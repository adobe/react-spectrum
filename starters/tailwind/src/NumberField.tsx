import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  Button,
  Group,
  Input,
  NumberField as AriaNumberField,
  NumberFieldProps as AriaNumberFieldProps,
  ValidationResult
} from 'react-aria-components';
import { FieldGroup, FieldError, Description, Label } from './Field';

export interface NumberFieldProps extends AriaNumberFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function NumberField(
  { label, description, errorMessage, ...props }: NumberFieldProps
) {
  return (
    <AriaNumberField {...props} className="group flex flex-col gap-1">
      <Label>{label}</Label>
      <FieldGroup>
        <Input className="px-2 flex-1 min-w-0 outline-none bg-transparent text-sm text-gray-800 disabled:text-gray-200" />
        <div className="flex flex-col border-l-2 border-gray-300 group-disabled:border-gray-200">
          <Button slot="increment" className="px-0.5 cursor-default rounded-tr text-gray-500 pressed:bg-gray-100 group-disabled:text-gray-200"><ChevronUp className="w-4 h-4" /></Button>
          <div className="border-b-2 border-gray-300 group-disabled:border-gray-200" />
          <Button slot="decrement" className="px-0.5 cursor-default rounded-br text-gray-500 pressed:bg-gray-100 group-disabled:text-gray-200"><ChevronDown className="w-4 h-4" /></Button>
        </div>
      </FieldGroup>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaNumberField>
  );
}
