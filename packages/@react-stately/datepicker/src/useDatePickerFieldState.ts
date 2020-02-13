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
import {DatePickerProps, DateValue} from '@react-types/datepicker';
import {getDate, getDaysInMonth, getHours, getMinutes, getMonth, getSeconds, getYear, setDate, setHours, setMinutes, setMonth, setSeconds, setYear} from 'date-fns';
import parse from 'date-fns/parse';
import {useControlledState} from '@react-stately/utils';
import {useDateFormatter} from '@react-aria/i18n';
import {useMemo, useState} from 'react';

export interface DateSegment {
  type: Intl.DateTimeFormatPartTypes,
  text: string,
  value?: number,
  minValue?: number,
  maxValue?: number,
  isPlaceholder: boolean
}

export interface DatePickerFieldState {
  value: Date,
  setValue: (value: Date) => void,
  segments: DateSegment[],
  dateFormatter: Intl.DateTimeFormat,
  increment: (type: Intl.DateTimeFormatPartTypes) => void,
  decrement: (type: Intl.DateTimeFormatPartTypes) => void,
  incrementPage: (type: Intl.DateTimeFormatPartTypes) => void,
  decrementPage: (type: Intl.DateTimeFormatPartTypes) => void,
  setSegment: (type: Intl.DateTimeFormatPartTypes, value: number) => void,
  confirmPlaceholder: (type: Intl.DateTimeFormatPartTypes) => void
}

const EDITABLE_SEGMENTS = {
  year: true,
  month: true,
  day: true,
  hour: true,
  minute: true,
  second: true,
  dayPeriod: true
};

const PAGE_STEP = {
  year: 5,
  month: 2,
  day: 7,
  hour: 2,
  minute: 15,
  second: 15
};

// Node seems to convert everything to lowercase...
const TYPE_MAPPING = {
  dayperiod: 'dayPeriod'
};

export function useDatePickerFieldState(props: DatePickerProps): DatePickerFieldState {
  let [validSegments, setValidSegments] = useState(
    props.value || props.defaultValue ? {...EDITABLE_SEGMENTS} : {}
  );

  let dateFormatter = useDateFormatter(props.formatOptions);
  let resolvedOptions = useMemo(() => dateFormatter.resolvedOptions(), [dateFormatter]);

  // Determine how many editable segments there are for validation purposes.
  // The result is cached for performance.
  let numSegments = useMemo(() =>
    dateFormatter.formatToParts(new Date())
      .filter(seg => EDITABLE_SEGMENTS[seg.type])
      .length
  , [dateFormatter]);

  // If there is a value prop, and some segments were previously placeholders, mark them all as valid.
  if (props.value && Object.keys(validSegments).length < numSegments) {
    setValidSegments({...EDITABLE_SEGMENTS});
  }

  // We keep track of the placeholder date separately in state so that onChange is not called
  // until all segments are set. If the value === null (not undefined), then assume the component
  // is controlled, so use the placeholder as the value until all segments are entered so it doesn't
  // change from uncontrolled to controlled and emit a warning.
  let [placeholderDate, setPlaceholderDate] = useState(convertValue(props.placeholderDate) || new Date(new Date().getFullYear(), 0, 1));
  let [date, setDate] = useControlledState<Date>(
    props.value === null ? convertValue(placeholderDate) : convertValue(props.value),
    convertValue(props.defaultValue),
    props.onChange
  );

  // If all segments are valid, use the date from state, otherwise use the placeholder date.
  let value = Object.keys(validSegments).length >= numSegments ? date : placeholderDate;
  let setValue = (value: Date) => {
    if (Object.keys(validSegments).length >= numSegments) {
      setDate(value);
    } else {
      setPlaceholderDate(value);
    }
  };

  let segments = dateFormatter.formatToParts(value)
    .map(segment => ({
      type: TYPE_MAPPING[segment.type] || segment.type,
      text: segment.value,
      ...getSegmentLimits(value, segment.type, resolvedOptions),
      isPlaceholder: !validSegments[segment.type]
    } as DateSegment));

  let adjustSegment = (type: Intl.DateTimeFormatPartTypes, amount: number) => {
    validSegments[type] = true;
    setValidSegments({...validSegments});
    setValue(add(value, type, amount, resolvedOptions));
  };

  return {
    value,
    setValue,
    segments,
    dateFormatter,
    increment(part) {
      adjustSegment(part, 1);
    },
    decrement(part) {
      adjustSegment(part, -1);
    },
    incrementPage(part) {
      adjustSegment(part, PAGE_STEP[part] || 1);
    },
    decrementPage(part) {
      adjustSegment(part, -(PAGE_STEP[part] || 1));
    },
    setSegment(part, v) {
      validSegments[part] = true;
      setValidSegments({...validSegments});
      setValue(setSegment(value, part, v, resolvedOptions));
    },
    confirmPlaceholder(part) {
      validSegments[part] = true;
      setValidSegments({...validSegments});
      setValue(new Date(value));
    }
  };
}

function convertValue(value: DateValue | null): Date {
  if (!value) {
    return undefined;
  }

  return parse(value);
}

function getSegmentLimits(date: Date, type: string, options: Intl.ResolvedDateTimeFormatOptions) {
  let value, minValue, maxValue;
  switch (type) {
    case 'day':
      value = getDate(date);
      minValue = 1;
      maxValue = getDaysInMonth(date);
      break;
    case 'dayPeriod':
      value = getHours(date) >= 12 ? 12 : 0;
      minValue = 0;
      maxValue = 12;
      break;
    case 'hour':
      value = getHours(date);
      if (options.hour12) {
        let isPM = value >= 12;
        minValue = isPM ? 12 : 0;
        maxValue = isPM ? 23 : 11;
      } else {
        minValue = 0;
        maxValue = 23;
      }
      break;
    case 'minute':
      value = getMinutes(date);
      minValue = 0;
      maxValue = 59;
      break;
    case 'second':
      value = getSeconds(date);
      minValue = 0;
      maxValue = 59;
      break;
    case 'month':
      value = getMonth(date) + 1;
      minValue = 1;
      maxValue = 12;
      break;
    case 'year':
      value = getYear(date);
      minValue = 1;
      maxValue = 9999;
      break;
    default:
      return {};
  }

  return {
    value,
    minValue,
    maxValue
  };
}

function add(value: Date, part: string, amount: number, options: Intl.ResolvedDateTimeFormatOptions) {
  switch (part) {
    case 'day': {
      let day = getDate(value);
      return setDate(value, cycleValue(day, amount, 1, getDaysInMonth(value)));
    }
    case 'dayPeriod': {
      let hours = getHours(value);
      let isPM = hours >= 12;
      return setHours(value, isPM ? hours - 12 : hours + 12);
    }
    case 'hour': {
      let hours = getHours(value);
      let min = 0;
      let max = 23;
      if (options.hour12) {
        let isPM = hours >= 12;
        min = isPM ? 12 : 0;
        max = isPM ? 23 : 11;
      }
      hours = cycleValue(hours, amount, min, max);
      return setHours(value, hours);
    }
    case 'minute': {
      let minutes = cycleValue(getMinutes(value), amount, 0, 59, true);
      return setMinutes(value, minutes);
    }
    case 'month': {
      let months = cycleValue(getMonth(value), amount, 0, 11);
      return setMonth(value, months);
    }
    case 'second': {
      let seconds = cycleValue(getSeconds(value), amount, 0, 59, true);
      return setSeconds(value, seconds);
    }
    case 'year': {
      let year = cycleValue(getYear(value), amount, 1, 9999, true);
      return setYear(value, year);
    }
  }
}

function cycleValue(value: number, amount: number, min: number, max: number, round = false) {
  if (round) {
    value += amount > 0 ? 1 : -1;

    if (value < min) {
      value = max;
    }

    let div = Math.abs(amount);
    if (amount > 0) {
      value = Math.ceil(value / div) * div;
    } else {
      value = Math.floor(value / div) * div;
    }

    if (value > max) {
      value = min;
    }
  } else {
    value += amount;
    if (value < min) {
      value = max - (min - value - 1);
    } else if (value > max) {
      value = min + (value - max - 1);
    }
  }

  return value;
}

function setSegment(value: Date, part: string, segmentValue: number, options: Intl.ResolvedDateTimeFormatOptions) {
  switch (part) {
    case 'day':
      return setDate(value, segmentValue);
    case 'dayPeriod': {
      let hours = getHours(value);
      let wasPM = hours >= 12;
      let isPM = segmentValue >= 12;
      if (isPM === wasPM) {
        return value;
      }
      return setHours(value, wasPM ? hours - 12 : hours + 12);
    }
    case 'hour':
      // In 12 hour time, ensure that AM/PM does not change
      if (options.hour12) {
        let hours = getHours(value);
        let wasPM = hours >= 12;
        if (!wasPM && segmentValue === 12) {
          segmentValue = 0;
        }
        if (wasPM && segmentValue < 12) {
          segmentValue += 12;
        }
      }
      return setHours(value, segmentValue);
    case 'minute':
      return setMinutes(value, segmentValue);
    case 'month':
      return setMonth(value, segmentValue - 1);
    case 'second':
      return setSeconds(value, segmentValue);
    case 'year':
      return setYear(value, segmentValue);
  }
}
