import React, { ReactNode } from 'react';
import { Radio as RACRadio, RadioGroup as RACRadioGroup, RadioGroupProps as RACRadioGroupProps, RadioProps, ValidationResult } from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { Description, FieldError, Label } from './Field';
import { composeTailwindRenderProps, focusRing } from './utils';

export interface RadioGroupProps extends Omit<RACRadioGroupProps, 'children'> {
  label?: string,
  children?: ReactNode,
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function RadioGroup(props: RadioGroupProps) {
  return (
    <RACRadioGroup {...props} className={composeTailwindRenderProps(props.className, 'group flex flex-col gap-2')}>
      <Label>{props.label}</Label>
      <div className="flex group-orientation-vertical:flex-col gap-2 group-orientation-horizontal:gap-4">
        {props.children}
      </div>
      {props.description && <Description>{props.description}</Description>}
      <FieldError>{props.errorMessage}</FieldError>
    </RACRadioGroup>
  );
}

const styles = tv({
  extend: focusRing,
  base: 'w-5 h-5 rounded-full border-2 bg-white dark:bg-zinc-900 transition-all',
  variants: {
    isSelected: {
      false: 'border-gray-400 dark:border-zinc-400 group-pressed:border-gray-500 dark:group-pressed:border-zinc-300',
      true: 'border-[7px] border-gray-700 dark:border-slate-300 forced-colors:border-[Highlight]! group-pressed:border-gray-800 dark:group-pressed:border-slate-200'
    },
    isInvalid: {
      true: 'border-red-700 dark:border-red-600 group-pressed:border-red-800 dark:group-pressed:border-red-700 forced-colors:border-[Mark]!'
    },
    isDisabled: {
      true: 'border-gray-200 dark:border-zinc-700 forced-colors:border-[GrayText]!'
    }
  }
});

export function Radio(props: RadioProps) {
  return (
    <RACRadio {...props} className={composeTailwindRenderProps(props.className, 'flex gap-2 items-center group text-gray-800 disabled:text-gray-300 dark:text-zinc-200 dark:disabled:text-zinc-600 forced-colors:disabled:text-[GrayText] text-sm transition')}>
      {renderProps => <>
        <div className={styles(renderProps)} />
        {props.children}
      </>}
    </RACRadio>
  );
}
