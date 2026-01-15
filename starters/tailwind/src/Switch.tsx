'use client';
import React from 'react';
import {
  Switch as AriaSwitch,
  SwitchProps as AriaSwitchProps
} from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { composeTailwindRenderProps, focusRing } from './utils';

export interface SwitchProps extends Omit<AriaSwitchProps, 'children'> {
  children: React.ReactNode;
}

const track = tv({
  extend: focusRing,
  base: 'flex h-5 w-9 box-border px-px items-center shrink-0 cursor-default rounded-full transition duration-200 ease-in-out shadow-inner border border-transparent font-sans',
  variants: {
    isSelected: {
      false: 'bg-neutral-100 dark:bg-neutral-800 group-pressed:bg-neutral-200 dark:group-pressed:bg-neutral-700 border-neutral-400 dark:border-neutral-400',
      true: 'bg-neutral-700 dark:bg-neutral-300 forced-colors:bg-[Highlight]! group-pressed:bg-neutral-800 dark:group-pressed:bg-neutral-200',
    },
    isDisabled: {
      true: 'bg-neutral-100 dark:bg-neutral-800 group-selected:bg-neutral-300 dark:group-selected:bg-neutral-800 forced-colors:group-selected:bg-[GrayText]! border-neutral-300 dark:border-neutral-900 forced-colors:border-[GrayText]',
    }
  }
});

const handle = tv({
  base: 'h-4 w-4 transform rounded-full outline outline-1 -outline-offset-1 outline-transparent shadow-xs transition duration-200 ease-in-out',
  variants: {
    isSelected: {
      false: 'translate-x-0 bg-neutral-900 dark:bg-neutral-300',
      true: 'translate-x-[100%] bg-white dark:bg-neutral-900'
    },
    isDisabled: {
      true: 'forced-colors:outline-[GrayText]'
    }
  },
  compoundVariants: [
    {
      isSelected: false,
      isDisabled: true,
      class: 'bg-neutral-300 dark:bg-neutral-700'
    },
    {
      isSelected: true,
      isDisabled: true,
      class: 'bg-neutral-50 dark:bg-neutral-700'
    }
  ]
});

export function Switch({ children, ...props }: SwitchProps) {
  return (
    <AriaSwitch {...props} className={composeTailwindRenderProps(props.className, 'group relative flex gap-2 items-center text-neutral-800 disabled:text-neutral-300 dark:text-neutral-200 dark:disabled:text-neutral-600 forced-colors:disabled:text-[GrayText] text-sm transition [-webkit-tap-highlight-color:transparent]')}>
      {(renderProps) => (
        <>
          <div className={track(renderProps)}>
            <span className={handle(renderProps)} />
          </div>
          {children}
        </>
      )}
    </AriaSwitch>
  );
}
