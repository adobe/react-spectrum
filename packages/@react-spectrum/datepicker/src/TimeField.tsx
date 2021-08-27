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

import {DatePickerField} from './DatePickerField';
import {DateValue, SpectrumTimePickerProps, TimeValue} from '@react-types/datepicker';
import {FocusScope} from '@react-aria/focus';
import {getLocalTimeZone, Time, toCalendarDateTime, today, toTime} from '@internationalized/date';
import React, {useMemo} from 'react';
import {useControlledState} from '@react-stately/utils';
import {useProviderProps} from '@react-spectrum/provider';

export function TimeField<T extends TimeValue>(props: SpectrumTimePickerProps<T>) {
  props = useProviderProps(props);
  let {
    autoFocus,
    placeholderValue = new Time(12),
    minValue,
    maxValue
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
    setValue(v && 'day' in v ? newValue : toTime(newValue));
  };

  return (
    <FocusScope autoFocus={autoFocus}>
      <DatePickerField
        {...props}
        data-testid="date-field"
        value={dateTime}
        defaultValue={undefined}
        minValue={minDate}
        maxValue={maxDate}
        onChange={onChange}
        maxGranularity="hour"
        placeholderValue={placeholderDate} />
    </FocusScope>
  );
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
