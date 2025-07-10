'use client';
import {
  DateField as AriaDateField,
  DateFieldProps as AriaDateFieldProps,
  DateInput as AriaDateInput,
  DateInputProps,
  DateSegment as AriaDateSegment,
  DateSegmentProps,
  DateValue,
  ValidationResult
} from 'react-aria-components';
import {Label, FieldError} from './Form';
import {Text} from './Content';

import './DateField.css';

export interface DateFieldProps<T extends DateValue>
  extends AriaDateFieldProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function DateField<T extends DateValue>(
  { label, description, errorMessage, ...props }: DateFieldProps<T>
) {
  return (
    (
      <AriaDateField {...props}>
        <Label>{label}</Label>
        <DateInput>
          {(segment) => <DateSegment segment={segment} />}
        </DateInput>
        {description && <Text slot="description">{description}</Text>}
        <FieldError>{errorMessage}</FieldError>
      </AriaDateField>
    )
  );
}

export function DateSegment(props: DateSegmentProps) {
  return <AriaDateSegment {...props} />;
}

export function DateInput(props: DateInputProps) {
  return <AriaDateInput {...props} />;
}
