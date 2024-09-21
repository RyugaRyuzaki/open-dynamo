import {useId} from "react";
import {Switch} from "@components/ui/switch";
import {Label} from "@/components/ui/label";
import {appTheme} from "@stores/theme";
import {useSignals} from "@preact/signals-react/runtime";
const Theme = () => {
  useSignals();
  const themeId = useId();
  return (
    <div className="relative h-[90%] my-auto flex ">
      <Switch
        id={themeId}
        checked={appTheme.value === "dark"}
        onCheckedChange={(e: boolean) => {
          appTheme.value = e ? "dark" : "light";
        }}
      />
      <Label htmlFor={themeId} className="my-auto ml-2">
        Dark
      </Label>
    </div>
  );
};

export default Theme;
