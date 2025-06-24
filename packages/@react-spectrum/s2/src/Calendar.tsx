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
  Calendar as AriaCalendar,
  CalendarProps as AriaCalendarProps,
  ButtonProps,
  CalendarCell,
  CalendarCellRenderProps,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarStateContext,
  ContextValue,
  DateValue,
  Text
} from 'react-aria-components';
import {baseColor, focusRing, lightDark, style} from '../style' with {type: 'macro'};
import ChevronLeftIcon from '../s2wf-icons/S2_Icon_ChevronLeft_20_N.svg';
import ChevronRightIcon from '../s2wf-icons/S2_Icon_ChevronRight_20_N.svg';
import {Context, createContext, ForwardedRef, forwardRef, Fragment, ReactElement, ReactNode, RefAttributes, useContext, useMemo} from 'react';
import {forwardRefType} from '@react-types/shared';
import {getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {getEraFormat} from '@react-aria/calendar';
import {useDateFormatter} from '@react-aria/i18n';
import {useSpectrumContextProps} from './useSpectrumContextProps';


export interface CalendarProps<T extends DateValue>
  extends Omit<AriaCalendarProps<T>, 'visibleDuration' | 'style' | 'className' | 'styles'>,
  StyleProps {
  errorMessage?: string,
  visibleMonths?: number
}

export const CalendarContext:
  Context<ContextValue<Partial<CalendarProps<any>>, HTMLDivElement>> =
  createContext<ContextValue<Partial<CalendarProps<any>>, HTMLDivElement>>(null);

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

const cellInnerStyles = style({
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
  height: 32,
  margin: 2,
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
    isSelected: {
      default: lightDark('accent-900', 'accent-700'),
      isHovered: lightDark('accent-1000', 'accent-600'),
      isPressed: lightDark('accent-1000', 'accent-600'),
      isFocusVisible: lightDark('accent-1000', 'accent-600')
    }
  },
  color: {
    isSelected: 'white',
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


export const Calendar:
  <T extends DateValue>(props: CalendarProps<T> & RefAttributes<HTMLDivElement>) => ReactElement | null =
/*#__PURE__*/ (forwardRef as forwardRefType)(function Calendar<T extends DateValue>(props: CalendarProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, CalendarContext);
  let {
    visibleMonths = 1,
    errorMessage,
    UNSAFE_style,
    UNSAFE_className,
    styles,
    ...otherProps
  } = props;
  return (
    <AriaCalendar
      {...otherProps}
      ref={ref}
      visibleDuration={{months: visibleMonths}}
      style={UNSAFE_style}
      className={(UNSAFE_className || '') + calendarStyles(null, styles)}>
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
        {Array.from({length: visibleMonths}).map((_, i) => (
          <CalendarGrid offset={{months: i}} key={i}>
            <CalendarGridHeader>
              {(day) => (
                <CalendarHeaderCell className={headerCellStyles}>
                  {day}
                </CalendarHeaderCell>
              )}
            </CalendarGridHeader>
            <CalendarGridBody>
              {(date) => (
                <CalendarCell
                  date={date}
                  cellClassName={cellStyles}
                  className={cellInnerStyles}>
                  {({isUnavailable, formattedDate}) => (
                    <>
                      <div>
                        {formattedDate}
                      </div>
                      {isUnavailable && <div className={unavailableStyles} role="presentation" />}
                    </>
                  )}
                </CalendarCell>
              )}
            </CalendarGridBody>
          </CalendarGrid>
        ))}
      </div>
      {errorMessage && <Text slot="errorMessage">{errorMessage}</Text>}
    </AriaCalendar>
  );
});

// Ordinarily the heading is a formatted date range, ie January 2025 - February 2025.
// However, we want to show each month individually.
const CalendarHeading = () => {
  let {visibleRange, timeZone} = useContext(CalendarStateContext) ?? {};
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
