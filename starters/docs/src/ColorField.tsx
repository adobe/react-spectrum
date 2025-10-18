'use client';
import {
  ColorField as AriaColorField,
  ColorFieldProps as AriaColorFieldProps,
  Input,
  ValidationResult
} from 'react-aria-components';
import {Text} from './Content';
import {Label, FieldError, Description} from './Form';

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
        <Input className="react-aria-Input inset" />
        {description && <Description>{description}</Description>}
        <FieldError>{errorMessage}</FieldError>
      </AriaColorField>
    )
  );
}
