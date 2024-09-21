import {FC, memo, ReactElement} from "react";
import {Button} from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {IoAddCircleOutline} from "react-icons/io5";
import {FaRegTrashAlt} from "react-icons/fa";
import {VscClearAll} from "react-icons/vsc";

import {Node, Edge} from "@xyflow/react";
import {addNodeSignal, getId} from "./PropertyDynamo";
export const ToolButton: FC<ButtonProps> = ({
  tooltip,
  icon,
  onClick,
  disabled,
}) => {
  return (
    <TooltipProvider delayDuration={10}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="flex-1 p-0 bg-transparent hover:bg-transparent mx-2"
            disabled={disabled}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClick();
            }}
          >
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export interface ButtonProps {
  tooltip: string;
  icon: ReactElement;
  onClick: () => void;
  disabled: boolean;
}
export const iconClassName = "h-8 w-8 text-slate-50";

const ToolButtons = () => {
  const onClearAll = () => {};
  const onAddNode = () => {
    addNodeSignal.value = {
      id: getId(),
      type: "ExpressID",
      data: {},
      position: {x: 0, y: 0},
    } as Node;
  };
  const onDeleteNode = () => {};
  const list: ButtonProps[] = [
    {
      tooltip: "Clear all node",
      icon: <VscClearAll className={iconClassName} />,
      onClick: onClearAll,
      disabled: false,
    },
    {
      tooltip: "Add node",
      icon: <IoAddCircleOutline className={iconClassName} />,
      onClick: onAddNode,
      disabled: false,
    },
    {
      tooltip: "Delete node",
      icon: <FaRegTrashAlt className={iconClassName} />,
      onClick: onDeleteNode,
      disabled: false,
    },
  ];
  return (
    <div className="relative w-full flex justify-between my-1">
      {list.map((bt: ButtonProps, index: number) => (
        <ToolButton key={bt.tooltip + index} {...bt} />
      ))}
    </div>
  );
};

export default memo(ToolButtons);
