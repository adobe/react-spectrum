'use client';
import {
  Input,
  TextField as AriaTextField,
  TextFieldProps as AriaTextFieldProps,
  ValidationResult
} from 'react-aria-components';
import {Label, FieldError, Description} from './Form';
import './TextField.css';

export interface TextFieldProps extends AriaTextFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function TextField(
  { label, description, errorMessage, ...props }: TextFieldProps
) {
  return (
    <AriaTextField {...props}>
      <Label>{label}</Label>
      <Input className="react-aria-Input inset" />
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaTextField>
  );
}
