import {
  Button,
  CalendarCell,
  CalendarGrid,
  DateInput,
  DateRangePicker as AriaDateRangePicker,
  DateRangePickerProps as AriaDateRangePickerProps,
  DateSegment,
  DateValue,
  Dialog,
  FieldError,
  Group,
  Heading,
  Label,
  Popover,
  RangeCalendar,
  Text
} from 'react-aria-components';
import {HelpTextProps} from '@react-types/shared';
import {ReactNode} from 'react';

export interface DateRangePickerProps<T extends DateValue>
  extends AriaDateRangePickerProps<T>, HelpTextProps {
  label?: ReactNode
}

export function DateRangePicker<T extends DateValue>(
  {label, description, errorMessage, ...props}: DateRangePickerProps<T>
) {
  return (
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
        <Button>▼</Button>
      </Group>
      {description && <Text slot="description">{description}</Text>}
      <FieldError>{errorMessage}</FieldError>
      <Popover>
        <Dialog>
          <RangeCalendar>
            <header>
              <Button slot="previous">◀</Button>
              <Heading />
              <Button slot="next">▶</Button>
            </header>
            <CalendarGrid>
              {(date) => <CalendarCell date={date} />}
            </CalendarGrid>
          </RangeCalendar>
        </Dialog>
      </Popover>
    </AriaDateRangePicker>
  );
}
