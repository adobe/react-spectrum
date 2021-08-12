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

import {Calendar, CalendarDateTime, GregorianCalendar, now, toCalendar, toCalendarDate, toCalendarDateTime, ZonedDateTime} from '@internationalized/date';
import {DatePickerProps, DateValue} from '@react-types/datepicker';
import {FieldOptions, getFormatOptions, isInvalid} from './utils';
import {useControlledState} from '@react-stately/utils';
import {useDateFormatter} from '@react-aria/i18n';
import {useEffect, useMemo, useRef, useState} from 'react';
import {ValidationState} from '@react-types/shared';

export interface DateSegment {
  type: Intl.DateTimeFormatPartTypes,
  text: string,
  value?: number,
  minValue?: number,
  maxValue?: number,
  isPlaceholder: boolean
}

export interface DatePickerFieldState {
  value: CalendarDateTime,
  dateValue: Date,
  setValue: (value: CalendarDateTime) => void,
  segments: DateSegment[],
  dateFormatter: Intl.DateTimeFormat,
  validationState: ValidationState,
  increment: (type: Intl.DateTimeFormatPartTypes) => void,
  decrement: (type: Intl.DateTimeFormatPartTypes) => void,
  incrementPage: (type: Intl.DateTimeFormatPartTypes) => void,
  decrementPage: (type: Intl.DateTimeFormatPartTypes) => void,
  setSegment: (type: Intl.DateTimeFormatPartTypes, value: number) => void,
  confirmPlaceholder: (type: Intl.DateTimeFormatPartTypes) => void,
  getFormatOptions(fieldOptions: FieldOptions): Intl.DateTimeFormatOptions
}

const EDITABLE_SEGMENTS = {
  year: true,
  month: true,
  day: true,
  hour: true,
  minute: true,
  second: true,
  dayPeriod: true,
  era: true
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

interface DatePickerFieldProps extends DatePickerProps {
  maxGranularity?: DatePickerProps['granularity'],
  createCalendar: (name: string) => Calendar
}

export function useDatePickerFieldState(props: DatePickerFieldProps): DatePickerFieldState {
  let {
    createCalendar,
    hideTimeZone
  } = props;

  let v = (props.value || props.defaultValue || props.placeholderValue);
  let defaultTimeZone = (v && 'timeZone' in v ? v.timeZone : undefined);
  let timeZone = defaultTimeZone || 'UTC';
  let granularity = props.granularity || (v && 'minute' in v ? 'minute' : 'day');

  let [validSegments, setValidSegments] = useState<Partial<typeof EDITABLE_SEGMENTS>>(
    props.value || props.defaultValue ? {...EDITABLE_SEGMENTS} : {}
  );

  let formatOpts = useMemo(() => ({
    granularity,
    maxGranularity: props.maxGranularity ?? 'year',
    timeZone: defaultTimeZone,
    hideTimeZone,
    hourCycle: props.hourCycle
  }), [props.maxGranularity, granularity, props.hourCycle, defaultTimeZone, hideTimeZone]);
  let opts = useMemo(() => getFormatOptions({}, formatOpts), [formatOpts]);

  let dateFormatter = useDateFormatter(opts);
  let resolvedOptions = useMemo(() => dateFormatter.resolvedOptions(), [dateFormatter]);
  let calendar = useMemo(() => createCalendar(resolvedOptions.calendar), [createCalendar, resolvedOptions.calendar]);

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
  let [placeholderDate, setPlaceholderDate] = useState(
    props.placeholderValue
      ? convertValue(props.placeholderValue, calendar)
      : createPlaceholderDate(calendar, defaultTimeZone)
  );

  let [date, setDate] = useControlledState(
    convertValue(props.value, calendar),
    convertValue(props.defaultValue, calendar),
    value => {
      if (props.onChange) {
        let hasTime = granularity === 'hour' || granularity === 'minute' || granularity === 'second';
        let gregorianDate = toCalendar(value, new GregorianCalendar());
        props.onChange(hasTime || defaultTimeZone ? gregorianDate : toCalendarDate(gregorianDate));
      }
    }
  );

  // Reset date and placeholder when calendar changes
  let lastCalendarIdentifier = useRef(calendar.identifier);
  useEffect(() => {
    if (calendar.identifier !== lastCalendarIdentifier.current) {
      let isValid = Object.keys(validSegments).length >= numSegments;
      if (isValid) {
        setDate(date => toCalendar(date, calendar));
      } else {
        setPlaceholderDate(placeholder => Object.keys(validSegments).length > 0 ? toCalendar(placeholder, calendar) : createPlaceholderDate(calendar, defaultTimeZone));
      }
      lastCalendarIdentifier.current = calendar.identifier;
    }
  }, [calendar, setDate, validSegments, defaultTimeZone, numSegments]);

  // If all segments are valid, use the date from state, otherwise use the placeholder date.
  let value = date && Object.keys(validSegments).length >= numSegments ? date : placeholderDate;
  let setValue = (value: CalendarDateTime) => {
    if (props.isDisabled || props.isReadOnly) {
      return;
    }

    if (Object.keys(validSegments).length >= numSegments) {
      setDate(value);
    } else {
      setPlaceholderDate(value);
    }
  };

  let dateValue = useMemo(() => value.toDate(timeZone), [value, timeZone]);
  let segments = useMemo(() =>
    dateFormatter.formatToParts(dateValue)
      .map(segment => ({
        type: TYPE_MAPPING[segment.type] || segment.type,
        text: segment.value,
        ...getSegmentLimits(value, segment.type, resolvedOptions),
        isPlaceholder: !validSegments[segment.type]
      } as DateSegment))
  , [dateValue, validSegments, dateFormatter, resolvedOptions, value]);

  let hasEra = useMemo(() => segments.some(s => s.type === 'era'), [segments]);

  let markValid = (part: Intl.DateTimeFormatPartTypes) => {
    validSegments[part] = true;
    if (part === 'year' && hasEra) {
      validSegments.era = true;
    }
    setValidSegments({...validSegments});
  };

  let adjustSegment = (type: Intl.DateTimeFormatPartTypes, amount: number) => {
    markValid(type);
    setValue(addSegment(value, type, amount, resolvedOptions));
  };

  let validationState: ValidationState = props.validationState ||
    (isInvalid(date, props.minValue, props.maxValue) ? 'invalid' : null);

  return {
    value: date,
    dateValue,
    setValue,
    segments,
    dateFormatter,
    validationState,
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
      markValid(part);
      setValue(setSegment(value, part, v, resolvedOptions));
    },
    confirmPlaceholder(part) {
      markValid(part);
      setValue(value.copy());
    },
    getFormatOptions(fieldOptions: FieldOptions) {
      return getFormatOptions(fieldOptions, formatOpts);
    }
  };
}

function getSegmentLimits(date: CalendarDateTime, type: string, options: Intl.ResolvedDateTimeFormatOptions) {
  let value, minValue, maxValue;
  switch (type) {
    case 'era': {
      let eras = date.calendar.getEras();
      value = eras.indexOf(date.era);
      minValue = 0;
      maxValue = eras.length - 1;
      break;
    }
    case 'year':
      value = date.year;
      minValue = 1;
      maxValue = date.calendar.getYearsInEra(date);
      break;
    case 'month':
      value = date.month;
      minValue = 1;
      maxValue = date.calendar.getMonthsInYear(date);
      break;
    case 'day':
      value = date.day;
      minValue = 1;
      maxValue = date.calendar.getDaysInMonth(date);
      break;
    case 'dayPeriod':
      value = date.hour >= 12 ? 12 : 0;
      minValue = 0;
      maxValue = 12;
      break;
    case 'hour':
      value = date.hour;
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
      value = date.minute;
      minValue = 0;
      maxValue = 59;
      break;
    case 'second':
      value = date.second;
      minValue = 0;
      maxValue = 59;
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

function addSegment(value: CalendarDateTime, part: string, amount: number, options: Intl.ResolvedDateTimeFormatOptions) {
  switch (part) {
    case 'era':
    case 'year':
    case 'month':
    case 'day':
      return value.cycle(part, amount, {round: part === 'year'});
    case 'dayPeriod': {
      let hours = value.hour;
      let isPM = hours >= 12;
      return value.set({hour: isPM ? hours - 12 : hours + 12});
    }
    case 'hour':
    case 'minute':
    case 'second':
      return value.cycle(part, amount, {
        round: part !== 'hour',
        hourCycle: options.hour12 ? 12 : 24
      });
  }
}

function setSegment(value: CalendarDateTime, part: string, segmentValue: number, options: Intl.ResolvedDateTimeFormatOptions) {
  switch (part) {
    case 'day':
    case 'month':
    case 'year':
      return value.set({[part]: segmentValue});
    case 'dayPeriod': {
      let hours = value.hour;
      let wasPM = hours >= 12;
      let isPM = segmentValue >= 12;
      if (isPM === wasPM) {
        return value;
      }
      return value.set({hour: wasPM ? hours - 12 : hours + 12});
    }
    case 'hour':
      // In 12 hour time, ensure that AM/PM does not change
      if (options.hour12) {
        let hours = value.hour;
        let wasPM = hours >= 12;
        if (!wasPM && segmentValue === 12) {
          segmentValue = 0;
        }
        if (wasPM && segmentValue < 12) {
          segmentValue += 12;
        }
      }
      // fallthrough
    case 'minute':
    case 'second':
      return value.set({[part]: segmentValue});
  }
}

function convertValue(value: DateValue, calendar: Calendar): CalendarDateTime | ZonedDateTime {
  if (value === null) {
    return null;
  }

  if (!value) {
    return undefined;
  }

  if ('hour' in value) {
    return toCalendar(value, calendar);
  }

  return toCalendar(toCalendarDateTime(value), calendar);
}

function createPlaceholderDate(calendar, timeZone) {
  let date = toCalendar(now(timeZone), calendar).set({
    hour: 12,
    minute: 0,
    second: 0,
    millisecond: 0
  });

  if (!timeZone) {
    return toCalendarDateTime(date);
  }

  return date;
}
