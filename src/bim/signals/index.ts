import {disposeViewerLoader} from "./loader";
import {disposeViewerDynamo} from "./dynamo";

export * from "./loader";
export * from "./dynamo";

export function disposeViewerSignals() {
  disposeViewerLoader();
  disposeViewerDynamo();
}
