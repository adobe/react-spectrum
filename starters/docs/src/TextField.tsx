'use client';
import {
  Input,
  TextField as AriaTextField,
  TextArea as AriaTextArea,
  type TextFieldProps as AriaTextFieldProps,
  type ValidationResult
} from 'react-aria-components/TextField';
import {Label, FieldError, Description} from './Form';
import './TextField.css';
import type React from 'react';

export interface TextFieldProps<T = HTMLInputElement> extends AriaTextFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  placeholder?: string;
  inputRef?: React.Ref<T>;
}

export function TextField({
  label,
  description,
  errorMessage,
  placeholder,
  inputRef,
  ...props
}: TextFieldProps) {
  return (
    <AriaTextField {...props}>
      {label && <Label>{label}</Label>}
      <Input ref={inputRef} className="react-aria-Input inset" placeholder={placeholder} />
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaTextField>
  );
}

export function TextArea({
  label,
  description,
  errorMessage,
  placeholder,
  inputRef,
  ...props
}: TextFieldProps<HTMLTextAreaElement>) {
  return (
    <AriaTextField {...props}>
      <Label>{label}</Label>
      <AriaTextArea
        ref={inputRef}
        className="react-aria-TextArea inset"
        placeholder={placeholder}
      />
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaTextField>
  );
}
