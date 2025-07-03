'use client';
import {
  Calendar as AriaCalendar,
  CalendarCell,
  CalendarGrid,
  CalendarProps as AriaCalendarProps,
  DateValue,
  Heading,
  Text
} from 'react-aria-components';
import {ChevronLeft, ChevronRight} from 'lucide-react';

import {Button} from './Button';

import './Calendar.css';

export interface CalendarProps<T extends DateValue>
  extends AriaCalendarProps<T> {
  errorMessage?: string;
}

export function Calendar<T extends DateValue>(
  { errorMessage, ...props }: CalendarProps<T>
) {
  return (
    (
      <AriaCalendar {...props}>
        <header>
          <Button slot="previous"><ChevronLeft size={16} /></Button>
          <Heading />
          <Button slot="next"><ChevronRight size={16} /></Button>
        </header>
        <CalendarGrid>
          {(date) => <CalendarCell date={date} />}
        </CalendarGrid>
        {errorMessage && <Text slot="errorMessage">{errorMessage}</Text>}
      </AriaCalendar>
    )
  );
}
