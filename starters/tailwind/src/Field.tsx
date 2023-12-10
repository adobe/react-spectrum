import { Label as RACLabel, LabelProps, FieldError as RACFieldError, Text, TextProps, FieldErrorProps, GroupProps, Group, composeRenderProps, Input as RACInput, InputProps } from "react-aria-components";
import React from 'react';
import {twMerge} from 'tailwind-merge';

export function Label(props: LabelProps) {
  return <RACLabel {...props} className={`text-sm text-gray-500 dark:text-zinc-400 font-medium cursor-default w-fit ${props.className || ''}`} />;
}

export function Description(props: TextProps) {
  return <Text {...props} slot="description" className={`text-sm text-gray-600 ${props.className || ''}`} />;
}

export function FieldError(props: FieldErrorProps) {
  return <RACFieldError {...props} className={`text-sm text-red-600 ${props.className || ''}`} />
}

export const fieldBorder = 'border-gray-300 dark:border-zinc-600 invalid:border-red-600 disabled:border-gray-200 dark:disabled:border-zinc-700 focus-within:border-gray-600 dark:focus-within:border-zinc-300';
export const groupFieldBorder = 'border-gray-300 dark:border-zinc-600 group-invalid:border-red-600 group-disabled:border-gray-200 dark:group-disabled:border-zinc-700 group-focus-within:border-gray-600 dark:group-focus-within:border-zinc-300';

export function FieldGroup(props: GroupProps) {
  return <Group {...props} className={composeRenderProps(props.className, className => twMerge('group flex items-center h-9 bg-white dark:bg-zinc-900 border-2 rounded-lg overflow-hidden focus-visible:outline outline-2 outline-blue-600 outline-offset-2', fieldBorder, className))} />;
}

export function Input(props: InputProps) {
  return <RACInput {...props} className={composeRenderProps(props.className, className => twMerge('px-2 py-1.5 flex-1 min-w-0 outline-none bg-white dark:bg-zinc-900 text-sm text-gray-800 dark:text-zinc-200 disabled:text-gray-200 dark:disabled:text-zinc-700', className))} />
}
