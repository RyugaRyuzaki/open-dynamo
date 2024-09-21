import * as WEBIFC from "web-ifc";

import {
  RelationsMap,
  ModelsRelationMap,
  InverseAttributes,
  InverseAttribute,
  IfcRelations,
} from "@bim/types";
import {relToAttributesMap} from "@bim/constants";

// TODO: Refactor to combine logic from process and processFromWebIfc

// export type { InverseAttribute, RelationsMap } from "./src/types";

/**
 * Indexer component for IFC entities, facilitating the indexing and retrieval of IFC entity relationships. It is designed to process models properties by indexing their IFC entities' relations based on predefined inverse attributes, and provides methods to query these relations. 📕 [Tutorial](https://docs.thatopen.com/Tutorials/Components/Core/IfcRelationsIndexer). 📘 [API](https://docs.thatopen.com/api/@thatopen/components/classes/IfcRelationsIndexer).
 */
export class IfcRelationsIndexer {
  /**
   * Holds the relationship mappings for each model processed by the indexer.
   * The structure is a map where each key is a model's UUID, and the value is another map.
   * This inner map's keys are entity expressIDs, and its values are maps where each key is an index
   * representing a specific relation type, and the value is an array of expressIDs of entities
   * that are related through that relation type. This structure allows for efficient querying
   * of entity relationships within a model.
   */
  readonly relationMaps: ModelsRelationMap = {};

  /** {@link Component.enabled} */
  enabled: boolean = true;

  private _relToAttributesMap = relToAttributesMap;

  private _inverseAttributes: InverseAttributes = [
    "IsDecomposedBy",
    "Decomposes",
    "AssociatedTo",
    "HasAssociations",
    "ClassificationForObjects",
    "IsGroupedBy",
    "HasAssignments",
    "IsDefinedBy",
    "DefinesOcurrence",
    "IsTypedBy",
    "Types",
    "Defines",
    "ContainedInStructure",
    "ContainsElements",
    "HasControlElements",
    "AssignedToFlowElement",
    "ConnectedTo",
    "ConnectedFrom",
    "ReferencedBy",
    "Declares",
    "HasContext",
    "Controls",
    "IsNestedBy",
    "Nests",
    "DocumentRefForObjects",
  ];

  private _ifcRels: IfcRelations = [
    WEBIFC.IFCRELAGGREGATES,
    WEBIFC.IFCRELASSOCIATESMATERIAL,
    WEBIFC.IFCRELASSOCIATESCLASSIFICATION,
    WEBIFC.IFCRELASSIGNSTOGROUP,
    WEBIFC.IFCRELDEFINESBYPROPERTIES,
    WEBIFC.IFCRELDEFINESBYTYPE,
    WEBIFC.IFCRELDEFINESBYTEMPLATE,
    WEBIFC.IFCRELCONTAINEDINSPATIALSTRUCTURE,
    WEBIFC.IFCRELFLOWCONTROLELEMENTS,
    WEBIFC.IFCRELCONNECTSELEMENTS,
    WEBIFC.IFCRELASSIGNSTOPRODUCT,
    WEBIFC.IFCRELDECLARES,
    WEBIFC.IFCRELASSIGNSTOCONTROL,
    WEBIFC.IFCRELNESTS,
    WEBIFC.IFCRELASSOCIATESDOCUMENT,
  ];

  private indexRelations(
    relationsMap: RelationsMap,
    relAttrs: any,
    related: InverseAttribute,
    relating: InverseAttribute
  ) {
    const relatingKey = Object.keys(relAttrs).find((key) =>
      key.startsWith("Relating")
    );
    const relatedKey = Object.keys(relAttrs).find((key) =>
      key.startsWith("Related")
    );
    if (!(relatingKey && relatedKey)) return;
    const relatingID = relAttrs[relatingKey].value;
    if (!Array.isArray(relAttrs[relatedKey])) return;
    const relatedIDs = relAttrs[relatedKey].map((el: any) => el.value);

    // forRelating
    const index = this.getAttributeIndex(relating);
    if (index !== null) {
      let currentMap = relationsMap.get(relatingID);
      if (!currentMap) {
        currentMap = new Map();
        relationsMap.set(relatingID, currentMap);
      }
      let indexMap = currentMap.get(index);
      if (!indexMap) {
        indexMap = [];
        currentMap.set(index, indexMap);
      }
      indexMap.push(...relatedIDs);
    }

    // forRelated
    for (const id of relatedIDs) {
      const index = this.getAttributeIndex(related);
      if (index === null) continue;
      let currentMap = relationsMap.get(id);
      if (!currentMap) {
        currentMap = new Map();
        relationsMap.set(id, currentMap);
      }
      let relations = currentMap.get(index);
      if (!relations) {
        relations = [];
        currentMap.set(index, relations);
      }
      relations.push(relatingID);
    }
  }

  private getAttributeIndex(inverseAttribute: InverseAttribute) {
    const index = this._inverseAttributes.indexOf(inverseAttribute);
    if (index === -1) return null;
    return index;
  }

  /**
   * Processes a given model from a WebIfc API to index its IFC entities relations.
   *
   * @param ifcApi - The WebIfc API instance from which to retrieve the model's properties.
   * @param modelID - The unique identifier of the model within the WebIfc API.
   * @returns A promise that resolves to the relations map for the processed model.
   *          This map is a detailed representation of the relations indexed by entity expressIDs and relation types.
   */
  async processFromWebIfc(ifcApi: WEBIFC.IfcAPI, modelID: number) {
    const relationsMap: RelationsMap = new Map();

    for (const relType of this._ifcRels) {
      const relInverseAttributes = this._relToAttributesMap.get(relType);
      if (!relInverseAttributes) continue;
      const {forRelated: related, forRelating: relating} = relInverseAttributes;
      const relExpressIDs = ifcApi.GetLineIDsWithType(modelID, relType);
      for (let i = 0; i < relExpressIDs.size(); i++) {
        const relAttrs = await ifcApi.properties.getItemProperties(
          modelID,
          relExpressIDs.get(i)
        );
        this.indexRelations(relationsMap, relAttrs, related, relating);
      }
    }
    return relationsMap;
  }

  /** {@link Disposable.dispose} */
  dispose() {
    (this.relationMaps as any) = {};
  }
}
