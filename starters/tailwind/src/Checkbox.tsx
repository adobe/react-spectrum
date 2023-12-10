import {CheckboxGroup as RACCheckboxGroup, Checkbox as RACCheckbox, CheckboxGroupProps as RACCheckboxGroupProps, CheckboxProps, ValidationResult} from 'react-aria-components';
import {Check, Minus} from 'lucide-react';
import {Label, FieldError, Description} from './Field';
import React, {ReactNode} from 'react';
import {tv} from 'tailwind-variants';

export interface CheckboxGroupProps extends Omit<RACCheckboxGroupProps, 'children'> {
  label?: string,
  children?: ReactNode,
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function CheckboxGroup(props: CheckboxGroupProps) {
  return (
    <RACCheckboxGroup {...props} className="flex flex-col gap-2">
      <Label>{props.label}</Label>
      {props.children}
      {props.description && <Description>{props.description}</Description>}
      <FieldError>{props.errorMessage}</FieldError>
    </RACCheckboxGroup>
  );
}

const styles = tv({
  base: 'w-5 h-5 flex-shrink-0 rounded flex items-center justify-center border-2 transition group-focus-visible:outline outline-2 outline-blue-600 outline-offset-2',
  variants: {
    isSelected: {
      false: 'bg-white border-gray-400 group-pressed:border-gray-500 dark:bg-zinc-900 dark:border-zinc-500 dark:group-pressed:border-zinc-400',
      true: 'bg-gray-700 border-gray-700 group-pressed:border-gray-800 group-pressed:bg-gray-800 dark:bg-slate-300 dark:border-slate-300 dark:group-pressed:border-slate-200 dark:group-pressed:bg-slate-200'
    },
    isInvalid: {
      true: 'border-red-700 group-pressed:border-red-800 group-selected:bg-red-700'
    },
    isDisabled: {
      true: 'border-gray-200'
    }
  }
});

export function Checkbox(props: CheckboxProps) {
  return (
    <RACCheckbox {...props} className="flex gap-2 items-center group text-gray-800 disabled:text-gray-300 dark:text-zinc-200 dark:disabled:text-zinc-600 text-sm transition">
      {({isSelected, isIndeterminate, isInvalid, isDisabled}) => (
        <>
          <div className={styles({isSelected: isSelected || isIndeterminate, isInvalid, isDisabled})}>
            {isIndeterminate
              ? <Minus className="w-4 h-4 text-white group-disabled:text-gray-400 dark:text-slate-900 dark:group-disabled:text-slate-600" />
              : isSelected
                ? <Check className="w-4 h-4 text-white group-disabled:text-gray-400 dark:text-slate-900 dark:group-disabled:text-slate-600" />
                : null
            }
          </div>
          {props.children}
        </>
      )}
    </RACCheckbox>
  );
}
