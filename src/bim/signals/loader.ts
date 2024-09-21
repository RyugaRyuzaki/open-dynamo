import {signal} from "@preact/signals-react";

export const modelLoadingSignal = signal<boolean>(false);
export const spinnerSignal = signal<boolean>(false);
export const fileLoaderSignal = signal<number | null>(null);
export const geometryLoaderSignal = signal<number | null>(null);
export const propertyLoaderSignal = signal<number | null>(null);
export const modelLoadedSignal = signal<boolean>(false);

export function disposeViewerLoader() {
  modelLoadingSignal.value = false;
  spinnerSignal.value = false;
  fileLoaderSignal.value = null;
  geometryLoaderSignal.value = null;
  propertyLoaderSignal.value = null;
  modelLoadedSignal.value = false;
}
