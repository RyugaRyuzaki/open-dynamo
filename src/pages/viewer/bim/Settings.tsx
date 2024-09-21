import Theme from "@components/theme";
import {memo} from "react";
import {ButtonProps, iconClassName, ToolButton} from "./ToolButtons";
import {GoArrowSwitch} from "react-icons/go";
import {MdOutlineFitScreen} from "react-icons/md";
import {dynamoDirectionSignal} from "../BimViewer";
import {fitViewSignal} from "./PropertyDynamo";
const Settings = () => {
  const onChangeDirection = () => {
    dynamoDirectionSignal.value =
      dynamoDirectionSignal.value === "horizontal" ? "vertical" : "horizontal";
  };
  const onFitView = () => {
    fitViewSignal.value = true;
  };

  const list: ButtonProps[] = [
    {
      tooltip: "Change direction",
      icon: <GoArrowSwitch className={iconClassName} />,
      onClick: onChangeDirection,
      disabled: false,
    },
    {
      tooltip: "Fit",
      icon: <MdOutlineFitScreen className={iconClassName} />,
      onClick: onFitView,
      disabled: false,
    },
  ];
  return (
    <div className="relative w-full flex justify-end my-1">
      <div className="relative flex-1 flex justify-end border-1 border-r-2">
        {list.map((bt: ButtonProps, index: number) => (
          <ToolButton key={bt.tooltip + index} {...bt} />
        ))}
      </div>
      <div className="relative my-auto mx-1">
        <Theme />
      </div>
    </div>
  );
};

export default memo(Settings);
