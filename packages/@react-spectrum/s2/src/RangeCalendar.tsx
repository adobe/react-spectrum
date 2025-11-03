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

import {
  RangeCalendar as AriaRangeCalendar,
  RangeCalendarProps as AriaRangeCalendarProps,
  ContextValue,
  DateValue,
  Provider,
  Text
} from 'react-aria-components';
import {CalendarButton, CalendarGrid, CalendarHeading} from './Calendar';
import ChevronLeftIcon from '../s2wf-icons/S2_Icon_ChevronLeft_20_N.svg';
import ChevronRightIcon from '../s2wf-icons/S2_Icon_ChevronRight_20_N.svg';
import {createContext, ForwardedRef, forwardRef, ReactNode} from 'react';
import {forwardRefType, GlobalDOMAttributes} from '@react-types/shared';
import {getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {Header, HeaderContext, HeadingContext} from './';
import {helpTextStyles} from './Field';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {style} from '../style' with {type: 'macro'};
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {useSpectrumContextProps} from './useSpectrumContextProps';


export interface RangeCalendarProps<T extends DateValue>
  extends Omit<AriaRangeCalendarProps<T>, 'visibleDuration' | 'style' | 'className' | 'children' | 'styles' | keyof GlobalDOMAttributes>,
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

export const RangeCalendarContext = createContext<ContextValue<Partial<RangeCalendarProps<any>>, HTMLDivElement>>(null);


const calendarStyles = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  width: 'fit'
}, getAllowedOverrides());

const headerStyles = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: 'full'
});

/**
 * RangeCalendars display a grid of days in one or more months and allow users to select a contiguous range of dates.
 */
export const RangeCalendar = /*#__PURE__*/ (forwardRef as forwardRefType)(function RangeCalendar<T extends DateValue>(props: RangeCalendarProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, RangeCalendarContext);
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
    <AriaRangeCalendar
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
                {errorMessage || stringFormatter.format('calendar.invalidSelection', {selectedCount: 2})}
              </Text>
            )}
          </>
        );
      }}
    </AriaRangeCalendar>
  );
});
