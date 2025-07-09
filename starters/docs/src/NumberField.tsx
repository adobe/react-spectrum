'use client';
import {
  Button,
  FieldError,
  Group,
  Input,
  Label,
  NumberField as AriaNumberField,
  NumberFieldProps as AriaNumberFieldProps,
  Text,
  ValidationResult
} from 'react-aria-components';
import {Plus, Minus} from 'lucide-react';

import './NumberField.css';

export interface NumberFieldProps extends AriaNumberFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function NumberField(
  { label, description, errorMessage, ...props }: NumberFieldProps
) {
  return (
    (
      <AriaNumberField {...props}>
        <Label>{label}</Label>
        <Group>
          <Button slot="decrement"><Minus size={18} /></Button>
          <Input />
          <Button slot="increment"><Plus size={18} /></Button>
        </Group>
        {description && <Text slot="description">{description}</Text>}
        <FieldError>{errorMessage}</FieldError>
      </AriaNumberField>
    )
  );
}
