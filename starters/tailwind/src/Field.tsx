import { Label as RACLabel, LabelProps, FieldError as RACFieldError, Text, TextProps, FieldErrorProps, GroupProps, Group, composeRenderProps, Input as RACInput, InputProps } from "react-aria-components";
import {focusRing} from "./utils";
import React from 'react';
import {tv} from 'tailwind-variants';
import {twMerge} from 'tailwind-merge';

export function Label(props: LabelProps) {
  return <RACLabel {...props} className={`text-sm text-gray-500 dark:text-zinc-400 font-medium cursor-default w-fit ${props.className || ''}`} />;
}

export function Description(props: TextProps) {
  return <Text {...props} slot="description" className={`text-sm text-gray-600 ${props.className || ''}`} />;
}

export function FieldError(props: FieldErrorProps) {
  return <RACFieldError {...props} className={`text-sm text-red-600 forced-colors:text-[Mark] ${props.className || ''}`} />
}

export const fieldBorderStyles = tv({
  variants: {
    isFocusWithin: {
      false: 'border-gray-300 dark:border-zinc-500 forced-colors:!border-[ButtonBorder]',
      true: 'border-gray-600 dark:border-zinc-300 forced-colors:!border-[Highlight]',
    },
    isInvalid: {
      true: 'border-red-600 dark:border-red-600 forced-colors:!border-[Mark]'
    },
    isDisabled: {
      true: 'border-gray-200 dark:border-zinc-700 forced-colors:!border-[GrayText]'
    }
  }
});

export const fieldGroupStyles = tv({
  extend: focusRing,
  base: 'group flex items-center h-9 bg-white dark:bg-zinc-900 forced-colors:!bg-[Field] border-2 rounded-lg overflow-hidden',
  variants: fieldBorderStyles.variants
});

export function FieldGroup(props: GroupProps) {
  return <Group {...props} className={composeRenderProps(props.className, (className, renderProps) => fieldGroupStyles({...renderProps, className}))} />;
}

export function Input(props: InputProps) {
  return <RACInput {...props} className={composeRenderProps(props.className, className => twMerge('px-2 py-1.5 flex-1 min-w-0 outline outline-0 bg-white dark:bg-zinc-900 text-sm text-gray-800 dark:text-zinc-200 disabled:text-gray-200 dark:disabled:text-zinc-700', className))} />
}
