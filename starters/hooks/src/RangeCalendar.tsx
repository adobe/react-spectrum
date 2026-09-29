'use client';
import {
  createCalendar,
  isSameDay,
  type CalendarDate,
  type DateValue
} from '@internationalized/date';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import {mergeProps} from 'react-aria/mergeProps';
import {
  useRangeCalendar,
  useCalendarCell,
  useCalendarGrid,
  type AriaCalendarGridProps,
  type AriaRangeCalendarProps
} from 'react-aria/useRangeCalendar';
import {useRangeCalendarState, type RangeCalendarState} from 'react-stately/useRangeCalendarState';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useHover} from 'react-aria/useHover';
import {useLocale} from 'react-aria/I18nProvider';
import {useRef} from 'react';
import {Button} from './Button';
import './Button.css';
import './RangeCalendar.css';

export function RangeCalendar(props: AriaRangeCalendarProps<DateValue>) {
  let {locale} = useLocale();
  let state = useRangeCalendarState({...props, locale, createCalendar});
  let ref = useRef<HTMLDivElement>(null);
  /*- begin highlight -*/
  let {calendarProps, prevButtonProps, nextButtonProps, title} = useRangeCalendar(
    props,
    state,
    ref
  );
  /*- end highlight -*/

  return (
    <div {...calendarProps} ref={ref} className="react-aria-RangeCalendar">
      <header>
        <Button {...prevButtonProps} variant="quiet">
          <ChevronLeft size={18} />
        </Button>
        <h2 className="react-aria-CalendarHeading">{title}</h2>
        <Button {...nextButtonProps} variant="quiet">
          <ChevronRight size={18} />
        </Button>
      </header>
      <div className="months">
        <div className="month">
          <CalendarGrid state={state} />
        </div>
      </div>
    </div>
  );
}

function CalendarGrid({state, ...props}: AriaCalendarGridProps & {state: RangeCalendarState}) {
  let {gridProps, headerProps, weekDays, weeksInMonth} = useCalendarGrid(props, state);

  return (
    <table {...gridProps} className="react-aria-CalendarGrid">
      <thead {...headerProps}>
        <tr>
          {weekDays.map((day, i) => (
            <th className="react-aria-CalendarHeaderCell" key={i}>
              {day}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...new Array(weeksInMonth).keys()].map(weekIndex => (
          <tr key={weekIndex}>
            {state
              .getDatesInWeek(weekIndex)
              .map((date, i) =>
                date ? <CalendarCell key={i} state={state} date={date} /> : <td key={i} />
              )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CalendarCell({state, date}: {state: RangeCalendarState; date: CalendarDate}) {
  let ref = useRef<HTMLDivElement>(null);
  let {
    cellProps,
    buttonProps,
    isSelected,
    isOutsideVisibleRange,
    isDisabled,
    isUnavailable,
    isPressed,
    formattedDate
  } = useCalendarCell({date}, state, ref);
  let {hoverProps, isHovered} = useHover({});
  let {focusProps, isFocusVisible} = useFocusRing();

  // Compute the range endpoints from the highlighted range.
  let isSelectionStart = state.highlightedRange
    ? isSameDay(date, state.highlightedRange.start)
    : false;
  let isSelectionEnd = state.highlightedRange ? isSameDay(date, state.highlightedRange.end) : false;

  return (
    <td {...cellProps}>
      <div
        {...mergeProps(buttonProps, focusProps)}
        ref={ref}
        hidden={isOutsideVisibleRange}
        className="react-aria-CalendarCell"
        data-selected={isSelected || undefined}
        data-selection-start={isSelectionStart || undefined}
        data-selection-end={isSelectionEnd || undefined}
        data-disabled={isDisabled || undefined}
        data-unavailable={isUnavailable || undefined}
        data-pressed={isPressed || undefined}
        data-focus-visible={isFocusVisible || undefined}>
        <span
          {...hoverProps}
          className="button-base"
          data-variant="quiet"
          data-selected={isSelectionStart || isSelectionEnd || undefined}
          data-hovered={isHovered || undefined}
          data-pressed={isPressed || undefined}
          data-disabled={isDisabled || undefined}>
          {formattedDate}
        </span>
      </div>
    </td>
  );
}
