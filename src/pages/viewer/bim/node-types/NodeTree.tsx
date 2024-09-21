import React, {FC, memo} from "react";
import {NodeProps, Node, Position, Handle} from "@xyflow/react";

export type INodeTree = Node<{
  typeName: string;
  hasChildren: boolean;
  parentId: string | null;
}>;

const NodeTree: FC<NodeProps<INodeTree>> = (props) => {
  const {
    data: {typeName, hasChildren, parentId},
  } = props;
  return (
    <div className="rounded-md bg-slate-300 h-[30px] w-[200px] flex items-center justify-center">
      <p
        className="mx-2 capitalize 
          my-auto select-none 
          whitespace-nowrap overflow-hidden 
          overflow-ellipsis max-w-[200px] text-center text-black font-bold"
      >
        {typeName}
      </p>
      {hasChildren && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="h-[8px] w-[8px] bg-white rounded-full border-black border-2"
        />
      )}
      {parentId && (
        <Handle
          type="source"
          position={Position.Top}
          className="h-[8px] w-[8px] bg-white rounded-full border-black border-2"
        />
      )}
      <Handle
        type="source"
        position={Position.Right}
        className="h-[8px] w-[8px] bg-white rounded-full border-black border-2"
      />
    </div>
  );
};

export default memo(NodeTree);
