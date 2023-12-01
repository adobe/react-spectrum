import {
  CalendarCell,
  CalendarGrid,
  DateValue,
  RangeCalendar as AriaRangeCalendar,
  RangeCalendarProps as AriaRangeCalendarProps,
  Text,
  CalendarGridBody
} from 'react-aria-components';
import { CalendarGridHeader, CalendarHeader } from './Calendar';
import {tv} from 'tailwind-variants';

export interface RangeCalendarProps<T extends DateValue>
  extends AriaRangeCalendarProps<T> {
  errorMessage?: string;
}

const cell = tv({
  base: 'w-full h-full flex items-center justify-center rounded-full group-focus-visible:outline outline-2 outline-blue-600 outline-offset-2',
  variants: {
    isSelected: {
      false: 'group-hover:bg-gray-100 group-pressed:bg-gray-200',
      true: 'group-hover:bg-blue-200 group-pressed:bg-blue-300'
    },
    isSelectionCap: {
      true: 'bg-blue-600 group-hover:bg-blue-600 group-pressed:bg-blue-600 text-white'
    }
  }
});

export function RangeCalendar<T extends DateValue>(
  { errorMessage, ...props }: RangeCalendarProps<T>
) {
  return (
    <AriaRangeCalendar {...props}>
      <CalendarHeader />
      <CalendarGrid className="[&_td]:px-0">
        <CalendarGridHeader />
        <CalendarGridBody>
          {(date) => <CalendarCell date={date} className="group w-9 h-9 text-sm outline-none cursor-default outside-month:text-gray-300 selected:bg-blue-100 [td:first-child_&]:rounded-s-full selection-start:rounded-s-full [td:last-child_&]:rounded-e-full selection-end:rounded-e-full">
            {({formattedDate, isSelected, isSelectionStart, isSelectionEnd}) =>
              <span
                className={cell({
                  isSelected: isSelected || false,
                  isSelectionCap: isSelectionStart || isSelectionEnd})
                }>
                {formattedDate}
              </span>
            }
          </CalendarCell>}
        </CalendarGridBody>
      </CalendarGrid>
      {errorMessage && <Text slot="errorMessage" className="text-sm text-red-600">{errorMessage}</Text>}
    </AriaRangeCalendar>
  );
}
