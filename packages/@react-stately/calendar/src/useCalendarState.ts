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

import {alignCenter, alignEnd, alignStart, constrainStart, constrainValue, isInvalid} from './utils';
import {
  Calendar,
  CalendarDate,
  Duration,
  GregorianCalendar,
  isSameDay,
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
  visibleDuration?: Duration,
  selectionAlignment?: 'start' | 'center' | 'end'
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
    maxValue,
    selectionAlignment
  } = props;

  let calendar = useMemo(() => createCalendar(resolvedOptions.calendar), [createCalendar, resolvedOptions.calendar]);

  let [value, setControlledValue] = useControlledState<DateValue>(props.value, props.defaultValue, props.onChange);
  let calendarDateValue = useMemo(() => value ? toCalendar(toCalendarDate(value), calendar) : null, [value, calendar]);
  let defaultDate = useMemo(() => calendarDateValue || constrainValue(toCalendar(today(timeZone), calendar), minValue, maxValue), [calendarDateValue, timeZone, calendar, minValue, maxValue]);
  let [startDate, setStartDate] = useState(() => {
    switch (selectionAlignment) {
      case 'start':
        return alignStart(defaultDate, visibleDuration, locale, minValue, maxValue);
      case 'end':
        return alignEnd(defaultDate, visibleDuration, locale, minValue, maxValue);
      case 'center':
      default:
        return alignCenter(defaultDate, visibleDuration, locale, minValue, maxValue);
    }
  });
  let [focusedDate, setFocusedDate] = useState(defaultDate);
  let [isFocused, setFocused] = useState(props.autoFocus || false);

  let endDate = useMemo(() => startDate.add(visibleDuration).subtract({days: 1}), [startDate, visibleDuration]);

  // Reset focused date and visible range when calendar changes.
  let lastCalendarIdentifier = useRef(calendar.identifier);
  useEffect(() => {
    if (calendar.identifier !== lastCalendarIdentifier.current) {
      let newFocusedDate = toCalendar(focusedDate, calendar);
      setStartDate(alignCenter(newFocusedDate, visibleDuration, locale, minValue, maxValue));
      setFocusedDate(newFocusedDate);
      lastCalendarIdentifier.current = calendar.identifier;
    }
  }, [calendar, focusedDate, visibleDuration, locale, minValue, maxValue]);

  // Sets focus to a specific cell date
  function focusCell(date: CalendarDate) {
    // date = constrain(focusedDate, date, visibleDuration, locale, minValue, maxValue);
    date = constrainValue(date, minValue, maxValue);

    let next = startDate.add(visibleDuration);
    if (date.compare(startDate) < 0) {
      setStartDate(alignEnd(date, visibleDuration, locale, minValue, maxValue));
    } else if (date.compare(next) >= 0) {
      setStartDate(alignStart(date, visibleDuration, locale, minValue, maxValue));
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
    setFocusedDate(date) {
      setFocusedDate(date);
      setFocused(true);
    },
    focusNextDay() {
      focusCell(focusedDate.add({days: 1}));
    },
    focusPreviousDay() {
      focusCell(focusedDate.subtract({days: 1}));
    },
    focusNextRow() {
      if (visibleDuration.days) {
        this.focusNextPage();
      } else if (visibleDuration.weeks || visibleDuration.months || visibleDuration.years) {
        focusCell(focusedDate.add({weeks: 1}));
      }
    },
    focusPreviousRow() {
      if (visibleDuration.days) {
        this.focusPreviousPage();
      } else if (visibleDuration.weeks || visibleDuration.months || visibleDuration.years) {
        focusCell(focusedDate.subtract({weeks: 1}));
      }
    },
    focusNextPage() {
      let start = startDate.add(visibleDuration);
      setStartDate(constrainStart(focusedDate, start, visibleDuration, locale, minValue, maxValue));
      setFocusedDate(constrainValue(focusedDate.add(visibleDuration), minValue, maxValue));
    },
    focusPreviousPage() {
      let start = startDate.subtract(visibleDuration);
      setStartDate(constrainStart(focusedDate, start, visibleDuration, locale, minValue, maxValue));
      setFocusedDate(constrainValue(focusedDate.subtract(visibleDuration), minValue, maxValue));
    },
    focusPageStart() {
      focusCell(startDate);
    },
    focusPageEnd() {
      focusCell(endDate);
    },
    focusNextSection() {
      if (visibleDuration.days) {
        this.focusNextPage();
      } else if (visibleDuration.weeks) {
        focusCell(focusedDate.add({months: 1}));
      } else if (visibleDuration.months || visibleDuration.years) {
        focusCell(focusedDate.add({years: 1}));
      }
    },
    focusPreviousSection() {
      if (visibleDuration.days) {
        this.focusPreviousPage();
      } else if (visibleDuration.weeks) {
        focusCell(focusedDate.subtract({months: 1}));
      } else if (visibleDuration.months || visibleDuration.years) {
        focusCell(focusedDate.subtract({years: 1}));
      }
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
