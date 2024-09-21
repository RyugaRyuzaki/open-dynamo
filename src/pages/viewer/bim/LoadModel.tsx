import React from "react";
import {Button} from "@components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/ui/tooltip";
import {FaUpload} from "react-icons/fa";
import {Label} from "@components/ui/label";
import {useSignals} from "@preact/signals-react/runtime";
import {modelLoadingSignal} from "@bim/signals/loader";
const LoadModel = ({handleOpenFile}: {handleOpenFile: () => void}) => {
  useSignals();

  return (
    <div className="w-full p-2 flex items-center border-b-1">
      <TooltipProvider delayDuration={10}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={"outline"}
              className="w-[100%] m-auto flex justify-center bg-gradient-to-r
                        from-cyan-500 to-blue-500
                        disabled:cursor-none
                        disabled:opacity-35
                        "
              onClick={handleOpenFile}
              disabled={modelLoadingSignal.value}
            >
              <FaUpload className="text-white" />
              <Label className="mx-2">Upload .ifc</Label>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-white bg-slate-900">
            Open local
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default LoadModel;
