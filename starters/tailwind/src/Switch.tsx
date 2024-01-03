import {
  Switch as AriaSwitch,
  SwitchProps as AriaSwitchProps
} from 'react-aria-components';
import React from 'react';

export interface SwitchProps extends Omit<AriaSwitchProps, 'children'> {
  children: React.ReactNode;
}

export function Switch({ children, ...props }: SwitchProps) {
  return (
    <AriaSwitch {...props} className="group flex gap-2 items-center text-gray-800 disabled:text-gray-300 dark:text-zinc-200 dark:disabled:text-zinc-600 forced-colors:disabled:text-[GrayText] text-sm transition">
      <div className="flex h-4 w-7 px-px items-center shrink-0 cursor-default rounded-full transition duration-200 ease-in-out shadow-inner bg-gray-400 dark:bg-zinc-400 group-pressed:bg-gray-500 dark:group-pressed:bg-zinc-300 group-selected:bg-gray-700 dark:group-selected:bg-zinc-300 forced-colors:group-selected:!bg-[Highlight] group-selected:group-pressed:bg-gray-800 dark:group-selected:group-pressed:bg-zinc-200 group-disabled:bg-gray-200 dark:group-disabled:bg-zinc-700 forced-colors:group-selected:group-disabled:!bg-[GrayText] outline outline-0 border border-transparent forced-colors:group-disabled:border-[GrayText] group-focus-visible:outline-blue-600 outline-offset-2">
        <span className="h-3 w-3 transform rounded-full bg-white dark:bg-zinc-900 outline outline-1 -outline-offset-1 outline-transparent forced-colors:group-disabled:outline-[GrayText] shadow transition duration-200 ease-in-out translate-x-0 group-selected:translate-x-[100%]" />
      </div>
      {children}
    </AriaSwitch>
  );
}
