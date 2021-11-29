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

import {Calendar, now, Time, toCalendar, toCalendarDate, toCalendarDateTime} from '@internationalized/date';
import {DatePickerProps, DateValue, Granularity, TimeValue} from '@react-types/datepicker';
import {useRef} from 'react';

export function isInvalid(value: DateValue, minValue: DateValue, maxValue: DateValue) {
  return value != null && (
    (minValue != null && value.compare(minValue) < 0) ||
    (maxValue != null && value.compare(maxValue) > 0)
  );
}

export type FieldOptions = Pick<Intl.DateTimeFormatOptions, 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'>;
interface FormatterOptions {
  timeZone?: string,
  hideTimeZone?: boolean,
  granularity?: DatePickerProps<any>['granularity'],
  maxGranularity?: 'year' | 'month' | DatePickerProps<any>['granularity'],
  hourCycle?: 12 | 24
}

const DEFAULT_FIELD_OPTIONS: FieldOptions = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit'
};

export function getFormatOptions(
  fieldOptions: FieldOptions,
  options: FormatterOptions
): Intl.DateTimeFormatOptions {
  fieldOptions = {...DEFAULT_FIELD_OPTIONS, ...fieldOptions};
  let granularity = options.granularity || 'minute';
  let keys = Object.keys(fieldOptions);
  let startIdx = keys.indexOf(options.maxGranularity ?? 'year');
  if (startIdx < 0) {
    startIdx = 0;
  }

  let endIdx = keys.indexOf(granularity);
  if (endIdx < 0) {
    endIdx = 2;
  }

  if (startIdx > endIdx) {
    throw new Error('maxGranularity must be greater than granularity');
  }

  let opts: Intl.DateTimeFormatOptions = keys.slice(startIdx, endIdx + 1).reduce((opts, key) => {
    opts[key] = fieldOptions[key];
    return opts;
  }, {});

  if (options.hourCycle != null) {
    opts.hour12 = options.hourCycle === 12;
  }

  opts.timeZone = options.timeZone || 'UTC';

  let hasTime = granularity === 'hour' || granularity === 'minute' || granularity === 'second';
  if (hasTime && options.timeZone && !options.hideTimeZone) {
    opts.timeZoneName = 'short';
  }

  return opts;
}

export function getPlaceholderTime(placeholderValue: DateValue): TimeValue {
  if (placeholderValue && 'hour' in placeholderValue) {
    return placeholderValue;
  }

  return new Time();
}

export function convertValue(value: DateValue, calendar: Calendar): DateValue {
  if (value === null) {
    return null;
  }

  if (!value) {
    return undefined;
  }

  return toCalendar(value, calendar);
}


export function createPlaceholderDate(placeholderValue: DateValue, granularity: string, calendar: Calendar, timeZone: string) {
  if (placeholderValue) {
    return convertValue(placeholderValue, calendar);
  }

  let date = toCalendar(now(timeZone).set({
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
  }), calendar);

  if (granularity === 'year' || granularity === 'month' || granularity === 'day') {
    return toCalendarDate(date);
  }

  if (!timeZone) {
    return toCalendarDateTime(date);
  }

  return date;
}

export function useDefaultProps(v: DateValue, granularity: Granularity): [Granularity, string] {
  // Compute default granularity and time zone from the value. If the value becomes null, keep the last values.
  let lastValue = useRef(v);
  if (v) {
    lastValue.current = v;
  }

  v = lastValue.current;
  let defaultTimeZone = (v && 'timeZone' in v ? v.timeZone : undefined);
  granularity = granularity || (v && 'minute' in v ? 'minute' : 'day');

  // props.granularity must actually exist in the value if one is provided.
  if (v && !(granularity in v)) {
    throw new Error('Invalid granularity ' + granularity + ' for value ' + v.toString());
  }

  return [granularity, defaultTimeZone];
}
