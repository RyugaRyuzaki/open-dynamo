import {FC, memo, useEffect, useState} from "react";
import {useSignals} from "@preact/signals-react/runtime";
import {Handle, Node, NodeProps, Position} from "@xyflow/react";
import {handleClassDot} from "../constants";
import {Input} from "@/components/ui/input";
import {parseText} from "../utiles";
import {debounce} from "lodash";
import {expressIDSignal} from "@bim/signals";
import {nodeChangeSignal} from "../PropertyDynamo";

export type INodeExpressID = Node<any>;
const ExpressID: FC<NodeProps<INodeExpressID>> = ({id}) => {
  useSignals();
  const [expressID, setExpressID] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const debouncedSearch = debounce(async (criteria) => {
    const newId = parseText(criteria);
    if (newId === "") {
      setExpressID("");
      setError(true);
      return;
    }
    const idString = newId.toString();
    if (isNaN(parseInt(idString))) {
      setExpressID("");
      setError(true);
      return;
    }
    setExpressID(idString);
    setError(false);
    const filtered = expressIDSignal.value.filter((expressID) =>
      expressID.toString().toLowerCase().includes(idString)
    );
    setFilteredIds(filtered.length > 0 ? filtered : []);
  }, 10);
  const [filteredIds, setFilteredIds] = useState<number[]>([]);
  const onSelect = (id: number) => {
    setExpressID(id.toString());
    setError(false);
    setFilteredIds([]);
  };
  useEffect(() => {
    const find = expressIDSignal.value.find(
      (eId) => eId.toString().toLowerCase() === expressID
    );
    const isFound = find !== undefined;
    if (isFound) nodeChangeSignal.value = {id, data: {outputId: expressID}};
  }, [expressID]);
  return (
    <>
      <div className="relative rounded-md bg-slate-300 w-[200px] flex items-center justify-start p-1">
        <p
          className="mx-2 capitalize 
            my-auto select-none 
            whitespace-nowrap overflow-hidden 
            overflow-ellipsis w-[100px] text-left text-black font-bold"
        >
          ExpressID
        </p>
        <div className="relative">
          <Input
            className={`w-[100px] m-auto bg-white text-black ${
              error ? "text-red-600" : ""
            }`}
            onFocus={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            value={expressID}
            onChange={(e) => debouncedSearch(e.target.value)}
          />
          <div
            className={`absolute top-full h-auto w-full z-50 bg-white mx-auto ${
              filteredIds.length > 0 ? "visible" : "hidden"
            } cursor-pointer`}
          >
            {filteredIds.map((id) => (
              <p
                key={id}
                className="my-auto text-left  text-black px-2 text-sm"
                onClick={() => onSelect(+id)}
              >
                {id}
              </p>
            ))}
          </div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className={`${handleClassDot}`}
      />
    </>
  );
};

export default memo(ExpressID);
