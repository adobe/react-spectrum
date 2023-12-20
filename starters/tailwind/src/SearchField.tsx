import {
  SearchField as AriaSearchField,
  SearchFieldProps as AriaSearchFieldProps,
  ValidationResult
} from 'react-aria-components';
import { Button } from './Button';
import { SearchIcon, XIcon } from 'lucide-react';
import { FieldGroup, FieldError, Description, Label, Input } from './Field';
import React from 'react';

export interface SearchFieldProps extends AriaSearchFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function SearchField(
  { label, description, errorMessage, ...props }: SearchFieldProps
) {
  return (
    <AriaSearchField {...props} className={`group flex flex-col gap-1 min-w-[40px] ${props.className}`}>
      {label && <Label>{label}</Label>}
      <FieldGroup>
        <SearchIcon aria-hidden className="w-4 h-4 ml-2 text-gray-500 dark:text-zinc-400 forced-colors:!text-[ButtonText]" />
        <Input className="[&::-webkit-search-cancel-button]:hidden disabled:[-webkit-text-fill-color:theme(colors.gray.200)]" />
        <Button variant="icon" className="mr-1 w-6 group-empty:invisible">
          <XIcon aria-hidden className="w-4 h-4" />
        </Button>
      </FieldGroup>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaSearchField>
  );
}
