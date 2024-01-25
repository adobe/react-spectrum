import { SearchIcon, XIcon } from 'lucide-react';
import React from 'react';
import {
  SearchField as AriaSearchField,
  SearchFieldProps as AriaSearchFieldProps,
  ValidationResult
} from 'react-aria-components';
import { Button } from './Button';
import { Description, FieldError, FieldGroup, Input, Label } from './Field';
import { composeTailwindRenderProps } from './utils';

export interface SearchFieldProps extends AriaSearchFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function SearchField(
  { label, description, errorMessage, ...props }: SearchFieldProps
) {
  return (
    <AriaSearchField {...props} className={composeTailwindRenderProps(props.className, 'group flex flex-col gap-1 min-w-[40px]')}>
      {label && <Label>{label}</Label>}
      <FieldGroup>
        <SearchIcon aria-hidden className="w-4 h-4 ml-2 text-gray-500 dark:text-zinc-400 forced-colors:text-[ButtonText] group-disabled:text-gray-200 dark:group-disabled:text-zinc-600 forced-colors:group-disabled:text-[GrayText]" />
        <Input className="[&::-webkit-search-cancel-button]:hidden" />
        <Button variant="icon" className="mr-1 w-6 group-empty:invisible">
          <XIcon aria-hidden className="w-4 h-4" />
        </Button>
      </FieldGroup>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaSearchField>
  );
}
