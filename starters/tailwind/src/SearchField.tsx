'use client';
import { SearchIcon, XIcon } from 'lucide-react';
import React from 'react';
import {
  SearchField as AriaSearchField,
  SearchFieldProps as AriaSearchFieldProps,
  ValidationResult
} from 'react-aria-components';
import { Description, FieldError, FieldGroup, Input, Label } from './Field';
import { composeTailwindRenderProps } from './utils';
import { FieldButton } from './FieldButton';

export interface SearchFieldProps extends AriaSearchFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  placeholder?: string
}

export function SearchField(
  { label, description, errorMessage, placeholder, ...props }: SearchFieldProps
) {
  return (
    <AriaSearchField {...props} className={composeTailwindRenderProps(props.className, 'group flex flex-col gap-1 min-w-[40px] font-sans')}>
      {label && <Label>{label}</Label>}
      <FieldGroup>
        <SearchIcon aria-hidden className="w-4 h-4 ml-2 text-gray-500 dark:text-zinc-400 forced-colors:text-[ButtonText] group-disabled:text-gray-200 dark:group-disabled:text-zinc-600 forced-colors:group-disabled:text-[GrayText]" />
        <Input placeholder={placeholder} className="[&::-webkit-search-cancel-button]:hidden" />
        <FieldButton className="mr-1 w-6 group-empty:invisible">
          <XIcon aria-hidden className="w-4 h-4" />
        </FieldButton>
      </FieldGroup>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaSearchField>
  );
}
