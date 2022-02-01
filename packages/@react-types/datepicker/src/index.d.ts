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
  /** The minimum allowed date that a user may select. */
  minValue?: DateValue,
  /** The maximum allowed date that a user may select. */
  maxValue?: DateValue,
  /** Callback that is called for each date of the calendar. If it returns true, then the date is disabled. */
  isDateDisabled?: (date: DateValue) => boolean,
  /** A placeholder date to display when no value is selected. Defaults to today's date at midnight. */
  placeholderValue?: T,
  /** Whether to display the time in 12 or 24 hour format. By default, this is determined by the user's locale. */
  hourCycle?: 12 | 24,
  /** Determines the smallest unit that is displayed in the date picker. By default, this is `"day"` for dates, and `"minute"` for times. */
  granularity?: Granularity,
  /**
   * Whether to hide the time zone abbreviation.
   * @default false
   */
  hideTimeZone?: boolean
}

export interface AriaDatePickerBaseProps<T extends DateValue> extends DatePickerBase<T>, AriaLabelingProps, DOMProps {}

export interface DatePickerProps<T extends DateValue> extends DatePickerBase<T>, ValueBase<T, MappedDateValue<T>> {}
export interface AriaDatePickerProps<T extends DateValue> extends AriaDatePickerBaseProps<T>, DatePickerProps<T> {}

export type DateRange = RangeValue<DateValue>;
export interface DateRangePickerProps<T extends DateValue> extends DatePickerBase<T>, ValueBase<RangeValue<T>, RangeValue<MappedDateValue<T>>> {}
export interface AriaDateRangePickerProps<T extends DateValue> extends AriaDatePickerBaseProps<T>, DateRangePickerProps<T> {}

interface SpectrumDatePickerBase<T extends DateValue> extends AriaDatePickerBaseProps<T>, SpectrumLabelableProps, StyleProps {
  /**
   * Whether the date picker should be displayed with a quiet style.
   * @default false
   */
  isQuiet?: boolean,
  /**
   * Whether to show the localized date format as help text below the field.
   * @default false
   */
  showFormatHelpText?: boolean,
  /**
   * The maximum number of months to display at once in the calendar popover, if screen space permits.
   * @default 1
   */
  maxVisibleMonths?: number
}

export interface SpectrumDatePickerProps<T extends DateValue> extends DatePickerProps<T>, SpectrumDatePickerBase<T> {}
export interface SpectrumDateRangePickerProps<T extends DateValue> extends DateRangePickerProps<T>, SpectrumDatePickerBase<T> {}
export interface SpectrumDateFieldProps<T extends DateValue> extends Omit<SpectrumDatePickerProps<T>, 'maxVisibleMonths'> {}

export type TimeValue = Time | CalendarDateTime | ZonedDateTime;
type MappedTimeValue<T> =
  T extends ZonedDateTime ? ZonedDateTime :
  T extends CalendarDateTime ? CalendarDateTime :
  T extends Time ? Time :
  never;

export interface TimePickerProps<T extends TimeValue> extends InputBase, Validation, FocusableProps, LabelableProps, ValueBase<T, MappedTimeValue<T>> {
  /** Whether to display the time in 12 or 24 hour format. By default, this is determined by the user's locale. */
  hourCycle?: 12 | 24,
  /**
   * Determines the smallest unit that is displayed in the time picker.
   * @default 'minute'
   */
  granularity?: 'hour' | 'minute' | 'second' | 'millisecond',
  /** Whether to hide the time zone abbreviation. */
  hideTimeZone?: boolean,
  /** A placeholder time to display when no value is selected. Defaults to 12:00 or 00:00 depending on the hour cycle. */
  placeholderValue?: T,
  /** The minimum allowed time that a user may select. */
  minValue?: TimeValue,
  /** The maximum allowed time that a user may select. */
  maxValue?: TimeValue
}

export interface SpectrumTimePickerProps<T extends TimeValue> extends TimePickerProps<T>, SpectrumLabelableProps, DOMProps, StyleProps {
  /**
   * Whether the time field should be displayed with a quiet style.
   * @default false
   */
  isQuiet?: boolean
}
