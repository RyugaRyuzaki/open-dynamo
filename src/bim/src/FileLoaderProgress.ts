import {setNotify} from "@components/Notify/baseNotify";
import {fileLoaderSignal, spinnerSignal} from "@bim/signals/loader";
import * as THREE from "three";
import DxfParser, {IDxf} from "dxf-parser";
/**
 *
 */
export class FileLoaderProgress extends THREE.Loader {
  private loader!: THREE.FileLoader;
  constructor(manager?: THREE.LoadingManager) {
    super(manager);
    this.loader = new THREE.FileLoader(this.manager);
    this.loader.setPath(this.path);

    this.loader.setRequestHeader(this.requestHeader);
    this.loader.setWithCredentials(this.withCredentials);
  }
  /**
   *
   */
  dispose() {
    (this.loader as any) = null;
  }
  /**
   *
   * @param event
   */
  private onProgress = (event: ProgressEvent) => {
    fileLoaderSignal.value = event.loaded / event.total;
  };
  /**
   *
   * @param err
   */
  private onError = (err: any) => {
    setNotify(err.message, false);
  };
  /**
   *
   * @param file
   * @param onSuccess
   */
  loadIfcFile(
    file: File,
    onSuccess: (buffer: Uint8Array, fileName: string) => void
  ) {
    const url = URL.createObjectURL(file);
    spinnerSignal.value = true;
    this.loader.setResponseType("arraybuffer");
    this.loader.load(
      url,
      (buffer: ArrayBuffer | string) => {
        try {
          if (typeof buffer === "string") {
            throw new Error("IFC files must be given as a buffer!");
          }
          onSuccess(new Uint8Array(buffer), file.name);
        } catch (e: any) {
          this.onError(e);
          this.manager.itemError(url);
        }
        URL.revokeObjectURL(url);
      },
      this.onProgress,
      this.onError
    );
  }
  loadDxfFile(file: File, onSuccess: (dxf: IDxf) => void) {
    const url = URL.createObjectURL(file);
    spinnerSignal.value = true;
    this.loader.load(
      url,
      (buffer: ArrayBuffer | string) => {
        try {
          if (typeof buffer !== "string") {
            throw new Error("IFC files must be given as a buffer!");
          }
          const parser = new DxfParser();
          const dxf = parser.parseSync(buffer as string);
          onSuccess(dxf!);
        } catch (e: any) {
          this.onError(e);
          this.manager.itemError(url);
        }
        URL.revokeObjectURL(url);
      },
      this.onProgress,
      this.onError
    );
  }
}
