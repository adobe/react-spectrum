'use client';
import React, {type ReactNode} from 'react';
import {composeRenderProps} from 'react-aria-components/composeRenderProps';
import {
  RadioField,
  RadioButton,
  RadioGroup as RACRadioGroup,
  type RadioGroupProps as RACRadioGroupProps,
  type RadioFieldProps,
  type ValidationResult
} from 'react-aria-components/RadioGroup';
import {tv} from 'tailwind-variants';
import {Description, FieldError, Label} from './Field';
import {composeTailwindRenderProps, focusRing} from './utils';

export interface RadioGroupProps extends Omit<RACRadioGroupProps, 'children'> {
  label?: string;
  children?: ReactNode;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function RadioGroup(props: RadioGroupProps) {
  return (
    <RACRadioGroup
      {...props}
      className={composeTailwindRenderProps(
        props.className,
        'group flex flex-col gap-2 font-sans'
      )}>
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
  base: 'w-4.5 h-4.5 flex-shrink-0 box-border rounded-full border bg-white dark:bg-neutral-900 transition-all',
  variants: {
    isSelected: {
      false:
        'border-neutral-400 dark:border-neutral-400 group-pressed:border-neutral-500 dark:group-pressed:border-neutral-300',
      true: 'border-[calc(var(--spacing)*1.5)] border-neutral-700 dark:border-neutral-300 forced-colors:border-[Highlight]! group-pressed:border-neutral-800 dark:group-pressed:border-neutral-200'
    },
    isInvalid: {
      true: 'border-red-700 dark:border-red-600 group-pressed:border-red-800 dark:group-pressed:border-red-700 forced-colors:border-[Mark]!'
    },
    isDisabled: {
      true: 'border-neutral-200 dark:border-neutral-700 forced-colors:border-[GrayText]!'
    }
  }
});

export interface RadioProps extends RadioFieldProps {
  description?: string;
}

export function Radio(props: RadioProps) {
  return (
    <RadioField {...props} className="flex flex-col gap-1 group">
      <RadioButton
        className={composeTailwindRenderProps(
          props.className,
          'flex relative gap-2 items-center group text-neutral-800 disabled:text-neutral-300 dark:text-neutral-200 dark:disabled:text-neutral-600 forced-colors:disabled:text-[GrayText] text-sm transition [-webkit-tap-highlight-color:transparent]'
        )}>
        {composeRenderProps(props.children, (children, renderProps) => (
          <>
            <div className={styles(renderProps)} />
            {children}
          </>
        ))}
      </RadioButton>
      {props.description && <Description className="ms-6.5">{props.description}</Description>}
    </RadioField>
  );
}
