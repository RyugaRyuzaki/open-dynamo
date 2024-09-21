import * as THREE from "three";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import {
  FileLoaderProgress,
  IfcStreamerComponent,
  IfcTilerComponent,
} from "./src";
import {modelLoadingSignal, spinnerSignal} from "@bim/signals/loader";
import {setNotify} from "@components/Notify/baseNotify";
import {disposeViewerSignals} from "@bim/signals";

import {Fragment} from "@thatopen/fragments";
/**
 *
 */
export class BimModel implements OBC.Disposable {
  readonly onDisposed: OBC.Event<any> = new OBC.Event();

  private loaderProgress = new FileLoaderProgress();

  components!: OBC.Components;
  world!: OBC.SimpleWorld<
    OBC.ShadowedScene,
    OBC.OrthoPerspectiveCamera,
    OBF.PostproductionRenderer
  >;
  worldGrid!: OBC.SimpleGrid;

  /**
   *
   */
  constructor(private container: HTMLDivElement) {
    this.init();
  }
  //
  async dispose() {
    console.log("dispose");
    disposeViewerSignals();
    this.loaderProgress.dispose();
    (this.loaderProgress as any) = null;
    (this.container as any) = null;
    this.components?.get(OBC.Worlds).dispose();
    this.components?.dispose();
    (this.world as any) = null;
    (this.components as any) = null;
    this.onDisposed.trigger(this);
    this.onDisposed.reset();
  }

  private init() {
    this.components = new OBC.Components();
    this.components.init();

    const worlds = this.components.get(OBC.Worlds);

    const world = worlds.create<
      OBC.ShadowedScene,
      OBC.OrthoPerspectiveCamera,
      OBF.PostproductionRenderer
    >();
    world.name = "Main";

    world.scene = new OBC.ShadowedScene(this.components);

    world.renderer = new OBF.PostproductionRenderer(
      this.components,
      this.container
    );
    const {postproduction, three} = world.renderer;

    three.shadowMap.enabled = true;
    three.shadowMap.type = THREE.PCFSoftShadowMap;

    world.camera = new OBC.OrthoPerspectiveCamera(this.components);

    world.scene.setup({
      shadows: {
        cascade: 1,
        resolution: 1024,
      },
    });
    world.scene.three.background = null;

    this.worldGrid = this.components.get(OBC.Grids).create(world);
    this.worldGrid.material.uniforms.uColor.value = new THREE.Color(0x424242);
    this.worldGrid.material.uniforms.uSize1.value = 2;
    this.worldGrid.material.uniforms.uSize2.value = 8;

    postproduction.enabled = true;
    postproduction.customEffects.excludedMeshes.push(this.worldGrid.three);
    postproduction.setPasses({custom: true, ao: true, gamma: true});
    postproduction.customEffects.lineColor = 0x17191c;
    postproduction.enabled = false;

    const highlighter = this.components.get(OBF.Highlighter);
    highlighter.setup({world});
    /** ====== IfcTilerComponent ======= **/
    const ifcTilerComponent = this.components.get(IfcTilerComponent);
    ifcTilerComponent.enabled = true;

    /** ====== IfcStreamerComponent ======= **/
    const ifcStreamerComponent = this.components.get(IfcStreamerComponent);
    ifcStreamerComponent.enabled = true;
    ifcStreamerComponent.world = world;
    ifcStreamerComponent.setupEvent = false;
    ifcStreamerComponent.setupEvent = true;

    world.camera.controls.restThreshold = 0.25;

    const fragments = this.components.get(OBC.FragmentsManager);
    const indexer = this.components.get(OBC.IfcRelationsIndexer);
    const classifier = this.components.get(OBC.Classifier);
    classifier.list.CustomSelections = {};

    this.world = world;
    fragments.onFragmentsLoaded.add(async (model) => {
      if (model.hasProperties) {
        await indexer.process(model);
        classifier.byEntity(model);
      }
      spinnerSignal.value = false;
    });
    ifcStreamerComponent.onFragmentsLoaded.add(
      async (fragments: Fragment[]) => {
        for (const {mesh} of fragments) {
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      }
    );
    fragments.onFragmentsDisposed.add(({fragmentIDs}) => {
      for (const fragmentID of fragmentIDs) {
        const mesh = [...world.meshes].find((mesh) => mesh.uuid === fragmentID);
        if (mesh) {
          world.meshes.delete(mesh);
        }
      }
    });
  }

  loadModelFromLocal = async () => {
    try {
      modelLoadingSignal.value = true;

      const options: OpenFilePickerOptions = {
        multiple: false,
        types: [
          {
            description: "Files",
            accept: {
              "application/octet-stream": [".ifc", ".IFC", ".dxf"],
            },
          },
        ],
      };

      const [fileHandle] = await window.showOpenFilePicker(options);
      const file = await fileHandle.getFile();
      const ifcTilerComponent = this.components.get(IfcTilerComponent);
      this.loaderProgress.loadIfcFile(
        file,
        async (buffer: Uint8Array, _name: string) => {
          await ifcTilerComponent.streamIfcWorkerFile(buffer);
        }
      );
    } catch (err: any) {
      setNotify(err.message, false);
    }
  };

  onResize = () => {
    if (!this.world) return;
    this.world.renderer?.resize();
    this.world.camera.updateAspect();
  };
}
