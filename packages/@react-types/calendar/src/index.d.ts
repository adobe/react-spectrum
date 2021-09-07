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

import {CalendarDate, CalendarDateTime, ZonedDateTime} from '@internationalized/date';
import {DOMProps, RangeValue, StyleProps, ValueBase} from '@react-types/shared';

export type DateValue = CalendarDate | CalendarDateTime | ZonedDateTime;
type MappedDateValue<T> =
  T extends ZonedDateTime ? ZonedDateTime :
  T extends CalendarDateTime ? CalendarDateTime :
  T extends CalendarDate ? CalendarDate :
  never;

export interface CalendarPropsBase {
  timeZone?: string,
  minValue?: DateValue,
  maxValue?: DateValue,
  isDisabled?: boolean,
  isReadOnly?: boolean,
  autoFocus?: boolean
}

export type DateRange = RangeValue<DateValue>;
export interface CalendarProps<T extends DateValue> extends CalendarPropsBase, ValueBase<T, MappedDateValue<T>> {}
export interface RangeCalendarProps<T extends DateValue> extends CalendarPropsBase, ValueBase<RangeValue<T>, RangeValue<MappedDateValue<T>>> {}

export interface SpectrumCalendarProps<T extends DateValue> extends CalendarProps<T>, DOMProps, StyleProps {
  visibleMonths?: number
}

export interface SpectrumRangeCalendarProps<T extends DateValue> extends RangeCalendarProps<T>, DOMProps, StyleProps {
  visibleMonths?: number
}
