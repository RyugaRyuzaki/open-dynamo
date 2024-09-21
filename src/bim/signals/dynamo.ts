import {INodeCategory} from "@bim/types";
import * as FRAGS from "@thatopen/fragments";
import {computed, signal} from "@preact/signals-react";

export const categoriesSignal = signal<Record<number, INodeCategory>>({});
export const propertiesSignal = signal<FRAGS.IfcProperties>({});
export const geometriesSignal = signal<FRAGS.IfcProperties>({});
export const expressIDSignal = computed<number[]>(() => {
  return Array.from(Object.keys(propertiesSignal.value).map((key) => +key));
});

export function disposeViewerDynamo() {
  categoriesSignal.value = {};
  propertiesSignal.value = {};
  geometriesSignal.value = {};
}
