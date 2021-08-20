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

import {CalendarDate} from '@internationalized/date';
import {DatePickerProps, DateValue} from '@react-types/datepicker';
import {FieldOptions, getFormatOptions} from './utils';
import {isInvalid} from './utils';
import {useControlledState} from '@react-stately/utils';
import {useState} from 'react';
import {ValidationState} from '@react-types/shared';

export interface DatePickerState {
  value: DateValue,
  dateValue: Date,
  setValue: (value: DateValue) => void,
  selectDate: (value: CalendarDate) => void,
  isOpen: boolean,
  setOpen: (isOpen: boolean) => void,
  validationState: ValidationState,
  formatValue(locale: string, fieldOptions: FieldOptions): string
}

export function useDatePickerState(props: DatePickerProps): DatePickerState {
  let [isOpen, setOpen] = useState(false);
  let [value, setValue] = useControlledState(props.value, props.defaultValue || null, props.onChange);

  let v = (value || props.placeholderValue);
  let defaultTimeZone = (v && 'timeZone' in v ? v.timeZone : undefined);
  let granularity = props.granularity || (v && 'minute' in v ? 'minute' : 'day');
  let dateValue = value != null ? value.toDate(defaultTimeZone ?? 'UTC') : null;

  // Intercept setValue to make sure the Time section is not changed by date selection in Calendar
  let selectDate = (newValue: CalendarDate) => {
    if (value && 'hour' in value) {
      newValue = value.set(newValue);
    }
    setValue(newValue);
    setOpen(false);
  };

  let validationState: ValidationState = props.validationState ||
    (isInvalid(value, props.minValue, props.maxValue) ? 'invalid' : null);

  return {
    value,
    dateValue,
    setValue,
    selectDate,
    isOpen,
    setOpen,
    validationState,
    formatValue(locale, fieldOptions) {
      let formatOptions = getFormatOptions(fieldOptions, {
        granularity,
        timeZone: defaultTimeZone,
        hideTimeZone: props.hideTimeZone,
        hourCycle: props.hourCycle
      });

      // TODO: cache
      let formatter = new Intl.DateTimeFormat(locale, formatOptions);
      return formatter.format(dateValue);
    }
  };
}
