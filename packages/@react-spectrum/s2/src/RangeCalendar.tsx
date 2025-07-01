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
  CalendarGrid as AriaCalendarGrid,
  RangeCalendar as AriaRangeCalendar,
  RangeCalendarProps as AriaRangeCalendarProps,
  CalendarGridBody,
  CalendarGridHeader,
  ContextValue,
  DateValue,
  Text
} from 'react-aria-components';
import {CalendarButton, CalendarCell, CalendarHeaderCell, CalendarHeading} from './Calendar';
import ChevronLeftIcon from '../s2wf-icons/S2_Icon_ChevronLeft_20_N.svg';
import ChevronRightIcon from '../s2wf-icons/S2_Icon_ChevronRight_20_N.svg';
import {controlFont, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {createContext, ForwardedRef, forwardRef, ReactNode} from 'react';
import {forwardRefType, ValidationResult} from '@react-types/shared';
import {Header} from './';
import {style} from '../style' with {type: 'macro'};
import {useSpectrumContextProps} from './useSpectrumContextProps';


export interface RangeCalendarProps<T extends DateValue>
  extends Omit<AriaRangeCalendarProps<T>, 'visibleDuration' | 'style' | 'className' | 'styles'>,
  StyleProps {
  errorMessage?: ReactNode | ((v: ValidationResult) => ReactNode),
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

export const helpTextStyles = style({
  gridArea: 'helptext',
  display: 'flex',
  alignItems: 'baseline',
  gap: 'text-to-visual',
  font: controlFont(),
  color: {
    default: 'neutral-subdued',
    isInvalid: 'negative',
    isDisabled: 'disabled'
  },
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  },
  contain: 'inline-size',
  paddingTop: '--field-gap',
  cursor: {
    default: 'text',
    isDisabled: 'default'
  }
});

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
                  <AriaCalendarGrid cellPadding={0} className={style({borderCollapse: 'collapse', borderSpacing: 0})} offset={{months: i}} key={i}>
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
              })}
            </div>
            {errorMessage && (
              <Text slot="errorMessage" className={helpTextStyles({isInvalid, isDisabled})}>
                {/* @ts-ignore */}
                {errorMessage}
              </Text>
            )}
          </>
        );
      }}
    </AriaRangeCalendar>
  );
});
