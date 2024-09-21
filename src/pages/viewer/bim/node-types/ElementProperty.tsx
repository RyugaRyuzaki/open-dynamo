import * as OBC from "@thatopen/components";
import {Handle, Node, NodeProps, Position} from "@xyflow/react";
import {FC, memo} from "react";
import {handleClassDot} from "../constants";

export type INodeIfcProperty = Node<{[attribute: string]: any}>;

const ElementProperty: FC<NodeProps<INodeIfcProperty>> = ({data}) => {
  const typeName = data.type
    ? OBC.IfcCategoryMap[data.type] ?? "IfcElement"
    : "IfcElement";

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
      {Object.keys(data)
        .filter((key) => data[key] && key !== "type" && key !== "target")
        .map((key: string, index: number) => {
          const props = data[key];
          let value = "";
          let isChild = false;
          if (typeof props === "object") {
            if (Array.isArray(props)) {
              value = props.map((p) => p.value).toString();
            } else {
              value = props.value;
              isChild = props.type && props.type === 5;
            }
          } else {
            value = props;
          }
          return (
            <div
              key={`${key}-${index}`}
              className="relative h-[40px] w-full flex items-center justify-between p-1 bg-slate-300"
            >
              <p
                className="mx-2 capitalize 
                    my-auto select-none 
                    whitespace-nowrap overflow-hidden 
                    overflow-ellipsis  w-[120px] text-left text-black font-bold"
              >
                {key}
              </p>
              <p
                className="mx-2 capitalize 
                    my-auto select-none 
                    whitespace-nowrap overflow-hidden 
                    overflow-ellipsis max-w-[120px] text-right text-black font-bold"
              >
                {value}
              </p>
              {isChild && key !== "expressID" && (
                <Handle
                  type="source"
                  position={Position.Right}
                  className={`${handleClassDot}`}
                  style={{
                    bottom: (index + 1) * 20,
                  }}
                  id={value.toString()}
                  isConnectable={true}
                />
              )}
            </div>
          );
        })}
      {data.target && (
        <Handle
          type="target"
          position={Position.Left}
          className={`${handleClassDot}`}
        />
      )}
    </div>
  );
};

export default memo(ElementProperty);
