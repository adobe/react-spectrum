/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {CalendarDate, CalendarDateTime, Time, ZonedDateTime} from '@internationalized/date';
import {FocusableProps, HelpTextProps, InputBase, LabelableProps, RangeValue, Validation, ValueBase} from '@react-types/shared';
import {OverlayTriggerProps} from '@react-stately/overlays';
import {PageBehavior} from '@react-stately/calendar';

export type DateValue = CalendarDate | CalendarDateTime | ZonedDateTime;
export type DateRange = RangeValue<DateValue>;
export type MappedDateValue<T> =
  T extends ZonedDateTime ? ZonedDateTime :
  T extends CalendarDateTime ? CalendarDateTime :
  T extends CalendarDate ? CalendarDate :
  never;

export type TimeValue = Time | CalendarDateTime | ZonedDateTime;
export type MappedTimeValue<T> =
  T extends ZonedDateTime ? ZonedDateTime :
  T extends CalendarDateTime ? CalendarDateTime :
  T extends Time ? Time :
  never;

export type Granularity = 'day' | 'hour' | 'minute' | 'second';
interface DateFieldBase<T extends DateValue> extends InputBase, Validation<MappedDateValue<T>>, FocusableProps, LabelableProps, HelpTextProps {
  /** The minimum allowed date that a user may select. */
  minValue?: DateValue | null,
  /** The maximum allowed date that a user may select. */
  maxValue?: DateValue | null,
  /** Callback that is called for each date of the calendar. If it returns true, then the date is unavailable. */
  isDateUnavailable?: (date: DateValue) => boolean,
  /** A placeholder date that influences the format of the placeholder shown when no value is selected. Defaults to today's date at midnight. */
  placeholderValue?: T | null,
  /** Whether to display the time in 12 or 24 hour format. By default, this is determined by the user's locale. */
  hourCycle?: 12 | 24,
  /** Determines the smallest unit that is displayed in the date picker. By default, this is `"day"` for dates, and `"minute"` for times. */
  granularity?: Granularity,
  /**
   * Whether to hide the time zone abbreviation.
   * @default false
   */
  hideTimeZone?: boolean,
  /**
   * Whether to always show leading zeros in the month, day, and hour fields.
   * By default, this is determined by the user's locale.
   */
  shouldForceLeadingZeros?: boolean
}

export interface DateFieldProps<T extends DateValue> extends DateFieldBase<T>, ValueBase<T | null, MappedDateValue<T> | null> {}

interface DatePickerBase<T extends DateValue> extends DateFieldBase<T>, OverlayTriggerProps {
  /**
   * Controls the behavior of paging. Pagination either works by advancing the visible page by visibleDuration (default) or one unit of visibleDuration.
   * @default visible
   */
  pageBehavior?: PageBehavior,
  /**
   * The day that starts the week.
   */
  firstDayOfWeek?: 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'
}

export interface DatePickerProps<T extends DateValue> extends DatePickerBase<T>, ValueBase<T | null, MappedDateValue<T> | null> {}

export interface DateRangePickerProps<T extends DateValue> extends Omit<DatePickerBase<T>, 'validate'>, Validation<RangeValue<MappedDateValue<T>>>, ValueBase<RangeValue<T> | null, RangeValue<MappedDateValue<T>> | null> {
  /**
   * When combined with `isDateUnavailable`, determines whether non-contiguous ranges,
   * i.e. ranges containing unavailable dates, may be selected.
   */
  allowsNonContiguousRanges?: boolean,
  /**
   * The name of the start date input element, used when submitting an HTML form. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname).
   */
  startName?: string,
  /**
   * The name of the end date input element, used when submitting an HTML form. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname).
   */
  endName?: string
}

export interface TimePickerProps<T extends TimeValue> extends InputBase, Validation<MappedTimeValue<T>>, FocusableProps, LabelableProps, HelpTextProps, ValueBase<T | null, MappedTimeValue<T> | null> {
  /** Whether to display the time in 12 or 24 hour format. By default, this is determined by the user's locale. */
  hourCycle?: 12 | 24,
  /**
   * Determines the smallest unit that is displayed in the time picker.
   * @default 'minute'
   */
  granularity?: 'hour' | 'minute' | 'second',
  /** Whether to hide the time zone abbreviation. */
  hideTimeZone?: boolean,
  /**
   * Whether to always show leading zeros in the hour field.
   * By default, this is determined by the user's locale.
   */
  shouldForceLeadingZeros?: boolean,
  /**
   * A placeholder time that influences the format of the placeholder shown when no value is selected.
   * Defaults to 12:00 AM or 00:00 depending on the hour cycle.
   */
  placeholderValue?: T,
  /** The minimum allowed time that a user may select. */
  minValue?: TimeValue | null,
  /** The maximum allowed time that a user may select. */
  maxValue?: TimeValue | null
}
