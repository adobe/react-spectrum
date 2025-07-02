'use client';
import {
  DateInput,
  DatePicker as AriaDatePicker,
  DatePickerProps as AriaDatePickerProps,
  DateSegment,
  DateValue,
  Dialog,
  FieldError,
  Group,
  Label,
  Popover,
  Text,
  ValidationResult
} from 'react-aria-components';
import {Button} from './Button';
import {Calendar} from './Calendar';

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
          <Button>▼</Button>
        </Group>
        {description && <Text slot="description">{description}</Text>}
        <FieldError>{errorMessage}</FieldError>
        <Popover>
          <Dialog>
            <Calendar firstDayOfWeek={firstDayOfWeek} />
          </Dialog>
        </Popover>
      </AriaDatePicker>
    )
  );
}
