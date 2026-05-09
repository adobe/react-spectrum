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

import {alignCenter, constrainValue, isInvalid, previousAvailableDate} from './utils';
import {
  Calendar,
  CalendarDate,
  CalendarIdentifier,
  DateDuration,
  GregorianCalendar,
  maxDate,
  minDate,
  toCalendar,
  toCalendarDate
} from '@internationalized/date';
import {CalendarPropsBase, DateValue, MappedDateValue, RangeCalendarState} from './types';
import {RangeValue, ValidationState, ValueBase} from '@react-types/shared';
import {useCalendarState} from './useCalendarState';
import {useCallback, useMemo, useState} from 'react';
import {useControlledState} from '../utils/useControlledState';

export type DateRange = RangeValue<DateValue> | null;
export interface RangeCalendarProps<T extends DateValue>
  extends CalendarPropsBase, ValueBase<RangeValue<T> | null, RangeValue<MappedDateValue<T>>> {
  /**
   * When combined with `isDateUnavailable`, determines whether non-contiguous ranges,
   * i.e. ranges containing unavailable dates, may be selected.
   */
  allowsNonContiguousRanges?: boolean;
  /**
   * Callback that is called for each date of the calendar. If it returns true, then the date is unavailable.
   * The second argument provides the current selection anchor date, if any. This can be used to adjust the available
   * dates based on the user's first selected date.
   */
  isDateUnavailable?: (date: DateValue, anchorDate: CalendarDate | null) => boolean;
}

export interface RangeCalendarStateOptions<
  T extends DateValue = DateValue
> extends RangeCalendarProps<T> {
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
 * Provides state management for a range calendar component.
 * A range calendar displays one or more date grids and allows users to select a contiguous range of dates.
 */
export function useRangeCalendarState<T extends DateValue = DateValue>(
  props: RangeCalendarStateOptions<T>
): RangeCalendarState<T> {
  let {
    value: valueProp,
    defaultValue,
    onChange,
    createCalendar,
    locale,
    visibleDuration = {months: 1},
    minValue,
    maxValue,
    ...calendarProps
  } = props;
  let [value, setValue] = useControlledState<RangeValue<T> | null, RangeValue<MappedDateValue<T>>>(
    valueProp!,
    defaultValue || null!,
    onChange
  );

  let [anchorDate, setAnchorDate] = useState<CalendarDate | null>(null);
  let alignment: 'center' | 'start' = 'center';
  if (value && value.start && value.end) {
    let start = alignCenter(
      toCalendarDate(value.start),
      visibleDuration,
      locale,
      minValue,
      maxValue
    );
    let end = start.add(visibleDuration).subtract({days: 1});

    if (value.end.compare(end) > 0) {
      alignment = 'start';
    }
  }

  let isDateUnavailable = useMemo(() => {
    let isDateUnavailable = props.isDateUnavailable;
    if (!isDateUnavailable) {
      return undefined;
    }

    return (date: DateValue) => isDateUnavailable(date, anchorDate);
  }, [props.isDateUnavailable, anchorDate]);

  let getAvailableRange = useCallback(
    (anchorDate: CalendarDate | null) => {
      if (anchorDate && isDateUnavailable && !props.allowsNonContiguousRanges) {
        const nextAvailableStartDate = nextUnavailableDate(
          anchorDate,
          isDateUnavailable,
          visibleDuration,
          -1
        );
        const nextAvailableEndDate = nextUnavailableDate(
          anchorDate,
          isDateUnavailable,
          visibleDuration,
          1
        );
        return {
          start: nextAvailableStartDate,
          end: nextAvailableEndDate
        };
      } else {
        return null;
      }
    },
    [isDateUnavailable, visibleDuration, props.allowsNonContiguousRanges]
  );

  let availableRange = useMemo(
    () => getAvailableRange(anchorDate),
    [getAvailableRange, anchorDate]
  );
  let min = useMemo(() => maxDate(minValue, availableRange?.start), [minValue, availableRange]);
  let max = useMemo(() => minDate(maxValue, availableRange?.end), [maxValue, availableRange]);

  let calendar = useCalendarState({
    ...calendarProps,
    value: value && value.start,
    createCalendar,
    locale,
    visibleDuration,
    minValue: min,
    maxValue: max,
    selectionAlignment: props.selectionAlignment || alignment,
    isDateUnavailable
  });

  let highlightedRange = anchorDate
    ? makeRange(anchorDate, calendar.focusedDate)
    : value && makeRange(value.start, value.end);
  let selectDate = (date: CalendarDate) => {
    if (props.isReadOnly) {
      return;
    }

    const constrainedDate = constrainValue(date, min, max);
    const previousAvailableConstrainedDate = previousAvailableDate(
      constrainedDate,
      calendar.visibleRange.start,
      isDateUnavailable
    );
    if (!previousAvailableConstrainedDate) {
      return;
    }

    if (!anchorDate) {
      setAnchorDate(previousAvailableConstrainedDate);
    } else {
      let range = makeRange(anchorDate, previousAvailableConstrainedDate);
      if (range) {
        setValue({
          start: convertValue(range.start, value?.start) as T,
          end: convertValue(range.end, value?.end) as T
        });
      }
      setAnchorDate(null);
    }
  };

  let [isDragging, setDragging] = useState(false);

  let isInvalidSelection = useMemo(() => {
    if (!value || anchorDate) {
      return false;
    }

    if (isDateUnavailable && (isDateUnavailable(value.start) || isDateUnavailable(value.end))) {
      return true;
    }

    return isInvalid(value.start, minValue, maxValue) || isInvalid(value.end, minValue, maxValue);
  }, [isDateUnavailable, value, anchorDate, minValue, maxValue]);

  let isValueInvalid = props.isInvalid || props.validationState === 'invalid' || isInvalidSelection;
  let validationState: ValidationState | null = isValueInvalid ? 'invalid' : null;

  return {
    ...calendar,
    value,
    setValue,
    anchorDate,
    setAnchorDate,
    highlightedRange,
    validationState,
    isValueInvalid,
    selectFocusedDate() {
      if (!calendar.isCellUnavailable(calendar.focusedDate)) {
        selectDate(calendar.focusedDate);
      }
    },
    commitSelection() {
      selectDate(calendar.focusedDate);
    },
    selectDate,
    highlightDate(date) {
      if (anchorDate) {
        calendar.setFocusedDate(date);
      }
    },
    isSelected(date) {
      return Boolean(
        highlightedRange &&
        date.compare(highlightedRange.start) >= 0 &&
        date.compare(highlightedRange.end) <= 0 &&
        !calendar.isCellDisabled(date) &&
        !calendar.isCellUnavailable(date)
      );
    },
    isInvalid(date) {
      return (
        calendar.isInvalid(date) || isInvalid(date, availableRange?.start, availableRange?.end)
      );
    },
    isDragging,
    setDragging,
    clearSelection() {
      setAnchorDate(null);
      setValue(null);
    },
    focusNearestAvailableDate(anchorDate) {
      let availableRange = getAvailableRange(anchorDate);
      let isDateInvalid = (date: CalendarDate) =>
        this.isInvalid(date) || isInvalid(date, availableRange?.start, availableRange?.end);
      let nextDay = anchorDate.add({days: 1});
      if (isDateInvalid(nextDay)) {
        nextDay = anchorDate.subtract({days: 1});
      }
      if (!isDateInvalid(nextDay)) {
        this.setFocusedDate(nextDay);
        this.setFocused(true);
      }
    }
  };
}

function makeRange(start: DateValue, end: DateValue): RangeValue<CalendarDate> | null {
  if (!start || !end) {
    return null;
  }

  if (end.compare(start) < 0) {
    [start, end] = [end, start];
  }

  return {start: toCalendarDate(start), end: toCalendarDate(end)};
}

function convertValue(newValue: CalendarDate, oldValue?: DateValue): DateValue {
  // The display calendar should not have any effect on the emitted value.
  // Emit dates in the same calendar as the original value, if any, otherwise gregorian.
  newValue = toCalendar(newValue, oldValue?.calendar || new GregorianCalendar());

  // Preserve time if the input value had one.
  if (oldValue && 'hour' in oldValue) {
    return oldValue.set(newValue);
  }

  return newValue;
}

function nextUnavailableDate(
  anchorDate: CalendarDate,
  isDateUnavailable: (date: CalendarDate) => boolean,
  visibleDuration: DateDuration,
  dir: number
): CalendarDate | undefined {
  let nextDate = anchorDate.add({days: dir});
  let minDate = anchorDate.subtract(visibleDuration);
  let maxDate = anchorDate.add(visibleDuration);
  while (
    (dir < 0 ? nextDate.compare(minDate) >= 0 : nextDate.compare(maxDate) <= 0) &&
    !isDateUnavailable(nextDate)
  ) {
    nextDate = nextDate.add({days: dir});
  }

  if (isDateUnavailable(nextDate)) {
    return nextDate.add({days: -dir});
  }
}
