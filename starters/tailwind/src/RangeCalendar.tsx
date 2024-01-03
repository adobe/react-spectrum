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
import React from 'react';
import {tv} from 'tailwind-variants';
import {focusRing} from './utils';

export interface RangeCalendarProps<T extends DateValue>
  extends AriaRangeCalendarProps<T> {
  errorMessage?: string;
}

const cell = tv({
  extend: focusRing,
  base: 'w-full h-full flex items-center justify-center rounded-full forced-color-adjust-none text-zinc-900 dark:text-zinc-200',
  variants: {
    selectionState: {
      'none': 'group-hover:bg-gray-100 dark:group-hover:bg-zinc-700 group-pressed:bg-gray-200 dark:group-pressed:bg-zinc-600',
      'middle': 'group-hover:bg-blue-200 dark:group-hover:bg-blue-900 forced-colors:group-hover:bg-[Highlight] group-pressed:bg-blue-300 dark:group-pressed:bg-blue-800 forced-colors:group-pressed:bg-[Highlight] forced-colors:text-[HighlightText]',
      'cap': 'bg-blue-600 forced-colors:bg-[Highlight] text-white forced-colors:text-[HighlightText]'
    },
    isDisabled: {
      true: 'text-gray-300 dark:text-zinc-600 forced-colors:text-[GrayText]'
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
          {(date) => <CalendarCell date={date} className="group w-9 h-9 text-sm outline outline-0 cursor-default outside-month:text-gray-300 selected:bg-blue-100 dark:selected:bg-blue-700/30 forced-colors:selected:bg-[Highlight] [td:first-child_&]:rounded-s-full selection-start:rounded-s-full [td:last-child_&]:rounded-e-full selection-end:rounded-e-full">
            {({formattedDate, isSelected, isSelectionStart, isSelectionEnd, isFocusVisible, isDisabled}) =>
              <span
                className={cell({
                  selectionState: isSelected && (isSelectionStart || isSelectionEnd) ? 'cap' : isSelected ? 'middle' : 'none',
                  isDisabled,
                  isFocusVisible
                })}>
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
