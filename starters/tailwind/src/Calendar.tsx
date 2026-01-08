'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';
import {
  Calendar as AriaCalendar,
  CalendarGridHeader as AriaCalendarGridHeader,
  CalendarProps as AriaCalendarProps,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarHeaderCell,
  DateValue,
  Heading,
  Text,
  useLocale
} from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { Button } from './Button';
import { composeTailwindRenderProps, focusRing } from './utils';

const cellStyles = tv({
  extend: focusRing,
  base: 'w-[calc(100cqw/7)] aspect-square text-sm cursor-default rounded-full flex items-center justify-center forced-color-adjust-none [-webkit-tap-highlight-color:transparent]',
  variants: {
    isSelected: {
      false: 'text-neutral-900 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 pressed:bg-neutral-300 dark:pressed:bg-neutral-600',
      true: 'bg-blue-600 invalid:bg-red-600 text-white forced-colors:bg-[Highlight] forced-colors:invalid:bg-[Mark] forced-colors:text-[HighlightText]'
    },
    isDisabled: {
      true: 'text-neutral-300 dark:text-neutral-600 forced-colors:text-[GrayText]'
    }
  }
});

export interface CalendarProps<T extends DateValue> extends Omit<AriaCalendarProps<T>, 'visibleDuration'> {
  errorMessage?: string;
}

export function Calendar<T extends DateValue>(
  { errorMessage, ...props }: CalendarProps<T>
) {
  return (
    <AriaCalendar {...props} className={composeTailwindRenderProps(props.className, 'flex flex-col font-sans w-[calc(9*var(--spacing)*7)] max-w-full @container')}>
      <CalendarHeader />
      <CalendarGrid className="border-spacing-0">
        <CalendarGridHeader />
        <CalendarGridBody>
          {(date) => <CalendarCell date={date} className={cellStyles} />}
        </CalendarGridBody>
      </CalendarGrid>
      {errorMessage && <Text slot="errorMessage" className="text-sm text-red-600">{errorMessage}</Text>}
    </AriaCalendar>
  );
}

export function CalendarHeader() {
  let {direction} = useLocale();

  return (
    <header className="flex items-center gap-1 pb-4 px-1 border-box">
      <Button variant="quiet" slot="previous">
        {direction === 'rtl' ? <ChevronRight aria-hidden size={18} /> : <ChevronLeft aria-hidden size={18} />}
      </Button>
      <Heading className="flex-1 font-sans font-semibold [font-variation-settings:normal] text-base text-center mx-2 my-0 text-neutral-900 dark:text-neutral-200" />
      <Button variant="quiet" slot="next">
        {direction === 'rtl' ? <ChevronLeft aria-hidden size={18} /> : <ChevronRight aria-hidden size={18} />}
      </Button>
    </header>
  );
}

export function CalendarGridHeader() {
  return (
    <AriaCalendarGridHeader>
      {(day) => (
        <CalendarHeaderCell className="text-xs text-neutral-500 font-semibold">
          {day}
        </CalendarHeaderCell>
      )}
    </AriaCalendarGridHeader>
  )
}
