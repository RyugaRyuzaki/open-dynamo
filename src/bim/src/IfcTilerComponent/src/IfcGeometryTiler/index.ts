import * as WEBIFC from "web-ifc";
import * as THREE from "three";
import * as FRAGS from "@thatopen/fragments";
import {
  CivilReader,
  IfcMetadataReader,
  IfcStreamingSettings,
  isPointInFrontOfPlane,
  obbFromPoints,
  SpatialIdsFinder,
  SpatialStructure,
} from "./src";
import {StreamedAsset, StreamedGeometries} from "../types";
import {StreamSerializer} from "@bim/src/streamed-geometries";

/**
 * A component that handles the tiling of IFC geometries for efficient streaming. 📕 [Tutorial](https://docs.thatopen.com/Tutorials/Components/Core/IfcGeometryTiler). 📘 [API](https://docs.thatopen.com/api/@thatopen/components/classes/IfcGeometryTiler).
 */
export class IfcGeometryTiler {
  /**
   * Settings for the IfcGeometryTiler.
   */
  settings = new IfcStreamingSettings();

  /**
   * The WebIFC API instance used for IFC file processing.
   */
  webIfc = new WEBIFC.IfcAPI();

  private _spatialTree = new SpatialStructure();

  private _metaData = new IfcMetadataReader();

  private _visitedGeometries = new Map<number, {uuid: string; index: number}>();
  private _streamSerializer = new StreamSerializer();

  private _geometries: Map<
    number,
    {
      position: Float32Array;
      normal: Float32Array;
      index: Uint32Array;
      boundingBox: Float32Array;
      hasHoles: boolean;
    }
  > = new Map();

  private _geometryCount = 0;

  private _civil = new CivilReader();
  private _groupSerializer = new FRAGS.Serializer();

  private _assets: StreamedAsset[] = [];

  private _meshesWithHoles = new Set<number>();

  constructor(
    private onAssetStreamed: (assetItems: StreamedAsset[]) => void,
    private onGeometryStreamed: ({
      data,
      buffer,
    }: {
      data: StreamedGeometries;
      buffer: Uint8Array;
    }) => void,
    private onIfcLoaded: (group: Uint8Array) => void,
    private onProgress: (progress: number) => void
  ) {}

  /** {@link Disposable.dispose} */
  dispose() {
    (this.webIfc as any) = null;
  }

  /**
   * This method streams the IFC file from a given buffer.
   *
   * @param data - The Uint8Array containing the IFC file data.
   * @returns A Promise that resolves when the streaming process is complete.
   *
   * @remarks
   * This method cleans up any resources after the streaming process is complete.
   *
   * @example
   * ```typescript
   * const ifcData = await fetch('path/to/ifc/file.ifc');
   * const rawBuffer = await response.arrayBuffer();
   * const ifcBuffer = new Uint8Array(rawBuffer);
   * await ifcGeometryTiler.streamFromBuffer(ifcBuffer);
   * ```
   */
  async streamFromBuffer(data: Uint8Array) {
    // const before = performance.now();
    await this.readIfcFile(data);

    await this.streamAllGeometries();
    this.cleanUp();

    // console.log(`Streaming the IFC took ${performance.now() - before} ms!`);
  }

  private async readIfcFile(data: Uint8Array) {
    const {path, absolute, logLevel} = this.settings.wasm;
    this.webIfc.SetWasmPath(path, absolute);
    await this.webIfc.Init();
    if (logLevel) {
      this.webIfc.SetLogLevel(logLevel);
    }
    this.webIfc.OpenModel(data, this.settings.webIfc);
  }

  private async streamAllGeometries() {
    const {minGeometrySize, minAssetsSize} = this.settings;

    // Precompute the level to which each item belongs
    this._spatialTree.setUp(this.webIfc);

    // Get all IFC objects and group them in chunks of specified size

    const allIfcEntities = this.webIfc.GetIfcEntityList(0);
    const chunks: number[][] = [[]];

    const group = new FRAGS.FragmentsGroup();

    group.ifcMetadata = {
      name: "",
      description: "",
      ...this._metaData.getNameInfo(this.webIfc),
      ...this._metaData.getDescriptionInfo(this.webIfc),
      schema: (this.webIfc.GetModelSchema(0) as FRAGS.IfcSchema) || "IFC2X3",
      maxExpressID: this.webIfc.GetMaxExpressID(0),
    };

    let counter = 0;
    let index = 0;
    for (const type of allIfcEntities) {
      if (!this.webIfc.IsIfcElement(type) && type !== WEBIFC.IFCSPACE) {
        continue;
      }
      if (this.settings.excludedCategories.has(type)) {
        continue;
      }
      const result = this.webIfc.GetLineIDsWithType(0, type);
      const size = result.size();
      for (let i = 0; i < size; i++) {
        if (counter > minGeometrySize) {
          counter = 0;
          index++;
          chunks.push([]);
        }
        const itemID = result.get(i);
        chunks[index].push(itemID);

        const props = this.webIfc.GetLine(0, itemID);
        if (props.GlobalId) {
          const globalID = props?.GlobalId.value || props?.GlobalId;
          group.globalToExpressIDs.set(globalID, itemID);
        }

        const level = this._spatialTree.itemsByFloor[itemID] || 0;
        group.data.set(itemID, [[], [level, type]]);
        counter++;
      }
    }

    this._spatialTree.cleanUp();

    let nextProgress = 0.01;
    let chunkCounter = 0;

    for (const chunk of chunks) {
      chunkCounter++;

      this.webIfc.StreamMeshes(0, chunk, (mesh) => {
        this.getMesh(this.webIfc, mesh, group);
      });

      if (this._geometryCount > minGeometrySize) {
        await this.streamGeometries();
      }

      if (this._assets.length > minAssetsSize) {
        await this.streamAssets();
      }

      const currentProgress = chunkCounter / chunks.length;
      if (currentProgress > nextProgress) {
        nextProgress += 0.01;
        nextProgress = Math.max(nextProgress, currentProgress);
        this.onProgress(Math.round(nextProgress * 100) / 100);
      }
    }

    // Stream remaining assets and geometries
    if (this._geometryCount) {
      await this.streamGeometries();
    }

    if (this._assets.length) {
      await this.streamAssets();
    }

    const {opaque, transparent} = group.geometryIDs;
    for (const [id, {index, uuid}] of this._visitedGeometries) {
      group.keyFragments.set(index, uuid);
      const geometryID = id > 1 ? opaque : transparent;
      geometryID.set(id, index);
    }

    SpatialIdsFinder.get(group, this.webIfc);

    const matrix = this.webIfc.GetCoordinationMatrix(0);
    group.coordinationMatrix.fromArray(matrix);
    group.civilData = this._civil.read(this.webIfc);

    const buffer = this._groupSerializer.export(group);
    this.onIfcLoaded(buffer);
    group.dispose(true);
  }

  private cleanUp() {
    try {
      this.webIfc.Dispose();
    } catch (e) {
      // Problem disposing memory (maybe already disposed?)
    }
    (this.webIfc as any) = null;
    this.webIfc = new WEBIFC.IfcAPI();
    this._visitedGeometries.clear();
    this._geometries.clear();
    this._assets = [];
    this._meshesWithHoles.clear();
  }

  private getMesh(
    webIfc: WEBIFC.IfcAPI,
    mesh: WEBIFC.FlatMesh,
    group: FRAGS.FragmentsGroup
  ) {
    const size = mesh.geometries.size();

    const id = mesh.expressID;

    const asset: StreamedAsset = {id, geometries: []};

    for (let i = 0; i < size; i++) {
      const geometry = mesh.geometries.get(i);
      const geometryID = geometry.geometryExpressID;

      // Distinguish between opaque and transparent geometries
      const factor = geometry.color.w === 1 ? 1 : -1;
      const transpGeometryID = geometryID * factor;

      if (!this._visitedGeometries.has(transpGeometryID)) {
        if (!this._visitedGeometries.has(geometryID)) {
          // This is the first time we see this geometry
          this.getGeometry(webIfc, geometryID);
        }

        // Save geometry for fragment generation
        // separating transparent and opaque geometries
        const index = this._visitedGeometries.size;
        const uuid = THREE.MathUtils.generateUUID();
        this._visitedGeometries.set(transpGeometryID, {uuid, index});
      }

      const geometryData = this._visitedGeometries.get(transpGeometryID);
      if (geometryData === undefined) {
        throw new Error("Error getting geometry data for streaming!");
      }
      const data = group.data.get(id);
      if (!data) {
        throw new Error("Data not found!");
      }

      data[0].push(geometryData.index);

      const {x, y, z, w} = geometry.color;
      const color = [x, y, z, w];
      const transformation = geometry.flatTransformation;
      asset.geometries.push({color, geometryID, transformation});
    }

    this._assets.push(asset);
  }

  private getGeometry(webIfc: WEBIFC.IfcAPI, id: number) {
    const geometry = webIfc.GetGeometry(0, id);

    const index = webIfc.GetIndexArray(
      geometry.GetIndexData(),
      geometry.GetIndexDataSize()
    ) as Uint32Array;

    const vertexData = webIfc.GetVertexArray(
      geometry.GetVertexData(),
      geometry.GetVertexDataSize()
    ) as Float32Array;

    const position = new Float32Array(vertexData.length / 2);
    const normal = new Float32Array(vertexData.length / 2);

    for (let i = 0; i < vertexData.length; i += 6) {
      position[i / 2] = vertexData[i];
      position[i / 2 + 1] = vertexData[i + 1];
      position[i / 2 + 2] = vertexData[i + 2];

      normal[i / 2] = vertexData[i + 3];
      normal[i / 2 + 1] = vertexData[i + 4];
      normal[i / 2 + 2] = vertexData[i + 5];
    }

    // const bbox = makeApproxBoundingBox(position, index);
    const obb = obbFromPoints(position);
    const boundingBox = new Float32Array(obb.transformation.elements);

    // Simple hole test: see if all triangles are facing away the center
    // Using the vertex normal because it's easier
    // Geometries with holes are treated as transparent items
    // in the visibility test for geometry streaming
    // Not perfect, but it will work for most cases and all the times it fails
    // are false positives, so it's always on the safety side

    const centerArray = [obb.center.x, obb.center.y, obb.center.z];

    let hasHoles = false;
    for (let i = 0; i < position.length - 2; i += 3) {
      const x = position[i];
      const y = position[i + 1];
      const z = position[i + 2];

      const nx = normal[i];
      const ny = normal[i + 1];
      const nz = normal[i + 2];

      const pos = [x, y, z];
      const nor = [nx, ny, nz];
      if (isPointInFrontOfPlane(centerArray, pos, nor)) {
        hasHoles = true;
        break;
      }
    }

    this._geometries.set(id, {
      position,
      normal,
      index,
      boundingBox,
      hasHoles,
    });

    geometry.delete();

    this._geometryCount++;
  }

  private async streamAssets() {
    await this.onAssetStreamed(this._assets);
    this._assets = null as any;
    this._assets = [];
  }

  private async streamGeometries() {
    let buffer = this._streamSerializer.export(this._geometries) as Uint8Array;

    let data: StreamedGeometries = {};

    for (const [id, {boundingBox, hasHoles}] of this._geometries) {
      data[id] = {boundingBox, hasHoles};
    }

    this.onGeometryStreamed({data, buffer});

    // Force memory disposal of all created items
    data = null as any;
    buffer = null as any;
    this._geometries.clear();
    this._geometryCount = 0;
  }
}
