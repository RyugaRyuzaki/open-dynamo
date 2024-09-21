import * as WEBIFC from "web-ifc";
import {PropertiesStreamingSettings} from "./PropertiesStreamingSettings";
import {IfcRelationsIndexer} from "../IfcRelationsIndexer";
import {relToAttributesMap} from "@bim/constants";

/**
 * A component that converts the properties of an IFC file to tiles. It uses the Web-IFC library to read and process the IFC data. 📕 [Tutorial](https://docs.thatopen.com/Tutorials/Components/Core/IfcPropertiesTiler). 📘 [API](https://docs.thatopen.com/api/@thatopen/components/classes/IfcPropertiesTiler).
 */
export class IfcPropertiesTiler {
  /**
   * An instance of the PropertiesStreamingSettings class, which holds the settings for the streaming process.
   */
  settings = new PropertiesStreamingSettings();

  /**
   * An instance of the IfcAPI class from the Web-IFC library, which provides methods for reading and processing IFC data.
   */
  webIfc = new WEBIFC.IfcAPI();
  relations = new IfcRelationsIndexer();
  /**
   *
   */
  constructor(
    private onPropertiesStreamed: (props: {
      type: number;
      data: {[id: number]: any};
    }) => void,
    private onProgress: (progress: number) => void
  ) {}

  /** {@link Disposable.dispose} */
  async dispose() {
    (this.webIfc as any) = null;
  }

  /**
   * This method converts properties from an IFC file to tiles given its data as a Uint8Array.
   *
   * @param data - The Uint8Array containing the IFC file data.
   * @returns A Promise that resolves when the streaming process is complete.
   */
  async streamFromBuffer(data: Uint8Array) {
    // const before = performance.now();
    await this.readIfcFile(data);

    await this.streamAllProperties();

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

  private async streamAllProperties() {
    const {propertiesSize} = this.settings;

    const allIfcEntities = new Set(this.webIfc.GetIfcEntityList(0));

    // let finalCount = 0;

    // Spatial items get their properties recursively to make
    // the location data available (e.g. absolute position of building)
    const spatialStructure = new Set([
      WEBIFC.IFCPROJECT,
      WEBIFC.IFCSITE,
      WEBIFC.IFCBUILDING,
      WEBIFC.IFCBUILDINGSTOREY,
      WEBIFC.IFCSPACE,
    ]);
    for (const type of spatialStructure) {
      allIfcEntities.add(type);
    }
    for (const key of relToAttributesMap.keys()) {
      allIfcEntities.add(key);
    }

    let nextProgress = 0.01;
    let typeCounter = 0;

    for (const type of allIfcEntities) {
      typeCounter++;

      const ids = this.webIfc.GetLineIDsWithType(0, type);

      // const allIDs = this._webIfc.GetAllLines(0);
      const idCount = ids.size();
      let count = 0;

      // Stream all properties in chunks of the specified size

      for (let i = 0; i < idCount - propertiesSize; i += propertiesSize) {
        const data: {[id: number]: any} = {};
        for (let j = 0; j < propertiesSize; j++) {
          count++;

          // finalCount++;
          const nextProperty = ids.get(i + j);

          try {
            const property = this.webIfc.GetLine(0, nextProperty);
            data[property.expressID] = property;
          } catch (e) {
            console.log(`Could not get property: ${nextProperty}`);
          }
        }
        this.onPropertiesStreamed({type, data});
      }

      // Stream the last chunk

      if (count !== idCount) {
        const data: {[id: number]: any} = {};
        for (let i = count; i < idCount; i++) {
          // finalCount++;
          const nextProperty = ids.get(i);

          try {
            const property = this.webIfc.GetLine(0, nextProperty);
            data[property.expressID] = property;
          } catch (e) {
            console.log(`Could not get property: ${nextProperty}`);
          }
        }

        this.onPropertiesStreamed({type, data});
      }

      const currentProgress = typeCounter / allIfcEntities.size;
      if (currentProgress > nextProgress) {
        nextProgress = Math.round(nextProgress * 100) / 100;
        this.onProgress(nextProgress);
        nextProgress += 0.01;
      }
    }
    this.onProgress(1);
  }
}
