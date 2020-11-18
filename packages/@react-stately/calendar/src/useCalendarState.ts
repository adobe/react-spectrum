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

import {addDays, addMonths, addWeeks, addYears, endOfDay, endOfMonth, getDaysInMonth, isSameDay, isSameMonth, setDay, startOfDay, startOfMonth, subDays, subMonths, subWeeks, subYears} from 'date-fns';
import {CalendarProps} from '@react-types/calendar';
import {CalendarState} from './types';
import {useControlledState} from '@react-stately/utils';
import {useMemo, useState} from 'react';
import {useWeekStart} from './useWeekStart';

export function useCalendarState(props: CalendarProps): CalendarState {
  let [value, setControlledValue] = useControlledState(props.value || undefined, props.defaultValue, props.onChange);
  let dateValue = value ? new Date(value) : null;
  let defaultMonth = dateValue || new Date();
  let [currentMonth, setCurrentMonth] = useState(defaultMonth); // TODO: does this need to be in state at all??
  let [focusedDate, setFocusedDate] = useState(defaultMonth);
  let [isFocused, setFocused] = useState(props.autoFocus || false);
  let month = currentMonth.getMonth();
  let year = currentMonth.getFullYear();
  let weekStart = useWeekStart();
  let monthStartsAt = (startOfMonth(currentMonth).getDay() - weekStart) % 7;
  if (monthStartsAt < 0) {
    monthStartsAt += 7;
  }

  let days = getDaysInMonth(currentMonth);
  let weeksInMonth = Math.ceil((monthStartsAt + days) / 7);
  let minDate = props.minValue ? startOfDay(props.minValue) : null;
  let maxDate = props.maxValue ? endOfDay(props.maxValue) : null;

  // Sets focus to a specific cell date
  function focusCell(date: Date) {
    if (isInvalid(date, minDate, maxDate)) {
      return;
    }

    if (!isSameMonth(date, currentMonth)) {
      setCurrentMonth(startOfMonth(date));
      setFocusedDate(date);
      return;
    }

    setFocusedDate(date);
  }

  function setValue(value: Date) {
    if (!props.isDisabled && !props.isReadOnly) {
      setControlledValue(value);
    }
  }

  let weekDays = useMemo(() => (
    [...new Array(7).keys()]
      .map(index => setDay(Date.now(), (index + weekStart) % 7))
  ), [weekStart]);

  return {
    isDisabled: props.isDisabled,
    isReadOnly: props.isReadOnly,
    value: dateValue,
    setValue,
    currentMonth,
    focusedDate,
    setFocusedDate,
    focusNextDay() {
      focusCell(addDays(focusedDate, 1));
    },
    focusPreviousDay() {
      focusCell(subDays(focusedDate, 1));
    },
    focusNextWeek() {
      focusCell(addWeeks(focusedDate, 1));
    },
    focusPreviousWeek() {
      focusCell(subWeeks(focusedDate, 1));
    },
    focusNextMonth() {
      focusCell(addMonths(focusedDate, 1));
    },
    focusPreviousMonth() {
      focusCell(subMonths(focusedDate, 1));
    },
    focusStartOfMonth() {
      focusCell(startOfMonth(focusedDate));
    },
    focusEndOfMonth() {
      focusCell(endOfMonth(startOfDay(focusedDate)));
    },
    focusNextYear() {
      focusCell(addYears(focusedDate, 1));
    },
    focusPreviousYear() {
      focusCell(subYears(focusedDate, 1));
    },
    selectFocusedDate() {
      setValue(focusedDate);
    },
    selectDate(date) {
      setValue(date);
    },
    isFocused,
    setFocused,
    weeksInMonth,
    weekStart,
    daysInMonth: getDaysInMonth(currentMonth),
    weekDays,
    getCellDate(weekIndex, dayIndex) {
      let day = (weekIndex * 7 + dayIndex) - monthStartsAt + 1;
      return new Date(year, month, day);
    },
    isInvalid(date) {
      return isInvalid(date, minDate, maxDate);
    },
    isSelected(date) {
      return isSameDay(date, value);
    },
    isCellFocused(date) {
      return isFocused && focusedDate && isSameDay(date, focusedDate);
    },
    isCellDisabled(date) {
      return props.isDisabled || !isSameMonth(date, currentMonth) || isInvalid(date, minDate, maxDate);
    },
    isPreviousMonthInvalid() {
      return isInvalid(endOfMonth(subMonths(currentMonth, 1)), minDate, maxDate);
    },
    isNextMonthInvalid() {
      return isInvalid(startOfMonth(addMonths(currentMonth, 1)), minDate, maxDate);
    }
  };
}

function isInvalid(date: Date, minDate: Date, maxDate: Date) {
  return (minDate != null && date < minDate) ||
    (maxDate != null && date > maxDate);
}
