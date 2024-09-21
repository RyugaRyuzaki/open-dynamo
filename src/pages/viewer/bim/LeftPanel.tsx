"use client";

import {memo} from "react";
import {BimModel} from "@bim/BimModel";
import {Separator} from "@/components/ui/separator";

import LoadModel from "./LoadModel";
import {useSignals} from "@preact/signals-react/runtime";
import ToolButtons from "./ToolButtons";
import Elements from "./Elements";
import Relations from "./Relations";
import Settings from "./Settings";
import {modelLoadedSignal} from "@bim/signals";

const LeftPanel = ({bimModel}: {bimModel: BimModel}) => {
  useSignals();

  return (
    <div className="w-full h-full flex flex-col">
      {!modelLoadedSignal.value && (
        <LoadModel
          handleOpenFile={() => {
            bimModel.loadModelFromLocal();
          }}
        />
      )}
      <Separator />

      <Settings />
      <Separator />
      <ToolButtons />
      <Separator />
      <div className="relative w-full flex justify-start my-1">
        <p className="relative my-auto">Relations</p>
      </div>
      <Separator />
      <Relations />
      <Separator />
      <div className="relative w-full flex justify-start my-1">
        <p className="relative my-auto">Elements</p>
      </div>
      <Separator />
      <Elements />
    </div>
  );
};

export default memo(LeftPanel);
