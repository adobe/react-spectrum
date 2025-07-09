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

import {DateFieldState, useDateFieldState} from '.';
import {DateValue, MappedTimeValue, TimePickerProps, TimeValue} from '@react-types/datepicker';
import {getLocalTimeZone, GregorianCalendar, Time, toCalendarDateTime, today, toTime, toZoned} from '@internationalized/date';
import {useCallback, useMemo} from 'react';
import {useControlledState} from '@react-stately/utils';

export interface TimeFieldStateOptions<T extends TimeValue = TimeValue> extends TimePickerProps<T> {
  /** The locale to display and edit the value according to. */
  locale: string
}

export interface TimeFieldState extends DateFieldState {
  /** The current time value. */
  timeValue: Time
}

/**
 * Provides state management for a time field component.
 * A time field allows users to enter and edit time values using a keyboard.
 * Each part of a time value is displayed in an individually editable segment.
 */
export function useTimeFieldState<T extends TimeValue = TimeValue>(props: TimeFieldStateOptions<T>): TimeFieldState {
  let {
    placeholderValue = new Time(),
    minValue,
    maxValue,
    defaultValue,
    granularity,
    validate
  } = props;

  let [value, setValue] = useControlledState<TimeValue | null, MappedTimeValue<T> | null>(
    props.value,
    defaultValue ?? null,
    props.onChange
  );

  let v = value || placeholderValue;
  let day = v && 'day' in v ? v : undefined;
  let defaultValueTimeZone = defaultValue && 'timeZone' in defaultValue ? defaultValue.timeZone : undefined;
  let placeholderDate = useMemo(() => {
    let valueTimeZone = v && 'timeZone' in v ? v.timeZone : undefined;

    return (valueTimeZone || defaultValueTimeZone) && placeholderValue ? toZoned(convertValue(placeholderValue)!, valueTimeZone || defaultValueTimeZone!) : convertValue(placeholderValue);
  }, [placeholderValue, v, defaultValueTimeZone]);
  let minDate = useMemo(() => convertValue(minValue, day), [minValue, day]);
  let maxDate = useMemo(() => convertValue(maxValue, day), [maxValue, day]);

  let timeValue = useMemo(() => value && 'day' in value ? toTime(value) : value as Time, [value]);
  let dateTime = useMemo(() => value == null ? null : convertValue(value), [value]);
  let defaultDateTime = useMemo(() => defaultValue == null ? null : convertValue(defaultValue), [defaultValue]);
  let onChange = newValue => {
    setValue(day || defaultValueTimeZone ? newValue : newValue && toTime(newValue));
  };

  let state = useDateFieldState({
    ...props,
    value: dateTime,
    defaultValue: defaultDateTime,
    minValue: minDate,
    maxValue: maxDate,
    onChange,
    granularity: granularity || 'minute',
    maxGranularity: 'hour',
    placeholderValue: placeholderDate ?? undefined,
    // Calendar should not matter for time fields.
    createCalendar: () => new GregorianCalendar(),
    validate: useCallback(() => validate?.(value as any), [validate, value])
  });

  return {
    ...state,
    timeValue
  };
}

function convertValue(value: TimeValue | null | undefined, date: DateValue = today(getLocalTimeZone())) {
  if (!value) {
    return null;
  }

  if ('day' in value) {
    return value;
  }

  return toCalendarDateTime(date, value);
}
