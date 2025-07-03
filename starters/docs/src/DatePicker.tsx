'use client';
import {
  DateInput,
  DatePicker as AriaDatePicker,
  DatePickerProps as AriaDatePickerProps,
  DateSegment,
  DateValue,
  FieldError,
  Group,
  Label,
  Text,
  ValidationResult
} from 'react-aria-components';
import {Button} from './Button';
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
          <Button><ChevronDown size={16} /></Button>
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
