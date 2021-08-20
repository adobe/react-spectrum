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
interface DatePickerBase extends InputBase, Validation, FocusableProps, LabelableProps {
  minValue?: DateValue,
  maxValue?: DateValue,
  placeholderValue?: DateValue,
  hourCycle?: 12 | 24,
  granularity?: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond',
  hideTimeZone?: boolean
}

export interface AriaDatePickerBaseProps extends DatePickerBase, AriaLabelingProps, DOMProps {}

export interface DatePickerProps extends DatePickerBase, ValueBase<DateValue> {}
export interface AriaDatePickerProps extends AriaDatePickerBaseProps, DatePickerProps {}

export type DateRange = RangeValue<DateValue>;
export interface DateRangePickerProps extends DatePickerBase, ValueBase<DateRange> {}
export interface AriaDateRangePickerProps extends AriaDatePickerBaseProps, DateRangePickerProps {}

interface SpectrumDatePickerBase extends AriaDatePickerBaseProps, SpectrumLabelableProps, StyleProps {
  isQuiet?: boolean,
  showFormatHelpText?: boolean
}

export interface SpectrumDatePickerProps extends DatePickerProps, SpectrumDatePickerBase {}
export interface SpectrumDateRangePickerProps extends DateRangePickerProps, SpectrumDatePickerBase {}

export type TimeValue = Time | CalendarDateTime | ZonedDateTime;
interface TimePickerProps extends InputBase, Validation, FocusableProps, LabelableProps, ValueBase<TimeValue> {
  hourCycle?: 12 | 24,
  granularity?: 'hour' | 'minute' | 'second' | 'millisecond',
  hideTimeZone?: boolean,
  placeholderValue?: TimeValue,
  minValue?: TimeValue,
  maxValue?: TimeValue
}

interface SpectrumTimePickerProps extends TimePickerProps, SpectrumLabelableProps, DOMProps, StyleProps {
  isQuiet?: boolean
}
