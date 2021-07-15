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

import {
  add,
  Calendar,
  CalendarDate,
  compare,
  endOfMonth,
  fromAbsolute,
  getDayOfWeek,
  isSameDay,
  isSameMonth,
  set,
  startOfMonth,
  subtract,
  toCalendar,
  toCalendarDate,
  toDate,
  today
} from '@internationalized/date';
import {CalendarProps} from '@react-types/calendar';
import {CalendarState} from './types';
import {useControlledState} from '@react-stately/utils';
import {useDateFormatter} from '@react-aria/i18n';
import {useEffect, useMemo, useRef, useState} from 'react';
import {useWeekStart} from './useWeekStart';

interface CalendarStateOptions extends CalendarProps {
  createCalendar: (name: string) => Calendar
}

export function useCalendarState(props: CalendarStateOptions): CalendarState {
  let defaultFormatter = useDateFormatter();
  let resolvedOptions = useMemo(() => defaultFormatter.resolvedOptions(), [defaultFormatter]);
  let {
    createCalendar,
    timeZone = resolvedOptions.timeZone
  } = props;

  let calendar = useMemo(() => createCalendar(resolvedOptions.calendar), [createCalendar, resolvedOptions.calendar]);

  let [value, setControlledValue] = useControlledState(props.value || undefined, props.defaultValue, props.onChange);
  let dateValue = useMemo(() => value ? new Date(value) : null, [value]);
  let calendarDateValue = useMemo(() => dateValue ? toCalendar(toCalendarDate(fromAbsolute(dateValue.getTime(), timeZone)), calendar) : null, [dateValue, timeZone, calendar]);
  let defaultMonth = calendarDateValue || toCalendar(today(timeZone), calendar);
  let [currentMonth, setCurrentMonth] = useState(defaultMonth); // TODO: does this need to be in state at all??
  let [focusedDate, setFocusedDate] = useState(defaultMonth);
  let [isFocused, setFocused] = useState(props.autoFocus || false);
  let weekStart = useWeekStart();
  let monthStartsAt = (getDayOfWeek(startOfMonth(currentMonth)) - weekStart) % 7;
  if (monthStartsAt < 0) {
    monthStartsAt += 7;
  }

  // Reset focused date and current month when calendar changes.
  let lastCalendarIdentifier = useRef(calendar.identifier);
  useEffect(() => {
    if (calendar.identifier !== lastCalendarIdentifier.current) {
      let newFocusedDate = toCalendar(focusedDate, calendar);
      setCurrentMonth(startOfMonth(newFocusedDate));
      setFocusedDate(newFocusedDate);
      lastCalendarIdentifier.current = calendar.identifier;
    }
  }, [calendar, focusedDate]);

  let days = currentMonth.calendar.getDaysInMonth(currentMonth);
  let weeksInMonth = Math.ceil((monthStartsAt + days) / 7);
  let minDate = useMemo(() => props.minValue ? toCalendar(toCalendarDate(fromAbsolute(new Date(props.minValue).getTime(), timeZone)), calendar) : null, [calendar, props.minValue, timeZone]);
  let maxDate = useMemo(() => props.maxValue ? toCalendar(toCalendarDate(fromAbsolute(new Date(props.maxValue).getTime(), timeZone)), calendar) : null, [calendar, props.maxValue, timeZone]);

  // Sets focus to a specific cell date
  function focusCell(date: CalendarDate) {
    if (isInvalid(date, minDate, maxDate)) {
      return;
    }

    if (!isSameMonth(date, currentMonth)) {
      setCurrentMonth(startOfMonth(date));
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
      .map(index => set(currentMonth, {day: index - monthStartsAt + 1}))
  ), [currentMonth, monthStartsAt]);

  return {
    isDisabled: props.isDisabled,
    isReadOnly: props.isReadOnly,
    value: calendarDateValue,
    setValue,
    currentMonth,
    focusedDate,
    timeZone,
    setFocusedDate,
    focusNextDay() {
      focusCell(add(focusedDate, {days: 1}));
    },
    focusPreviousDay() {
      focusCell(subtract(focusedDate, {days: 1}));
    },
    focusNextWeek() {
      focusCell(add(focusedDate, {weeks: 1}));
    },
    focusPreviousWeek() {
      focusCell(subtract(focusedDate, {weeks: 1}));
    },
    focusNextMonth() {
      focusCell(add(focusedDate, {months: 1}));
    },
    focusPreviousMonth() {
      focusCell(subtract(focusedDate, {months: 1}));
    },
    focusStartOfMonth() {
      focusCell(startOfMonth(focusedDate));
    },
    focusEndOfMonth() {
      focusCell(endOfMonth(focusedDate));
    },
    focusNextYear() {
      focusCell(add(focusedDate, {years: 1}));
    },
    focusPreviousYear() {
      focusCell(subtract(focusedDate, {years: 1}));
    },
    selectFocusedDate() {
      setValue(toDate(focusedDate, timeZone));
    },
    selectDate(date) {
      setValue(toDate(date, timeZone));
    },
    isFocused,
    setFocused,
    weeksInMonth,
    weekStart,
    daysInMonth: currentMonth.calendar.getDaysInMonth(currentMonth),
    weekDays,
    getCellDate(weekIndex, dayIndex) {
      let day = (weekIndex * 7 + dayIndex) - monthStartsAt + 1;
      return set(currentMonth, {day});
    },
    isInvalid(date) {
      return isInvalid(date, minDate, maxDate);
    },
    isSelected(date) {
      return calendarDateValue != null && isSameDay(date, calendarDateValue);
    },
    isCellFocused(date) {
      return isFocused && focusedDate && isSameDay(date, focusedDate);
    },
    isCellDisabled(date) {
      return props.isDisabled || !isSameMonth(date, currentMonth) || isInvalid(date, minDate, maxDate);
    },
    isPreviousMonthInvalid() {
      return isInvalid(endOfMonth(subtract(currentMonth, {months: 1})), minDate, maxDate);
    },
    isNextMonthInvalid() {
      return isInvalid(startOfMonth(add(currentMonth, {months: 1})), minDate, maxDate);
    }
  };
}

function isInvalid(date: CalendarDate, minDate: CalendarDate, maxDate: CalendarDate) {
  return (minDate != null && compare(date, minDate) < 0) ||
    (maxDate != null && compare(date, maxDate) > 0);
}
