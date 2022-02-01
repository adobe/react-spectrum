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

import {CalendarDate, DateFormatter, toCalendarDateTime, toDateFields} from '@internationalized/date';
import {DatePickerProps, DateValue, Granularity, TimeValue} from '@react-types/datepicker';
import {FieldOptions, getFormatOptions, getPlaceholderTime, useDefaultProps} from './utils';
import {isInvalid} from './utils';
import {useControlledState} from '@react-stately/utils';
import {useState} from 'react';
import {ValidationState} from '@react-types/shared';

export interface DatePickerState {
  value: DateValue,
  setValue: (value: DateValue) => void,
  dateValue: DateValue,
  setDateValue: (value: CalendarDate) => void,
  timeValue: TimeValue,
  setTimeValue: (value: TimeValue) => void,
  isOpen: boolean,
  setOpen: (isOpen: boolean) => void,
  validationState: ValidationState,
  formatValue(locale: string, fieldOptions: FieldOptions): string,
  granularity: Granularity
}

export function useDatePickerState<T extends DateValue>(props: DatePickerProps<T>): DatePickerState {
  let [isOpen, setOpen] = useState(false);
  let [value, setValue] = useControlledState<DateValue>(props.value, props.defaultValue || null, props.onChange);

  let v = (value || props.placeholderValue);
  let [granularity, defaultTimeZone] = useDefaultProps(v, props.granularity);
  let dateValue = value != null ? value.toDate(defaultTimeZone ?? 'UTC') : null;
  let hasTime = granularity === 'hour' || granularity === 'minute' || granularity === 'second' || granularity === 'millisecond';

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

  let commitValue = (date: DateValue, time: TimeValue) => {
    setValue('timeZone' in time ? time.set(toDateFields(date)) : toCalendarDateTime(date, time));
  };

  // Intercept setValue to make sure the Time section is not changed by date selection in Calendar
  let selectDate = (newValue: CalendarDate) => {
    if (hasTime) {
      if (selectedTime) {
        commitValue(newValue, selectedTime);
      } else {
        setSelectedDate(newValue);
      }
    } else {
      setValue(newValue);
    }

    if (!hasTime) {
      setOpen(false);
    }
  };

  let selectTime = (newValue: TimeValue) => {
    if (selectedDate) {
      commitValue(selectedDate, newValue);
    } else {
      setSelectedTime(newValue);
    }
  };

  let validationState: ValidationState = props.validationState ||
    (isInvalid(value, props.minValue, props.maxValue) ? 'invalid' : null);

  return {
    value,
    setValue,
    dateValue: selectedDate,
    timeValue: selectedTime,
    setDateValue: selectDate,
    setTimeValue: selectTime,
    granularity,
    isOpen,
    setOpen(isOpen) {
      // Commit the selected date when the calendar is closed. Use a placeholder time if one wasn't set.
      // If only the time was set and not the date, don't commit. The state will be preserved until
      // the user opens the popover again.
      if (!isOpen && !value && selectedDate && hasTime) {
        commitValue(selectedDate, selectedTime || getPlaceholderTime(props.placeholderValue));
      }

      setOpen(isOpen);
    },
    validationState,
    formatValue(locale, fieldOptions) {
      if (!dateValue) {
        return '';
      }

      let formatOptions = getFormatOptions(fieldOptions, {
        granularity,
        timeZone: defaultTimeZone,
        hideTimeZone: props.hideTimeZone,
        hourCycle: props.hourCycle
      });

      let formatter = new DateFormatter(locale, formatOptions);
      return formatter.format(dateValue);
    }
  };
}
