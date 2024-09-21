import {memo, useState} from "react";
import * as OBC from "@thatopen/components";
import {Input} from "@/components/ui/input";
import Element from "./node-types/Element";
import {useComputed, useSignals} from "@preact/signals-react/runtime";
import {categoriesSignal} from "@bim/signals";
import {INodeCategory} from "@bim/types";

const Elements = () => {
  useSignals();
  const allCategories = useComputed<INodeCategory[]>(() =>
    Object.keys(categoriesSignal.value).map(
      (key) => categoriesSignal.value[+key]
    )
  );
  const onSearch = (event: any) => {
    const value = event.target.value.toLowerCase().trim();
    const filtered = allCategories.value.filter((category) =>
      category.name.toLowerCase().includes(value)
    );
    setFilteredCategories(value && filtered.length > 0 ? filtered : []);
  };
  const [filteredCategories, setFilteredCategories] = useState<INodeCategory[]>(
    []
  );

  return (
    <div className="relative w-full flex-1 max-h-[100vh] overflow-x-hidden overflow-y-auto">
      <div className="relative flex justify-start my-2">
        <Input
          className="w-[95%] m-auto"
          placeholder="Search"
          onChange={onSearch}
        />
      </div>
      <div className="relative flex flex-col gap-2 mt-2">
        {filteredCategories.map((category) => (
          <Element
            key={category.id}
            categoryId={category.id}
            nodeType={"Relation"}
            type={category.name}
          />
        ))}
      </div>
    </div>
  );
};

export default memo(Elements);
