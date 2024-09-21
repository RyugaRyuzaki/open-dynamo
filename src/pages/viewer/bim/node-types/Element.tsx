import {INodeType} from "@bim/types";
import React, {memo, DragEvent} from "react";
export interface IElementNodeButton {
  id: number;
  name: string;
}
const onDragStart = (
  event: DragEvent,
  categoryId: number,
  nodeType: INodeType
) => {
  if (!event.dataTransfer) return;
  event.dataTransfer.setData("application/reactflow", nodeType);
  event.dataTransfer.setData("application/category", categoryId.toString());
  event.dataTransfer.effectAllowed = "move";
};
const Element = ({
  categoryId,
  nodeType,
  type,
}: {
  categoryId: number;
  nodeType: INodeType;
  type: string;
}) => {
  return (
    <div
      className={`react-flow__node-input w-full flex justify-between p-1 mr-1 cursor-pointer   hover:bg-green-300 hover:text-slate-800 rounded-md 
  `}
      onDragStart={(event: DragEvent) =>
        onDragStart(event, categoryId, nodeType)
      }
      draggable
    >
      <p
        className="mx-2 capitalize 
          my-auto select-none 
          whitespace-nowrap overflow-hidden 
          overflow-ellipsis max-w-[200px] p-1"
      >
        {type}
      </p>
    </div>
  );
};

export default memo(Element);
