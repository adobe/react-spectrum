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

import {ActionButton, Header, Heading} from './';
import {
  CalendarCell as AriaCalendarCell,
  RangeCalendar as AriaRangeCalendar,
  RangeCalendarProps as AriaRangeCalendarProps,
  ButtonProps,
  CalendarCellProps,
  CalendarCellRenderProps,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  ContextValue,
  DateValue,
  RangeCalendarStateContext,
  Text
} from 'react-aria-components';
import {baseColor, focusRing, lightDark, style} from '../style' with {type: 'macro'};
import ChevronLeftIcon from '../s2wf-icons/S2_Icon_ChevronLeft_20_N.svg';
import ChevronRightIcon from '../s2wf-icons/S2_Icon_ChevronRight_20_N.svg';
import {Context, createContext, CSSProperties, ForwardedRef, forwardRef, Fragment, ReactElement, ReactNode, RefAttributes, useContext, useMemo} from 'react';
import {forwardRefType} from '@react-types/shared';
import {getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {getEraFormat} from '@react-aria/calendar';
import {useDateFormatter} from '@react-aria/i18n';


export interface RangeCalendarProps<T extends DateValue>
  extends Omit<AriaRangeCalendarProps<T>, 'visibleDuration' | 'style' | 'className' | 'styles'>,
  StyleProps {
  errorMessage?: string,
  visibleMonths?: number
}

export const RangeCalendarContext:
  Context<ContextValue<Partial<RangeCalendarProps<any>>, HTMLDivElement>> =
  createContext<ContextValue<Partial<RangeCalendarProps<any>>, HTMLDivElement>>(null);


const calendarStyles = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  width: 'full'
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
  flexGrow: 1
});

const cellStyles = style<CalendarCellRenderProps>({
  paddingX: 4,
  '--cell-gap': {
    type: 'paddingStart',
    value: 4
  },
  paddingY: 2
});

const cellInnerWrapperStyles = style<CalendarCellRenderProps>({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 'full',
  boxSizing: 'border-box',
  borderStartRadius: {
    isSelectionStart: 'full'
  },
  borderEndRadius: {
    isSelectionEnd: 'full'
  },
  outlineStyle: 'none'
});

const innerCellStyles = style<CalendarCellRenderProps>({
  ...focusRing(),
  outlineOffset: {
    default: -2,
    isToday: 2,
    isSelected: 2
  },
  position: 'relative',
  font: 'body-sm',
  cursor: 'default',
  width: 32,
  '--cell-width': {
    type: 'width',
    value: '[self(width)]'
  },
  height: 32,
  borderRadius: 'full',
  display: {
    default: 'flex',
    isOutsideMonth: 'none'
  },
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: {
    default: 'transparent',
    isHovered: 'gray-100',
    isToday: {
      default: baseColor('gray-300'),
      isDisabled: 'disabled'
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
    }
  },
  color: {
    isSelected: {
      isSelectionStart: 'white',
      isSelectionEnd: 'white'
    },
    isDisabled: 'disabled'
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
  borderColor: 'blue-800', // focus-indicator-color
  borderStartRadius: 'full',
  borderEndRadius: 'full',
  backgroundColor: 'blue-subtle'
});

export const RangeCalendar:
  <T extends DateValue>(props: RangeCalendarProps<T> & RefAttributes<HTMLDivElement>) => ReactElement | null =
/*#__PURE__*/ (forwardRef as forwardRefType)(function RangeCalendar<T extends DateValue>(props: RangeCalendarProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  let {
    visibleMonths = 1,
    errorMessage,
    UNSAFE_style,
    UNSAFE_className,
    styles,
    ...otherProps
  } = props;

  return (
    <AriaRangeCalendar
      {...otherProps}
      ref={ref}
      visibleDuration={{months: visibleMonths}}
      style={UNSAFE_style}
      className={UNSAFE_className + calendarStyles(null, styles)}>
      <Header styles={headerStyles}>
        <CalendarButton slot="previous"><ChevronLeftIcon /></CalendarButton>
        <CalendarHeading />
        <CalendarButton slot="next"><ChevronRightIcon /></CalendarButton>
      </Header>
      <div
        className={style({
          display: 'flex',
          flexDirection: 'row',
          gap: 24,
          width: 'full'
        })}>
        {Array.from({length: visibleMonths}).map((_, i) => {
          return (
            <CalendarGrid offset={{months: i}} key={i} className={style({borderSpacing: 0, borderCollapse: 'collapse'})}>
              <CalendarGridHeader>
                {(day) => (
                  <CalendarHeaderCell className={headerCellStyles}>
                    {day}
                  </CalendarHeaderCell>
                )}
              </CalendarGridHeader>
              <CalendarGridBody>
                {(date, weekIndex) => {
                  return (
                    <CalendarCell date={date} weekIndex={weekIndex} />
                  );
                }}
              </CalendarGridBody>
            </CalendarGrid>
          );
        })}
      </div>
      {errorMessage && <Text slot="errorMessage">{errorMessage}</Text>}
    </AriaRangeCalendar>
  );
});

// Ordinarily the heading is a formatted date range, ie January 2025 - February 2025.
// However, we want to show each month individually.
const CalendarHeading = () => {
  let {visibleRange, timeZone} = useContext(RangeCalendarStateContext) ?? {};
  let era: any = getEraFormat(visibleRange?.start) || getEraFormat(visibleRange?.end);
  let monthFormatter = useDateFormatter({
    month: 'long',
    year: 'numeric',
    era,
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
              <div className={style({visibility: 'hidden', width: 32})} role="presentation" />
              <div className={style({visibility: 'hidden', width: 24})} role="presentation" />
              <div className={style({visibility: 'hidden', width: 32})} role="presentation" />
              <div className={titleStyles}>{month}</div>
            </Fragment>
          );
        }
      })}
    </Heading>
  );
};

const CalendarButton = (props: Omit<ButtonProps, 'children'> & {children: ReactNode}) => {
  return (
    <ActionButton
      {...props}
      isQuiet>
      {props.children}
    </ActionButton>
  );
};

const CalendarCell = (props: Omit<CalendarCellProps, 'children'> & {weekIndex: number}) => {
  let state = useContext(RangeCalendarStateContext)!;
  let {getDatesInWeek} = state;
  let {weekIndex} = props;
  let datesInWeek = getDatesInWeek(weekIndex);

  return (
    <AriaCalendarCell
      {...props}
      className={cellInnerWrapperStyles}
      cellClassName={cellStyles}>
      {(renderProps) => {
        let {isUnavailable, formattedDate} = renderProps;
        let isBackgroundStyleApplied = false;
        let firstSelectedInWeek = datesInWeek.findIndex(date => date && state.isSelected(date));
        let indexOfCurrentDate = datesInWeek.findIndex(date => date && date.compare(props.date) === 0);
        if (renderProps.isSelected && firstSelectedInWeek !== -1 && indexOfCurrentDate !== -1) {
          isBackgroundStyleApplied = true;
        }
        return (
          <div className={innerCellStyles(renderProps)}>
            <div>
              {formattedDate}
            </div>
            {isUnavailable && <div className={unavailableStyles} role="presentation" />}
            {isBackgroundStyleApplied && <div style={{'--selection-span': indexOfCurrentDate - firstSelectedInWeek} as CSSProperties} className={selectionSpanStyles} role="presentation" />}
          </div>
        );
      }}
    </AriaCalendarCell>
  );
};
