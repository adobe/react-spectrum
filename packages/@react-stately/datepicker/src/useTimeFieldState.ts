/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Calendar, getLocalTimeZone, Time, toCalendarDateTime, today, toTime} from '@internationalized/date';
import {DateValue, TimePickerProps, TimeValue} from '@react-types/datepicker';
import {useControlledState} from '@react-stately/utils';
import {useDatePickerFieldState} from '.';
import {useMemo} from 'react';

interface TimeFieldProps<T extends TimeValue> extends TimePickerProps<T> {
  locale: string,
  createCalendar: (name: string) => Calendar
}

export function useTimeFieldState<T extends TimeValue>(props: TimeFieldProps<T>) {
  let {
    placeholderValue = new Time(),
    minValue,
    maxValue,
    granularity
  } = props;

  let [value, setValue] = useControlledState<TimeValue>(
    props.value,
    props.defaultValue,
    props.onChange
  );

  let v = value || placeholderValue;
  let day = v && 'day' in v ? v : undefined;
  let placeholderDate = useMemo(() => convertValue(placeholderValue), [placeholderValue]);
  let minDate = useMemo(() => convertValue(minValue, day), [minValue, day]);
  let maxDate = useMemo(() => convertValue(maxValue, day), [maxValue, day]);

  let dateTime = useMemo(() => value == null ? null : convertValue(value), [value]);
  let onChange = newValue => {
    setValue(v && 'day' in v ? newValue : newValue && toTime(newValue));
  };

  return useDatePickerFieldState({
    ...props,
    value: dateTime,
    defaultValue: undefined,
    minValue: minDate,
    maxValue: maxDate,
    onChange,
    granularity: granularity || 'minute',
    maxGranularity: 'hour',
    placeholderValue: placeholderDate
  });
}

function convertValue(value: TimeValue, date: DateValue = today(getLocalTimeZone())) {
  if (!value) {
    return null;
  }

  if ('day' in value) {
    return value;
  }

  return toCalendarDateTime(date, value);
}
