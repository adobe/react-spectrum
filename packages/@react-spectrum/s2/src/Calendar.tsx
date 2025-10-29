/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ActionButton, Header, HeaderContext, Heading, HeadingContext, pressScale} from './';
import {
  Calendar as AriaCalendar,
  CalendarCell as AriaCalendarCell,
  CalendarGrid as AriaCalendarGrid,
  CalendarHeaderCell as AriaCalendarHeaderCell,
  CalendarProps as AriaCalendarProps,
  ButtonProps,
  CalendarCellProps,
  CalendarCellRenderProps,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCellProps,
  CalendarState,
  CalendarStateContext,
  ContextValue,
  DateValue,
  Provider,
  RangeCalendarState,
  RangeCalendarStateContext,
  Text
} from 'react-aria-components';
import {AriaCalendarGridProps} from '@react-aria/calendar';
import {baseColor, focusRing, lightDark, style} from '../style' with {type: 'macro'};
import {
  CalendarDate,
  getDayOfWeek,
  startOfMonth
} from '@internationalized/date';
import ChevronLeftIcon from '../s2wf-icons/S2_Icon_ChevronLeft_20_N.svg';
import ChevronRightIcon from '../s2wf-icons/S2_Icon_ChevronRight_20_N.svg';
import {forwardRefType, GlobalDOMAttributes} from '@react-types/shared';
import {getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {helpTextStyles} from './Field';
// @ts-ignore
import intlMessages from '../intl/*.json';
import React, {createContext, CSSProperties, ForwardedRef, forwardRef, Fragment, PropsWithChildren, ReactElement, ReactNode, useContext, useMemo, useRef} from 'react';
import {useDateFormatter, useLocale, useLocalizedStringFormatter} from '@react-aria/i18n';
import {useSpectrumContextProps} from './useSpectrumContextProps';


export interface CalendarProps<T extends DateValue>
  extends Omit<AriaCalendarProps<T>, 'visibleDuration' | 'style' | 'className' | 'styles' | 'children' | keyof GlobalDOMAttributes>,
  StyleProps {
  /**
   * The error message to display when the calendar is invalid.
   */
  errorMessage?: ReactNode,
  /**
   * The number of months to display at once.
   * @default 1
   */
  visibleMonths?: number
}

export const CalendarContext = createContext<ContextValue<Partial<CalendarProps<any>>, HTMLDivElement>>(null);

const calendarStyles = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  width: 'fit',
  disableTapHighlight: true
}, getAllowedOverrides());

const headerStyles = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: 'full'
});

const headingStyles = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  margin: 0,
  width: 'full'
});

const titleStyles = style({
  font: 'title-lg',
  textAlign: 'center',
  flexGrow: 1,
  flexShrink: 0,
  flexBasis: '0%',
  minWidth: 0
});

const headerCellStyles = style({
  font: 'title-sm',
  cursor: 'default',
  textAlign: 'center',
  paddingStart: {
    default: 4,
    ':first-child': 0
  },
  paddingEnd: {
    default: 4,
    ':last-child': 0
  },
  paddingBottom: 12
});

const cellStyles = style({
  outlineStyle: 'none',
  '--cell-gap': {
    type: 'paddingStart',
    value: 4
  },
  paddingStart: {
    default: 4,
    isFirstChild: 0
  },
  paddingEnd: {
    default: 4,
    isLastChild: 0
  },
  paddingTop: {
    default: 2,
    isFirstWeek: 0
  },
  paddingBottom: 2,
  position: 'relative',
  width: 32,
  height: 32,
  display: {
    default: 'flex',
    isOutsideMonth: 'none'
  },
  alignItems: 'center',
  justifyContent: 'center'
});

const cellInnerStyles = style<CalendarCellRenderProps & {selectionMode: 'single' | 'range'}>({
  ...focusRing(),
  transition: {
    default: 'default',
    forcedColors: 'none'
  },
  outlineOffset: {
    default: -2,
    isToday: 2,
    isSelected: {
      selectionMode: {
        single: 2,
        range: -2
      }
    },
    isSelectionStart: 2,
    isSelectionEnd: 2
  },
  position: 'relative',
  font: 'body-sm',
  cursor: 'default',
  width: 'full',
  height: 32,
  borderRadius: 'full',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  forcedColorAdjust: 'none',
  backgroundColor: {
    default: 'transparent',
    isHovered: 'gray-100',
    isPressed: 'gray-100',
    isDisabled: 'transparent',
    isToday: {
      default: baseColor('gray-300'),
      isDisabled: 'disabled'
    },
    isSelected: {
      selectionMode: {
        single: {
          default: lightDark('accent-900', 'accent-700'),
          isHovered: lightDark('accent-1000', 'accent-600'),
          isPressed: lightDark('accent-1000', 'accent-600'),
          isFocusVisible: lightDark('accent-1000', 'accent-600'),
          isDisabled: 'transparent'
        },
        range: {
          isHovered: 'blue-500'
        }
      }
    },
    isSelectionStart: {
      default: lightDark('accent-900', 'accent-700'),
      isHovered: lightDark('accent-1000', 'accent-600'),
      isPressed: lightDark('accent-1000', 'accent-600'),
      isFocusVisible: lightDark('accent-1000', 'accent-600')
    },
    isSelectionEnd: {
      default: lightDark('accent-900', 'accent-700'),
      isHovered: lightDark('accent-1000', 'accent-600'),
      isPressed: lightDark('accent-1000', 'accent-600'),
      isFocusVisible: lightDark('accent-1000', 'accent-600')
    },
    isUnavailable: 'transparent',
    forcedColors: {
      default: 'transparent',
      isToday: 'ButtonFace',
      isHovered: 'Highlight',
      isSelected: {
        selectionMode: {
          single: 'Highlight',
          range: {
            isHovered: 'Highlight'
          }
        }
      },
      isSelectionStart: 'Highlight',
      isSelectionEnd: 'Highlight',
      isUnavailable: 'transparent'
    }
  },
  color: {
    default: 'neutral',
    isSelected: {
      default: 'white',
      selectionMode: {
        range: 'neutral'
      }
    },
    isSelectionStart: 'white',
    isSelectionEnd: 'white',
    isDisabled: 'disabled',
    forcedColors: {
      default: 'ButtonText',
      isToday: 'ButtonFace',
      isSelected: 'HighlightText',
      isSelectionStart: 'HighlightText',
      isSelectionEnd: 'HighlightText',
      isDisabled: 'GrayText'
    }
  }
});

const unavailableStyles = style({
  position: 'absolute',
  top: 'calc(50% - 1px)',
  left: 'calc(25% - 1px)',
  right: 'calc(25% - 1px)',
  height: 2,
  transform: 'rotate(-16deg)',
  borderRadius: 'full',
  backgroundColor: '[currentColor]'
});

const selectionSpanStyles = style({
  position: 'absolute',
  zIndex: -1,
  top: 0,
  insetStart: 'calc(-1 * var(--selection-span) * (var(--cell-width) + var(--cell-gap) + var(--cell-gap)))',
  insetEnd: 0,
  bottom: 0,
  borderWidth: 2,
  borderStyle: 'dashed',
  borderColor: {
    default: 'blue-800', // focus-indicator-color
    forcedColors: {
      default: 'ButtonText'
    }
  },
  borderStartRadius: 'full',
  borderEndRadius: 'full',
  backgroundColor: {
    default: 'blue-subtle',
    forcedColors: {
      default: 'Highlight'
    }
  },
  forcedColorAdjust: 'none'
});

/**
 * Calendars display a grid of days in one or more months and allow users to select a single date.
 */
export const Calendar = /*#__PURE__*/ (forwardRef as forwardRefType)(function Calendar<T extends DateValue>(props: CalendarProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, CalendarContext);
  let {
    visibleMonths = 1,
    errorMessage,
    UNSAFE_style,
    UNSAFE_className,
    styles,
    ...otherProps
  } = props;
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/s2');
  return (
    <AriaCalendar
      {...otherProps}
      ref={ref}
      visibleDuration={{months: visibleMonths}}
      style={UNSAFE_style}
      className={(UNSAFE_className || '') + calendarStyles(null, styles)}>
      {({isInvalid, isDisabled}) => {
        return (
          <>
            <Provider
              values={[
                [HeaderContext, null],
                [HeadingContext, null]
              ]}>
              <Header styles={headerStyles}>
                <CalendarButton slot="previous"><ChevronLeftIcon /></CalendarButton>
                <CalendarHeading />
                <CalendarButton slot="next"><ChevronRightIcon /></CalendarButton>
              </Header>
            </Provider>
            <div
              className={style({
                display: 'flex',
                flexDirection: 'row',
                gap: 24,
                width: 'full',
                alignItems: 'start'
              })}>
              {Array.from({length: visibleMonths}).map((_, i) => (
                <CalendarGrid months={i} key={i} />
              ))}
            </div>
            {isInvalid && (
              <Text slot="errorMessage" className={helpTextStyles({isInvalid, isDisabled, size: 'M'})}>
                {errorMessage || stringFormatter.format('calendar.invalidSelection', {selectedCount: 1})}
              </Text>
            )}
          </>
        );
      }}
    </AriaCalendar>
  );
});

export const CalendarGrid = (props: Omit<AriaCalendarGridProps, 'children'> & PropsWithChildren & {months: number}): ReactElement => {
  // use isolation to start a new stacking context so that we can use zIndex -1 for the selection span.
  return (
    <AriaCalendarGrid
      className={style({
        borderCollapse: 'collapse',
        borderSpacing: 0,
        isolation: 'isolate'
      })}
      offset={{months: props.months}}>
      <CalendarGridHeader>
        {(day) => (
          <CalendarHeaderCell>
            {day}
          </CalendarHeaderCell>
        )}
      </CalendarGridHeader>
      <CalendarGridBody>
        {(date) => (
          <CalendarCell date={date} firstDayOfWeek={props.firstDayOfWeek} />
        )}
      </CalendarGridBody>
    </AriaCalendarGrid>
  );
};

// Ordinarily the heading is a formatted date range, ie January 2025 - February 2025.
// However, we want to show each month individually.
export const CalendarHeading = (): ReactElement => {
  let calendarStateContext = useContext(CalendarStateContext);
  let rangeCalendarStateContext = useContext(RangeCalendarStateContext);
  let {visibleRange, timeZone} = calendarStateContext ?? rangeCalendarStateContext ?? {};
  let currentMonth = visibleRange?.start ?? visibleRange?.end;
  let monthFormatter = useDateFormatter({
    month: 'long',
    year: 'numeric',
    era: currentMonth && currentMonth.calendar.identifier === 'gregory' && currentMonth.era === 'BC' ? 'short' : undefined,
    calendar: visibleRange?.start.calendar.identifier,
    timeZone
  });
  let months = useMemo(() => {
    if (!visibleRange) {
      return [];
    }
    let months: string[] = [];
    for (let i = visibleRange.start; i.compare(visibleRange.end) <= 0; i = i.add({months: 1})) {
      // TODO: account for the first week possibly overlapping, like with a custom 454 calendar.
      // there has to be a better way to do this...
      if (i.month === visibleRange.start.month) {
        i = i.add({weeks: 1});
      }
      months.push(monthFormatter.format(i.toDate(timeZone!)));
    }
    return months;
  }, [visibleRange, monthFormatter, timeZone]);

  return (
    <Heading styles={headingStyles}>
      {months.map((month, i) => {
        if (i === 0) {
          return (
            <Fragment key={month}>
              <div className={titleStyles}>{month}</div>
            </Fragment>
          );
        } else {
          return (
            <Fragment key={month}>
              {/* Spacers to account for Next/Previous buttons and gap, spelled out to show the math */}
              <div className={style({visibility: 'hidden', width: 32})} />
              <div className={style({visibility: 'hidden', width: 24})} />
              <div className={style({visibility: 'hidden', width: 32})} />
              <div className={titleStyles}>{month}</div>
            </Fragment>
          );
        }
      })}
    </Heading>
  );
};

export const CalendarButton = (props: Omit<ButtonProps, 'children'> & {children: ReactNode}): ReactElement => {
  let {direction} = useLocale();
  return (
    <div
      className={
        style({
          scale: {
            direction: {
              rtl: -1
            }
          }
        })({direction})
      }>
      <ActionButton
        {...props}
        isQuiet>
        {props.children}
      </ActionButton>
    </div>
  );
};

const CalendarHeaderCell = (props: Omit<CalendarHeaderCellProps, 'children'> & PropsWithChildren): ReactElement => {
  return (
    <AriaCalendarHeaderCell className={headerCellStyles}>
      {props.children}
    </AriaCalendarHeaderCell>
  );
};

const CalendarCell = (props: Omit<CalendarCellProps, 'children'> & {firstDayOfWeek: 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | undefined}): ReactElement => {
  let {locale} = useLocale();
  let firstDayOfWeek = props.firstDayOfWeek;
  // Calculate the day and week index based on the date.
  let {dayIndex, weekIndex} = useWeekAndDayIndices(props.date, locale, firstDayOfWeek);

  let calendarStateContext = useContext(CalendarStateContext);
  let rangeCalendarStateContext = useContext(RangeCalendarStateContext);
  let state = (calendarStateContext ?? rangeCalendarStateContext)!;

  let isFirstWeek = weekIndex === 0;
  let isFirstChild = dayIndex === 0;
  let isLastChild = dayIndex === 6;
  return (
    <AriaCalendarCell
      date={props.date}
      className={(renderProps) => cellStyles({...renderProps, isFirstChild, isLastChild, isFirstWeek})}>
      {(renderProps) => <CalendarCellInner {...props} weekIndex={weekIndex} dayIndex={dayIndex} state={state} isRangeSelection={!!rangeCalendarStateContext} renderProps={renderProps} />}
    </AriaCalendarCell>
  );
};

const CalendarCellInner = (props: Omit<CalendarCellProps, 'children'> & {isRangeSelection: boolean, state: CalendarState | RangeCalendarState, weekIndex: number, dayIndex: number, renderProps?: CalendarCellRenderProps, date: DateValue}): ReactElement => {
  let {weekIndex, dayIndex, date, renderProps, state, isRangeSelection} = props;
  let {getDatesInWeek} = state;
  let ref = useRef<HTMLDivElement>(null);
  let {isUnavailable, formattedDate, isSelected} = renderProps!;
  let startDate = startOfMonth(date);
  let datesInWeek = getDatesInWeek(weekIndex, startDate);

  // Starting from the current day, find the first day before it in the current week that is not selected.
  // Then, the span of selected days is the current day minus the first unselected day.
  let firstUnselectedInRangeInWeek = datesInWeek.slice(0, dayIndex + 1).reverse().findIndex((date, i) => {
    return date && i > 0 && (!state.isSelected(date) || date.month !== props.date.month);
  });
  let selectionSpan = -1;
  if (firstUnselectedInRangeInWeek > -1 && isSelected) {
    selectionSpan = firstUnselectedInRangeInWeek - 1;
  } else if (isSelected) {
    selectionSpan = dayIndex;
  }

  let prevDay = date.subtract({days: 1});
  let nextDay = date.add({days: 1});
  let isBackgroundStyleApplied = (
    isSelected
    && isRangeSelection
    && (state.isSelected(prevDay)
      || (nextDay.month === date.month && state.isSelected(nextDay)))
    );

  return (
    <div
      className={style({
        position: 'relative',
        width: 32,
        '--cell-width': {
          type: 'width',
          value: '[self(width)]'
        }
      })}>
      <div
        ref={ref}
        style={pressScale(ref, {})(renderProps!)}
        className={cellInnerStyles({...renderProps!, selectionMode: isRangeSelection ? 'range' : 'single'})}>
        <div>
          {formattedDate}
        </div>
        {isUnavailable && <div className={unavailableStyles} role="presentation" />}
      </div>
      {isBackgroundStyleApplied && <div style={{'--selection-span': selectionSpan} as CSSProperties} className={selectionSpanStyles} role="presentation" />}
    </div>
  );
};

type DayOfWeek = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

/**
 * Calculate the week index (0-based) and day index (0-based) for a given date within a month in a calendar.
 * @param date - The date to calculate indices for.
 * @param locale - The locale string (e.g., 'en-US', 'fr-FR', 'hi-IN-u-ca-indian').
 * @param firstDayOfWeek - Optional override for the first day of the week ('sun', 'mon', 'tue', etc.).
 * @returns Object with weekIndex and dayIndex.
 */
function useWeekAndDayIndices(
  date: CalendarDate,
  locale: string,
  firstDayOfWeek?: DayOfWeek
) {
  let {dayIndex, weekIndex} = useMemo(() => {
    // Get the day index within the week (0-6)
    const dayIndex = getDayOfWeek(date, locale, firstDayOfWeek);

    const monthStart = startOfMonth(date);

    // Calculate the week index by finding which week this date falls into
    // within the month's calendar grid
    const monthStartDayOfWeek = getDayOfWeek(monthStart, locale, firstDayOfWeek);
    const dayOfMonth = date.day;

    const weekIndex = Math.floor((dayOfMonth + monthStartDayOfWeek - 1) / 7);

    return {
      weekIndex,
      dayIndex
    };
  }, [date, locale, firstDayOfWeek]);

  return {dayIndex, weekIndex};
}
