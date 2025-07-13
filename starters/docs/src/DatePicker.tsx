'use client';
import {
  DatePicker as AriaDatePicker,
  DatePickerProps as AriaDatePickerProps,
  DateValue,
  Group,
  ValidationResult
} from 'react-aria-components';
import {DateInput, DateSegment} from './DateField';
import {Label, FieldError} from './Form';
import {Text} from './Content';
import {FieldButton} from './Form';
import {Calendar} from './Calendar';
import {Popover} from './Popover';
import {ChevronDown} from 'lucide-react';

import './DatePicker.css';

export interface DatePickerProps<T extends DateValue>
  extends AriaDatePickerProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function DatePicker<T extends DateValue>(
  { label, description, errorMessage, firstDayOfWeek, ...props }:
    DatePickerProps<T>
) {
  return (
    (
      <AriaDatePicker {...props}>
        <Label>{label}</Label>
        <Group>
          <DateInput>
            {(segment) => <DateSegment segment={segment} />}
          </DateInput>
          <FieldButton><ChevronDown size={16} /></FieldButton>
        </Group>
        {description && <Text slot="description">{description}</Text>}
        <FieldError>{errorMessage}</FieldError>
        <Popover hideArrow>
          <Calendar firstDayOfWeek={firstDayOfWeek} />
        </Popover>
      </AriaDatePicker>
    )
  );
}
