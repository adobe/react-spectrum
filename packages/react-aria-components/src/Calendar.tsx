/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {
  AriaCalendarProps,
  AriaRangeCalendarProps,
  DateValue,
  mergeProps,
  useCalendar,
  useCalendarCell,
  useCalendarGrid,
  useFocusRing,
  useHover,
  useIsSSR,
  useLocale,
  useRangeCalendar,
  VisuallyHidden
} from 'react-aria';
import {ButtonContext} from './Button';
import {CalendarDate, CalendarIdentifier, createCalendar, DateDuration, endOfMonth, Calendar as ICalendar, isSameDay, isSameMonth, isToday} from '@internationalized/date';
import {CalendarState, RangeCalendarState, useCalendarState, useRangeCalendarState} from 'react-stately';
import {chain, filterDOMProps, useLayoutEffect} from '@react-aria/utils';
import {
  ClassNameOrFunction,
  ContextValue,
  DOMProps,
  Provider,
  RenderProps,
  SlotProps,
  StyleProps,
  useContextProps,
  useRenderProps,
  useSlottedContext
} from './utils';
import {DOMAttributes, FocusableElement, forwardRefType, GlobalDOMAttributes, HoverEvents} from '@react-types/shared';
import {HeadingContext} from './RSPContexts';
import React, {createContext, ForwardedRef, forwardRef, ReactElement, ReactNode, useContext, useMemo, useReducer, useRef} from 'react';
import {TextContext} from './Text';

export interface CalendarRenderProps {
  /**
   * Whether the calendar is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean,
  /**
   * State of the calendar.
   */
  state: CalendarState,
  /**
   * Whether the calendar is invalid.
   * @selector [data-invalid]
   */
  isInvalid: boolean
}

export interface RangeCalendarRenderProps extends Omit<CalendarRenderProps, 'state'> {
  /**
   * State of the range calendar.
   */
  state: RangeCalendarState
}

export interface CalendarProps<T extends DateValue> extends Omit<AriaCalendarProps<T>, 'errorMessage' | 'validationState'>, RenderProps<CalendarRenderProps>, SlotProps, GlobalDOMAttributes<HTMLDivElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state.
   * @default 'react-aria-Calendar'
   */
  className?: ClassNameOrFunction<CalendarRenderProps>,
  /**
   * The amount of days that will be displayed at once. This affects how pagination works.
   * @default {months: 1}
   */
  visibleDuration?: DateDuration,
  /**
   * A function to create a new [Calendar](https://react-spectrum.adobe.com/internationalized/date/Calendar.html)
   * object for a given calendar identifier. If not provided, the `createCalendar` function
   * from `@internationalized/date` will be used.
   */
  createCalendar?: (identifier: CalendarIdentifier) => ICalendar
}

export interface RangeCalendarProps<T extends DateValue> extends Omit<AriaRangeCalendarProps<T>, 'errorMessage' | 'validationState'>, RenderProps<RangeCalendarRenderProps>, SlotProps, GlobalDOMAttributes<HTMLDivElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state.
   * @default 'react-aria-RangeCalendar'
   */
  className?: ClassNameOrFunction<RangeCalendarRenderProps>,
  /**
   * The amount of days that will be displayed at once. This affects how pagination works.
   * @default {months: 1}
   */
  visibleDuration?: DateDuration,
  /**
   * A function to create a new [Calendar](https://react-spectrum.adobe.com/internationalized/date/Calendar.html)
   * object for a given calendar identifier. If not provided, the `createCalendar` function
   * from `@internationalized/date` will be used.
   */
  createCalendar?: (identifier: CalendarIdentifier) => ICalendar
}

export const CalendarContext = createContext<ContextValue<CalendarProps<any>, HTMLDivElement>>(null);
export const RangeCalendarContext = createContext<ContextValue<RangeCalendarProps<any>, HTMLDivElement>>(null);
export const CalendarStateContext = createContext<CalendarState | null>(null);
export const RangeCalendarStateContext = createContext<RangeCalendarState | null>(null);

/**
 * A calendar displays one or more date grids and allows users to select a single date.
 */
export const Calendar = /*#__PURE__*/ (forwardRef as forwardRefType)(function Calendar<T extends DateValue>(props: CalendarProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, CalendarContext);
  let {locale} = useLocale();
  let state = useCalendarState({
    ...props,
    locale,
    createCalendar: props.createCalendar || createCalendar
  });

  let {calendarProps, prevButtonProps, nextButtonProps, errorMessageProps, title} = useCalendar(props, state);

  let renderProps = useRenderProps({
    ...props,
    values: {
      state,
      isDisabled: props.isDisabled || false,
      isInvalid: state.isValueInvalid
    },
    defaultClassName: 'react-aria-Calendar'
  });

  let DOMProps = filterDOMProps(props, {global: true});

  return (
    <div
      {...mergeProps(DOMProps, renderProps, calendarProps)}
      ref={ref}
      slot={props.slot || undefined}
      data-disabled={props.isDisabled || undefined}
      data-invalid={state.isValueInvalid || undefined}>
      <Provider
        values={[
          [ButtonContext, {
            slots: {
              previous: prevButtonProps,
              next: nextButtonProps
            }
          }],
          [HeadingContext, {'aria-hidden': true, level: 2, children: title}],
          [CalendarStateContext, state],
          [CalendarContext, props as CalendarProps<any>],
          [TextContext, {
            slots: {
              errorMessage: errorMessageProps
            }
          }]
        ]}>
        {/* Add a screen reader only description of the entire visible range rather than
          * a separate heading above each month grid. This is placed first in the DOM order
          * so that it is the first thing a touch screen reader user encounters.
          * In addition, VoiceOver on iOS does not announce the aria-label of the grid
          * elements, so the aria-label of the Calendar is included here as well. */}
        <VisuallyHidden>
          <h2>{calendarProps['aria-label']}</h2>
        </VisuallyHidden>
        {renderProps.children}
        {/* For touch screen readers, add a visually hidden next button after the month grid
          * so it's easy to navigate after reaching the end without going all the way
          * back to the start of the month. */}
        <VisuallyHidden>
          <button
            aria-label={nextButtonProps['aria-label']}
            disabled={nextButtonProps.isDisabled}
            onClick={() => state.focusNextPage()}
            tabIndex={-1} />
        </VisuallyHidden>
      </Provider>
    </div>
  );
});

/**
 * A range calendar displays one or more date grids and allows users to select a contiguous range of dates.
 */
export const RangeCalendar = /*#__PURE__*/ (forwardRef as forwardRefType)(function RangeCalendar<T extends DateValue>(props: RangeCalendarProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, RangeCalendarContext);
  let {locale} = useLocale();
  let state = useRangeCalendarState({
    ...props,
    locale,
    createCalendar: props.createCalendar || createCalendar
  });

  let {calendarProps, prevButtonProps, nextButtonProps, errorMessageProps, title} = useRangeCalendar(
    props,
    state,
    ref
  );

  let renderProps = useRenderProps({
    ...props,
    values: {
      state,
      isDisabled: props.isDisabled || false,
      isInvalid: state.isValueInvalid
    },
    defaultClassName: 'react-aria-RangeCalendar'
  });

  let DOMProps = filterDOMProps(props, {global: true});

  return (
    <div
      {...mergeProps(renderProps, DOMProps, calendarProps)}
      ref={ref}
      slot={props.slot || undefined}
      data-disabled={props.isDisabled || undefined}
      data-invalid={state.isValueInvalid || undefined}>
      <Provider
        values={[
          [ButtonContext, {
            slots: {
              previous: prevButtonProps,
              next: nextButtonProps
            }
          }],
          [HeadingContext, {'aria-hidden': true, level: 2, children: title}],
          [RangeCalendarStateContext, state],
          [RangeCalendarContext, props as RangeCalendarProps<any>],
          [TextContext, {
            slots: {
              errorMessage: errorMessageProps
            }
          }]
        ]}>
        {/* Add a screen reader only description of the entire visible range rather than
          * a separate heading above each month grid. This is placed first in the DOM order
          * so that it is the first thing a touch screen reader user encounters.
          * In addition, VoiceOver on iOS does not announce the aria-label of the grid
          * elements, so the aria-label of the Calendar is included here as well. */}
        <VisuallyHidden>
          <h2>{calendarProps['aria-label']}</h2>
        </VisuallyHidden>
        {renderProps.children}
        {/* For touch screen readers, add a visually hidden next button after the month grid
          * so it's easy to navigate after reaching the end without going all the way
          * back to the start of the month. */}
        <VisuallyHidden>
          <button
            aria-label={nextButtonProps['aria-label']}
            disabled={nextButtonProps.isDisabled}
            onClick={() => state.focusNextPage()}
            tabIndex={-1} />
        </VisuallyHidden>
      </Provider>
    </div>
  );
});

// Display a large number of pages on either side of the center date to
// give the illusion of infinite scrolling. When the user stops scrolling,
// reset the scroll position back to the center.
const PAGES = 100;

interface State {
  centerDate: CalendarDate,
  currentPage: number
}

type Action =
  | {type: 'SCROLL', page: number}
  | {type: 'SCROLL_END', visibleMonths: number}
  | {type: 'SET_FOCUSED_DATE', date: CalendarDate};

function reducer(state: State, action: Action) {
  let {centerDate, currentPage} = state;
  switch (action.type) {
    case 'SCROLL':
      if (action.page === currentPage) {
        return state;
      }
      return {centerDate, currentPage: action.page};
    case 'SCROLL_END':
      if (currentPage === PAGES) {
        return state;
      }
      return {
        centerDate: centerDate.add({months: (currentPage - PAGES) * action.visibleMonths}),
        currentPage: PAGES
      };
    case 'SET_FOCUSED_DATE':
      return {centerDate: action.date, currentPage: PAGES};
  }
}

export interface CalendarCarouselProps extends StyleProps, GlobalDOMAttributes<HTMLDivElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element.
   * @default 'react-aria-CalendarCarousel'
   */
  className?: string,
  /** One or more CalendarGrid elements representing a single page. */
  children: ReactNode
}

/**
 * A CalendarCarousel displays one or more CalendarGrids,
 * and allows a user to swipe to navigate between pages.
 */
export function CalendarCarousel(props: CalendarCarouselProps) {
  let calendarState = useContext(CalendarStateContext);
  let rangeCalendarState = useContext(RangeCalendarStateContext);
  let state = calendarState ?? rangeCalendarState!;
  let [{centerDate, currentPage}, dispatch] = useReducer(
    reducer,
    null,
    () => ({centerDate: state.focusedDate, currentPage: PAGES})
  );

  // Whenever the center date changes, reset the scroll position.
  let ref = useRef<HTMLDivElement | null>(null);
  let isSSR = useIsSSR();
  useLayoutEffect(() => {
    if (!isSSR) {
      ref.current!.scrollLeft = ref.current!.offsetWidth * PAGES;
    }
  }, [isSSR, centerDate, state.visibleDuration]);

  // If the focused date changes, update the center date.
  if (currentPage === PAGES && state.focusedDate.compare(centerDate) !== 0) {
    dispatch({
      type: 'SET_FOCUSED_DATE',
      date: state.focusedDate
    });
  }

  let timeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  let onScroll = () => {
    // Update the calendar's focused date when scrolling between pages,
    // and adjust the current page within the visible range.
    let el = ref.current!;
    let index = Math.round(el.scrollLeft / el.offsetWidth);
    if (currentPage !== index) {
      // setFocusedDate also forces DOM focus, but we don't want to affect that.
      let isFocused = state.isFocused;
      state.setFocusedDate(centerDate.add({months: (index - PAGES) * state.visibleDuration.months!}), 'start');
      state.setFocused(isFocused);
      dispatch({
        type: 'SCROLL',
        page: index
      });
    }

    // After scrolling stops, re-center the scroll position.
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      let index = el.scrollLeft / el.offsetWidth;
      if (Math.abs(Math.round(index) - index) < 0.01) {
        dispatch({type: 'SCROLL_END', visibleMonths: state.visibleDuration.months!});
      }
    }, 500);
  };

  return (
    <div
      ref={ref}
      {...filterDOMProps(props, {global: true})}
      onScroll={chain(props.onScroll, onScroll)}
      className={props.className || 'react-aria-CalendarCarousel'}
      tabIndex={-1}
      style={{
        ...props.style,
        display: 'flex',
        overflow: 'auto',
        scrollSnapType: 'x mandatory',
        scrollbarWidth: 'none',
        width: 'fit-content'
      }}>
      {/* If SSR, only display the current page. After hydration, display an extra page on either side plus placeholders. */}
      {isSSR ? props.children : <>
        {/* Placeholder to hold space in the scroll width for more pages. */}
        <div style={{width: (currentPage - 1) * 100 + '%', flexShrink: 0, contain: 'strict'}} />
        {/* contain: 'inline-size' makes these extra pages not affect the width of the parent */}
        <div inert style={{width: '100%', flexShrink: 0, contain: 'inline-size', scrollSnapAlign: 'start', scrollSnapStop: 'always'}}>
          <CalendarGridContext.Provider value={{offset: {months: -state.visibleDuration.months!}}}>
            {props.children}
          </CalendarGridContext.Provider>
        </div>
        {/* Center (visible) page */}
        <div style={{width: 'fit-content', flexShrink: 0, scrollSnapAlign: 'start', scrollSnapStop: 'always'}}>
          {props.children}
        </div>
        <div inert style={{width: '100%', flexShrink: 0, contain: 'inline-size', scrollSnapAlign: 'start', scrollSnapStop: 'always'}}>
          <CalendarGridContext.Provider value={{offset: state.visibleDuration}}>
            {props.children}
          </CalendarGridContext.Provider>
        </div>
        <div style={{width: (PAGES * 2 - currentPage - 1) * 100 + '%', flexShrink: 0, contain: 'strict'}} />
      </>}
    </div>
  );
}

export interface CalendarCellRenderProps {
  /** The date that the cell represents. */
  date: CalendarDate,
  /** The day number formatted according to the current locale. */
  formattedDate: string,
  /**
   * Whether the cell is currently hovered with a mouse.
   * @selector [data-hovered]
   */
  isHovered: boolean,
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
   * @selector [data-focused]
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
   * @selector [data-invalid]
   */
  isInvalid: boolean,
  /**
   * Whether the cell is today.
   * @selector [data-today]
   */
  isToday: boolean
}

export interface CalendarGridProps extends StyleProps, GlobalDOMAttributes<HTMLTableElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element.
   * @default 'react-aria-CalendarGrid'
   */
  className?: string,
  /**
   * Either a function to render calendar cells for each date in the month,
   * or children containing a `<CalendarGridHeader>`` and `<CalendarGridBody>`
   * when additional customization is needed.
   */
  children?: ReactElement | ReactElement[] | ((date: CalendarDate) => ReactElement),
  /**
   * An offset from the beginning of the visible date range that this
   * CalendarGrid should display. Useful when displaying more than one
   * month at a time.
   */
  offset?: DateDuration,
  /**
   * The style of weekday names to display in the calendar grid header,
   * e.g. single letter, abbreviation, or full day name.
   * @default "narrow"
   */
  weekdayStyle?: 'narrow' | 'short' | 'long'
}

interface InternalCalendarGridContextValue {
  headerProps: DOMAttributes<FocusableElement>,
  weekDays: string[],
  startDate: CalendarDate,
  weeksInMonth: number
}

const CalendarGridContext = createContext<ContextValue<CalendarGridProps, HTMLTableElement>>(null);
const InternalCalendarGridContext = createContext<InternalCalendarGridContextValue | null>(null);

/**
 * A calendar grid displays a single grid of days within a calendar or range calendar which
 * can be keyboard navigated and selected by the user.
 */
export const CalendarGrid = /*#__PURE__*/ (forwardRef as forwardRefType)(function CalendarGrid(props: CalendarGridProps, ref: ForwardedRef<HTMLTableElement>) {
  // Merge offset from context with props.
  let ctx = useSlottedContext(CalendarGridContext);
  let offset = useMemo(() => {
    let offset = props.offset || ctx?.offset;
    if (props.offset && ctx?.offset) {
      offset = {...ctx.offset};
      for (let key in offset) {
        offset[key] += props.offset[key] ?? 0;
      }
    }
    return offset;
  }, [props.offset, ctx?.offset]);

  [props, ref] = useContextProps(props, ref, CalendarGridContext);
  let calendarState = useContext(CalendarStateContext);
  let rangeCalendarState = useContext(RangeCalendarStateContext);
  let calenderProps = useSlottedContext(CalendarContext)!;
  let rangeCalenderProps = useSlottedContext(RangeCalendarContext)!;
  let state = calendarState ?? rangeCalendarState!;
  let startDate = state.visibleRange.start;
  if (offset) {
    startDate = startDate.add(offset);
  }

  let firstDayOfWeek = calenderProps?.firstDayOfWeek ?? rangeCalenderProps?.firstDayOfWeek;

  let {gridProps, headerProps, weekDays, weeksInMonth} = useCalendarGrid({
    startDate,
    endDate: endOfMonth(startDate),
    weekdayStyle: props.weekdayStyle,
    firstDayOfWeek
  }, state);

  let DOMProps = filterDOMProps(props, {global: true});

  return (
    <InternalCalendarGridContext.Provider value={{headerProps, weekDays, startDate, weeksInMonth}}>
      <table
        {...mergeProps(DOMProps, gridProps)}
        ref={ref}
        style={props.style}
        cellPadding={0}
        className={props.className ?? 'react-aria-CalendarGrid'}>
        {typeof props.children !== 'function'
          ? props.children
          : (<>
            <CalendarGridHeaderForwardRef>
              {day => <CalendarHeaderCellForwardRef>{day}</CalendarHeaderCellForwardRef>}
            </CalendarGridHeaderForwardRef>
            <CalendarGridBodyForwardRef>
              {props.children}
            </CalendarGridBodyForwardRef>
          </>)
        }
      </table>
    </InternalCalendarGridContext.Provider>
  );
});

export interface CalendarGridHeaderProps extends StyleProps, GlobalDOMAttributes<HTMLTableSectionElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element.
   * @default 'react-aria-CalendarGridHeader'
   */
  className?: string,
  /** A function to render a `<CalendarHeaderCell>` for a weekday name. */
  children: (day: string) => ReactElement
}

function CalendarGridHeader(props: CalendarGridHeaderProps, ref: ForwardedRef<HTMLTableSectionElement>) {
  let {children, style, className} = props;
  let {headerProps, weekDays} = useContext(InternalCalendarGridContext)!;
  let DOMProps = filterDOMProps(props, {global: true});

  return (
    <thead
      {...mergeProps(DOMProps, headerProps)}
      ref={ref}
      style={style}
      className={className || 'react-aria-CalendarGridHeader'}>
      <tr>
        {weekDays.map((day, key) => React.cloneElement(children(day), {key}))}
      </tr>
    </thead>
  );
}

/**
 * A calendar grid header displays a row of week day names at the top of a month.
 */
const CalendarGridHeaderForwardRef = /*#__PURE__*/ (forwardRef as forwardRefType)(CalendarGridHeader);
export {CalendarGridHeaderForwardRef as CalendarGridHeader};

export interface CalendarHeaderCellProps extends DOMProps, GlobalDOMAttributes<HTMLTableHeaderCellElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element.
   * @default 'react-aria-CalendarHeaderCell'
   */
  className?: string
}

function CalendarHeaderCell(props: CalendarHeaderCellProps, ref: ForwardedRef<HTMLTableCellElement>) {
  let {children, style, className} = props;
  let DOMProps = filterDOMProps(props, {global: true});
  return (
    <th
      {...DOMProps}
      ref={ref}
      style={style}
      className={className || 'react-aria-CalendarHeaderCell'}>
      {children}
    </th>
  );
}

/**
 * A calendar header cell displays a week day name at the top of a column within a calendar.
 */
const CalendarHeaderCellForwardRef = forwardRef(CalendarHeaderCell);
export {CalendarHeaderCellForwardRef as CalendarHeaderCell};

export interface CalendarGridBodyProps extends StyleProps, GlobalDOMAttributes<HTMLTableSectionElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element.
   * @default 'react-aria-CalendarGridBody'
   */
  className?: string,
  /** A function to render a `<CalendarCell>` for a given date. */
  children: (date: CalendarDate) => ReactElement
}

function CalendarGridBody(props: CalendarGridBodyProps, ref: ForwardedRef<HTMLTableSectionElement>) {
  let {children, style, className} = props;
  let calendarState = useContext(CalendarStateContext);
  let rangeCalendarState = useContext(RangeCalendarStateContext);
  let state = calendarState ?? rangeCalendarState!;
  let {startDate, weeksInMonth} = useContext(InternalCalendarGridContext)!;
  let DOMProps = filterDOMProps(props, {global: true});

  return (
    <tbody
      {...DOMProps}
      ref={ref}
      style={style}
      className={className || 'react-aria-CalendarGridBody'}>
      {[...new Array(weeksInMonth).keys()].map((weekIndex) => (
        <tr key={weekIndex}>
          {state.getDatesInWeek(weekIndex, startDate).map((date, i) => (
            date
              ? React.cloneElement(children(date), {key: i})
              : <td key={i} />
          ))}
        </tr>
      ))}
    </tbody>
  );
}

/**
 * A calendar grid body displays a grid of calendar cells within a month.
 */
const CalendarGridBodyForwardRef = /*#__PURE__*/ (forwardRef as forwardRefType)(CalendarGridBody);
export {CalendarGridBodyForwardRef as CalendarGridBody};

export interface CalendarCellProps extends RenderProps<CalendarCellRenderProps>, HoverEvents, GlobalDOMAttributes<HTMLTableCellElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state.
   * @default 'react-aria-CalendarCell'
   */
  className?: ClassNameOrFunction<CalendarCellRenderProps>,
  /** The date to render in the cell. */
  date: CalendarDate
}

/**
 * A calendar cell displays a date cell within a calendar grid which can be selected by the user.
 */
export const CalendarCell = /*#__PURE__*/ (forwardRef as forwardRefType)(function CalendarCell({date, ...otherProps}: CalendarCellProps, ref: ForwardedRef<HTMLTableCellElement>) {
  let calendarState = useContext(CalendarStateContext);
  let rangeCalendarState = useContext(RangeCalendarStateContext);
  let state = calendarState ?? rangeCalendarState!;
  let {startDate: currentMonth} = useContext(InternalCalendarGridContext) ?? {startDate: state.visibleRange.start};
  let isOutsideMonth = !isSameMonth(currentMonth, date);
  let istoday = isToday(date, state.timeZone);

  let buttonRef = useRef<HTMLDivElement>(null);
  let {cellProps, buttonProps, ...states} = useCalendarCell(
    {date, isOutsideMonth},
    state,
    buttonRef
  );

  let {hoverProps, isHovered} = useHover({...otherProps, isDisabled: states.isDisabled});
  let {focusProps, isFocusVisible} = useFocusRing();
  isFocusVisible &&= states.isFocused;
  let isSelectionStart = false;
  let isSelectionEnd = false;
  if ('highlightedRange' in state && state.highlightedRange) {
    isSelectionStart = isSameDay(date, state.highlightedRange.start);
    isSelectionEnd = isSameDay(date, state.highlightedRange.end);
  }

  let renderProps = useRenderProps({
    ...otherProps,
    defaultChildren: states.formattedDate,
    defaultClassName: 'react-aria-CalendarCell',
    values: {
      date,
      isHovered,
      isOutsideMonth,
      isFocusVisible,
      isSelectionStart,
      isSelectionEnd,
      isToday: istoday,
      ...states
    }
  });

  let dataAttrs = {
    'data-focused': states.isFocused || undefined,
    'data-hovered': isHovered || undefined,
    'data-pressed': states.isPressed || undefined,
    'data-unavailable': states.isUnavailable || undefined,
    'data-disabled': states.isDisabled || undefined,
    'data-focus-visible': isFocusVisible || undefined,
    'data-outside-visible-range': states.isOutsideVisibleRange || undefined,
    'data-outside-month': isOutsideMonth || undefined,
    'data-selected': states.isSelected || undefined,
    'data-selection-start': isSelectionStart || undefined,
    'data-selection-end': isSelectionEnd || undefined,
    'data-invalid': states.isInvalid || undefined,
    'data-today': istoday || undefined
  };

  let DOMProps = filterDOMProps(otherProps, {global: true});

  return (
    <td {...cellProps} ref={ref}>
      <div {...mergeProps(DOMProps, buttonProps, focusProps, hoverProps, dataAttrs, renderProps)} ref={buttonRef} />
    </td>
  );
});
