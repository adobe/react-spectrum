'use client';
import {
  Button,
  FieldError,
  Input,
  Label,
  SearchField as AriaSearchField,
  SearchFieldProps as AriaSearchFieldProps,
  Text,
  ValidationResult
} from 'react-aria-components';
import {X} from 'lucide-react';
import './SearchField.css';

export interface SearchFieldProps extends AriaSearchFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  placeholder?: string;
}

export function SearchField(
  { label, description, errorMessage, placeholder, ...props }: SearchFieldProps
) {
  return (
    (
      <AriaSearchField {...props}>
        {label && <Label>{label}</Label>}
        <Input placeholder={placeholder} />
        <Button><X size={14} /></Button>
        {description && <Text slot="description">{description}</Text>}
        <FieldError>{errorMessage}</FieldError>
      </AriaSearchField>
    )
  );
}
