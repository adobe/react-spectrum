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

import {CalendarDate, DateFormatter, toCalendarDate, toCalendarDateTime} from '@internationalized/date';
import {DatePickerProps, DateValue, Granularity, TimeValue} from '@react-types/datepicker';
import {FieldOptions, FormatterOptions, getFormatOptions, getPlaceholderTime, getValidationResult, useDefaultProps} from './utils';
import {FormValidationState, useFormValidationState} from '@react-stately/form';
import {OverlayTriggerState, useOverlayTriggerState} from '@react-stately/overlays';
import {useControlledState} from '@react-stately/utils';
import {useMemo, useState} from 'react';
import {ValidationState} from '@react-types/shared';

export interface DatePickerStateOptions<T extends DateValue> extends DatePickerProps<T> {
  /**
   * Determines whether the date picker popover should close automatically when a date is selected.
   * @default true
   */
  shouldCloseOnSelect?: boolean | (() => boolean)
}

export interface DatePickerState extends OverlayTriggerState, FormValidationState {
  /** The currently selected date. */
  value: DateValue | null,
  /** Sets the selected date. */
  setValue(value: DateValue | null): void,
  /**
   * The date portion of the value. This may be set prior to `value` if the user has
   * selected a date but has not yet selected a time.
   */
  dateValue: DateValue,
  /** Sets the date portion of the value. */
  setDateValue(value: CalendarDate): void,
  /**
   * The time portion of the value. This may be set prior to `value` if the user has
   * selected a time but has not yet selected a date.
   */
  timeValue: TimeValue,
  /** Sets the time portion of the value. */
  setTimeValue(value: TimeValue): void,
  /** The granularity for the field, based on the `granularity` prop and current value. */
  granularity: Granularity,
  /** Whether the date picker supports selecting a time, according to the `granularity` prop and current value. */
  hasTime: boolean,
  /** Whether the calendar popover is currently open. */
  isOpen: boolean,
  /** Sets whether the calendar popover is open. */
  setOpen(isOpen: boolean): void,
  /**
   * The current validation state of the date picker, based on the `validationState`, `minValue`, and `maxValue` props.
   * @deprecated Use `isInvalid` instead.
   */
  validationState: ValidationState,
  /** Whether the date picker is invalid, based on the `isInvalid`, `minValue`, and `maxValue` props. */
  isInvalid: boolean,
  /** Formats the selected value using the given options. */
  formatValue(locale: string, fieldOptions: FieldOptions): string,
  /** Gets a formatter based on state's props. */
  getDateFormatter(locale: string, formatOptions: FormatterOptions): DateFormatter
}

/**
 * Provides state management for a date picker component.
 * A date picker combines a DateField and a Calendar popover to allow users to enter or select a date and time value.
 */
export function useDatePickerState<T extends DateValue = DateValue>(props: DatePickerStateOptions<T>): DatePickerState {
  let overlayState = useOverlayTriggerState(props);
  let [value, setValue] = useControlledState<DateValue>(props.value, props.defaultValue || null, props.onChange);

  let v = (value || props.placeholderValue);
  let [granularity, defaultTimeZone] = useDefaultProps(v, props.granularity);
  let dateValue = value != null ? value.toDate(defaultTimeZone ?? 'UTC') : null;
  let hasTime = granularity === 'hour' || granularity === 'minute' || granularity === 'second';
  let shouldCloseOnSelect = props.shouldCloseOnSelect ?? true;

  let [selectedDate, setSelectedDate] = useState<DateValue>(null);
  let [selectedTime, setSelectedTime] = useState<TimeValue>(null);

  if (value) {
    selectedDate = value;
    if ('hour' in value) {
      selectedTime = value;
    }
  }

  // props.granularity must actually exist in the value if one is provided.
  if (v && !(granularity in v)) {
    throw new Error('Invalid granularity ' + granularity + ' for value ' + v.toString());
  }

  let showEra = value?.calendar.identifier === 'gregory' && value.era === 'BC';
  let formatOpts = useMemo(() => ({
    granularity,
    timeZone: defaultTimeZone,
    hideTimeZone: props.hideTimeZone,
    hourCycle: props.hourCycle,
    shouldForceLeadingZeros: props.shouldForceLeadingZeros,
    showEra
  }), [granularity, props.hourCycle, props.shouldForceLeadingZeros, defaultTimeZone, props.hideTimeZone, showEra]);

  let {minValue, maxValue, isDateUnavailable} = props;
  let builtinValidation = useMemo(() => getValidationResult(
    value,
    minValue,
    maxValue,
    isDateUnavailable,
    formatOpts
  ), [value, minValue, maxValue, isDateUnavailable, formatOpts]);

  let validation = useFormValidationState({
    ...props,
    value,
    builtinValidation
  });

  let isValueInvalid = validation.displayValidation.isInvalid;
  let validationState: ValidationState = props.validationState || (isValueInvalid ? 'invalid' : null);

  let commitValue = (date: DateValue, time: TimeValue) => {
    setValue('timeZone' in time ? time.set(toCalendarDate(date)) : toCalendarDateTime(date, time));
    setSelectedDate(null);
    setSelectedTime(null);
    validation.commitValidation();
  };

  // Intercept setValue to make sure the Time section is not changed by date selection in Calendar
  let selectDate = (newValue: CalendarDate) => {
    let shouldClose = typeof shouldCloseOnSelect === 'function' ? shouldCloseOnSelect() : shouldCloseOnSelect;
    if (hasTime) {
      if (selectedTime || shouldClose) {
        commitValue(newValue, selectedTime || getPlaceholderTime(props.placeholderValue));
      } else {
        setSelectedDate(newValue);
      }
    } else {
      setValue(newValue);
      validation.commitValidation();
    }

    if (shouldClose) {
      overlayState.setOpen(false);
    }
  };

  let selectTime = (newValue: TimeValue) => {
    if (selectedDate && newValue) {
      commitValue(selectedDate, newValue);
    } else {
      setSelectedTime(newValue);
    }
  };

  return {
    ...validation,
    value,
    setValue,
    dateValue: selectedDate,
    timeValue: selectedTime,
    setDateValue: selectDate,
    setTimeValue: selectTime,
    granularity,
    hasTime,
    ...overlayState,
    setOpen(isOpen) {
      // Commit the selected date when the calendar is closed. Use a placeholder time if one wasn't set.
      // If only the time was set and not the date, don't commit. The state will be preserved until
      // the user opens the popover again.
      if (!isOpen && !value && selectedDate && hasTime) {
        commitValue(selectedDate, selectedTime || getPlaceholderTime(props.placeholderValue));
      }

      overlayState.setOpen(isOpen);
    },
    validationState,
    isInvalid: isValueInvalid,
    formatValue(locale, fieldOptions) {
      if (!dateValue) {
        return '';
      }

      let formatOptions = getFormatOptions(fieldOptions, formatOpts);
      let formatter = new DateFormatter(locale, formatOptions);
      return formatter.format(dateValue);
    },
    getDateFormatter(locale, formatOptions: FormatterOptions) {
      let newOptions = {...formatOpts, ...formatOptions};
      let newFormatOptions = getFormatOptions({}, newOptions);
      return new DateFormatter(locale, newFormatOptions);
    }
  };
}
