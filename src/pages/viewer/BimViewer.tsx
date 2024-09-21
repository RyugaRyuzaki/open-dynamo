import {useEffect, useRef, useState} from "react";
import LeftPanel from "./bim/LeftPanel";
import {BimModel} from "@bim/BimModel";
import {signal} from "@preact/signals-react";
import {useSignalEffect, useSignals} from "@preact/signals-react/runtime";

import Spinner from "@components/Spinner/Spinner";
import NotifyProgress from "@components/Notify/NotifyProgress";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  fileLoaderSignal,
  geometryLoaderSignal,
  propertyLoaderSignal,
} from "@bim/signals";

import PropertyDynamo from "./bim/PropertyDynamo";

export const dynamoDirectionSignal = signal<"horizontal" | "vertical">(
  "horizontal"
);
/**
 *
 * @returns
 */
const BimViewer = () => {
  useSignals();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [bimModel, setBimModel] = useState<BimModel | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const model = new BimModel(containerRef.current);
    setBimModel(model);
    setTimeout(model.onResize, 1);
    return () => {
      model?.dispose();
      setBimModel(null);
    };
  }, []);

  const onResize = () => {
    if (!bimModel) return;
    setTimeout(bimModel.onResize, 1);
  };
  useSignalEffect(() => {
    const direction = dynamoDirectionSignal.value;
    console.log(direction);
    onResize();
  });
  return (
    <>
      <ResizablePanelGroup
        direction="horizontal"
        className="relative h-full w-full overflow-hidden"
        onLayout={onResize}
      >
        <ResizablePanel
          defaultSize={15}
          maxSize={20}
          minSize={10}
          className="relative h-full p-2"
        >
          {bimModel && <LeftPanel bimModel={bimModel} />}
        </ResizablePanel>
        <ResizableHandle className="w-[4px]" />
        <ResizablePanel defaultSize={85}>
          <ResizablePanelGroup
            direction={dynamoDirectionSignal.value}
            className="relative h-full w-full overflow-hidden"
            onLayout={onResize}
          >
            <ResizablePanel defaultSize={50}>
              <PropertyDynamo />
            </ResizablePanel>
            <ResizableHandle
              className={`${
                dynamoDirectionSignal.value === "horizontal"
                  ? "h-full w-[4px]"
                  : "w-full h-[4px]"
              }`}
            />
            <ResizablePanel>
              <div
                className="relative h-full w-full exclude-theme-change"
                ref={containerRef}
              ></div>
            </ResizablePanel>
            <Spinner />
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
      <NotifyProgress name="File" signal={fileLoaderSignal} />
      <NotifyProgress name="Geometry" signal={geometryLoaderSignal} />
      <NotifyProgress name="Property" signal={propertyLoaderSignal} />
    </>
  );
};

export default BimViewer;
