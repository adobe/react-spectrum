import {
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  DateInput,
  DatePicker as AriaDatePicker,
  DatePickerProps as AriaDatePickerProps,
  DateSegment,
  DateValue,
  Dialog,
  FieldError,
  Group,
  Heading,
  Label,
  Popover,
  Text
} from 'react-aria-components';
import {HelpTextProps} from '@react-types/shared';
import {ReactNode} from 'react';

export interface DatePickerProps<T extends DateValue>
  extends AriaDatePickerProps<T>, HelpTextProps {
  label?: ReactNode
}

export function DatePicker<T extends DateValue>(
  {label, description, errorMessage, ...props}: DatePickerProps<T>
) {
  return (
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
          <Calendar>
            <header>
              <Button slot="previous">◀</Button>
              <Heading />
              <Button slot="next">▶</Button>
            </header>
            <CalendarGrid>
              {(date) => <CalendarCell date={date} />}
            </CalendarGrid>
          </Calendar>
        </Dialog>
      </Popover>
    </AriaDatePicker>
  );
}
