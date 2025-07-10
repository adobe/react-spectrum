'use client';
import {
  ColorField as AriaColorField,
  ColorFieldProps as AriaColorFieldProps,
  Input,
  ValidationResult
} from 'react-aria-components';
import {Text} from './Content';
import {Label, FieldError} from './Form';

import './ColorField.css';

export interface ColorFieldProps extends AriaColorFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function ColorField(
  { label, description, errorMessage, ...props }: ColorFieldProps
) {
  return (
    (
      <AriaColorField {...props}>
        {label && <Label>{label}</Label>}
        <Input />
        {description && <Text slot="description">{description}</Text>}
        <FieldError>{errorMessage}</FieldError>
      </AriaColorField>
    )
  );
}
