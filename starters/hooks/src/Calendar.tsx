'use client';
import {createCalendar, type CalendarDate, type DateValue} from '@internationalized/date';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import {mergeProps} from 'react-aria/mergeProps';
import {
  useCalendar,
  useCalendarCell,
  useCalendarGrid,
  type AriaCalendarGridProps,
  type AriaCalendarProps
} from 'react-aria/useCalendar';
import {useCalendarState} from 'react-stately/useCalendarState';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useHover} from 'react-aria/useHover';
import {useLocale} from 'react-aria/I18nProvider';
import {useRef} from 'react';
import {Button} from './Button';
import './Calendar.css';

export function Calendar(props: AriaCalendarProps<DateValue>) {
  // useCalendarState handles date manipulation across calendar systems.
  let {locale} = useLocale();
  let state = useCalendarState({...props, locale, createCalendar});
  let {calendarProps, prevButtonProps, nextButtonProps, title} = useCalendar(props, state);

  return (
    <div {...calendarProps} className="react-aria-Calendar">
      <header>
        {/* The nav buttons reuse the Button component from this starter. */}
        <Button {...prevButtonProps} variant="quiet">
          <ChevronLeft size={18} />
        </Button>
        <h2 className="react-aria-CalendarHeading">{title}</h2>
        <Button {...nextButtonProps} variant="quiet">
          <ChevronRight size={18} />
        </Button>
      </header>
      <div className="months">
        {/* The .month wrapper provides the container query the cell sizing relies on. */}
        <div className="month">
          <CalendarGrid state={state} />
        </div>
      </div>
    </div>
  );
}

function CalendarGrid({
  state,
  ...props
}: AriaCalendarGridProps & {state: ReturnType<typeof useCalendarState>}) {
  // useCalendarGrid renders the table of dates for a single month.
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

function CalendarCell({
  state,
  date
}: {
  state: ReturnType<typeof useCalendarState>;
  date: CalendarDate;
}) {
  // useCalendarCell provides the props and state for an individual date cell.
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

  return (
    <td {...cellProps}>
      <div
        {...mergeProps(buttonProps, hoverProps, focusProps)}
        ref={ref}
        hidden={isOutsideVisibleRange}
        className="react-aria-CalendarCell button-base"
        data-variant="quiet"
        data-selected={isSelected || undefined}
        data-disabled={isDisabled || undefined}
        data-unavailable={isUnavailable || undefined}
        data-hovered={isHovered || undefined}
        data-pressed={isPressed || undefined}
        data-focus-visible={isFocusVisible || undefined}>
        {formattedDate}
      </div>
    </td>
  );
}
