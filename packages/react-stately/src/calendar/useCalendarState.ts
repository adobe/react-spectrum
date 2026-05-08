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
  alignCenter,
  alignEnd,
  alignStart,
  constrainStart,
  constrainValue,
  isEqualDuration,
  isInvalid,
  previousAvailableDate
} from './utils';
import {
  Calendar,
  CalendarDate,
  CalendarIdentifier,
  DateDuration,
  DateFormatter,
  endOfMonth,
  endOfWeek,
  getDayOfWeek,
  getWeeksInMonth,
  GregorianCalendar,
  isEqualCalendar,
  isSameDay,
  startOfMonth,
  startOfWeek,
  toCalendar,
  toCalendarDate,
  today
} from '@internationalized/date';
import {
  CalendarPropsBase,
  CalendarSelectionMode,
  CalendarState,
  CalendarValueType,
  DateValue,
  MappedDateValue
} from './types';
import {useControlledState} from '../utils/useControlledState';
import {useMemo, useState} from 'react';
import {ValidationState, ValueBase} from '@react-types/shared';

export interface CalendarProps<T extends DateValue, M extends CalendarSelectionMode = 'single'>
  extends
    CalendarPropsBase,
    ValueBase<CalendarValueType<T | null, M>, CalendarValueType<MappedDateValue<T>, M>> {
  /**
   * Whether single or multiple selection is enabled.
   * @default "single"
   */
  selectionMode?: M;
  /** Callback that is called for each date of the calendar. If it returns true, then the date is unavailable. */
  isDateUnavailable?: (date: DateValue) => boolean;
}

export interface CalendarStateOptions<
  T extends DateValue = DateValue,
  M extends CalendarSelectionMode = 'single'
> extends CalendarProps<T, M> {
  /** The locale to display and edit the value according to. */
  locale: string;
  /**
   * A function that creates a [Calendar](../internationalized/date/Calendar.html)
   * object for a given calendar identifier. Such a function may be imported from the
   * `@internationalized/date` package, or manually implemented to include support for
   * only certain calendars.
   */
  createCalendar: (name: CalendarIdentifier) => Calendar;
  /**
   * The amount of days that will be displayed at once. This affects how pagination works.
   * @default {months: 1}
   */
  visibleDuration?: DateDuration;
  /**
   * Determines the alignment of the visible months on initial render based on the current selection or current date if there is no selection.
   * @default 'center'
   */
  selectionAlignment?: 'start' | 'center' | 'end';
}
/**
 * Provides state management for a calendar component.
 * A calendar displays one or more date grids and allows users to select a single date.
 */
export function useCalendarState<
  T extends DateValue = DateValue,
  M extends CalendarSelectionMode = 'single'
>(props: CalendarStateOptions<T, M>): CalendarState<M> {
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
    selectionMode = 'single' as M,
    firstDayOfWeek,
    weeksInMonth
  } = props;
  let calendar = useMemo(
    () => createCalendar(resolvedOptions.calendar as CalendarIdentifier),
    [createCalendar, resolvedOptions.calendar]
  );

  let [value, setControlledValue] = useControlledState<
    T | T[] | null,
    MappedDateValue<T> | MappedDateValue<T>[] | null
  >(props.value as any, (props.defaultValue as any) ?? null, props.onChange as any);
  let calendarDateValue = useMemo(() => {
    if (Array.isArray(value)) {
      return value.map(value => toCalendar(toCalendarDate(value), calendar));
    } else {
      return value ? toCalendar(toCalendarDate(value), calendar) : null;
    }
  }, [value, calendar]);
  let timeZone = useMemo(() => {
    let val = Array.isArray(value) ? value[0] : value;
    return val && 'timeZone' in val ? val.timeZone : resolvedOptions.timeZone;
  }, [value, resolvedOptions.timeZone]);
  let focusedCalendarDate = useMemo(
    () =>
      props.focusedValue
        ? constrainValue(
            toCalendar(toCalendarDate(props.focusedValue), calendar),
            minValue,
            maxValue
          )
        : undefined,
    [props.focusedValue, calendar, minValue, maxValue]
  );
  let defaultFocusedCalendarDate = useMemo(() => {
    if (props.defaultFocusedValue) {
      return constrainValue(
        toCalendar(toCalendarDate(props.defaultFocusedValue), calendar),
        minValue,
        maxValue
      );
    }

    if (calendarDateValue) {
      return constrainValue(
        Array.isArray(calendarDateValue) ? calendarDateValue[0] : calendarDateValue,
        minValue,
        maxValue
      );
    }

    return constrainValue(toCalendar(today(timeZone), calendar), minValue, maxValue);
  }, [props.defaultFocusedValue, calendarDateValue, timeZone, calendar, minValue, maxValue]);
  let [focusedDate, setFocusedDate] = useControlledState(
    focusedCalendarDate,
    defaultFocusedCalendarDate,
    props.onFocusChange
  );
  let getStartDate = () => {
    switch (selectionAlignment) {
      case 'start':
        return alignStart(focusedDate, visibleDuration, locale, minValue, maxValue);
      case 'end':
        return alignEnd(focusedDate, visibleDuration, locale, minValue, maxValue);
      case 'center':
      default:
        return alignCenter(focusedDate, visibleDuration, locale, minValue, maxValue);
    }
  };

  let [startDate, setStartDate] = useState(getStartDate);
  let [isFocused, setFocused] = useState(props.autoFocus || false);

  let [lastVisibleDuration, setLastVisibleDuration] = useState(visibleDuration);
  if (!isEqualDuration(visibleDuration, lastVisibleDuration)) {
    setLastVisibleDuration(visibleDuration);
    setStartDate(getStartDate());
  }

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

  function normalizeValue(newValue: CalendarDate) {
    let constrained = constrainValue(newValue, minValue, maxValue);
    let prev = previousAvailableDate(constrained, startDate, isDateUnavailable);
    if (!prev) {
      return null;
    }

    // The display calendar should not have any effect on the emitted value.
    // Emit dates in the same calendar as the original value, if any, otherwise gregorian.
    let baseValue = Array.isArray(value) ? value[0] : value;
    let calendarValue = toCalendar(prev, baseValue?.calendar || new GregorianCalendar());

    // Preserve time if the input value had one.
    if (baseValue && 'hour' in baseValue) {
      return baseValue.set(calendarValue) as T;
    }

    return calendarValue as T;
  }

  function setValue(newValue: CalendarDate | CalendarDate[] | null) {
    if (!props.isDisabled && !props.isReadOnly) {
      if (newValue === null) {
        setControlledValue(selectionMode === 'multiple' ? [] : null);
        return;
      }

      if (Array.isArray(newValue)) {
        setControlledValue(newValue.map(normalizeValue).filter(Boolean) as any);
      } else {
        let localValue = normalizeValue(newValue);
        if (localValue) {
          setControlledValue(localValue as any);
        }
      }
    }
  }

  let isUnavailable = useMemo(() => {
    if (!calendarDateValue) {
      return false;
    }

    if (Array.isArray(calendarDateValue)) {
      return calendarDateValue.some(
        date => isDateUnavailable?.(date) || isInvalid(date, minValue, maxValue)
      );
    }

    return (
      isDateUnavailable?.(calendarDateValue) || isInvalid(calendarDateValue, minValue, maxValue)
    );
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
    value: calendarDateValue as any,
    setValue: setValue as any,
    selectionMode,
    visibleDuration,
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
        this.selectDate(focusedDate);
      }
    },
    selectDate(date) {
      if (props.isDisabled || props.isReadOnly) {
        return;
      }

      if (selectionMode === 'multiple' && date != null) {
        let newDate = normalizeValue(date);
        if (!newDate) {
          return;
        }

        let baseValue: T[] = [];
        if (Array.isArray(value)) {
          baseValue = value;
        } else if (value != null) {
          baseValue = [value];
        }

        let index = baseValue.findIndex(value => isSameDay(value, newDate));
        let newValue =
          index >= 0
            ? baseValue.slice(0, index).concat(baseValue.slice(index + 1))
            : [...baseValue, newDate];
        setControlledValue(newValue);
      } else {
        setValue(date);
      }
    },
    isFocused,
    setFocused,
    isInvalid(date) {
      return isInvalid(date, minValue, maxValue);
    },
    isSelected(date) {
      if (!calendarDateValue || this.isCellDisabled(date) || this.isCellUnavailable(date)) {
        return false;
      }
      return Array.isArray(calendarDateValue)
        ? calendarDateValue.some(value => isSameDay(value, date))
        : isSameDay(date, calendarDateValue);
    },
    isCellFocused(date) {
      return isFocused && focusedDate && isSameDay(date, focusedDate);
    },
    isCellDisabled(date) {
      return (
        props.isDisabled ||
        date.compare(startDate) < 0 ||
        date.compare(endDate) > 0 ||
        this.isInvalid(date)
      );
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

      let days = visibleDuration.days && visibleDuration.days < 7 ? visibleDuration.days : 7;
      if (days === 7) {
        date = startOfWeek(date, locale, firstDayOfWeek);

        // startOfWeek will clamp dates within the calendar system's valid range, which may
        // start in the middle of a week. In this case, add null placeholders.
        let dayOfWeek = getDayOfWeek(date, locale, firstDayOfWeek);
        for (let i = 0; i < dayOfWeek; i++) {
          dates.push(null);
        }
      }

      while (dates.length < days) {
        dates.push(date);
        let nextDate = date.add({days: 1});
        if (isSameDay(date, nextDate)) {
          // If the next day is the same, we have hit the end of the calendar system.
          break;
        }
        date = nextDate;
      }

      // Add null placeholders if at the end of the calendar system.
      while (dates.length < days) {
        dates.push(null);
      }

      return dates;
    },
    getWeeksInMonth(date = startDate) {
      let weeks = weeksInMonth || getWeeksInMonth(date, locale, firstDayOfWeek);
      if (visibleDuration.weeks || visibleDuration.days) {
        weeks = visibleDuration.weeks ?? 0;
        if (visibleDuration.days) {
          weeks += Math.ceil(visibleDuration.days / 7);
        }
      }
      return weeks;
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
