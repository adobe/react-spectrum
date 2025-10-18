'use client';
import { CalendarIcon } from 'lucide-react';
import React from 'react';
import {
  DatePicker as AriaDatePicker,
  DatePickerProps as AriaDatePickerProps,
  DateValue,
  ValidationResult
} from 'react-aria-components';
import { Calendar } from './Calendar';
import { DateInput } from './DateField';
import { Dialog } from './Dialog';
import { Description, FieldError, FieldGroup, Label } from './Field';
import { Popover } from './Popover';
import { composeTailwindRenderProps } from './utils';
import { FieldButton } from './FieldButton';

export interface DatePickerProps<T extends DateValue>
  extends AriaDatePickerProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function DatePicker<T extends DateValue>(
  { label, description, errorMessage, ...props }: DatePickerProps<T>
) {
  return (
    <AriaDatePicker {...props} className={composeTailwindRenderProps(props.className, 'group flex flex-col gap-1 font-sans')}>
      {label && <Label>{label}</Label>}
      <FieldGroup className="min-w-[208px] w-auto">
        <DateInput className="flex-1 min-w-[150px] px-2 py-1.5 text-sm" />
        <FieldButton className="w-6 mr-1 rounded-sm outline-offset-0">
          <CalendarIcon aria-hidden className="w-4 h-4" />
        </FieldButton>
      </FieldGroup>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover>
        <Dialog>
          <Calendar />
        </Dialog>
      </Popover>
    </AriaDatePicker>
  );
}
