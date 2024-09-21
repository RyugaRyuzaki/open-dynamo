import {
  geometryLoaderSignal,
  modelLoadedSignal,
  propertyLoaderSignal,
  spinnerSignal,
} from "@bim/signals/loader";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as FRAGS from "@thatopen/fragments";
import * as THREE from "three";
import {IfcStreamerComponent} from "../IfcStreamerComponent";
import {
  IAssetStreamed,
  IGeometryStreamed,
  IPayloadParser,
  IProgress,
  IPropertiesStreamed,
  IWorkerParser,
  IWorkerReceive,
} from "./src/types";
import {setNotify} from "@components/Notify/baseNotify";
import {INodeCategory} from "@bim/types";
import {
  categoriesSignal,
  geometriesSignal,
  propertiesSignal,
} from "@bim/signals";

/**
 *
 */
export class IfcTilerComponent extends OBC.Component implements OBC.Disposable {
  //1 attribute
  /**
   * A unique identifier for the component.
   * This UUID is used to register the component within the Components system.
   */
  static readonly uuid = "245d14fc-e534-4b5e-bdef-c1ca3e6bb734" as const;
  readonly aws3Host = import.meta.env.VITE_AWS3_HOST;
  readonly frag = "application/octet-stream" as const;
  readonly json = "application/json" as const;
  enabled = false;

  readonly onDisposed: OBC.Event<any> = new OBC.Event();

  // worker
  private parserWorker = new Worker(
    new URL("./src/IfcWorker.ts", import.meta.url),
    {
      type: "module",
      credentials: "include",
    }
  );
  private geometryFilesCount = 0;

  private propertyCount = 0;

  private before = 0;
  private modelId!: string | null;
  // S3 storage ${host}/${bucket_name}/${modelId}
  artifactModelData!: {
    assets?: OBC.StreamedAsset[];
    geometries?: OBC.StreamedGeometries;
    groupBuffer?: Uint8Array;
    streamedGeometryFiles?: {[fileName: string]: Uint8Array};
    properties?: FRAGS.IfcProperties;
  };
  /**
   *
   * @param components
   */
  constructor(components: OBC.Components) {
    super(components);
    this.components.add(IfcTilerComponent.uuid, this);
    this.onWorkerMessage();
  }
  //3 method
  async dispose() {
    (this.artifactModelData as any) = null;
    this.parserWorker.terminate();
    (this.parserWorker as any) = null;
    this.onDisposed.trigger(this);
    this.onDisposed.reset();
    console.log("disposed IfcTilerComponent");
  }
  // streamer geometry
  //
  private onAssetStreamed = (payload: IAssetStreamed) => {
    if (!this.modelId || !this.artifactModelData) return;
    if (this.artifactModelData.assets === undefined)
      this.artifactModelData.assets = [];
    this.artifactModelData.assets = [
      ...this.artifactModelData.assets,
      ...payload,
    ];
  };

  private onGeometryStreamed = (payload: IGeometryStreamed) => {
    if (!this.modelId || !this.artifactModelData) return;

    const {data, buffer} = payload;

    if (this.artifactModelData.geometries === undefined)
      this.artifactModelData.geometries = {};

    if (this.artifactModelData.streamedGeometryFiles === undefined)
      this.artifactModelData.streamedGeometryFiles = {};

    const geometryFile = `geometries-${this.geometryFilesCount}.frag`;

    for (const id in data) {
      if (!this.artifactModelData.geometries[id])
        this.artifactModelData.geometries[id] = {...data[id], geometryFile};
    }

    if (!this.artifactModelData.streamedGeometryFiles[geometryFile])
      this.artifactModelData.streamedGeometryFiles[geometryFile] = buffer;

    this.geometryFilesCount++;
  };

  private onIfcLoaded = async (payload: Uint8Array) => {
    if (!this.modelId || !this.artifactModelData) return;

    this.artifactModelData.groupBuffer = payload;
    const now = performance.now();
    console.log("onIfcLoaded", `${now - this.before}`);
    await this.onSuccess();
  };

  private onProgressGeometry = async (payload: IProgress) => {
    const {progress} = payload;
    geometryLoaderSignal.value = progress;
    if (progress !== 1) return;
    const now = performance.now();
    console.log("onProgressGeometry", `${now - this.before}`);
  };

  private onPropertiesStreamed = (payload: IPropertiesStreamed) => {
    if (!this.modelId || !this.artifactModelData) return;
    const {data} = payload;

    if (this.artifactModelData.properties === undefined)
      this.artifactModelData.properties = {};

    for (const id in data) {
      if (!this.artifactModelData.properties[id])
        this.artifactModelData.properties[id] = data[id];
    }

    this.propertyCount++;
  };

  private onProgressProperty = (payload: IProgress) => {
    const {progress} = payload;
    propertyLoaderSignal.value = progress;
    if (progress !== 1) return;
    const now = performance.now();
    console.log("onProgressProperty", `${now - this.before}`);
  };

  private onSuccess = async () => {
    if (!this.modelId || !this.artifactModelData) return;

    const {assets, geometries, groupBuffer, properties} =
      this.artifactModelData;
    if (
      assets === undefined ||
      assets.length === 0 ||
      geometries === undefined ||
      groupBuffer === undefined ||
      properties === undefined
    )
      return;

    const customIfcStreamer = this.components.get(IfcStreamerComponent);
    customIfcStreamer.fromServer = false;
    const settings = {assets, geometries} as OBF.StreamLoaderSettings;
    const group = await customIfcStreamer.loadFromLocal(
      settings,
      groupBuffer,
      true,
      properties
    );
    const categories: Record<number, INodeCategory> = {};
    for (const [_id, [_keys, [_level, id]]] of group.data) {
      const name = OBC.IfcCategoryMap[id];
      if (!name) continue;
      if (!categories[id]) categories[id] = {id, name};
    }
    const props: FRAGS.IfcProperties = {};
    const geo: FRAGS.IfcProperties = {};
    for (const key in properties) {
      const type = properties[key].type;
      if (!type) continue;
      if (!props[key]) props[key] = properties[key];
      if (OBC.GeometryTypes.has(type)) {
        if (!geo[key]) geo[key] = properties[key];
      }
    }
    propertiesSignal.value = props;
    geometriesSignal.value = geo;
    categoriesSignal.value = {...categoriesSignal.value, ...categories};
    modelLoadedSignal.value = true;
    spinnerSignal.value = false;
  };
  /**
   * 1/make sure onAssetStreamed,onGeometryStreamed and onIfcLoaded are finished
   * then we can load model for reviewing
   * 2/ make sure onProgressGeometry and onProgressProperty are finished
   * then we can upload to server
   */
  private handlerMap = {
    onPropertiesStreamed: this.onPropertiesStreamed,
    onProgressProperty: this.onProgressProperty,
    onAssetStreamed: this.onAssetStreamed,
    onGeometryStreamed: this.onGeometryStreamed,
    onIfcLoaded: this.onIfcLoaded,
    onProgressGeometry: this.onProgressGeometry,
  };

  private onWorkerMessage() {
    this.parserWorker.addEventListener("message", async (e: MessageEvent) => {
      const {action, payload} = e.data as IWorkerReceive;
      if (action === "onError") {
        setNotify(payload as string, false);
        return;
      }
      const handler = this.handlerMap[action as keyof typeof this.handlerMap];
      //@ts-ignore
      if (handler) handler(payload);
    });
  }
  streamIfcWorkerFile = async (buffer: Uint8Array) => {
    (this.artifactModelData as any) = null;
    (this.modelId as any) = null;
    this.geometryFilesCount = 0;
    this.propertyCount = 0;
    this.modelId = THREE.MathUtils.generateUUID();
    this.artifactModelData = {};
    this.before = performance.now();
    this.parserWorker.postMessage({
      action: "onIfcStream",
      payload: {buffer, modelId: this.modelId} as IPayloadParser,
    } as IWorkerParser);
  };
}
