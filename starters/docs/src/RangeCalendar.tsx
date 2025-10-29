'use client';
import {
  CalendarCell as AriaCalendarCell,
  DateValue,
  Heading,
  RangeCalendar as AriaRangeCalendar,
  RangeCalendarProps as AriaRangeCalendarProps,
  Text,
  composeRenderProps,
  CalendarCellProps
} from 'react-aria-components';
import {Button} from './Button';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import {CalendarGrid} from './Calendar';
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
          <Button slot="previous" variant="quiet"><ChevronLeft size={18} /></Button>
          <Heading />
          <Button slot="next" variant="quiet"><ChevronRight size={18} /></Button>
        </header>
        <CalendarGrid>
          {(date) => <CalendarCell date={date} />}
        </CalendarGrid>
        {errorMessage && <Text slot="errorMessage">{errorMessage}</Text>}
      </AriaRangeCalendar>
    )
  );
}


export {CalendarGrid};
export function CalendarCell(props: CalendarCellProps) {
  return (
    <AriaCalendarCell {...props}>
      {composeRenderProps(props.children, (children, {defaultChildren, isHovered, isPressed, isSelectionStart, isSelectionEnd, isDisabled}) => 
        <span
          className="button-base"
          data-variant="quiet"
          data-hovered={isHovered || undefined}
          data-pressed={isPressed || undefined}
          data-selected={isSelectionStart || isSelectionEnd || undefined}
          data-disabled={isDisabled || undefined}>
          {children || defaultChildren}
        </span>
      )}
    </AriaCalendarCell>
  );
}
