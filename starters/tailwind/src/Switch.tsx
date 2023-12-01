import {
  Switch as AriaSwitch,
  SwitchProps as AriaSwitchProps
} from 'react-aria-components';

export interface SwitchProps extends Omit<AriaSwitchProps, 'children'> {
  children: React.ReactNode;
}

export function Switch({ children, ...props }: SwitchProps) {
  return (
    <AriaSwitch {...props} className="group flex gap-2 items-center text-gray-800 disabled:text-gray-300 text-sm transition">
      <div className="flex h-4 w-7 px-0.5 items-center shrink-0 cursor-default rounded-full transition duration-200 ease-in-out shadow-inner bg-gray-400 group-pressed:bg-gray-500 group-selected:bg-gray-700 group-selected:group-pressed:bg-gray-800 group-disabled:bg-gray-200 outline-none group-focus-visible:outline-blue-600 outline-offset-2">
        <span className="h-3 w-3 transform rounded-full bg-white shadow transition duration-200 ease-in-out translate-x-0 group-selected:translate-x-[100%]" />
      </div>
      {children}
    </AriaSwitch>
  );
}
