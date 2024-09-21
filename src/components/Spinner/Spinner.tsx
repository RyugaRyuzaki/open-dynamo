import "./spinner.css";
//@ts-ignore
import {ReactComponent as Logo} from "@assets/logo.svg";
import {spinnerSignal} from "@bim/signals/loader";
import {useSignals} from "@preact/signals-react/runtime";

const Spinner = () => {
  useSignals();
  return (
    <div
      className={`absolute h-full w-full top-0 left-0 z-50 flex items-center bg-slate-400 ${
        spinnerSignal.value ? "visible" : "hidden"
      }`}
    >
      <div className="sk-fading-circle">
        <div className="sk-circle1 sk-circle"></div>
        <div className="sk-circle2 sk-circle"></div>
        <div className="sk-circle3 sk-circle"></div>
        <div className="sk-circle4 sk-circle"></div>
        <div className="sk-circle5 sk-circle"></div>
        <div className="sk-circle6 sk-circle"></div>
        <div className="sk-circle7 sk-circle"></div>
        <div className="sk-circle8 sk-circle"></div>
        <div className="sk-circle9 sk-circle"></div>
        <div className="sk-circle10 sk-circle"></div>
        <div className="sk-circle11 sk-circle"></div>
        <div className="sk-circle12 sk-circle"></div>
        <div className="h-[200px] w-[200px] flex items-center">
          <Logo className="h-24 w-24 m-auto" />
        </div>
      </div>
    </div>
  );
};

export default Spinner;
