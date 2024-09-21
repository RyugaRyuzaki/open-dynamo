import {effect, signal} from "@preact/signals-react";
import {toast} from "react-toastify";
export interface INotify {
  success: boolean;
  message: string;
  position: "top-center" | "top-right";
}
export const notifySignal = signal<INotify | null>(null);

effect(() => {
  if (!notifySignal.value) return;
  const {success, message, position} = notifySignal.value;
  if (success) {
    toast.success(message, {position, autoClose: 500});
  } else {
    toast.error(message, {position, autoClose: 500});
  }
});
export function setNotify(message: string, success = true) {
  notifySignal.value = {
    message,
    success,
    position: success ? "top-right" : "top-center",
  } as INotify;
}
export function disposeFileType() {
  notifySignal.value = null;
}
