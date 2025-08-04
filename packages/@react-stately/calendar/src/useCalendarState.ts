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

import {alignCenter, alignEnd, alignStart, constrainStart, constrainValue, isInvalid, previousAvailableDate} from './utils';
import {
  Calendar,
  CalendarDate,
  CalendarIdentifier,
  DateDuration,
  DateFormatter,
  endOfMonth,
  endOfWeek,
  getDayOfWeek,
  GregorianCalendar,
  isEqualCalendar,
  isSameDay,
  startOfMonth,
  startOfWeek,
  toCalendar,
  toCalendarDate,
  today
} from '@internationalized/date';
import {CalendarProps, DateValue, MappedDateValue} from '@react-types/calendar';
import {CalendarState} from './types';
import {useControlledState} from '@react-stately/utils';
import {useMemo, useState} from 'react';
import {ValidationState} from '@react-types/shared';

export interface CalendarStateOptions<T extends DateValue = DateValue> extends CalendarProps<T> {
  /** The locale to display and edit the value according to. */
  locale: string,
  /**
   * A function that creates a [Calendar](../internationalized/date/Calendar.html)
   * object for a given calendar identifier. Such a function may be imported from the
   * `@internationalized/date` package, or manually implemented to include support for
   * only certain calendars.
   */
  createCalendar: (name: CalendarIdentifier) => Calendar,
  /**
   * The amount of days that will be displayed at once. This affects how pagination works.
   * @default {months: 1}
   */
  visibleDuration?: DateDuration,
  /** Determines how to align the initial selection relative to the visible date range. */
  selectionAlignment?: 'start' | 'center' | 'end'
}
/**
 * Provides state management for a calendar component.
 * A calendar displays one or more date grids and allows users to select a single date.
 */
export function useCalendarState<T extends DateValue = DateValue>(props: CalendarStateOptions<T>): CalendarState {
  let defaultFormatter = useMemo(() => new DateFormatter(props.locale), [props.locale]);
  let resolvedOptions = useMemo(() => defaultFormatter.resolvedOptions(), [defaultFormatter]);
  let {
    locale,
    createCalendar,
    visibleDuration = {months: 1},
    minValue,
    maxValue,
    selectionAlignment,
    isDateUnavailable,
    pageBehavior = 'visible',
    firstDayOfWeek
  } = props;
  let calendar = useMemo(() => createCalendar(resolvedOptions.calendar as CalendarIdentifier), [createCalendar, resolvedOptions.calendar]);

  let [value, setControlledValue] = useControlledState<DateValue | null, MappedDateValue<T>>(props.value!, props.defaultValue ?? null!, props.onChange);
  let calendarDateValue = useMemo(() => value ? toCalendar(toCalendarDate(value), calendar) : null, [value, calendar]);
  let timeZone = useMemo(() => value && 'timeZone' in value ? value.timeZone : resolvedOptions.timeZone, [value, resolvedOptions.timeZone]);
  let focusedCalendarDate = useMemo(() => (
    props.focusedValue
      ? constrainValue(toCalendar(toCalendarDate(props.focusedValue), calendar), minValue, maxValue)
      : undefined
  ), [props.focusedValue, calendar, minValue, maxValue]);
  let defaultFocusedCalendarDate = useMemo(() => (
    constrainValue(
      props.defaultFocusedValue
        ? toCalendar(toCalendarDate(props.defaultFocusedValue), calendar)
        : calendarDateValue || toCalendar(today(timeZone), calendar),
      minValue,
      maxValue
    )
  ), [props.defaultFocusedValue, calendarDateValue, timeZone, calendar, minValue, maxValue]);
  let [focusedDate, setFocusedDate] = useControlledState(focusedCalendarDate, defaultFocusedCalendarDate, props.onFocusChange);
  let [startDate, setStartDate] = useState(() => {
    switch (selectionAlignment) {
      case 'start':
        return alignStart(focusedDate, visibleDuration, locale, minValue, maxValue);
      case 'end':
        return alignEnd(focusedDate, visibleDuration, locale, minValue, maxValue);
      case 'center':
      default:
        return alignCenter(focusedDate, visibleDuration, locale, minValue, maxValue);
    }
  });
  let [isFocused, setFocused] = useState(props.autoFocus || false);

  let endDate = useMemo(() => {
    let duration = {...visibleDuration};
    if (duration.days) {
      duration.days--;
    } else {
      duration.days = -1;
    }
    return startDate.add(duration);
  }, [startDate, visibleDuration]);

  // Reset focused date and visible range when calendar changes.
  let [lastCalendar, setLastCalendar] = useState(calendar);
  if (!isEqualCalendar(calendar, lastCalendar)) {
    let newFocusedDate = toCalendar(focusedDate, calendar);
    setStartDate(alignCenter(newFocusedDate, visibleDuration, locale, minValue, maxValue));
    setFocusedDate(newFocusedDate);
    setLastCalendar(calendar);
  }

  if (isInvalid(focusedDate, minValue, maxValue)) {
    // If the focused date was moved to an invalid value, it can't be focused, so constrain it.
    setFocusedDate(constrainValue(focusedDate, minValue, maxValue));
  } else if (focusedDate.compare(startDate) < 0) {
    setStartDate(alignEnd(focusedDate, visibleDuration, locale, minValue, maxValue));
  } else if (focusedDate.compare(endDate) > 0) {
    setStartDate(alignStart(focusedDate, visibleDuration, locale, minValue, maxValue));
  }

  // Sets focus to a specific cell date
  function focusCell(date: CalendarDate) {
    date = constrainValue(date, minValue, maxValue);
    setFocusedDate(date);
  }

  function setValue(newValue: CalendarDate | null) {
    if (!props.isDisabled && !props.isReadOnly) {
      let localValue = newValue;
      if (localValue === null) {
        setControlledValue(null);
        return;
      }
      localValue = constrainValue(localValue, minValue, maxValue);
      localValue = previousAvailableDate(localValue, startDate, isDateUnavailable);
      if (!localValue) {
        return;
      }

      // The display calendar should not have any effect on the emitted value.
      // Emit dates in the same calendar as the original value, if any, otherwise gregorian.
      localValue = toCalendar(localValue, value?.calendar || new GregorianCalendar());

      // Preserve time if the input value had one.
      if (value && 'hour' in value) {
        setControlledValue(value.set(localValue));
      } else {
        setControlledValue(localValue);
      }
    }
  }

  let isUnavailable = useMemo(() => {
    if (!calendarDateValue) {
      return false;
    }

    if (isDateUnavailable && isDateUnavailable(calendarDateValue)) {
      return true;
    }

    return isInvalid(calendarDateValue, minValue, maxValue);
  }, [calendarDateValue, isDateUnavailable, minValue, maxValue]);
  let isValueInvalid = props.isInvalid || props.validationState === 'invalid' || isUnavailable;
  let validationState: ValidationState | null = isValueInvalid ? 'invalid' : null;

  let pageDuration = useMemo(() => {
    if (pageBehavior === 'visible') {
      return visibleDuration;
    }

    return unitDuration(visibleDuration);
  }, [pageBehavior, visibleDuration]);

  return {
    isDisabled: props.isDisabled ?? false,
    isReadOnly: props.isReadOnly ?? false,
    value: calendarDateValue,
    setValue,
    visibleRange: {
      start: startDate,
      end: endDate
    },
    minValue,
    maxValue,
    focusedDate,
    timeZone,
    validationState,
    isValueInvalid,
    setFocusedDate(date) {
      focusCell(date);
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
      let start = startDate.add(pageDuration);
      setFocusedDate(constrainValue(focusedDate.add(pageDuration), minValue, maxValue));
      setStartDate(
        alignStart(
          constrainStart(focusedDate, start, pageDuration, locale, minValue, maxValue),
          pageDuration,
          locale
        )
      );
    },
    focusPreviousPage() {
      let start = startDate.subtract(pageDuration);
      setFocusedDate(constrainValue(focusedDate.subtract(pageDuration), minValue, maxValue));
      setStartDate(
        alignStart(
          constrainStart(focusedDate, start, pageDuration, locale, minValue, maxValue),
          pageDuration,
          locale
        )
      );
    },
    focusSectionStart() {
      if (visibleDuration.days) {
        focusCell(startDate);
      } else if (visibleDuration.weeks) {
        focusCell(startOfWeek(focusedDate, locale));
      } else if (visibleDuration.months || visibleDuration.years) {
        focusCell(startOfMonth(focusedDate));
      }
    },
    focusSectionEnd() {
      if (visibleDuration.days) {
        focusCell(endDate);
      } else if (visibleDuration.weeks) {
        focusCell(endOfWeek(focusedDate, locale));
      } else if (visibleDuration.months || visibleDuration.years) {
        focusCell(endOfMonth(focusedDate));
      }
    },
    focusNextSection(larger) {
      if (!larger && !visibleDuration.days) {
        focusCell(focusedDate.add(unitDuration(visibleDuration)));
        return;
      }

      if (visibleDuration.days) {
        this.focusNextPage();
      } else if (visibleDuration.weeks) {
        focusCell(focusedDate.add({months: 1}));
      } else if (visibleDuration.months || visibleDuration.years) {
        focusCell(focusedDate.add({years: 1}));
      }
    },
    focusPreviousSection(larger) {
      if (!larger && !visibleDuration.days) {
        focusCell(focusedDate.subtract(unitDuration(visibleDuration)));
        return;
      }

      if (visibleDuration.days) {
        this.focusPreviousPage();
      } else if (visibleDuration.weeks) {
        focusCell(focusedDate.subtract({months: 1}));
      } else if (visibleDuration.months || visibleDuration.years) {
        focusCell(focusedDate.subtract({years: 1}));
      }
    },
    selectFocusedDate() {
      if (!(isDateUnavailable && isDateUnavailable(focusedDate))) {
        setValue(focusedDate);
      }
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
      return calendarDateValue != null && isSameDay(date, calendarDateValue) && !this.isCellDisabled(date) && !this.isCellUnavailable(date);
    },
    isCellFocused(date) {
      return isFocused && focusedDate && isSameDay(date, focusedDate);
    },
    isCellDisabled(date) {
      return props.isDisabled || date.compare(startDate) < 0 || date.compare(endDate) > 0 || this.isInvalid(date);
    },
    isCellUnavailable(date) {
      return props.isDateUnavailable ? props.isDateUnavailable(date) : false;
    },
    isPreviousVisibleRangeInvalid() {
      let prev = startDate.subtract({days: 1});
      return isSameDay(prev, startDate) || this.isInvalid(prev);
    },
    isNextVisibleRangeInvalid() {
      // Adding may return the same date if we reached the end of time
      // according to the calendar system (e.g. 9999-12-31).
      let next = endDate.add({days: 1});
      return isSameDay(next, endDate) || this.isInvalid(next);
    },
    getDatesInWeek(weekIndex, from = startDate) {
      let date = from.add({weeks: weekIndex});
      let dates: (CalendarDate | null)[] = [];

      date = startOfWeek(date, locale, firstDayOfWeek);
      
      // startOfWeek will clamp dates within the calendar system's valid range, which may
      // start in the middle of a week. In this case, add null placeholders.
      let dayOfWeek = getDayOfWeek(date, locale, firstDayOfWeek);
      for (let i = 0; i < dayOfWeek; i++) {
        dates.push(null);
      }

      while (dates.length < 7) {
        dates.push(date);
        let nextDate = date.add({days: 1});
        if (isSameDay(date, nextDate)) {
          // If the next day is the same, we have hit the end of the calendar system.
          break;
        }
        date = nextDate;
      }

      // Add null placeholders if at the end of the calendar system.
      while (dates.length < 7) {
        dates.push(null);
      }

      return dates;
    }
  };
}

function unitDuration(duration: DateDuration) {
  let unit = {...duration};
  for (let key in duration) {
    unit[key] = 1;
  }
  return unit;
}
