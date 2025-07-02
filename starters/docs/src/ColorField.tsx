'use client';
import {
  ColorField as AriaColorField,
  ColorFieldProps as AriaColorFieldProps,
  FieldError,
  Input,
  Label,
  Text,
  ValidationResult
} from 'react-aria-components';

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

export { ColorField as MyColorField };
