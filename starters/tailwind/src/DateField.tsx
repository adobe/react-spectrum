import {
  DateField as AriaDateField,
  DateFieldProps as AriaDateFieldProps,
  DateInput as AriaDateInput,
  DateInputProps,
  DateSegment,
  DateValue,
  ValidationResult
} from 'react-aria-components';
import { Label, Description, FieldError, fieldBorder } from './Field';
import React from 'react';

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
    <AriaDateInput className={`group min-w-[150px] px-2 py-1.5 text-sm bg-white dark:bg-zinc-900 border-2 border-gray-300 ${fieldBorder} rounded-lg focus-visible:outline outline-2 outline-blue-600 outline-offset-2`} {...props}>
      {(segment) => <DateSegment segment={segment} className="inline p-0.5 type-literal:px-0 rounded outline-none caret-transparent text-gray-800 group-disabled:text-gray-200 dark:text-zinc-200 dark:group-disabled:text-zinc-600 focus:bg-blue-600 focus:text-white dark:focus:text-white placeholder-shown:text-gray-600 dark:placeholder-shown:text-zinc-400 placeholder-shown:italic" />}
    </AriaDateInput>
  );
}
