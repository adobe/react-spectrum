'use client';
import React from 'react';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import {
  RangeCalendar as AriaRangeCalendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarHeading,
  Text,
  type DateValue,
  type RangeCalendarProps as AriaRangeCalendarProps
} from 'react-aria-components/RangeCalendar';
import {useLocale} from 'react-aria-components/I18nProvider';
import {tv} from 'tailwind-variants';
import {Button} from './Button';
import {CalendarGridHeader} from './Calendar';
import {composeTailwindRenderProps, focusRing} from './utils';

export interface RangeCalendarProps<T extends DateValue> extends AriaRangeCalendarProps<T> {
  errorMessage?: string;
}

const cell = tv({
  extend: focusRing,
  base: 'w-full h-full flex items-center justify-center rounded-full forced-color-adjust-none text-neutral-900 dark:text-neutral-200',
  variants: {
    selectionState: {
      none: 'group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 group-pressed:bg-neutral-300 dark:group-pressed:bg-neutral-600',
      middle: [
        'group-hover:bg-blue-200 dark:group-hover:bg-blue-900 forced-colors:group-hover:bg-[Highlight]',
        'group-invalid:group-hover:bg-red-200 dark:group-invalid:group-hover:bg-red-900 forced-colors:group-invalid:group-hover:bg-[Mark]',
        'group-pressed:bg-blue-300 dark:group-pressed:bg-blue-800 forced-colors:group-pressed:bg-[Highlight] forced-colors:text-[HighlightText]',
        'group-invalid:group-pressed:bg-red-300 dark:group-invalid:group-pressed:bg-red-800 forced-colors:group-invalid:group-pressed:bg-[Mark]'
      ],
      cap: 'bg-blue-600 group-invalid:bg-red-600 forced-colors:bg-[Highlight] forced-colors:group-invalid:bg-[Mark] text-white forced-colors:text-[HighlightText]'
    },
    isDisabled: {
      true: 'text-neutral-300 dark:text-neutral-600 forced-colors:text-[GrayText]'
    }
  }
});

export function RangeCalendar<T extends DateValue>({
  errorMessage,
  ...props
}: RangeCalendarProps<T>) {
  let {direction} = useLocale();
  let months = props.visibleDuration?.months || 1;
  return (
    <AriaRangeCalendar
      {...props}
      className={composeTailwindRenderProps(
        props.className,
        'flex font-sans w-full max-w-fit overflow-auto gap-3'
      )}>
      {Array.from({length: months}, (_, i) => (
        <div key={i} className="@container flex flex-col w-[calc(9*var(--spacing)*7)]">
          <header className="flex items-center mb-4">
            {i === 0 && (
              <Button variant="quiet" slot="previous">
                {direction === 'rtl' ? (
                  <ChevronRight aria-hidden size={18} />
                ) : (
                  <ChevronLeft aria-hidden size={18} />
                )}
              </Button>
            )}
            <CalendarHeading
              offset={{months: i}}
              className="flex-1 font-sans font-semibold [font-variation-settings:normal] text-base text-center mx-2 my-0 text-neutral-900 dark:text-neutral-200"
            />
            {i === months - 1 && (
              <Button variant="quiet" slot="next">
                {direction === 'rtl' ? (
                  <ChevronLeft aria-hidden size={18} />
                ) : (
                  <ChevronRight aria-hidden size={18} />
                )}
              </Button>
            )}
          </header>
          <CalendarGrid offset={{months: i}} className="[&_td]:px-0 [&_td]:py-px border-spacing-0">
            <CalendarGridHeader />
            <CalendarGridBody>
              {date => (
                <CalendarCell
                  date={date}
                  className="group w-[calc(100cqw/7)] aspect-square text-sm outline outline-0 cursor-default outside-month:text-neutral-300 selected:bg-blue-100 dark:selected:bg-blue-700/30 forced-colors:selected:bg-[Highlight] invalid:selected:bg-red-100 dark:invalid:selected:bg-red-700/30 forced-colors:invalid:selected:bg-[Mark] [td:first-child_&]:rounded-s-full selection-start:rounded-s-full [td:last-child_&]:rounded-e-full selection-end:rounded-e-full [-webkit-tap-highlight-color:transparent]">
                  {({
                    formattedDate,
                    isSelected,
                    isSelectionStart,
                    isSelectionEnd,
                    isFocusVisible,
                    isDisabled
                  }) => (
                    <span
                      className={cell({
                        selectionState:
                          isSelected && (isSelectionStart || isSelectionEnd)
                            ? 'cap'
                            : isSelected
                              ? 'middle'
                              : 'none',
                        isDisabled,
                        isFocusVisible
                      })}>
                      {formattedDate}
                    </span>
                  )}
                </CalendarCell>
              )}
            </CalendarGridBody>
          </CalendarGrid>
        </div>
      ))}
      {errorMessage && (
        <Text slot="errorMessage" className="text-sm text-red-600">
          {errorMessage}
        </Text>
      )}
    </AriaRangeCalendar>
  );
}
