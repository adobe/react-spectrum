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
import {DateValue} from '@react-types/datepicker';
import {endOfDay, getDaysInMonth, isSameDay, startOfDay} from 'date-fns';
import {RangeCalendarProps} from '@react-types/calendar';
import {RangeCalendarState} from './types';
import {RangeValue} from '@react-types/shared';
import {useCalendarState} from './useCalendarState';
import {useControlledState} from '@react-stately/utils';
import {useState} from 'react';

export function useRangeCalendarState(props: RangeCalendarProps): RangeCalendarState {
  let {value: valueProp, defaultValue, onChange, ...calendarProps} = props;
  let [value, setValue] = useControlledState(
    valueProp,
    defaultValue,
    onChange
  );

  let dateRange = value != null ? convertRange(value) : null;
  let [anchorDate, setAnchorDate] = useState(null);
  let calendar = useCalendarState({
    ...calendarProps,
    value: value && value.start
  });

  let highlightedRange = anchorDate ? makeRange(anchorDate, calendar.focusedDate) : value && makeRange(dateRange.start, dateRange.end);
  let selectDate = (date: Date) => {
    if (props.isReadOnly) {
      return;
    }

    if (!anchorDate) {
      setAnchorDate(date);
    } else {
      setValue(makeRange(anchorDate, date));
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
    getCellOptions(weekIndex, dayIndex) {
      let opts = calendar.getCellOptions(weekIndex, dayIndex);
      let isSelected = highlightedRange && opts.cellDate >= highlightedRange.start && opts.cellDate <= highlightedRange.end;
      return {
        ...opts,
        isRangeSelection: isSelected,
        isSelected,
        isRangeStart: isSelected && (dayIndex === 0 || opts.cellDate.getDate() === 1),
        isRangeEnd: isSelected && (dayIndex === 6 || opts.cellDate.getDate() === getDaysInMonth(calendar.currentMonth)),
        isSelectionStart: highlightedRange && isSameDay(opts.cellDate, highlightedRange.start),
        isSelectionEnd: highlightedRange && isSameDay(opts.cellDate, highlightedRange.end)
      };
    }
  };
}

function makeRange(start: Date, end: Date): RangeValue<Date> {
  if (end < start) {
    [start, end] = [end, start];
  }

  return {start: startOfDay(start), end: endOfDay(end)};
}

function convertRange(range: RangeValue<DateValue>): RangeValue<Date> {
  return {
    start: new Date(range.start),
    end: new Date(range.end)
  };
}
