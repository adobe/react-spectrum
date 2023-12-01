import {
  Input,
  SearchField as AriaSearchField,
  SearchFieldProps as AriaSearchFieldProps,
  ValidationResult
} from 'react-aria-components';
import { Button } from './Button';
import { SearchIcon, XIcon } from 'lucide-react';
import { FieldGroup, FieldError, Description, Label } from './Field';

export interface SearchFieldProps extends AriaSearchFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function SearchField(
  { label, description, errorMessage, ...props }: SearchFieldProps
) {
  return (
    <AriaSearchField {...props} className="group flex flex-col gap-1">
      {label && <Label>{label}</Label>}
      <FieldGroup>
        <SearchIcon className="w-4 h-4 ml-2 text-gray-500" />
        <Input className="[&::-webkit-search-cancel-button]:hidden bg-transparent flex-1 min-w-0 px-2 py-1.5 outline-none text-sm text-gray-800 placeholder-shown:text-gray-800 disabled:text-gray-200 disabled:[-webkit-text-fill-color:theme(colors.gray.200)]" />
        <Button variant="icon" className="mr-1 w-6 group-empty:invisible"><XIcon className="w-4 h-4" /></Button>
      </FieldGroup>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaSearchField>
  );
}
