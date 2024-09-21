import * as WEBIFC from "web-ifc";
import {LogLevel} from "web-ifc";

import {
  IAssetStreamed,
  IGeometryStreamed,
  IPayloadModify,
  IPayloadParser,
  IProgress,
  IWorkerParser,
  IWorkerReceive,
} from "./types";
import {IfcPropertiesTiler} from "./IfcPropertiesTiler";
import {IfcGeometryTiler} from "./IfcGeometryTiler";
import {ISpatialStructure} from "@bim/types";

const wasm = {
  path: "https://unpkg.com/web-ifc@0.0.57/",
  absolute: true,
  LogLevel: LogLevel.LOG_LEVEL_OFF,
};

const webIfc: WEBIFC.LoaderSettings = {
  COORDINATE_TO_ORIGIN: true,
  //@ts-ignore
  OPTIMIZE_PROFILES: true,
} as const;

// streamer geometry

const onAssetStreamed = (payload: IAssetStreamed) => {
  self.postMessage({action: "onAssetStreamed", payload} as IWorkerReceive);
};
const onGeometryStreamed = (payload: IGeometryStreamed) => {
  self.postMessage({action: "onGeometryStreamed", payload} as IWorkerReceive);
};
const onIfcLoaded = (payload: Uint8Array) => {
  self.postMessage({action: "onIfcLoaded", payload} as IWorkerReceive);
};
const onProgressGeometry = (progress: number) => {
  self.postMessage({
    action: "onProgressGeometry",
    payload: {progress, type: "geometry"} as IProgress,
  } as IWorkerReceive);
};
const ifcGeometryTiler = new IfcGeometryTiler(
  onAssetStreamed,
  onGeometryStreamed,
  onIfcLoaded,
  onProgressGeometry
);
ifcGeometryTiler.settings.wasm = wasm;
ifcGeometryTiler.settings.autoSetWasm = false;
ifcGeometryTiler.settings.webIfc = webIfc;
ifcGeometryTiler.settings.minGeometrySize = 20;
ifcGeometryTiler.settings.minAssetsSize = 1000;

const onPropertiesStreamed = (payload: {
  type: number;
  data: {[id: number]: any};
}) => {
  self.postMessage({action: "onPropertiesStreamed", payload} as IWorkerReceive);
};
const onProgressProperty = (progress: number) => {
  self.postMessage({
    action: "onProgressProperty",
    payload: {progress, type: "property"} as IProgress,
  } as IWorkerReceive);
};

const ifcPropertiesTiler = new IfcPropertiesTiler(
  onPropertiesStreamed,
  onProgressProperty
);
ifcPropertiesTiler.settings.wasm = wasm;
ifcPropertiesTiler.settings.autoSetWasm = false;
ifcPropertiesTiler.settings.webIfc = webIfc;
ifcPropertiesTiler.settings.propertiesSize = 100;

const onIfcStream = async (payload: IPayloadParser) => {
  try {
    const {buffer} = payload;
    await ifcPropertiesTiler.streamFromBuffer(buffer);
    await ifcGeometryTiler.streamFromBuffer(buffer);
  } catch (error: any) {
    self.postMessage({action: "onError", payload: error.message});
  }
};
const onIfcModify = async (payload: IPayloadModify) => {
  console.log(payload);
};

const handlerMap = {
  onIfcStream,
  onIfcModify,
};

self.onmessage = async (e: MessageEvent) => {
  const {action, payload} = e.data as IWorkerParser;
  const handler = handlerMap[action as keyof typeof handlerMap];
  //@ts-ignore
  if (handler) handler(payload);
};
