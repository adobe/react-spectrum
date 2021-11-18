/*
 * Copyright 2020 Adobe. All rights reserved.
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
  AriaLabelingProps,
  DOMProps,
  FocusableProps,
  HelpTextProps,
  InputBase,
  LabelableProps,
  RangeValue,
  SpectrumLabelableProps,
  StyleProps,
  Validation,
  ValueBase
} from '@react-types/shared';
import {CalendarDate, CalendarDateTime, Time, ZonedDateTime} from '@internationalized/date';

export type DateValue = CalendarDate | CalendarDateTime | ZonedDateTime;
type MappedDateValue<T> =
  T extends ZonedDateTime ? ZonedDateTime :
  T extends CalendarDateTime ? CalendarDateTime :
  T extends CalendarDate ? CalendarDate :
  never;

export type Granularity = 'day' | 'hour' | 'minute' | 'second' | 'millisecond';
interface DatePickerBase<T extends DateValue> extends InputBase, Validation, FocusableProps, LabelableProps, HelpTextProps {
  minValue?: DateValue,
  maxValue?: DateValue,
  placeholderValue?: T,
  hourCycle?: 12 | 24,
  granularity?: Granularity,
  hideTimeZone?: boolean
}

export interface AriaDatePickerBaseProps<T extends DateValue> extends DatePickerBase<T>, AriaLabelingProps, DOMProps {}

export interface DatePickerProps<T extends DateValue> extends DatePickerBase<T>, ValueBase<T, MappedDateValue<T>> {}
export interface AriaDatePickerProps<T extends DateValue> extends AriaDatePickerBaseProps<T>, DatePickerProps<T> {}

export type DateRange = RangeValue<DateValue>;
export interface DateRangePickerProps<T extends DateValue> extends DatePickerBase<T>, ValueBase<RangeValue<T>, RangeValue<MappedDateValue<T>>> {}
export interface AriaDateRangePickerProps<T extends DateValue> extends AriaDatePickerBaseProps<T>, DateRangePickerProps<T> {}

interface SpectrumDatePickerBase<T extends DateValue> extends AriaDatePickerBaseProps<T>, SpectrumLabelableProps, StyleProps {
  isQuiet?: boolean,
  showFormatHelpText?: boolean,
  maxVisibleMonths?: number
}

export interface SpectrumDatePickerProps<T extends DateValue> extends DatePickerProps<T>, SpectrumDatePickerBase<T> {}
export interface SpectrumDateRangePickerProps<T extends DateValue> extends DateRangePickerProps<T>, SpectrumDatePickerBase<T> {}

export type TimeValue = Time | CalendarDateTime | ZonedDateTime;
type MappedTimeValue<T> =
  T extends ZonedDateTime ? ZonedDateTime :
  T extends CalendarDateTime ? CalendarDateTime :
  T extends Time ? Time :
  never;

export interface TimePickerProps<T extends TimeValue> extends InputBase, Validation, FocusableProps, LabelableProps, ValueBase<T, MappedTimeValue<T>> {
  hourCycle?: 12 | 24,
  granularity?: 'hour' | 'minute' | 'second' | 'millisecond',
  hideTimeZone?: boolean,
  placeholderValue?: T,
  minValue?: TimeValue,
  maxValue?: TimeValue
}

export interface SpectrumTimePickerProps<T extends TimeValue> extends TimePickerProps<T>, SpectrumLabelableProps, DOMProps, StyleProps {
  isQuiet?: boolean
}
