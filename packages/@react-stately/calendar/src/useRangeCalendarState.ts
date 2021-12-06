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

import {alignCenter} from './utils';
import {Calendar, CalendarDate, Duration, GregorianCalendar, toCalendar, toCalendarDate} from '@internationalized/date';
import {DateRange, DateValue} from '@react-types/calendar';
import {RangeCalendarProps} from '@react-types/calendar';
import {RangeCalendarState} from './types';
import {RangeValue} from '@react-types/shared';
import {useCalendarState} from './useCalendarState';
import {useControlledState} from '@react-stately/utils';
import {useState} from 'react';

interface RangeCalendarStateOptions<T extends DateValue> extends RangeCalendarProps<T> {
  locale: string,
  createCalendar: (name: string) => Calendar,
  visibleDuration?: Duration
}

export function useRangeCalendarState<T extends DateValue>(props: RangeCalendarStateOptions<T>): RangeCalendarState {
  let {value: valueProp, defaultValue, onChange, createCalendar, locale, visibleDuration = {months: 1}, minValue, maxValue, ...calendarProps} = props;
  let [value, setValue] = useControlledState<DateRange>(
    valueProp,
    defaultValue,
    onChange
  );

  let [anchorDate, setAnchorDate] = useState(null);
  let alignment: 'center' | 'start' = 'center';
  if (value && value.start && value.end) {
    let start = alignCenter(toCalendarDate(value.start), visibleDuration, locale, minValue, maxValue);
    let end = start.add(visibleDuration).subtract({days: 1});

    if (value.end.compare(end) > 0) {
      alignment = 'start';
    }
  }

  let calendar = useCalendarState({
    ...calendarProps,
    value: value && value.start,
    createCalendar,
    locale,
    visibleDuration,
    minValue,
    maxValue,
    selectionAlignment: alignment
  });

  let highlightedRange = anchorDate ? makeRange(anchorDate, calendar.focusedDate) : value && makeRange(value.start, value.end);
  let selectDate = (date: CalendarDate) => {
    if (props.isReadOnly) {
      return;
    }

    if (!anchorDate) {
      setAnchorDate(date);
    } else {
      let range = makeRange(anchorDate, date);
      setValue({
        start: convertValue(range.start, value?.start),
        end: convertValue(range.end, value?.end)
      });
      setAnchorDate(null);
    }
  };

  let [isDragging, setDragging] = useState(false);

  return {
    ...calendar,
    value,
    setValue,
    anchorDate,
    setAnchorDate,
    highlightedRange,
    selectFocusedDate() {
      selectDate(calendar.focusedDate);
    },
    selectDate,
    highlightDate(date) {
      if (anchorDate) {
        calendar.setFocusedDate(date);
      }
    },
    isSelected(date) {
      return highlightedRange && date.compare(highlightedRange.start) >= 0 && date.compare(highlightedRange.end) <= 0;
    },
    isDragging,
    setDragging
  };
}

function makeRange(start: DateValue, end: DateValue): RangeValue<CalendarDate> {
  if (!start || !end) {
    return null;
  }

  if (end.compare(start) < 0) {
    [start, end] = [end, start];
  }

  return {start: toCalendarDate(start), end: toCalendarDate(end)};
}

function convertValue(newValue: CalendarDate, oldValue: DateValue) {
  // The display calendar should not have any effect on the emitted value.
  // Emit dates in the same calendar as the original value, if any, otherwise gregorian.
  newValue = toCalendar(newValue, oldValue?.calendar || new GregorianCalendar());

  // Preserve time if the input value had one.
  if (oldValue && 'hour' in oldValue) {
    return oldValue.set(newValue);
  }

  return newValue;
}
