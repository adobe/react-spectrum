'use client';
import {
  CheckboxGroup as AriaCheckboxGroup,
  CheckboxGroupProps as AriaCheckboxGroupProps,
  FieldError,
  Label,
  Text,
  ValidationResult
} from 'react-aria-components';

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

export { CheckboxGroup as MyCheckboxGroup };
