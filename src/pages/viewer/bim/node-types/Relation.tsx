import {Handle, Node, NodeProps, Position} from "@xyflow/react";
import {FC, memo} from "react";
import {handleClassDot} from "../constants";

export type INodeRRelations = Node<{typeName: string; keys: number[]}>;

const Relation: FC<NodeProps<INodeRRelations>> = ({data: {typeName, keys}}) => {
  return (
    <div className="relative rounded-lg w-[300px]">
      <div className="relative rounded-t-lg  h-[40px]  w-full flex items-center justify-start p-1 bg-green-300">
        <p
          className="mx-2 capitalize 
                my-auto select-none 
                whitespace-nowrap overflow-hidden 
                overflow-ellipsis  w-full text-center text-black font-bold"
        >
          {typeName}
        </p>
      </div>
      {keys.map((key: number, index: number) => {
        return (
          <div
            key={`${key}-${index}`}
            className="relative h-[40px] w-full flex items-center justify-end p-1 bg-slate-300"
          >
            <p
              className="mx-2 capitalize 
                      my-auto select-none 
                      whitespace-nowrap overflow-hidden 
                      overflow-ellipsis max-w-[120px] text-right text-black font-bold"
            >
              {key}
            </p>
            <Handle
              type="source"
              position={Position.Right}
              className={`${handleClassDot}`}
              style={{
                bottom: (index + 1) * 20,
              }}
              id={key.toString()}
              isConnectable={true}
            />
          </div>
        );
      })}
    </div>
  );
};

export default memo(Relation);
