import { Radio, RadioGroup, Label } from "react-aria-components";

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
      className="flex flex-col m-auto space-y-10 text-center"
    >
      <Label className="text-xl font-semibold mb-200">Plan Switcher</Label>
      <div className="relative m-auto flex justify-evenly w-[400px]">
        <Option aria-label="Own label" side="start" value="annual">
          Annual
          <span className="absolute py-1 text-xs text-white bg-gray-500 rounded left-100 px-75 -top-75">
            Save 33%
          </span>
        </Option>
        <Option side="end" value="monthly">
          Monthly
        </Option>
      </div>
    </RadioGroup>
  );
}
