import type { RadioGroupProps } from "react-aria-components";
import { Label, Radio, RadioGroup, Text } from "react-aria-components";

interface SelectBoxGroupProps extends Omit<RadioGroupProps, "children"> {
  children?: React.ReactNode;
  label?: string;
}

export function SelectBoxGroup({
  label,
  children,
  ...props
}: SelectBoxGroupProps) {
  return (
    <RadioGroup className="flex flex-col space-y-2 text-center" {...props}>
      <Label className="text-xl font-semibold mb-200">{label}</Label>
      <div className="flex justify-center">{children}</div>
    </RadioGroup>
  );
}

interface SelectBoxProps {
  name: string;
  icon?: React.ReactNode;
  description?: string;
}

export function SelectBox({ name, icon, description }: SelectBoxProps) {
  return (
    <Radio
      value={name}
      className="flex justify-center bg-white border rounded dark:bg-black p-160 m-160 h-2000 w-2000 focus:outline-hidden focus-visible:ring-half focus-visible:ring-offset-0 selected:bg-accent-100 selected:border-accent-700"
    >
      {({ isSelected }) => (
        <div className="relative flex flex-col items-center justify-center w-full h-full gap-150">
          {isSelected && (
            <div className="absolute top-0 left-0 -mt-75 -ml-75">
              <div className="h-[14px] w-[14px] bg-accent-900 rounded-small">
                <svg
                  className="fill-gray-75 pt-[2px] pl-[2px]"
                  focusable="false"
                  aria-hidden="true"
                  role="img"
                >
                  <path d="M3.788 9A.999.999 0 0 1 3 8.615l-2.288-3a1 1 0 1 1 1.576-1.23l1.5 1.991 3.924-4.991a1 1 0 1 1 1.576 1.23l-4.712 6A.999.999 0 0 1 3.788 9z"></path>
                </svg>
              </div>
            </div>
          )}
          {icon && <div className="text-gray-500">{icon}</div>}
          <div className="font-semibold">{name}</div>
          {description && <div className="text-sm">{description}</div>}
        </div>
      )}
    </Radio>
  );
}
