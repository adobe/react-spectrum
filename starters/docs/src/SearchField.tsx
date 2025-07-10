'use client';
import {
  Button,
  Input,
  SearchField as AriaSearchField,
  SearchFieldProps as AriaSearchFieldProps,
  ValidationResult
} from 'react-aria-components';
import {Label, FieldError} from './Form';
import {Text} from './Content';
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
