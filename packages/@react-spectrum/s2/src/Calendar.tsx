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

import {ActionButton} from './ActionButton';
import {
  Calendar as AriaCalendar,
  CalendarCell as AriaCalendarCell,
  CalendarContext as AriaCalendarContext,
  CalendarGrid as AriaCalendarGrid,
  CalendarHeaderCell as AriaCalendarHeaderCell,
  CalendarProps as AriaCalendarProps,
  CalendarCellProps,
  CalendarCellRenderProps,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCellProps,
  CalendarHeading,
  CalendarSelectionMode,
  CalendarState,
  CalendarStateContext,
  DateValue
} from 'react-aria-components/Calendar';
import {AriaCalendarGridProps} from 'react-aria/useCalendar';
import {ButtonProps} from 'react-aria-components/Button';
import {CalendarDate, getDayOfWeek, startOfMonth} from '@internationalized/date';
import ChevronLeftIcon from '../s2wf-icons/S2_Icon_ChevronLeft_20_N.svg';
import ChevronRightIcon from '../s2wf-icons/S2_Icon_ChevronRight_20_N.svg';
import {ContextValue, Provider, useSlottedContext} from 'react-aria-components/slots';
import {focusRing, lightDark, style} from '../style' with {type: 'macro'};
import {forwardRefType, GlobalDOMAttributes} from '@react-types/shared';
import {getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {Header, HeaderContext, HeadingContext} from './Content';
import {helpTextStyles} from './Field';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {pressScale} from './pressScale';
import {RangeCalendarContext, RangeCalendarStateContext} from 'react-aria-components/RangeCalendar';
import {RangeCalendarState} from 'react-stately/useRangeCalendarState';
import React, {
  createContext,
  ForwardedRef,
  forwardRef,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useContext,
  useMemo,
  useRef
} from 'react';
import {Text} from 'react-aria-components/Text';
import {useLocale} from 'react-aria/I18nProvider';
import {useLocalizedStringFormatter} from 'react-aria/useLocalizedStringFormatter';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface CalendarProps<T extends DateValue, M extends CalendarSelectionMode = 'single'>
  extends
    Omit<
      AriaCalendarProps<T, M>,
      | 'visibleDuration'
      | 'weeksInMonth'
      | 'style'
      | 'className'
      | 'render'
      | 'styles'
      | 'children'
      | keyof GlobalDOMAttributes
    >,
    StyleProps {
  /**
   * The error message to display when the calendar is invalid.
   */
  errorMessage?: ReactNode;
  /**
   * The number of months to display at once.
   * @default 1
   */
  visibleMonths?: number;
}

export const CalendarContext =
  createContext<ContextValue<Partial<CalendarProps<any, CalendarSelectionMode>>, HTMLDivElement>>(
    null
  );

const calendarStyles = style<{isMultiMonth?: boolean}>(
  {
    display: 'flex',
    containerType: {
      default: 'inline-size',
      isMultiMonth: 'unset'
    },
    flexDirection: 'column',
    gap: 24,
    disableTapHighlight: true,
    '--cell-gap': {
      type: 'paddingStart',
      value: 4
    },
    '--cell-max-width': {
      type: 'width',
      value: 32
    },
    '--cell-responsive-size': {
      type: 'width',
      value: {
        default: '[min(var(--cell-max-width), (100cqw - (var(--cell-gap) * 12)) / 7)]',
        isMultiMonth: '--cell-max-width'
      }
    },
    width: {
      default: 'calc(7 * var(--cell-max-width) + var(--cell-gap) * 12)',
      isMultiMonth: 'fit'
    },
    maxWidth: {
      default: 'full',
      isMultiMonth: 'unset'
    }
  },
  getAllowedOverrides()
);

const headerStyles = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  columnGap: 24
});

const headingStyles = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  margin: 0,
  flexGrow: 1,
  width: 'full'
});

const titleStyles = style({
  font: 'title-lg',
  textAlign: 'center',
  flexGrow: 1,
  flexShrink: 0,
  marginY: 0
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
  boxSizing: 'content-box',
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
  paddingBottom: {
    default: 2,
    isLastWeek: 0
  },
  position: 'relative',
  display: {
    default: 'flex',
    isOutsideMonth: 'none'
  },
  alignItems: 'center',
  justifyContent: 'center',
  disableTapHighlight: true,
  width: '--cell-responsive-size',
  height: '--cell-responsive-size'
});

const cellInnerStyles = style<CalendarCellRenderProps & {selectionMode: 'single' | 'range'}>({
  ...focusRing(),
  transition: {
    default: 'default',
    forcedColors: 'none'
  },
  outlineOffset: {
    default: -2,
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
  height: 'full',
  borderRadius: 'full',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  forcedColorAdjust: 'none',
  backgroundColor: {
    default: 'transparent',
    isHovered: {
      default: 'gray-100',
      isUnavailable: 'transparent'
    },
    isPressed: 'gray-100',
    isDisabled: 'transparent',
    isSelected: {
      selectionMode: {
        single: {
          default: lightDark('accent-900', 'accent-700'),
          isHovered: lightDark('accent-1000', 'accent-600'),
          isPressed: lightDark('accent-1000', 'accent-600'),
          isFocusVisible: lightDark('accent-1000', 'accent-600'),
          isDisabled: 'transparent',
          isInvalid: {
            default: lightDark('negative-900', 'negative-700'),
            isHovered: lightDark('negative-1000', 'negative-600'),
            isPressed: lightDark('negative-1000', 'negative-600'),
            isFocusVisible: lightDark('negative-1000', 'negative-600')
          }
        },
        range: {
          isHovered: {
            default: 'blue-500',
            isInvalid: {
              default: 'negative-300',
              isUnavailable: 'transparent'
            }
          }
        }
      }
    },
    isSelectionStart: {
      default: lightDark('accent-900', 'accent-700'),
      isHovered: lightDark('accent-1000', 'accent-600'),
      isPressed: lightDark('accent-1000', 'accent-600'),
      isFocusVisible: lightDark('accent-1000', 'accent-600'),
      isDisabled: 'transparent',
      isInvalid: {
        default: lightDark('negative-900', 'negative-700'),
        isHovered: {
          default: lightDark('negative-1000', 'negative-600'),
          isUnavailable: lightDark('negative-900', 'negative-700')
        },
        isPressed: lightDark('negative-1000', 'negative-600'),
        isFocusVisible: {
          default: lightDark('negative-1000', 'negative-600'),
          isUnavailable: lightDark('negative-900', 'negative-700')
        }
      }
    },
    isSelectionEnd: {
      default: lightDark('accent-900', 'accent-700'),
      isHovered: lightDark('accent-1000', 'accent-600'),
      isPressed: lightDark('accent-1000', 'accent-600'),
      isFocusVisible: lightDark('accent-1000', 'accent-600'),
      isDisabled: 'transparent',
      isInvalid: {
        default: lightDark('negative-900', 'negative-700'),
        isHovered: {
          default: lightDark('negative-1000', 'negative-600'),
          isUnavailable: lightDark('negative-900', 'negative-700')
        },
        isPressed: lightDark('negative-1000', 'negative-600'),
        isFocusVisible: {
          default: lightDark('negative-1000', 'negative-600'),
          isUnavailable: lightDark('negative-900', 'negative-700')
        }
      }
    },
    forcedColors: {
      default: 'transparent',
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
      isSelected: 'HighlightText',
      isSelectionStart: 'HighlightText',
      isSelectionEnd: 'HighlightText',
      isDisabled: 'GrayText'
    }
  }
});

const todayStyles = style({
  position: 'absolute',
  bottom: '12.5%',
  left: '50%',
  transform: 'translateX(-50%)',
  width: 4,
  height: 4,
  borderRadius: 'full',
  backgroundColor: '[currentColor]',
  display: {
    default: 'none',
    isToday: 'block'
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

const selectionBackgroundStyles = style<{
  isInvalid?: boolean;
  isFirstDayInWeek?: boolean;
  isLastDayInWeek?: boolean;
  isSelectionStart?: boolean;
  isSelectionEnd?: boolean;
  isPreviousDayNotSelected?: boolean;
  isNextDayNotSelected?: boolean;
}>({
  position: 'absolute',
  zIndex: -1,
  top: 0,
  insetStart: {
    default: -4,
    isFirstDayInWeek: 0,
    isSelectionStart: 0,
    isPreviousDayNotSelected: 0
  },
  insetEnd: {
    default: -4,
    isLastDayInWeek: 0,
    isSelectionEnd: 0,
    isNextDayNotSelected: 0
  },
  bottom: 0,
  borderStartRadius: {
    default: 'none',
    isFirstDayInWeek: 'full',
    isSelectionStart: 'full',
    isPreviousDayNotSelected: 'full'
  },
  borderEndRadius: {
    default: 'none',
    isLastDayInWeek: 'full',
    isSelectionEnd: 'full',
    isNextDayNotSelected: 'full'
  },
  backgroundColor: {
    default: 'blue-subtle',
    isInvalid: 'negative-100',
    forcedColors: {
      default: 'Highlight'
    }
  },
  forcedColorAdjust: 'none'
});

const selectionBorderStyles = style<{
  isInvalid?: boolean;
  isFirstDayInWeek?: boolean;
  isLastDayInWeek?: boolean;
  isSelectionStart?: boolean;
  isSelectionEnd?: boolean;
  isPreviousDayNotSelected?: boolean;
  isNextDayNotSelected?: boolean;
}>({
  position: 'absolute',
  zIndex: 1,
  top: 0,
  insetStart: {
    default: -4,
    isFirstDayInWeek: 0,
    isSelectionStart: 0,
    isPreviousDayNotSelected: 0
  },
  insetEnd: {
    default: -4,
    isLastDayInWeek: 0,
    isSelectionEnd: 0,
    isNextDayNotSelected: 0
  },
  bottom: 0,
  borderStartWidth: {
    default: 0,
    isFirstDayInWeek: 1,
    isSelectionStart: 1,
    isPreviousDayNotSelected: 1
  },
  borderTopWidth: 1,
  borderEndWidth: {
    default: 0,
    isLastDayInWeek: 1,
    isSelectionEnd: 1,
    isNextDayNotSelected: 1
  },
  borderBottomWidth: 1,
  borderStyle: 'solid',
  borderColor: {
    default: 'blue-800', // focus-indicator-color
    isInvalid: 'negative-900',
    forcedColors: {
      default: 'ButtonText'
    }
  },
  borderStartRadius: {
    default: 'none',
    isFirstDayInWeek: 'full',
    isSelectionStart: 'full',
    isPreviousDayNotSelected: 'full'
  },
  borderEndRadius: {
    default: 'none',
    isLastDayInWeek: 'full',
    isSelectionEnd: 'full',
    isNextDayNotSelected: 'full'
  }
});
/**
 * Calendars display a grid of days in one or more months and allow users to select a single date.
 */
export const Calendar = /*#__PURE__*/ (forwardRef as forwardRefType)(function Calendar<
  T extends DateValue,
  M extends CalendarSelectionMode = 'single'
>(props: CalendarProps<T, M>, ref: ForwardedRef<HTMLDivElement>) {
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
  let isMultiMonth = visibleMonths > 1;
  return (
    <AriaCalendar
      {...otherProps}
      ref={ref}
      visibleDuration={{months: visibleMonths}}
      style={UNSAFE_style}
      className={(UNSAFE_className || '') + calendarStyles({isMultiMonth}, styles)}>
      {({isInvalid, isDisabled}) => {
        return (
          <>
            <Provider
              values={[
                [HeaderContext, null],
                [HeadingContext, null]
              ]}>
              <CalendarHeader visibleMonths={visibleMonths} />
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
                <CalendarGrid key={i} months={i} />
              ))}
            </div>
            {isInvalid && (
              <Text
                slot="errorMessage"
                className={helpTextStyles({isInvalid, isDisabled, size: 'M'})}>
                {errorMessage ||
                  stringFormatter.format('calendar.invalidSelection', {selectedCount: 1})}
              </Text>
            )}
          </>
        );
      }}
    </AriaCalendar>
  );
});

export const CalendarHeader = ({visibleMonths}: {visibleMonths: number}): ReactElement => {
  return (
    <Header styles={headerStyles}>
      {Array.from({length: visibleMonths}).map((_, i) => (
        <div key={i} className={headingStyles}>
          {i === 0 && (
            <CalendarButton slot="previous">
              <ChevronLeftIcon />
            </CalendarButton>
          )}
          <CalendarHeading offset={{months: i}} className={titleStyles} />
          {i === visibleMonths - 1 && (
            <CalendarButton slot="next">
              <ChevronRightIcon />
            </CalendarButton>
          )}
        </div>
      ))}
    </Header>
  );
};

export const CalendarGrid = (
  props: Omit<AriaCalendarGridProps, 'children'> & PropsWithChildren & {months: number}
): ReactElement => {
  let rangeCalendarProps = useSlottedContext(RangeCalendarContext);
  let calendarProps = useSlottedContext(AriaCalendarContext);
  let firstDayOfWeek = rangeCalendarProps?.firstDayOfWeek ?? calendarProps?.firstDayOfWeek;

  // use isolation to start a new stacking context so that we can use zIndex -1 for the selection span.
  return (
    <AriaCalendarGrid
      className={style({
        borderCollapse: 'collapse',
        borderSpacing: 0,
        isolation: 'isolate'
      })}
      offset={{months: props.months}}>
      <CalendarGridHeader className="">
        {day => <CalendarHeaderCell>{day}</CalendarHeaderCell>}
      </CalendarGridHeader>
      <CalendarGridBody className="">
        {date => <CalendarCell date={date} firstDayOfWeek={firstDayOfWeek} />}
      </CalendarGridBody>
    </AriaCalendarGrid>
  );
};

export const CalendarButton = (
  props: Omit<ButtonProps, 'children'> & {children: ReactNode}
): ReactElement => {
  let {direction} = useLocale();
  return (
    <div
      className={style({
        scale: {
          direction: {
            rtl: -1
          }
        }
      })({direction})}>
      <ActionButton {...props} isQuiet>
        {props.children}
      </ActionButton>
    </div>
  );
};

const CalendarHeaderCell = (
  props: Omit<CalendarHeaderCellProps, 'children'> & PropsWithChildren
): ReactElement => {
  return (
    <AriaCalendarHeaderCell className={headerCellStyles}>{props.children}</AriaCalendarHeaderCell>
  );
};

const CalendarCell = (
  props: Omit<CalendarCellProps, 'children'> & {
    firstDayOfWeek: 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | undefined;
  }
): ReactElement => {
  let {locale} = useLocale();
  let firstDayOfWeek = props.firstDayOfWeek;
  // Calculate the day and week index based on the date.
  let {dayIndex, weekIndex, lastWeekIndex} = useWeekAndDayIndices(
    props.date,
    locale,
    firstDayOfWeek
  );

  let calendarStateContext = useContext(CalendarStateContext);
  let rangeCalendarStateContext = useContext(RangeCalendarStateContext);
  let state = (calendarStateContext ?? rangeCalendarStateContext)!;

  let isFirstWeek = weekIndex === 0;
  let isLastWeek = weekIndex === lastWeekIndex;
  let isFirstChild = dayIndex === 0;
  let isLastChild = dayIndex === 6;

  return (
    <AriaCalendarCell
      date={props.date}
      className={renderProps =>
        cellStyles({...renderProps, isFirstChild, isLastChild, isFirstWeek, isLastWeek})
      }>
      {renderProps => (
        <CalendarCellInner
          {...props}
          weekIndex={weekIndex}
          dayIndex={dayIndex}
          state={state}
          isRangeSelection={!!rangeCalendarStateContext}
          renderProps={renderProps}
        />
      )}
    </AriaCalendarCell>
  );
};

const CalendarCellInner = (
  props: Omit<CalendarCellProps, 'children'> & {
    isRangeSelection: boolean;
    state: CalendarState<CalendarSelectionMode> | RangeCalendarState;
    weekIndex: number;
    dayIndex: number;
    renderProps?: CalendarCellRenderProps;
    date: DateValue;
  }
): ReactElement => {
  let {dayIndex, date, renderProps, state, isRangeSelection} = props;
  let ref = useRef<HTMLDivElement>(null);
  let {isUnavailable, formattedDate, isSelected, isSelectionStart, isSelectionEnd, isInvalid} =
    renderProps!;
  // only apply the selection start/end styles if the start/end date is actually selectable (aka not unavailable)
  // or if the range is invalid and thus we still want to show the styles even if the start/end date is an unavailable one
  isSelectionStart = isSelectionStart && (!isUnavailable || isInvalid);
  isSelectionEnd = isSelectionEnd && (!isUnavailable || isInvalid);

  let isDateInRange = (checkDate: CalendarDate) => {
    if (!('highlightedRange' in state) || !state.highlightedRange) {
      return state.isSelected(checkDate);
    }
    // if invalid, check if date is within the full range boundaries
    if (isInvalid) {
      return (
        checkDate.compare(state.highlightedRange.start) >= 0 &&
        checkDate.compare(state.highlightedRange.end) <= 0
      );
    }

    return state.isSelected(checkDate);
  };

  let prevDay = date.subtract({days: 1});
  let nextDay = date.add({days: 1});
  let isFirstDayInWeek = dayIndex === 0;
  let isLastDayInWeek = dayIndex === 6;
  let isPreviousDayNotSelected =
    !prevDay || !isDateInRange(prevDay) || prevDay.month !== props.date.month;
  let isNextDayNotSelected =
    !nextDay || !isDateInRange(nextDay) || nextDay.month !== props.date.month;

  // when invalid, show background for all selected dates (including unavailable) to make continuous range appearance
  // when valid, only show background for available selected dates
  let isBackgroundStyleApplied =
    isSelected &&
    isRangeSelection &&
    (isInvalid || !isUnavailable) &&
    (isDateInRange(prevDay) || (nextDay.month === date.month && isDateInRange(nextDay)));

  return (
    <div
      className={style({
        position: 'relative',
        width: 'full',
        height: 'full'
      })}>
      <div
        ref={ref}
        style={pressScale(ref, {})(renderProps!)}
        className={cellInnerStyles({
          ...renderProps!,
          isSelectionStart,
          isSelectionEnd,
          selectionMode: isRangeSelection ? 'range' : 'single'
        })}>
        <div className={todayStyles(renderProps!)} role="presentation" />
        <div>{formattedDate}</div>
        {isUnavailable && <div className={unavailableStyles} role="presentation" />}
      </div>
      {isBackgroundStyleApplied && (
        <div
          className={selectionBackgroundStyles({
            isInvalid,
            isFirstDayInWeek,
            isLastDayInWeek,
            isSelectionStart,
            isSelectionEnd,
            isPreviousDayNotSelected,
            isNextDayNotSelected
          })}
          role="presentation"
        />
      )}
      {isBackgroundStyleApplied && (
        <div
          className={selectionBorderStyles({
            isInvalid,
            isFirstDayInWeek,
            isLastDayInWeek,
            isSelectionStart,
            isSelectionEnd,
            isPreviousDayNotSelected,
            isNextDayNotSelected
          })}
          role="presentation"
        />
      )}
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
function useWeekAndDayIndices(date: CalendarDate, locale: string, firstDayOfWeek?: DayOfWeek) {
  let result = useMemo(() => {
    // Get the day index within the week (0-6)
    const dayIndex = getDayOfWeek(date, locale, firstDayOfWeek);

    const monthStart = startOfMonth(date);

    // Calculate the week index by finding which week this date falls into
    // within the month's calendar grid
    const monthStartDayOfWeek = getDayOfWeek(monthStart, locale, firstDayOfWeek);
    const dayOfMonth = date.day;

    const weekIndex = Math.floor((dayOfMonth + monthStartDayOfWeek - 1) / 7);
    const lastDayOfMonth = startOfMonth(date).add({months: 1}).subtract({days: 1});
    const lastWeekIndex = Math.floor((lastDayOfMonth.day + monthStartDayOfWeek - 1) / 7);

    return {
      weekIndex,
      lastWeekIndex,
      dayIndex
    };
  }, [date, locale, firstDayOfWeek]);

  return result;
}
