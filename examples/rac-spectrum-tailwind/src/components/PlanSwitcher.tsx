import { Radio, RadioGroup } from "react-aria-components";

interface OptionProps {
  side: "start" | "end";
  value: string;
  children: React.ReactNode;
}

function Option({ side, value, children }: OptionProps) {
  return (
    <Radio
      value={value}
      className={`w-full text-center border border-gray-300 p-75 flex items-center justify-center ${
        side === "start" ? "rounded-s" : "rounded-e"
      } selected:border-accent-800 selected:bg-accent-100 selected:text-accent-900 focus-visible:ring-half ring-offset-0`}
    >
      {children}
    </Radio>
  );
}

export function PlanSwitcher() {
  return (
    <RadioGroup
      defaultValue="annual"
      className="relative m-auto flex justify-evenly w-[400px]"
    >
      <span className="absolute py-1 text-xs text-white bg-gray-500 rounded left-100 px-75 -top-75">
        Save 33%
      </span>
      <Option side="start" value="annual">
        Annual
      </Option>
      <Option side="end" value="monthly">
        Monthly
      </Option>
    </RadioGroup>
  );
}
