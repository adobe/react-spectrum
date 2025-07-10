'use client';
import {
  CheckboxGroup as AriaCheckboxGroup,
  CheckboxGroupProps as AriaCheckboxGroupProps,
  ValidationResult
} from 'react-aria-components';
import {Text} from './Content';
import {Label, FieldError} from './Form';

import './CheckboxGroup.css';

export interface CheckboxGroupProps
  extends Omit<AriaCheckboxGroupProps, 'children'> {
  children?: React.ReactNode;
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function CheckboxGroup(
  {
    label,
    description,
    errorMessage,
    children,
    ...props
  }: CheckboxGroupProps
) {
  return (
    (
      <AriaCheckboxGroup {...props}>
        {label && <Label>{label}</Label>}
        {children}
        {description && <Text slot="description">{description}</Text>}
        <FieldError>{errorMessage}</FieldError>
      </AriaCheckboxGroup>
    )
  );
}
