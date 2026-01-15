'use client';
import React from 'react';
import { ToggleButton as RACToggleButton, ToggleButtonProps, composeRenderProps } from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { focusRing } from './utils';

let styles = tv({
  extend: focusRing,
  base: 'relative inline-flex items-center justify-center gap-2 border border-black/10 dark:border-white/10 h-9 box-border px-3.5 [&:has(>svg:only-child)]:px-0 [&:has(>svg:only-child)]:h-8 [&:has(>svg:only-child)]:aspect-square font-sans text-sm text-center transition rounded-lg cursor-default forced-color-adjust-none [-webkit-tap-highlight-color:transparent]',
  variants: {
    isSelected: {
      false: 'bg-neutral-50 hover:bg-neutral-100 pressed:bg-neutral-200 text-neutral-800 dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:pressed:bg-neutral-500 dark:text-neutral-100 forced-colors:bg-[ButtonFace]! forced-colors:text-[ButtonText]!',
      true: 'bg-neutral-700 hover:bg-neutral-800 pressed:bg-neutral-900 text-white dark:bg-neutral-300 dark:hover:bg-neutral-200 dark:pressed:bg-neutral-100 dark:text-black forced-colors:bg-[Highlight]! forced-colors:text-[HighlightText]!'
    },
    isDisabled: {
      true: 'border-transparent dark:border-transparent bg-neutral-100 dark:bg-neutral-800 forced-colors:bg-[ButtonFace]! text-neutral-300 dark:text-neutral-600 forced-colors:text-[GrayText]!'
    }
  }
});

export function ToggleButton(props: ToggleButtonProps) {
  return (
    <RACToggleButton
      {...props}
      className={composeRenderProps(
        props.className,
        (className, renderProps) => styles({...renderProps, className})
      )} />
  );
}
