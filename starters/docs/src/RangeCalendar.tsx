'use client';
import {
  CalendarCell,
  CalendarGrid,
  DateValue,
  Heading,
  RangeCalendar as AriaRangeCalendar,
  RangeCalendarProps as AriaRangeCalendarProps,
  Text
} from 'react-aria-components';
import {Button} from './Button';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import './RangeCalendar.css';

export interface RangeCalendarProps<T extends DateValue>
  extends AriaRangeCalendarProps<T> {
  errorMessage?: string;
}

export function RangeCalendar<T extends DateValue>(
  { errorMessage, ...props }: RangeCalendarProps<T>
) {
  return (
    (
      <AriaRangeCalendar {...props}>
        <header>
          <Button slot="previous"><ChevronLeft size={16} /></Button>
          <Heading />
          <Button slot="next"><ChevronRight size={16} /></Button>
        </header>
        <CalendarGrid>
          {(date) => <CalendarCell date={date} />}
        </CalendarGrid>
        {errorMessage && <Text slot="errorMessage">{errorMessage}</Text>}
      </AriaRangeCalendar>
    )
  );
}
