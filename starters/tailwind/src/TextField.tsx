import {
  Input,
  Text,
  TextField as AriaTextField,
  TextFieldProps as AriaTextFieldProps,
  ValidationResult
} from 'react-aria-components';
import { Label, FieldError, Description } from './Field';

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
      <Input className="border-2 border-gray-300 invalid:border-red-600 disabled:border-gray-200 text-sm text-gray-800 disabled:text-gray-200 rounded-md px-2 py-1.5 outline-none focus:border-gray-600 focus-visible:outline-2 focus-visible:outline-blue-600 outline-offset-2" />
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaTextField>
  );
}
