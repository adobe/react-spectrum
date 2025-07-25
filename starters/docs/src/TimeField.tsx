'use client';
import {
  TimeField as AriaTimeField,
  TimeFieldProps as AriaTimeFieldProps,
  TimeValue,
  ValidationResult
} from 'react-aria-components';
import {Label, FieldError} from './Form';
import {Text} from './Content';
import {DateInput, DateSegment} from './DateField';

import './TimeField.css';

export interface TimeFieldProps<T extends TimeValue>
  extends AriaTimeFieldProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function TimeField<T extends TimeValue>(
  { label, description, errorMessage, ...props }: TimeFieldProps<T>
) {
  return (
    (
      <AriaTimeField {...props}>
        <Label>{label}</Label>
        <DateInput>
          {(segment) => <DateSegment segment={segment} />}
        </DateInput>
        {description && <Text slot="description">{description}</Text>}
        <FieldError>{errorMessage}</FieldError>
      </AriaTimeField>
    )
  );
}
