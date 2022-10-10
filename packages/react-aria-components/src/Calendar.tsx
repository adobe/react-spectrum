import {ButtonContext} from './Button';
import {CalendarDate, createCalendar, DateDuration, getWeeksInMonth, isSameDay, isSameMonth} from '@internationalized/date';
import {CalendarProps, mergeProps, useCalendar, useCalendarCell, useCalendarGrid, useFocusRing, useLocale, useRangeCalendar, VisuallyHidden} from 'react-aria';
import {CalendarState, RangeCalendarState, useCalendarState, useRangeCalendarState} from 'react-stately';
import {createContext, ForwardedRef, forwardRef, ReactElement, useContext} from 'react';
import {DateValue, RangeCalendarProps} from '@react-types/calendar';
import {HeadingContext} from './Heading';
import {Provider, RenderProps, StyleProps, useContextProps, useRenderProps, WithRef} from './utils';
import React from 'react';
import {TextContext} from './Text';
import {useObjectRef} from '@react-aria/utils';

interface CalendarComponentProps<T extends DateValue> extends Omit<CalendarProps<T>, 'errorMessage'>, RenderProps<CalendarState> {
  /**
   * The amount of days that will be displayed at once. This affects how pagination works.
   * @default {months: 1}
   */
  visibleDuration?: DateDuration
}

interface RangeCalendarComponentProps<T extends DateValue> extends Omit<RangeCalendarProps<T>, 'errorMessage'>, RenderProps<RangeCalendarState> {
  /**
   * The amount of days that will be displayed at once. This affects how pagination works.
   * @default {months: 1}
   */
  visibleDuration?: DateDuration
}

export const CalendarContext = createContext<WithRef<CalendarProps<any>, HTMLDivElement>>({});
export const RangeCalendarContext = createContext<WithRef<RangeCalendarProps<any>, HTMLDivElement>>({});
const InternalCalendarContext = createContext<CalendarState | RangeCalendarState>(null);
const InternalCalendarGridContext = createContext<CalendarDate>(null);

function Calendar<T extends DateValue>(props: CalendarComponentProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, CalendarContext);
  let {locale} = useLocale();
  let state = useCalendarState({
    ...props,
    locale,
    createCalendar
  });

  let {calendarProps, prevButtonProps, nextButtonProps, errorMessageProps, title} = useCalendar(props, state);

  let renderProps = useRenderProps({
    ...props,
    values: state,
    defaultClassName: 'react-aria-Calendar'
  });

  return (
    <div {...renderProps} {...calendarProps} ref={ref}>
      <Provider
        values={[
          [ButtonContext, {
            slots: {
              previous: prevButtonProps,
              next: nextButtonProps
            }
          }],
          [HeadingContext, {'aria-hidden': true, level: 2, children: title}],
          [InternalCalendarContext, state],
          [TextContext, {
            slots: {
              errorMessage: errorMessageProps
            }
          }]
        ]}>
        <VisuallyHidden>
          <h2>{calendarProps['aria-label']}</h2>
        </VisuallyHidden>
        {renderProps.children}
        <VisuallyHidden>
          <button aria-label={nextButtonProps['aria-label']} onClick={() => state.focusNextPage()} />
        </VisuallyHidden>
      </Provider>
    </div>
  );
}

/**
 * A calendar displays one or more date grids and allows users to select a single date.
 */
const _Calendar = forwardRef(Calendar);
export {_Calendar as Calendar};

function RangeCalendar<T extends DateValue>(props: RangeCalendarComponentProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, RangeCalendarContext);
  let {locale} = useLocale();
  let state = useRangeCalendarState({
    ...props,
    locale,
    createCalendar
  });

  let {calendarProps, prevButtonProps, nextButtonProps, errorMessageProps, title} = useRangeCalendar(
    props,
    state,
    ref
  );

  let renderProps = useRenderProps({
    ...props,
    values: state,
    defaultClassName: 'react-aria-RangeCalendar'
  });

  return (
    <div {...renderProps} {...calendarProps} ref={ref}>
      <Provider
        values={[
          [ButtonContext, {
            slots: {
              previous: prevButtonProps,
              next: nextButtonProps
            }
          }],
          [HeadingContext, {'aria-hidden': true, level: 2, children: title}],
          [InternalCalendarContext, state],
          [TextContext, {
            slots: {
              errorMessage: errorMessageProps
            }
          }]
        ]}>
        <VisuallyHidden>
          <h2>{calendarProps['aria-label']}</h2>
        </VisuallyHidden>
        {renderProps.children}
        <VisuallyHidden>
          <button aria-label={nextButtonProps['aria-label']} onClick={() => state.focusNextPage()} />
        </VisuallyHidden>
      </Provider>
    </div>
  );
}

/**
 * A range calendar displays one or more date grids and allows users to select a contiguous range of dates.
 */
const _RangeCalendar = forwardRef(RangeCalendar);
export {_RangeCalendar as RangeCalendar};

export interface CalendarCellRenderProps {
  /** The date that the cell represents. */
  date: CalendarDate,
  /** The day number formatted according to the current locale. */
  formattedDate: string,
  /**
   * Whether the cell is currently being pressed.
   * @selector [data-pressed]
   */
  isPressed: boolean,
  /**
   * Whether the cell is selected.
   * @selector [data-selected]
   */
  isSelected: boolean,
  /**
   * Whether the cell is the first date in a range selection.
   * @selector [data-selection-start]
   */
  isSelectionStart: boolean,
  /**
   * Whether the cell is the last date in a range selection.
   * @selector [data-selection-end]
   */
   isSelectionEnd: boolean,
  /**
   * Whether the cell is focused.
   * @selector :focus
   */
  isFocused: boolean,
  /**
   * Whether the cell is keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean,
  /**
   * Whether the cell is disabled, according to the calendar's `minValue`, `maxValue`, and `isDisabled` props.
   * Disabled dates are not focusable, and cannot be selected by the user. They are typically
   * displayed with a dimmed appearance.
   * @selector [data-disabled]
   */
  isDisabled: boolean,
  /**
   * Whether the cell is outside the visible range of the calendar.
   * For example, dates before the first day of a month in the same week.
   * @selector [data-outside-visible-range]
   */
  isOutsideVisibleRange: boolean,
  /**
   * Whether the cell is outside the current month.
   * @selector [data-outside-month]
   */
  isOutsideMonth: boolean,
  /**
   * Whether the cell is unavailable, according to the calendar's `isDateUnavailable` prop. Unavailable dates remain
   * focusable, but cannot be selected by the user. They should be displayed with a visual affordance to indicate they
   * are unavailable, such as a different color or a strikethrough.
   *
   * Note that because they are focusable, unavailable dates must meet a 4.5:1 color contrast ratio,
   * [as defined by WCAG](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html).
   * 
   * @selector [data-unavailable]
   */
  isUnavailable: boolean,
  /**
   * Whether the cell is part of an invalid selection.
   * @selector [aria-invalid]
   */
  isInvalid: boolean
}

interface CalendarGridProps extends StyleProps {
  children: (date: CalendarDate) => ReactElement,
  offset?: DateDuration
}

function CalendarGrid(props: CalendarGridProps, ref: ForwardedRef<HTMLTableElement>) {
  let state = useContext(InternalCalendarContext);
  let startDate = state.visibleRange.start;
  if (props.offset) {
    startDate = startDate.add(props.offset);
  }

  let {gridProps, headerProps, weekDays} = useCalendarGrid({
    startDate,
    endDate: startDate.add({months: 1})
  }, state);
  let {locale} = useLocale();

  let weeksInMonth = getWeeksInMonth(startDate, locale);

  return (
    <InternalCalendarGridContext.Provider value={startDate}>
      <table {...gridProps} ref={ref} style={props.style} className={props.className ?? 'react-aria-CalendarGrid'}>
        <thead {...headerProps}>
          <tr>
            {weekDays.map((day, index) => <th key={index}>{day}</th>)}
          </tr>
        </thead>
        <tbody>
          {[...new Array(weeksInMonth).keys()].map((weekIndex) => (
            <tr key={weekIndex}>
              {state.getDatesInWeek(weekIndex, startDate).map((date, i) => (
                date
                  ? React.cloneElement(props.children(date), {key: i})
                  : <td key={i} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </InternalCalendarGridContext.Provider>
  );
}

/**
 * A calendar grid displays a single grid of days within a calendar or range calendar which
 * can be keyboard navigated and selected by the user.
 */
const _CalendarGrid = forwardRef(CalendarGrid);
export {_CalendarGrid as CalendarGrid};

interface CalendarCellProps extends RenderProps<CalendarCellRenderProps> {
  date: CalendarDate
}

function CalendarCell({date, className, style, children}: CalendarCellProps, ref: ForwardedRef<HTMLDivElement>) {
  let state = useContext(InternalCalendarContext);
  let currentMonth = useContext(InternalCalendarGridContext);
  let objectRef = useObjectRef(ref);
  let {cellProps, buttonProps, ...states} = useCalendarCell(
    {date},
    state,
    objectRef
  );

  let {focusProps, isFocusVisible} = useFocusRing();
  let isOutsideMonth = !isSameMonth(currentMonth, date);
  let isSelectionStart = false;
  let isSelectionEnd = false;
  if ('highlightedRange' in state && state.highlightedRange) {
    isSelectionStart = isSameDay(date, state.highlightedRange.start);
    isSelectionEnd = isSameDay(date, state.highlightedRange.end);
  }

  let renderProps = useRenderProps({
    className,
    style,
    children,
    defaultChildren: states.formattedDate,
    defaultClassName: 'react-aria-CalendarCell',
    values: {
      date,
      isOutsideMonth,
      isFocusVisible,
      isSelectionStart,
      isSelectionEnd,
      ...states
    }
  });

  let dataAttrs = {
    'data-pressed': states.isPressed || undefined,
    'data-unavailable': states.isUnavailable || undefined,
    'data-disabled': states.isDisabled || undefined,
    'data-focus-visible': isFocusVisible || undefined,
    'data-outside-visible-range': states.isOutsideVisibleRange || undefined,
    'data-outside-month': isOutsideMonth || undefined,
    'data-selected': states.isSelected || undefined,
    'data-selection-start': isSelectionStart || undefined,
    'data-selection-end': isSelectionEnd || undefined
  };

  return (
    <td {...cellProps}>
      <div {...mergeProps(buttonProps, focusProps, dataAttrs, renderProps)} ref={objectRef} />
    </td>
  );
}

/**
 * A calendar cell displays a date cell within a calendar grid which can be selected by the user.
 */
const _CalendarCell = forwardRef(CalendarCell);
export {_CalendarCell as CalendarCell};
