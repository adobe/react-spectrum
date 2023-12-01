import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Calendar as AriaCalendar,
  CalendarCell,
  CalendarGrid,
  CalendarProps as AriaCalendarProps,
  DateValue,
  Heading,
  Text,
  CalendarGridHeader as AriaCalendarGridHeader,
  CalendarHeaderCell,
  CalendarGridBody
} from 'react-aria-components';
import { Button } from './Button';

export interface CalendarProps<T extends DateValue>
  extends AriaCalendarProps<T> {
  errorMessage?: string;
}

export function Calendar<T extends DateValue>(
  { errorMessage, ...props }: CalendarProps<T>
) {
  return (
    <AriaCalendar {...props}>
      <CalendarHeader />
      <CalendarGrid>
        <CalendarGridHeader />
        <CalendarGridBody>
          {(date) => <CalendarCell date={date} className="w-9 h-9 text-sm outline-none cursor-default rounded-full flex items-center justify-center outside-month:text-gray-300 hover:bg-gray-100 pressed:bg-gray-200 selected:bg-blue-600 selected:text-white focus-visible:outline-2 focus-visible:outline-blue-600 outline-offset-2" />}
        </CalendarGridBody>
      </CalendarGrid>
      {errorMessage && <Text slot="errorMessage" className="text-sm text-red-600">{errorMessage}</Text>}
    </AriaCalendar>
  );
}

export function CalendarHeader() {
  return (
    <header className="flex items-center gap-1 pb-4 px-1 w-full">
      <Button variant="icon" slot="previous"><ChevronLeft /></Button>
      <Heading className="flex-1 font-semibold text-xl text-center mx-2" />
      <Button variant="icon" slot="next"><ChevronRight /></Button>
    </header>
  );
}

export function CalendarGridHeader() {
  return (
    <AriaCalendarGridHeader>
      {(day) => (
        <CalendarHeaderCell className="text-xs text-gray-500 font-semibold">
          {day}
        </CalendarHeaderCell>
      )}
    </AriaCalendarGridHeader>
  )
}
