import {useRef, cloneElement, createContext, useContext, useMemo} from 'react';
import {useCalendarState, useRangeCalendarState} from 'react-stately';
import {useCalendar, useRangeCalendar, useCalendarGrid, useCalendarCell} from 'react-aria';
import {useLocale, VisuallyHidden, useDateFormatter, mergeProps} from 'react-aria';
import {createCalendar, startOfWeek, getWeeksInMonth} from '@internationalized/date';
import {Button} from './Button';
import React from 'react';
import {useRenderProps} from './utils';

export const CalendarContext = createContext({});
const InternalCalendarContext = createContext();

export function Calendar(props) {
  let propsFromDatePicker = useContext(CalendarContext);
  props = mergeProps(propsFromDatePicker, props);
  let { locale } = useLocale();
  let state = useCalendarState({
    ...props,
    locale,
    createCalendar
  });

  let ref = useRef();
  let { calendarProps, prevButtonProps, nextButtonProps, title } = useCalendar(
    props,
    state,
    ref
  );

  return (
    <div {...calendarProps} ref={ref} style={props.style} className={props.className}>
      <InternalCalendarContext.Provider
        value={{
          state,
          title,
          calendarProps,
          prevButtonProps,
          nextButtonProps
        }}
      >
        <VisuallyHidden>
          <h2>{calendarProps['aria-label']}</h2>
        </VisuallyHidden>
        {props.children}
        <VisuallyHidden>
          <button aria-label={nextButtonProps['aria-label']} onClick={() => state.focusNextPage()} />
        </VisuallyHidden>
      </InternalCalendarContext.Provider>
    </div>
  );
}

export function RangeCalendar(props) {
  let propsFromDatePicker = useContext(CalendarContext);
  props = mergeProps(propsFromDatePicker, props);
  let { locale } = useLocale();
  let state = useRangeCalendarState({
    ...props,
    locale,
    createCalendar
  });

  let ref = useRef();
  let { calendarProps, prevButtonProps, nextButtonProps, title } = useRangeCalendar(
    props,
    state,
    ref
  );

  return (
    <div {...calendarProps} ref={ref} style={props.style} className={props.className}>
      <InternalCalendarContext.Provider
        value={{
          state,
          title,
          calendarProps,
          prevButtonProps,
          nextButtonProps
        }}
      >
        <VisuallyHidden>
          <h2>{calendarProps['aria-label']}</h2>
        </VisuallyHidden>
        {props.children}
        <VisuallyHidden>
          <button aria-label={nextButtonProps['aria-label']} onClick={() => state.focusNextPage()} />
        </VisuallyHidden>
      </InternalCalendarContext.Provider>
    </div>
  );
}

export function CalendarHeader(props) {
  let { state, title } = useContext(InternalCalendarContext);
  let renderProps = useRenderProps({
    ...props,
    values: {state},
    defaultChildren: title
  });

  return (
    <h2 aria-hidden="true" {...renderProps} />
  );
}

export function CalendarPreviousButton({ children }) {
  let { prevButtonProps } = useContext(InternalCalendarContext);
  return <Button {...prevButtonProps}>{children}</Button>;
}

export function CalendarNextButton({ children }) {
  let { nextButtonProps } = useContext(InternalCalendarContext);
  return <Button {...nextButtonProps}>{children}</Button>;
}

export function CalendarGrid(props) {
  let { state } = useContext(InternalCalendarContext);
  let { gridProps, headerProps, weekDays } = useCalendarGrid(props, state);
  let { locale } = useLocale();

  let startDate = state.visibleRange.start;
  if (props.offset) {
    startDate = startDate.add(props.offset);
  }
  let weeksInMonth = getWeeksInMonth(startDate, locale);

  return (
    <table {...gridProps} style={props.style}>
      <thead {...headerProps}>
        <tr>
          {weekDays.map((day, index) => <th key={index}>{day}</th>)}
        </tr>
      </thead>
      <tbody>
        {[...new Array(weeksInMonth).keys()].map((weekIndex) => (
          <tr key={weekIndex}>
            {state.getDatesInWeek(weekIndex).map((date, i) => (
              date
                ? (
                  <CalendarCell
                    key={i}
                    state={state}
                    date={date}
                    currentMonth={startDate}
                    render={props.children}
                  />
                )
                : <td key={i} />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CalendarCell({ state, date, currentMonth, render }) {
  let ref = useRef();
  let { cellProps, buttonProps, isPressed, isSelected, isFocused, isOutsideVisibleRange, isUnavailable, isInvalid, formattedDate } = useCalendarCell(
    {date},
    state,
    ref
  );

  let button = render({
    formattedDate,
    date,
    isPressed,
    isSelected,
    isFocused,
    isOutsideVisibleRange,
    isUnavailable,
  });

  // Bad idea to cloneElement here? What if element doesn't pass through DOM props?
  // Also, two DOM elements... impossible to style <td>
  return (
    <td {...cellProps}>
      {cloneElement(button, mergeProps(button.props, buttonProps, {ref}))}
    </td>
  );
}
