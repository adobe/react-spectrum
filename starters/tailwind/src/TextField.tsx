import {
  TextField as AriaTextField,
  TextFieldProps as AriaTextFieldProps,
  ValidationResult
} from 'react-aria-components';
import { Label, Input, FieldError, Description } from './Field';
import React from 'react';

export interface TextFieldProps extends AriaTextFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function TextField(
  { label, description, errorMessage, ...props }: TextFieldProps
) {
  return (
    <AriaTextField {...props} className="flex flex-col gap-1">
      {label && <Label>{label}</Label>}
      <Input className="border-2 border-gray-300 dark:border-zinc-600 invalid:border-red-600 disabled:border-gray-200 rounded-md focus:border-gray-600 dark:focus:border-zinc-300 focus-visible:outline-2 focus-visible:outline-blue-600 outline-offset-2" />
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaTextField>
  );
}
