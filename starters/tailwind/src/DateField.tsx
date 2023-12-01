import {
  DateField as AriaDateField,
  DateFieldProps as AriaDateFieldProps,
  DateInput as AriaDateInput,
  DateInputProps,
  DateSegment,
  DateValue,
  ValidationResult
} from 'react-aria-components';
import { Label, Description, FieldError } from './Field';

export interface DateFieldProps<T extends DateValue> extends AriaDateFieldProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function DateField<T extends DateValue>(
  { label, description, errorMessage, ...props }: DateFieldProps<T>
) {
  return (
    <AriaDateField {...props} className="flex flex-col gap-1">
      {label && <Label>{label}</Label>}
      <DateInput />
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaDateField>
  );
}

export function DateInput(props: Omit<DateInputProps, 'children'>) {
  return (
    <AriaDateInput className="group min-w-[150px] px-2 py-1.5 text-sm border-2 border-gray-300 invalid:border-red-600 disabled:border-gray-200 rounded-lg focus-within:border-gray-600 focus-visible:outline outline-2 outline-blue-600 outline-offset-2" {...props}>
      {(segment) => <DateSegment segment={segment} className="inline p-0.5 type-literal:px-0 rounded outline-none caret-transparent text-gray-800 group-disabled:text-gray-200 focus:bg-blue-600 focus:text-white placeholder-shown:text-gray-600 placeholder-shown:italic" />}
    </AriaDateInput>
  );
}
