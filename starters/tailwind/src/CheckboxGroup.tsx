'use client';
import React, { ReactNode } from 'react';
import { CheckboxGroup as AriaCheckboxGroup, CheckboxGroupProps as AriaCheckboxGroupProps, ValidationResult } from 'react-aria-components';
import { Description, FieldError, Label } from './Field';
import { composeTailwindRenderProps } from './utils';

export interface CheckboxGroupProps extends Omit<AriaCheckboxGroupProps, 'children'> {
  label?: string,
  children?: ReactNode,
  description?: string,
  errorMessage?: string | ((validation: ValidationResult) => string)
}

export function CheckboxGroup(props: CheckboxGroupProps) {
  return (
    <AriaCheckboxGroup {...props} className={composeTailwindRenderProps(props.className, 'flex flex-col gap-2 font-sans')}>
      <Label>{props.label}</Label>
      {props.children}
      {props.description && <Description>{props.description}</Description>}
      <FieldError>{props.errorMessage}</FieldError>
    </AriaCheckboxGroup>
  );
}
