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
  Calendar,
  CalendarDate,
  Duration,
  endOfMonth,
  GregorianCalendar,
  isSameDay,
  startOfMonth,
  startOfWeek,
  toCalendar,
  toCalendarDate,
  today
} from '@internationalized/date';
import {CalendarProps, DateValue} from '@react-types/calendar';
import {CalendarState} from './types';
import {useControlledState} from '@react-stately/utils';
import {useDateFormatter} from '@react-aria/i18n';
import {useEffect, useMemo, useRef, useState} from 'react';

interface CalendarStateOptions<T extends DateValue> extends CalendarProps<T> {
  locale: string,
  createCalendar: (name: string) => Calendar,
  visibleDuration?: Duration
}

export function useCalendarState<T extends DateValue>(props: CalendarStateOptions<T>): CalendarState {
  let defaultFormatter = useDateFormatter();
  let resolvedOptions = useMemo(() => defaultFormatter.resolvedOptions(), [defaultFormatter]);
  let {
    locale,
    createCalendar,
    timeZone = resolvedOptions.timeZone,
    visibleDuration = {months: 1},
    minValue,
    maxValue
  } = props;

  let calendar = useMemo(() => createCalendar(resolvedOptions.calendar), [createCalendar, resolvedOptions.calendar]);

  let [value, setControlledValue] = useControlledState<DateValue>(props.value, props.defaultValue, props.onChange);
  let calendarDateValue = useMemo(() => value ? toCalendar(toCalendarDate(value), calendar) : null, [value, calendar]);
  let defaultDate = useMemo(() => calendarDateValue || toCalendar(today(timeZone), calendar), [calendarDateValue, timeZone, calendar]);
  let [startDate, setStartDate] = useState(() => alignCenter(defaultDate, visibleDuration, locale));
  let [focusedDate, setFocusedDate] = useState(defaultDate);
  let [isFocused, setFocused] = useState(props.autoFocus || false);

  let endDate = useMemo(() => startDate.add(visibleDuration).subtract({days: 1}), [startDate, visibleDuration]);

  // Reset focused date and visible range when calendar changes.
  let lastCalendarIdentifier = useRef(calendar.identifier);
  useEffect(() => {
    if (calendar.identifier !== lastCalendarIdentifier.current) {
      let newFocusedDate = toCalendar(focusedDate, calendar);
      setStartDate(alignCenter(newFocusedDate, visibleDuration, locale));
      setFocusedDate(newFocusedDate);
      lastCalendarIdentifier.current = calendar.identifier;
    }
  }, [calendar, focusedDate, visibleDuration, locale]);

  // Sets focus to a specific cell date
  function focusCell(date: CalendarDate) {
    if (isInvalid(date, minValue, maxValue)) {
      return;
    }

    let next = startDate.add(visibleDuration);
    if (date.compare(startDate) < 0) {
      setStartDate(alignEnd(date, visibleDuration, locale));
    } else if (date.compare(next) >= 0) {
      setStartDate(alignStart(date, visibleDuration, locale));
    }

    setFocusedDate(date);
  }

  function setValue(newValue: CalendarDate) {
    if (!props.isDisabled && !props.isReadOnly) {
      // The display calendar should not have any effect on the emitted value.
      // Emit dates in the same calendar as the original value, if any, otherwise gregorian.
      newValue = toCalendar(newValue, value?.calendar || new GregorianCalendar());

      // Preserve time if the input value had one.
      if (value && 'hour' in value) {
        setControlledValue(value.set(newValue));
      } else {
        setControlledValue(newValue);
      }
    }
  }

  return {
    isDisabled: props.isDisabled,
    isReadOnly: props.isReadOnly,
    value: calendarDateValue,
    setValue,
    visibleRange: {
      start: startDate,
      end: endDate
    },
    focusedDate,
    timeZone,
    setFocusedDate,
    focusNextDay() {
      focusCell(focusedDate.add({days: 1}));
    },
    focusPreviousDay() {
      focusCell(focusedDate.subtract({days: 1}));
    },
    focusNextWeek() {
      focusCell(focusedDate.add({weeks: 1}));
    },
    focusPreviousWeek() {
      focusCell(focusedDate.subtract({weeks: 1}));
    },
    focusNextMonth() {
      focusCell(focusedDate.add({months: 1}));
    },
    focusPreviousMonth() {
      focusCell(focusedDate.subtract({months: 1}));
    },
    focusStartOfMonth() {
      focusCell(startOfMonth(focusedDate));
    },
    focusEndOfMonth() {
      focusCell(endOfMonth(focusedDate));
    },
    focusNextYear() {
      focusCell(focusedDate.add({years: 1}));
    },
    focusPreviousYear() {
      focusCell(focusedDate.subtract({years: 1}));
    },
    focusNextVisibleRange() {
      setStartDate(startDate.add(visibleDuration));
      setFocusedDate(focusedDate.add(visibleDuration));
    },
    focusPreviousVisibleRange() {
      setStartDate(startDate.subtract(visibleDuration));
      setFocusedDate(focusedDate.subtract(visibleDuration));
    },
    selectFocusedDate() {
      setValue(focusedDate);
    },
    selectDate(date) {
      setValue(date);
    },
    isFocused,
    setFocused,
    isInvalid(date) {
      return isInvalid(date, minValue, maxValue);
    },
    isSelected(date) {
      return calendarDateValue != null && isSameDay(date, calendarDateValue);
    },
    isCellFocused(date) {
      return isFocused && focusedDate && isSameDay(date, focusedDate);
    },
    isCellDisabled(date) {
      return props.isDisabled || date.compare(startDate) < 0 || date.compare(endDate) > 0 || isInvalid(date, minValue, maxValue);
    },
    isPreviousVisibleRangeInvalid() {
      return isInvalid(startDate.subtract({days: 1}), minValue, maxValue);
    },
    isNextVisibleRangeInvalid() {
      return isInvalid(endDate.add({days: 1}), minValue, maxValue);
    }
  };
}

function isInvalid(date: CalendarDate, minValue: DateValue, maxValue: DateValue) {
  return (minValue != null && date.compare(minValue) < 0) ||
    (maxValue != null && date.compare(maxValue) > 0);
}

function alignCenter(date: CalendarDate, duration: Duration, locale: string) {
  let halfDuration: Duration = {};
  for (let key in duration) {
    halfDuration[key] = Math.floor(duration[key] / 2);
    if (halfDuration[key] > 0 && halfDuration[key] % 2 === 0) {
      halfDuration[key]--;
    }
  }

  return alignStart(date, duration, locale).subtract(halfDuration);
}

function alignStart(date: CalendarDate, duration: Duration, locale: string) {
  // align to the start of the largest unit
  if (duration.years) {
    date = date.set({month: 1, day: 1});
  } else if (duration.months) {
    date = date.set({day: 1});
  } else if (duration.weeks) {
    date = startOfWeek(date, locale);
  }

  return date;
}

function alignEnd(date: CalendarDate, duration: Duration, locale: string) {
  let d = {...duration};
  // subtract 1 from the smallest unit
  if (duration.days) {
    d.days--;
  } else if (duration.weeks) {
    d.weeks--;
  } else if (duration.months) {
    d.months--;
  } else if (duration.years) {
    d.years--;
  }

  return alignStart(date, duration, locale).subtract(d);
}
