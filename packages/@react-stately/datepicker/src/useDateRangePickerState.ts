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

import {createPlaceholderDate, FieldOptions, getFormatOptions, getPlaceholderTime, isInvalid, useDefaultProps} from './utils';
import {DateFormatter, toCalendarDateTime, toDateFields} from '@internationalized/date';
import {DateRange, DateRangePickerProps, DateValue, Granularity, TimeValue} from '@react-types/datepicker';
import {RangeValue, ValidationState} from '@react-types/shared';
import {useControlledState} from '@react-stately/utils';
import {useRef, useState} from 'react';

type TimeRange = RangeValue<TimeValue>;
export interface DateRangePickerState {
  value: DateRange,
  setValue: (value: DateRange) => void,
  setDate: (part: keyof DateRange, value: DateValue) => void,
  setTime: (part: keyof TimeRange, value: TimeValue) => void,
  setDateTime: (part: keyof DateRange, value: DateValue) => void,
  dateRange: DateRange,
  setDateRange: (value: DateRange) => void,
  timeRange: TimeRange,
  setTimeRange: (value: TimeRange) => void,
  isOpen: boolean,
  setOpen: (isOpen: boolean) => void,
  validationState: ValidationState,
  formatValue(locale: string, fieldOptions: FieldOptions): string,
  confirmPlaceholder(): void,
  granularity: Granularity
}

export function useDateRangePickerState<T extends DateValue>(props: DateRangePickerProps<T>): DateRangePickerState {
  let [isOpen, setOpen] = useState(false);
  let [controlledValue, setControlledValue] = useControlledState<DateRange>(props.value, props.defaultValue || null, props.onChange);
  let [placeholderValue, setPlaceholderValue] = useState(() => controlledValue || {start: null, end: null});

  // Reset the placeholder if the value prop is set to null.
  if (controlledValue == null && placeholderValue.start && placeholderValue.end) {
    placeholderValue = {start: null, end: null};
    setPlaceholderValue(placeholderValue);
  }

  let value = controlledValue || placeholderValue;
  let valueRef = useRef(value);
  valueRef.current = value;

  let setValue = (value: DateRange) => {
    valueRef.current = value;
    setPlaceholderValue(value);
    if (value?.start && value.end) {
      setControlledValue(value);
    } else {
      setControlledValue(null);
    }
  };

  let v = (value?.start || value?.end || props.placeholderValue);
  let [granularity, defaultTimeZone] = useDefaultProps(v, props.granularity);
  let hasTime = granularity === 'hour' || granularity === 'minute' || granularity === 'second' || granularity === 'millisecond';

  let [dateRange, setSelectedDateRange] = useState<DateRange>(null);
  let [timeRange, setSelectedTimeRange] = useState<TimeRange>(null);

  if (value && value.start && value.end) {
    dateRange = value;
    if ('hour' in value.start) {
      timeRange = value as TimeRange;
    }
  }

  let commitValue = (dateRange: DateRange, timeRange: TimeRange) => {
    setValue({
      start: 'timeZone' in timeRange.start ? timeRange.start.set(toDateFields(dateRange.start)) : toCalendarDateTime(dateRange.start, timeRange.start),
      end: 'timeZone' in timeRange.end ? timeRange.end.set(toDateFields(dateRange.end)) : toCalendarDateTime(dateRange.end, timeRange.end)
    });
  };

  // Intercept setValue to make sure the Time section is not changed by date selection in Calendar
  let setDateRange = (range: DateRange) => {
    if (hasTime) {
      if (range.start && range.end && timeRange?.start && timeRange?.end) {
        commitValue(range, timeRange);
      } else {
        setSelectedDateRange(range);
      }
    } else if (range.start && range.end) {
      setValue(range);
    } else {
      setSelectedDateRange(range);
    }

    if (!hasTime) {
      setOpen(false);
    }
  };

  let setTimeRange = (range: TimeRange) => {
    if (dateRange?.start && dateRange?.end && range.start && range.end) {
      commitValue(dateRange, range);
    } else {
      setSelectedTimeRange(range);
    }
  };

  let validationState: ValidationState = props.validationState
    || (value != null && (
      isInvalid(value.start, props.minValue, props.maxValue) ||
      isInvalid(value.end, props.minValue, props.maxValue) ||
      (value.end != null && value.start != null && value.end.compare(value.start) < 0)
    ) ? 'invalid' : null);

  return {
    value,
    setValue,
    dateRange,
    timeRange,
    granularity,
    setDate(part, date) {
      setDateRange({...dateRange, [part]: date});
    },
    setTime(part, time) {
      setTimeRange({...timeRange, [part]: time});
    },
    setDateTime(part, dateTime) {
      setValue({...value, [part]: dateTime});
    },
    setDateRange,
    setTimeRange,
    isOpen,
    setOpen(isOpen) {
      // Commit the selected date range when the calendar is closed. Use a placeholder time if one wasn't set.
      // If only the time range was set and not the date range, don't commit. The state will be preserved until
      // the user opens the popover again.
      if (!isOpen && !(value?.start && value?.end) && dateRange?.start && dateRange?.end && hasTime) {
        commitValue(dateRange, {
          start: timeRange?.start || getPlaceholderTime(props.placeholderValue),
          end: timeRange?.end || getPlaceholderTime(props.placeholderValue)
        });
      }

      setOpen(isOpen);
    },
    validationState,
    formatValue(locale, fieldOptions) {
      if (!value || !value.start || !value.end) {
        return '';
      }

      let startTimeZone = 'timeZone' in value.start ? value.start.timeZone : undefined;
      let startGranularity = props.granularity || (value.start && 'minute' in value.start ? 'minute' : 'day');
      let endTimeZone = 'timeZone' in value.end ? value.end.timeZone : undefined;
      let endGranularity = props.granularity || (value.end && 'minute' in value.end ? 'minute' : 'day');

      let startOptions = getFormatOptions(fieldOptions, {
        granularity: startGranularity,
        timeZone: startTimeZone,
        hideTimeZone: props.hideTimeZone,
        hourCycle: props.hourCycle
      });

      let startFormatter = new DateFormatter(locale, startOptions);
      let endFormatter: Intl.DateTimeFormat;
      if (startTimeZone === endTimeZone && startGranularity === endGranularity) {
        // Use formatRange, as it results in shorter output when some of the fields
        // are shared between the start and end dates (e.g. the same month).
        // Formatting will fail if the end date is before the start date. Fall back below when that happens.
        try {
          return startFormatter.formatRange(value.start.toDate(startTimeZone), value.end.toDate(endTimeZone));
        } catch (e) {
          // ignore
        }

        endFormatter = startFormatter;
      } else {
        let endOptions = getFormatOptions(fieldOptions, {
          granularity: endGranularity,
          timeZone: endTimeZone,
          hideTimeZone: props.hideTimeZone,
          hourCycle: props.hourCycle
        });

        endFormatter = new DateFormatter(locale, endOptions);
      }

      return `${startFormatter.format(value.start.toDate(startTimeZone))} – ${endFormatter.format(value.end.toDate(endTimeZone))}`;
    },
    confirmPlaceholder() {
      // Need to use ref value here because the value can be set in the same tick as
      // a blur, which means the component won't have re-rendered yet.
      let value = valueRef.current;
      if (value && Boolean(value.start) !== Boolean(value.end)) {
        let calendar = (value.start || value.end).calendar;
        let placeholder = createPlaceholderDate(props.placeholderValue, granularity, calendar, defaultTimeZone);
        setValue({
          start: value.start || placeholder,
          end: value.end || placeholder
        });
      }
    }
  };
}
