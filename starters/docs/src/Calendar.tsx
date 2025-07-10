'use client';
import {
  Calendar as AriaCalendar,
  CalendarCell as AriaCalendarCell,
  CalendarGrid as AriaCalendarGrid,
  CalendarProps as AriaCalendarProps,
  DateValue,
  CalendarCellProps,
  CalendarGridProps
} from 'react-aria-components';
import {Heading, Text} from './Content';
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

export function CalendarCell(props: CalendarCellProps) {
  return <AriaCalendarCell {...props} />;
}

export function CalendarGrid(props: CalendarGridProps) {
  return <AriaCalendarGrid {...props} />;
}