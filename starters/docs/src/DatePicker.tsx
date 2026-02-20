'use client';
import {
  DatePicker as AriaDatePicker,
  DatePickerProps as AriaDatePickerProps,
  DateValue,
  Group,
  ValidationResult
} from 'react-aria-components';
import {DateInput, DateSegment} from './DateField';
import {Label, FieldError, Description} from './Form';
import {FieldButton} from './Form';
import {Calendar} from './Calendar';
import {Popover} from './Popover';
import {ChevronDown} from 'lucide-react';

import './DatePicker.css';

export interface DatePickerProps<T extends DateValue> extends AriaDatePickerProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function DatePicker<T extends DateValue>(
  { label, description, errorMessage, ...props }: DatePickerProps<T>
) {
  return (
    <AriaDatePicker {...props}>
      <Label>{label}</Label>
      <Group>
        <DateInput>
          {(segment) => <DateSegment segment={segment} />}
        </DateInput>
        <FieldButton><ChevronDown /></FieldButton>
      </Group>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover hideArrow>
        <Calendar />
      </Popover>
    </AriaDatePicker>
  );
}
