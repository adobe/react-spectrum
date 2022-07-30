import {ButtonContext} from './Button';
import {CalendarDate, createCalendar, DateDuration, getWeeksInMonth, isSameMonth} from '@internationalized/date';
import {CalendarProps, useCalendar, useCalendarCell, useCalendarGrid, useRangeCalendar} from 'react-aria';
import {CalendarState, RangeCalendarState, useCalendarState, useRangeCalendarState} from 'react-stately';
import {cloneElement, createContext, CSSProperties, ForwardedRef, forwardRef, ReactElement, ReactNode, useContext, useRef} from 'react';
import {DateValue, RangeCalendarProps} from '@react-types/calendar';
import {HeadingContext} from './Heading';
import {mergeProps, useLocale, VisuallyHidden} from 'react-aria';
import {Provider, useContextProps, WithRef} from './utils';
import React from 'react';

interface CalendarComponentProps<T extends DateValue> extends CalendarProps<T> {
  children: ReactNode,
  style?: CSSProperties,
  className?: string
}

interface RangeCalendarComponentProps<T extends DateValue> extends RangeCalendarProps<T> {
  children: ReactNode,
  style?: CSSProperties,
  className?: string
}

export const CalendarContext = createContext<WithRef<CalendarProps<any>, HTMLDivElement>>({});
export const RangeCalendarContext = createContext<WithRef<RangeCalendarProps<any>, HTMLDivElement>>({});
const InternalCalendarContext = createContext<CalendarState | RangeCalendarState>(null);

function Calendar<T extends DateValue>(props: CalendarComponentProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, CalendarContext);
  let {locale} = useLocale();
  let state = useCalendarState({
    ...props,
    locale,
    createCalendar
  });

  let {calendarProps, prevButtonProps, nextButtonProps, title} = useCalendar(props, state);

  return (
    <div {...calendarProps} ref={ref} style={props.style} className={props.className}>
      <Provider
        values={[
          [ButtonContext, {
            slots: {
              previous: prevButtonProps,
              next: nextButtonProps
            }
          }],
          [HeadingContext, {'aria-hidden': true, level: 2, children: title}]
        ]}>
        <InternalCalendarContext.Provider value={state}>
          <VisuallyHidden>
            <h2>{calendarProps['aria-label']}</h2>
          </VisuallyHidden>
          {props.children}
          <VisuallyHidden>
            <button aria-label={nextButtonProps['aria-label']} onClick={() => state.focusNextPage()} />
          </VisuallyHidden>
        </InternalCalendarContext.Provider>
      </Provider>
    </div>
  );
}

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

  let {calendarProps, prevButtonProps, nextButtonProps, title} = useRangeCalendar(
    props,
    state,
    ref
  );

  return (
    <div {...calendarProps} ref={ref} style={props.style} className={props.className}>
      <Provider
        values={[
          [ButtonContext, {
            slots: {
              previous: prevButtonProps,
              next: nextButtonProps
            }
          }],
          [HeadingContext, {'aria-hidden': true, level: 2, children: title}]
        ]}>
        <InternalCalendarContext.Provider value={state}>
          <VisuallyHidden>
            <h2>{calendarProps['aria-label']}</h2>
          </VisuallyHidden>
          {props.children}
          <VisuallyHidden>
            <button aria-label={nextButtonProps['aria-label']} onClick={() => state.focusNextPage()} />
          </VisuallyHidden>
        </InternalCalendarContext.Provider>
      </Provider>
    </div>
  );
}

const _RangeCalendar = forwardRef(RangeCalendar);
export {_RangeCalendar as RangeCalendar};

interface CalendarCellRenderProps {
  formattedDate: string,
  date: CalendarDate,
  isPressed: boolean,
  isSelected: boolean,
  isFocused: boolean,
  isOutsideVisibleRange: boolean,
  isOutsideMonth: boolean,
  isUnavailable: boolean,
  isInvalid: boolean
}

interface CalendarGridProps {
  children: (values: CalendarCellRenderProps) => ReactElement,
  offset?: DateDuration,
  style?: CSSProperties,
  className?: string
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
    <table {...gridProps} ref={ref} style={props.style} className={props.className}>
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
                ? (
                  <CalendarCell
                    key={i}
                    state={state}
                    date={date}
                    currentMonth={startDate}
                    render={props.children} />
                )
                : <td key={i} />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const _CalendarGrid = forwardRef(CalendarGrid);
export {_CalendarGrid as CalendarGrid};

interface CalendarCellProps {
  render: (values: CalendarCellRenderProps) => ReactElement,
  date: CalendarDate,
  currentMonth: CalendarDate,
  state: CalendarState | RangeCalendarState
}

function CalendarCell({state, date, currentMonth, render}: CalendarCellProps) {
  let ref = useRef();
  let {cellProps, buttonProps, ...states} = useCalendarCell(
    {date},
    state,
    ref
  );

  let button = render({
    date,
    isOutsideMonth: !isSameMonth(currentMonth, date),
    ...states
  });

  // Bad idea to cloneElement here? What if element doesn't pass through DOM props?
  // Also, two DOM elements... impossible to style <td>
  return (
    <td {...cellProps}>
      {cloneElement(button, mergeProps(button.props, buttonProps, {ref}))}
    </td>
  );
}
