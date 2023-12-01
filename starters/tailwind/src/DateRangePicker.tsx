import {
  DateRangePicker as AriaDateRangePicker,
  DateRangePickerProps as AriaDateRangePickerProps,
  DateValue,
  Dialog,
  ValidationResult
} from 'react-aria-components';
import { DateInput } from './DateField';
import { Button } from './Button';
import { RangeCalendar } from './RangeCalendar';
import { CalendarIcon } from 'lucide-react';
import { FieldGroup, Label, FieldError, Description } from './Field';
import { Popover } from './Popover';

export interface DateRangePickerProps<T extends DateValue>
  extends AriaDateRangePickerProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function DateRangePicker<T extends DateValue>(
  { label, description, errorMessage, ...props }: DateRangePickerProps<T>
) {
  return (
    <AriaDateRangePicker {...props} className="group flex flex-col gap-1">
      {label && <Label>{label}</Label>}
      <FieldGroup className="min-w-[208px] w-auto">
        <DateInput slot="start" className="px-2 py-1.5 text-sm" />
        <span aria-hidden="true">–</span>
        <DateInput slot="end" className="flex-1 px-2 py-1.5 text-sm" />
        <Button variant="icon" className="w-6 mr-1 rounded outline-offset-0"><CalendarIcon className="w-4 h-4" /></Button>
      </FieldGroup>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover>
        <Dialog className="px-4 py-5 max-h-[inherit] overflow-auto outline-none">
          <RangeCalendar />
        </Dialog>
      </Popover>
    </AriaDateRangePicker>
  );
}
