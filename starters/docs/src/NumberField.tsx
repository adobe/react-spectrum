'use client';
import {
  Group,
  Input,
  NumberField as AriaNumberField,
  NumberFieldProps as AriaNumberFieldProps,
  ValidationResult
} from 'react-aria-components';
import {Button} from './Button';
import {Plus, Minus} from 'lucide-react';
import {Label, FieldError, Description} from './Form';
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
          <Input className="react-aria-Input inset" />
          <Button slot="decrement" variant="secondary"><Minus /></Button>
          <Button slot="increment" variant="secondary"><Plus /></Button>
        </Group>
        {description && <Description>{description}</Description>}
        <FieldError>{errorMessage}</FieldError>
      </AriaNumberField>
    )
  );
}
