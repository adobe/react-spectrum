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
import {DateRange, DateRangePickerProps, DateValue} from '@react-types/datepicker';
import {FieldOptions, getFormatOptions, isInvalid} from './utils';
import {RangeValue, ValidationState} from '@react-types/shared';
import {useControlledState} from '@react-stately/utils';
import {useState} from 'react';

export interface DateRangePickerState {
  value: DateRange,
  setValue: (value: DateRange) => void,
  setDate: (part: keyof DateRange, value: DateValue) => void,
  selectDateRange: (value: RangeValue<CalendarDate>) => void,
  isOpen: boolean,
  setOpen: (isOpen: boolean) => void,
  validationState: ValidationState,
  formatValue(locale: string, fieldOptions: FieldOptions): string
}

export function useDateRangePickerState(props: DateRangePickerProps): DateRangePickerState {
  let [isOpen, setOpen] = useState(false);
  let onChange = value => {
    if (value.start && value.end && props.onChange) {
      props.onChange(value);
    }
  };

  let [value, setValue] = useControlledState<DateRange>(
    props.value === null ? {start: null, end: null} : props.value,
    props.defaultValue || {start: null, end: null},
    onChange
  );

  // Intercept setValue to make sure the Time section is not changed by date selection in Calendar
  let selectDateRange = (range: RangeValue<CalendarDate>) => {
    if (range && value?.start && 'hour' in value.start) {
      range = {
        start: value.start.set(range.start),
        end: value.end.set(range.end)
      };
    }
    setValue(range);
    setOpen(false);
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
    setDate(part, date) {
      setValue({...value, [part]: date});
    },
    selectDateRange,
    isOpen,
    setOpen,
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

      // TODO: cache
      let startFormatter = new Intl.DateTimeFormat(locale, startOptions);
      let endFormatter: Intl.DateTimeFormat;
      if (startTimeZone === endTimeZone && startGranularity === endGranularity) {
        // Use formatRange if available, as it results in shorter output when some of the fields
        // are shared between the start and end dates (e.g. the same month).
        if ('formatRange' in startFormatter) {
          // Formatting will fail if the end date is before the start date. Fall back below when that happens.
          try {
            // @ts-ignore
            return startFormatter.formatRange(value.start.toDate(startTimeZone), value.end.toDate(endTimeZone));
          } catch (e) {
            // ignore
          }
        }

        endFormatter = startFormatter;
      } else {
        let endOptions = getFormatOptions(fieldOptions, {
          granularity: endGranularity,
          timeZone: endTimeZone,
          hideTimeZone: props.hideTimeZone,
          hourCycle: props.hourCycle
        });

        endFormatter = new Intl.DateTimeFormat(locale, endOptions);
      }

      return `${startFormatter.format(value.start.toDate(startTimeZone))} – ${endFormatter.format(value.end.toDate(endTimeZone))}`;
    }
  };
}
