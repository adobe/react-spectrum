'use client';
import {
  DateInput,
  DateRangePicker as AriaDateRangePicker,
  DateRangePickerProps as AriaDateRangePickerProps,
  DateSegment,
  DateValue,
  FieldError,
  Group,
  Label,
  Text,
  ValidationResult
} from 'react-aria-components';
import {Button} from './Button';
import {Popover} from './Popover';
import {RangeCalendar} from './RangeCalendar';
import {ChevronDown} from 'lucide-react';
import './DateRangePicker.css';

export interface DateRangePickerProps<T extends DateValue>
  extends AriaDateRangePickerProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function DateRangePicker<T extends DateValue>(
  { label, description, errorMessage, firstDayOfWeek, ...props }:
    DateRangePickerProps<T>
) {
  return (
    (
      <AriaDateRangePicker {...props}>
        <Label>{label}</Label>
        <Group>
          <DateInput slot="start">
            {(segment) => <DateSegment segment={segment} />}
          </DateInput>
          <span aria-hidden="true">–</span>
          <DateInput slot="end">
            {(segment) => <DateSegment segment={segment} />}
          </DateInput>
          <Button><ChevronDown size={16} /></Button>
        </Group>
        {description && <Text slot="description">{description}</Text>}
        <FieldError>{errorMessage}</FieldError>
        <Popover hideArrow>
          <RangeCalendar firstDayOfWeek={firstDayOfWeek} />
        </Popover>
      </AriaDateRangePicker>
    )
  );
}
