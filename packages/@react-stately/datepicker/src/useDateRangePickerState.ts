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


import {DateFormatter, toCalendarDate, toCalendarDateTime} from '@internationalized/date';
import {DateRange, DateRangePickerProps, DateValue, Granularity, MappedDateValue, TimeValue} from '@react-types/datepicker';
import {FieldOptions, FormatterOptions, getFormatOptions, getPlaceholderTime, getRangeValidationResult, useDefaultProps} from './utils';
import {FormValidationState, useFormValidationState} from '@react-stately/form';
import {OverlayTriggerState, useOverlayTriggerState} from '@react-stately/overlays';
import {RangeValue, ValidationState} from '@react-types/shared';
import {useControlledState} from '@react-stately/utils';
import {useMemo, useState} from 'react';

export interface DateRangePickerStateOptions<T extends DateValue = DateValue> extends DateRangePickerProps<T> {
  /**
   * Determines whether the date picker popover should close automatically when a date is selected.
   * @default true
   */
  shouldCloseOnSelect?: boolean | (() => boolean)
}

type TimeRange = RangeValue<TimeValue>;
export interface DateRangePickerState extends OverlayTriggerState, FormValidationState {
  /** The currently selected date range. */
  value: RangeValue<DateValue | null>,
  /** The default selected date range. */
  defaultValue: DateRange | null,
  /** Sets the selected date range. */
  setValue(value: DateRange | null): void,
  /**
   * The date portion of the selected range. This may be set prior to `value` if the user has
   * selected a date range but has not yet selected a time range.
   */
  dateRange: RangeValue<DateValue | null> | null,
  /** Sets the date portion of the selected range. */
  setDateRange(value: DateRange): void,
  /**
   * The time portion of the selected range. This may be set prior to `value` if the user has
   * selected a time range but has not yet selected a date range.
   */
  timeRange: RangeValue<TimeValue | null> | null,
  /** Sets the time portion of the selected range. */
  setTimeRange(value: TimeRange): void,
  /** Sets the date portion of either the start or end of the selected range. */
  setDate(part: 'start' | 'end', value: DateValue | null): void,
  /** Sets the time portion of either the start or end of the selected range. */
  setTime(part: 'start' | 'end', value: TimeValue | null): void,
  /** Sets the date and time of either the start or end of the selected range. */
  setDateTime(part: 'start' | 'end', value: DateValue | null): void,
  /** The granularity for the field, based on the `granularity` prop and current value. */
  granularity: Granularity,
  /** Whether the date range picker supports selecting times, according to the `granularity` prop and current value. */
  hasTime: boolean,
  /** Whether the calendar popover is currently open. */
  isOpen: boolean,
  /** Sets whether the calendar popover is open. */
  setOpen(isOpen: boolean): void,
  /**
   * The current validation state of the date range picker, based on the `validationState`, `minValue`, and `maxValue` props.
   * @deprecated Use `isInvalid` instead.
   */
  validationState: ValidationState | null,
  /** Whether the date range picker is invalid, based on the `isInvalid`, `minValue`, and `maxValue` props. */
  isInvalid: boolean,
  /** Formats the selected range using the given options. */
  formatValue(locale: string, fieldOptions: FieldOptions): {start: string, end: string} | null,
  /** Gets a formatter based on state's props. */
  getDateFormatter(locale: string, formatOptions: FormatterOptions): DateFormatter
}

/**
 * Provides state management for a date range picker component.
 * A date range picker combines two DateFields and a RangeCalendar popover to allow
 * users to enter or select a date and time range.
 */
export function useDateRangePickerState<T extends DateValue = DateValue>(props: DateRangePickerStateOptions<T>): DateRangePickerState {
  let overlayState = useOverlayTriggerState(props);
  let [controlledValue, setControlledValue] = useControlledState<DateRange | null, RangeValue<MappedDateValue<T>> | null>(props.value, props.defaultValue || null, props.onChange);
  let [initialValue] = useState(controlledValue);
  let [placeholderValue, setPlaceholderValue] = useState<RangeValue<DateValue | null>>(() => controlledValue || {start: null, end: null});

  // Reset the placeholder if the value prop is set to null.
  if (controlledValue == null && placeholderValue.start && placeholderValue.end) {
    placeholderValue = {start: null, end: null};
    setPlaceholderValue(placeholderValue);
  }

  let value = controlledValue || placeholderValue;

  let setValue = (newValue: RangeValue<DateValue | null> | null) => {
    value = newValue || {start: null, end: null};
    setPlaceholderValue(value);
    if (isCompleteRange(value)) {
      setControlledValue(value);
    } else {
      setControlledValue(null);
    }
  };

  let v = (value?.start || value?.end || props.placeholderValue || null);
  let [granularity, defaultTimeZone] = useDefaultProps(v, props.granularity);
  let hasTime = granularity === 'hour' || granularity === 'minute' || granularity === 'second';
  let shouldCloseOnSelect = props.shouldCloseOnSelect ?? true;

  let [dateRange, setSelectedDateRange] = useState<RangeValue<DateValue | null> | null>(null);
  let [timeRange, setSelectedTimeRange] = useState<RangeValue<TimeValue | null> | null>(null);

  if (value && isCompleteRange(value)) {
    dateRange = value;
    if ('hour' in value.start) {
      timeRange = value as TimeRange;
    }
  }

  let commitValue = (dateRange: DateRange, timeRange: TimeRange) => {
    setValue({
      start: 'timeZone' in timeRange.start ? timeRange.start.set(toCalendarDate(dateRange.start)) : toCalendarDateTime(dateRange.start, timeRange.start),
      end: 'timeZone' in timeRange.end ? timeRange.end.set(toCalendarDate(dateRange.end)) : toCalendarDateTime(dateRange.end, timeRange.end)
    });
    setSelectedDateRange(null);
    setSelectedTimeRange(null);
    validation.commitValidation();
  };

  // Intercept setValue to make sure the Time section is not changed by date selection in Calendar
  let setDateRange = (range: RangeValue<DateValue | null>) => {
    let shouldClose = typeof shouldCloseOnSelect === 'function' ? shouldCloseOnSelect() : shouldCloseOnSelect;
    if (hasTime) {
      // Set a placeholder time if the popover is closing so we don't leave the field in an incomplete state.
      if (isCompleteRange(range) && (shouldClose || (timeRange?.start && timeRange?.end))) {
        commitValue(range, {
          start: timeRange?.start || getPlaceholderTime(props.placeholderValue),
          end: timeRange?.end || getPlaceholderTime(props.placeholderValue)
        });
      } else {
        setSelectedDateRange(range);
      }
    } else if (isCompleteRange(range)) {
      setValue(range);
      validation.commitValidation();
    } else {
      setSelectedDateRange(range);
    }

    if (shouldClose) {
      overlayState.setOpen(false);
    }
  };

  let setTimeRange = (range: RangeValue<TimeValue | null>) => {
    if (isCompleteRange(dateRange) && isCompleteRange(range)) {
      commitValue(dateRange, range);
    } else {
      setSelectedTimeRange(range);
    }
  };

  let showEra = (value?.start?.calendar.identifier === 'gregory' && value.start.era === 'BC') || (value?.end?.calendar.identifier === 'gregory' && value.end.era === 'BC');
  let formatOpts = useMemo(() => ({
    granularity,
    timeZone: defaultTimeZone,
    hideTimeZone: props.hideTimeZone,
    hourCycle: props.hourCycle,
    shouldForceLeadingZeros: props.shouldForceLeadingZeros,
    showEra
  }), [granularity, props.hourCycle, props.shouldForceLeadingZeros, defaultTimeZone, props.hideTimeZone, showEra]);

  let {minValue, maxValue, isDateUnavailable} = props;
  let builtinValidation = useMemo(() => getRangeValidationResult(
    value,
    minValue,
    maxValue,
    isDateUnavailable,
    formatOpts
  ), [value, minValue, maxValue, isDateUnavailable, formatOpts]);

  let validation = useFormValidationState({
    ...props,
    value: controlledValue as RangeValue<MappedDateValue<T>> | null,
    name: useMemo(() => [props.startName, props.endName].filter(n => n != null), [props.startName, props.endName]),
    builtinValidation
  });

  let isValueInvalid = validation.displayValidation.isInvalid;
  let validationState: ValidationState | null = props.validationState || (isValueInvalid ? 'invalid' : null);

  return {
    ...validation,
    value,
    defaultValue: props.defaultValue ?? initialValue,
    setValue,
    dateRange,
    timeRange,
    granularity,
    hasTime,
    setDate(part, date) {
      if (part === 'start') {
        setDateRange({start: date, end: dateRange?.end ?? null});
      } else {
        setDateRange({start: dateRange?.start ?? null, end: date});
      }
    },
    setTime(part, time) {
      if (part === 'start') {
        setTimeRange({start: time, end: timeRange?.end ?? null});
      } else {
        setTimeRange({start: timeRange?.start ?? null, end: time});
      }
    },
    setDateTime(part, dateTime) {
      if (part === 'start') {
        setValue({start: dateTime, end: value?.end ?? null});
      } else {
        setValue({start: value?.start ?? null, end: dateTime});
      }
    },
    setDateRange,
    setTimeRange,
    ...overlayState,
    setOpen(isOpen) {
      // Commit the selected date range when the calendar is closed. Use a placeholder time if one wasn't set.
      // If only the time range was set and not the date range, don't commit. The state will be preserved until
      // the user opens the popover again.
      if (!isOpen && !(value?.start && value?.end) && isCompleteRange(dateRange) && hasTime) {
        commitValue(dateRange, {
          start: timeRange?.start || getPlaceholderTime(props.placeholderValue),
          end: timeRange?.end || getPlaceholderTime(props.placeholderValue)
        });
      }

      overlayState.setOpen(isOpen);
    },
    validationState,
    isInvalid: isValueInvalid,
    formatValue(locale, fieldOptions) {
      if (!value || !value.start || !value.end) {
        return null;
      }

      let startTimeZone = 'timeZone' in value.start ? value.start.timeZone : undefined;
      let startGranularity = props.granularity || (value.start && 'minute' in value.start ? 'minute' : 'day');
      let endTimeZone = 'timeZone' in value.end ? value.end.timeZone : undefined;
      let endGranularity = props.granularity || (value.end && 'minute' in value.end ? 'minute' : 'day');

      let startOptions = getFormatOptions(fieldOptions, {
        granularity: startGranularity,
        timeZone: startTimeZone,
        hideTimeZone: props.hideTimeZone,
        hourCycle: props.hourCycle,
        showEra: (value.start.calendar.identifier === 'gregory' && value.start.era === 'BC') ||
          (value.end.calendar.identifier === 'gregory' && value.end.era === 'BC')
      });

      let startDate = value.start.toDate(startTimeZone || 'UTC');
      let endDate = value.end.toDate(endTimeZone || 'UTC');

      let startFormatter = new DateFormatter(locale, startOptions);
      let endFormatter: Intl.DateTimeFormat;
      if (startTimeZone === endTimeZone && startGranularity === endGranularity && value.start.compare(value.end) !== 0) {
        // Use formatRange, as it results in shorter output when some of the fields
        // are shared between the start and end dates (e.g. the same month).
        // Formatting will fail if the end date is before the start date. Fall back below when that happens.
        try {
          let parts = startFormatter.formatRangeToParts(startDate, endDate);

          // Find the separator between the start and end date. This is determined
          // by finding the last shared literal before the end range.
          let separatorIndex = -1;
          for (let i = 0; i < parts.length; i++) {
            let part = parts[i];
            if (part.source === 'shared' && part.type === 'literal') {
              separatorIndex = i;
            } else if (part.source === 'endRange') {
              break;
            }
          }

          // Now we can combine the parts into start and end strings.
          let start = '';
          let end = '';
          for (let i = 0; i < parts.length; i++) {
            if (i < separatorIndex) {
              start += parts[i].value;
            } else if (i > separatorIndex) {
              end += parts[i].value;
            }
          }

          return {start, end};
        } catch {
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

      return {
        start: startFormatter.format(startDate),
        end: endFormatter.format(endDate)
      };
    },
    getDateFormatter(locale, formatOptions: FormatterOptions) {
      let newOptions = {...formatOpts, ...formatOptions};
      let newFormatOptions = getFormatOptions({}, newOptions);
      return new DateFormatter(locale, newFormatOptions);
    }
  };
}

function isCompleteRange<T>(value: RangeValue<T | null> | null): value is RangeValue<T> {
  return value?.start != null && value.end != null;
}
