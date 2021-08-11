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

import {Calendar, CalendarDate, compareDate, fromAbsolute, toCalendarDate, toDate} from '@internationalized/date';
import {DateValue} from '@react-types/calendar';
import {RangeCalendarProps} from '@react-types/calendar';
import {RangeCalendarState} from './types';
import {RangeValue} from '@react-types/shared';
import {useCalendarState} from './useCalendarState';
import {useControlledState} from '@react-stately/utils';
import {useState} from 'react';

interface RangeCalendarStateOptions extends RangeCalendarProps {
  createCalendar: (name: string) => Calendar
}

export function useRangeCalendarState(props: RangeCalendarStateOptions): RangeCalendarState {
  let {value: valueProp, defaultValue, onChange, createCalendar, ...calendarProps} = props;
  let [value, setValue] = useControlledState(
    valueProp,
    defaultValue,
    onChange
  );

  let [anchorDate, setAnchorDate] = useState(null);
  let calendar = useCalendarState({
    ...calendarProps,
    value: value && value.start,
    createCalendar
  });

  let dateRange = value != null ? convertRange(value, calendar.timeZone) : null;
  let highlightedRange = anchorDate ? makeRange(anchorDate, calendar.focusedDate) : value && makeRange(dateRange.start, dateRange.end);
  let selectDate = (date: CalendarDate) => {
    if (props.isReadOnly) {
      return;
    }

    if (!anchorDate) {
      setAnchorDate(date);
    } else {
      let range = makeRange(anchorDate, date);
      setValue({
        start: toDate(range.start, calendar.timeZone),
        end: toDate(range.end, calendar.timeZone)
      });
      setAnchorDate(null);
    }
  };

  return {
    ...calendar,
    value: dateRange,
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
      return highlightedRange && compareDate(date, highlightedRange.start) >= 0 && compareDate(date, highlightedRange.end) <= 0;
    }
  };
}

function makeRange(start: CalendarDate, end: CalendarDate): RangeValue<CalendarDate> {
  if (!start || !end) {
    return null;
  }

  if (compareDate(end, start) < 0) {
    [start, end] = [end, start];
  }

  return {start, end};
}

function convertRange(range: RangeValue<DateValue>, timeZone: string): RangeValue<CalendarDate> {
  return {
    start: range.start ? toCalendarDate(fromAbsolute(new Date(range.start).getTime(), timeZone)) : null,
    end: range.end ? toCalendarDate(fromAbsolute(new Date(range.end).getTime(), timeZone)) : null
  };
}
