import {CheckboxGroup as RACCheckboxGroup, Checkbox as RACCheckbox, CheckboxGroupProps as RACCheckboxGroupProps, CheckboxProps, ValidationResult} from 'react-aria-components';
import {Check, Minus} from 'lucide-react';
import {Label, FieldError, Description} from './Field';
import {focusRing} from './utils';
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
  extend: focusRing,
  base: 'w-5 h-5 flex-shrink-0 rounded flex items-center justify-center border-2 transition',
  variants: {
    isSelected: {
      false: 'bg-white border-gray-400 group-pressed:border-gray-500 dark:bg-zinc-900 dark:border-zinc-400 dark:group-pressed:border-zinc-300',
      true: 'bg-gray-700 border-gray-700 group-pressed:border-gray-800 group-pressed:bg-gray-800 dark:bg-slate-300 dark:border-slate-300 dark:group-pressed:border-slate-200 dark:group-pressed:bg-slate-200 forced-colors:!bg-[Highlight] forced-colors:!border-[Highlight]'
    },
    isInvalid: {
      true: 'border-red-700 group-pressed:border-red-800 group-selected:bg-red-700'
    },
    isDisabled: {
      true: 'border-gray-200 forced-colors:border-[GrayText]'
    }
  }
});

const iconStyles = 'w-4 h-4 text-white group-disabled:text-gray-400 dark:text-slate-900 dark:group-disabled:text-slate-600 forced-colors:!text-[HighlightText] forced-colors:group-disabled:!text-[GrayText]';

export function Checkbox(props: CheckboxProps) {
  return (
    <RACCheckbox {...props} className="flex gap-2 items-center group text-gray-800 disabled:text-gray-300 dark:text-zinc-200 dark:disabled:text-zinc-600 forced-colors:disabled:!text-[GrayText] text-sm transition">
      {({isSelected, isIndeterminate, ...renderProps}) => (
        <>
          <div className={styles({isSelected: isSelected || isIndeterminate, ...renderProps})}>
            {isIndeterminate
              ? <Minus aria-hidden className={iconStyles} />
              : isSelected
                ? <Check aria-hidden className={iconStyles} />
                : null
            }
          </div>
          {props.children}
        </>
      )}
    </RACCheckbox>
  );
}
