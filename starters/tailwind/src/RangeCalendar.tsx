'use client';
import React from 'react';
import {
  RangeCalendar as AriaRangeCalendar,
  RangeCalendarProps as AriaRangeCalendarProps,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  DateValue,
  Text
} from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { CalendarGridHeader, CalendarHeader } from './Calendar';
import { composeTailwindRenderProps, focusRing } from './utils';

export interface RangeCalendarProps<T extends DateValue> extends Omit<AriaRangeCalendarProps<T>, 'visibleDuration'> {
  errorMessage?: string;
}

const cell = tv({
  extend: focusRing,
  base: 'w-full h-full flex items-center justify-center rounded-full forced-color-adjust-none text-neutral-900 dark:text-neutral-200',
  variants: {
    selectionState: {
      'none': 'group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 group-pressed:bg-neutral-300 dark:group-pressed:bg-neutral-600',
      'middle': [
        'group-hover:bg-blue-200 dark:group-hover:bg-blue-900 forced-colors:group-hover:bg-[Highlight]',
        'group-invalid:group-hover:bg-red-200 dark:group-invalid:group-hover:bg-red-900 forced-colors:group-invalid:group-hover:bg-[Mark]',
        'group-pressed:bg-blue-300 dark:group-pressed:bg-blue-800 forced-colors:group-pressed:bg-[Highlight] forced-colors:text-[HighlightText]',
        'group-invalid:group-pressed:bg-red-300 dark:group-invalid:group-pressed:bg-red-800 forced-colors:group-invalid:group-pressed:bg-[Mark]',
      ],
      'cap': 'bg-blue-600 group-invalid:bg-red-600 forced-colors:bg-[Highlight] forced-colors:group-invalid:bg-[Mark] text-white forced-colors:text-[HighlightText]'
    },
    isDisabled: {
      true: 'text-neutral-300 dark:text-neutral-600 forced-colors:text-[GrayText]'
    }
  }
});

export function RangeCalendar<T extends DateValue>(
  { errorMessage, ...props }: RangeCalendarProps<T>
) {
  return (
    <AriaRangeCalendar {...props} className={composeTailwindRenderProps(props.className, 'font-sans w-[calc(9*var(--spacing)*7)] max-w-full @container')}>
      <CalendarHeader />
      <CalendarGrid className="[&_td]:px-0 [&_td]:py-px border-spacing-0">
        <CalendarGridHeader />
        <CalendarGridBody>
          {(date) => <CalendarCell date={date} className="group w-[calc(100cqw/7)] aspect-square text-sm outline outline-0 cursor-default outside-month:text-neutral-300 selected:bg-blue-100 dark:selected:bg-blue-700/30 forced-colors:selected:bg-[Highlight] invalid:selected:bg-red-100 dark:invalid:selected:bg-red-700/30 forced-colors:invalid:selected:bg-[Mark] [td:first-child_&]:rounded-s-full selection-start:rounded-s-full [td:last-child_&]:rounded-e-full selection-end:rounded-e-full [-webkit-tap-highlight-color:transparent]">
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
