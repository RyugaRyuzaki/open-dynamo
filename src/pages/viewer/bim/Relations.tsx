import * as OBC from "@thatopen/components";
import {memo, useState} from "react";
import {Input} from "@/components/ui/input";

import {relToAttributesMap} from "@bim/constants";
import Element from "./node-types/Element";
import {INodeCategory} from "@bim/types";

const allRelations = Array.from(relToAttributesMap.keys()).map((key) => ({
  id: key,
  name: OBC.IfcCategoryMap[+key],
}));

const Relations = () => {
  const [filteredRelations, setFilteredRelations] =
    useState<INodeCategory[]>(allRelations);

  const onSearch = (event: any) => {
    const value = event.target.value.toLowerCase().trim();

    setFilteredRelations(
      allRelations.filter((category) =>
        category.name.toLowerCase().includes(value)
      )
    );
  };
  return (
    <>
      <div className="relative flex justify-start my-2">
        <Input
          className="w-[95%] m-auto"
          placeholder="Search"
          onChange={onSearch}
        />
      </div>
      <div className="w-full h-[20vh] max-h-[20vh] overflow-x-hidden overflow-y-auto flex flex-col gap-2 mt-2">
        {filteredRelations.map((rel) => (
          <Element
            key={rel.id}
            categoryId={rel.id}
            nodeType={"Relation"}
            type={rel.name}
          />
        ))}
      </div>
    </>
  );
};

export default memo(Relations);
