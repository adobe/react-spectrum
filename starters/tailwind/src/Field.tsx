'use client';
import React from 'react';
import { FieldErrorProps, Group, GroupProps, InputProps, LabelProps, FieldError as RACFieldError, Input as RACInput, Label as RACLabel, Text, TextProps, composeRenderProps } from "react-aria-components";
import { twMerge } from 'tailwind-merge';
import { tv } from 'tailwind-variants';
import { composeTailwindRenderProps, focusRing } from "./utils";

export function Label(props: LabelProps) {
  return <RACLabel {...props} className={twMerge('font-sans text-sm text-neutral-600 dark:text-neutral-300 font-medium cursor-default w-fit', props.className)} />;
}

export function Description(props: TextProps) {
  return <Text {...props} slot="description" className={twMerge('text-sm text-neutral-600', props.className)} />;
}

export function FieldError(props: FieldErrorProps) {
  return <RACFieldError {...props} className={composeTailwindRenderProps(props.className, 'text-sm text-red-600 forced-colors:text-[Mark]')} />
}

export const fieldBorderStyles = tv({
  base: 'transition',
  variants: {
    isFocusWithin: {
      false: 'border-neutral-300 hover:border-neutral-400 dark:border-neutral-600 dark:hover:border-neutral-500 forced-colors:border-[ButtonBorder]',
      true: 'border-neutral-600 dark:border-neutral-300 forced-colors:border-[Highlight]',
    },
    isInvalid: {
      true: 'border-red-600 dark:border-red-600 forced-colors:border-[Mark]'
    },
    isDisabled: {
      true: 'border-neutral-200 dark:border-neutral-700 forced-colors:border-[GrayText]'
    }
  }
});

export const fieldGroupStyles = tv({
  extend: focusRing,
  base: 'group flex items-center h-9 box-border bg-white dark:bg-neutral-900 forced-colors:bg-[Field] border rounded-lg overflow-hidden transition',
  variants: fieldBorderStyles.variants
});

export function FieldGroup(props: GroupProps) {
  return <Group {...props} className={composeRenderProps(props.className, (className, renderProps) => fieldGroupStyles({...renderProps, className}))} />;
}

export function Input(props: InputProps) {
  return <RACInput {...props} className={composeTailwindRenderProps(props.className, 'px-3 py-0 min-h-9 flex-1 min-w-0 border-0 outline outline-0 bg-white dark:bg-neutral-900 font-sans text-sm text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-600 dark:placeholder:text-neutral-400 disabled:text-neutral-200 dark:disabled:text-neutral-600 disabled:placeholder:text-neutral-200 dark:disabled:placeholder:text-neutral-600 [-webkit-tap-highlight-color:transparent]')} />
}
