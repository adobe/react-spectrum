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

import {DatePickerProps} from '@react-types/datepicker';
import {useControlledState} from '@react-stately/utils';
import {useDateFormatter} from '@react-aria/i18n';
import {useEffect, useMemo, useRef, useState} from 'react';

import {Calendar, CalendarDateTime, GregorianCalendar, now, set, setTime, toCalendar, toCalendarDate, toCalendarDateTime, toDate, cycleDate, cycleTime} from '@internationalized/date';

export interface DateSegment {
  type: Intl.DateTimeFormatPartTypes,
  text: string,
  value?: number,
  minValue?: number,
  maxValue?: number,
  isPlaceholder: boolean
}

export interface DatePickerFieldState {
  // value: Date,
  value: CalendarDateTime,
  dateValue: Date,
  setValue: (value: CalendarDateTime) => void,
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

const FIELD_OPTIONS = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit'
};

interface DatePickerFieldProps extends DatePickerProps {
  maxGranularity?: DatePickerProps['granularity'],
  createCalendar: (name: string) => Calendar,
  timeZone?: string
}

export function useDatePickerFieldState(props: DatePickerFieldProps): DatePickerFieldState {
  let defaultFormatter = useDateFormatter();
  let defaultResolvedOptions = useMemo(() => defaultFormatter.resolvedOptions(), [defaultFormatter]);
  let {
    createCalendar,
    timeZone = 'UTC' //defaultResolvedOptions.timeZone
  } = props;

  let calendar = useMemo(() => createCalendar(defaultResolvedOptions.calendar), [createCalendar, defaultResolvedOptions.calendar]);

  let [validSegments, setValidSegments] = useState(
    props.value || props.defaultValue ? {...EDITABLE_SEGMENTS} : {}
  );

  let opts = useMemo(() => {
    let keys = Object.keys(FIELD_OPTIONS);
    let startIdx = keys.indexOf(props.maxGranularity ?? 'year');
    if (startIdx < 0) {
      startIdx = 0;
    }

    let endIdx = keys.indexOf(props.granularity ?? 'day');
    if (endIdx < 0) {
      endIdx = 2;
    }

    if (startIdx > endIdx) {
      throw new Error('maxGranularity must be greater than granularity');
    }

    let opts: Intl.DateTimeFormatOptions = keys.slice(startIdx, endIdx + 1).reduce((opts, key) => {
      opts[key] = FIELD_OPTIONS[key];
      return opts;
    }, {});

    if (props.hourCycle != null) {
      opts.hour12 = props.hourCycle === 12;
    }

    opts.timeZone = timeZone;
    // opts.timeZoneName = 'short';

    return opts;
  }, [props.maxGranularity, props.granularity, props.hourCycle, timeZone]);

  let dateFormatter = useDateFormatter(opts);
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
  let [placeholderDate, setPlaceholderDate] = useState(toCalendar(toCalendarDateTime(props.placeholderDate ? props.placeholderDate : createPlaceholderDate(calendar, timeZone)), calendar));
  let [date, setDate] = useControlledState<CalendarDateTime>(
    props.value === null ? placeholderDate : toCalendar(toCalendarDateTime(props.value), calendar),
    props.defaultValue ? toCalendar(toCalendarDateTime(props.defaultValue), calendar) : null,
    value => {
      console.log(props.onChange, value)
      if (props.onChange) {
        let hasTime = props.granularity === 'hour' || props.granularity === 'minute' || props.granularity === 'second';
        let gregorianDate = toCalendar(value, new GregorianCalendar());
        props.onChange(hasTime ? gregorianDate : toCalendarDate(gregorianDate));
      }
    }
  );

  // Reset date and placeholder when calendar changes
  let lastCalendarIdentifier = useRef(calendar.identifier);
  useEffect(() => {
    if (calendar.identifier !== lastCalendarIdentifier.current) {
      setPlaceholderDate(placeholder => Object.keys(validSegments).length > 0 ? toCalendar(placeholder, calendar) : createPlaceholderDate(calendar, timeZone));
      setDate(date => Object.keys(validSegments).length >= numSegments ? toCalendar(date, calendar) : date);
      lastCalendarIdentifier.current = calendar.identifier;
    }
  }, [calendar, setDate]);

  // If all segments are valid, use the date from state, otherwise use the placeholder date.
  let value = Object.keys(validSegments).length >= numSegments ? date : placeholderDate;
  let setValue = (value: CalendarDateTime) => {
    if (Object.keys(validSegments).length >= numSegments) {
      setDate(value);
    } else {
      setPlaceholderDate(value);
    }
  };

  let dateValue = toDate(value, timeZone);
  let segments = dateFormatter.formatToParts(dateValue)
    .map(segment => ({
      type: TYPE_MAPPING[segment.type] || segment.type,
      text: segment.value,
      ...getSegmentLimits(value, segment.type, resolvedOptions),
      isPlaceholder: !validSegments[segment.type]
    } as DateSegment));

  let adjustSegment = (type: Intl.DateTimeFormatPartTypes, amount: number) => {
    validSegments[type] = true;
    if (type === 'year') {
      validSegments.era = true;
    }
    setValidSegments({...validSegments});
    setValue(addSegment(value, type, amount, resolvedOptions));
  };

  return {
    value,
    dateValue,
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
      if (part === 'year') {
        validSegments.era = true;
      }
      setValidSegments({...validSegments});
      setValue(setSegment(value, part, v, resolvedOptions));
    },
    confirmPlaceholder(part) {
      validSegments[part] = true;
      setValidSegments({...validSegments});
      setValue(value);
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

function addSegment(value: CalendarDateTime, part: string, amount: number, options: Intl.ResolvedDateTimeFormatOptions): CalendarDateTime {
  switch (part) {
    case 'era':
    case 'year':
    case 'month':
    case 'day':
      return cycleDate(value, part, amount, {round: part === 'year'});
    case 'dayPeriod': {
      let hours = value.hour;
      let isPM = hours >= 12;
      return setTime(value, {hour: isPM ? hours - 12 : hours + 12});
    }
    case 'hour':
    case 'minute':
    case 'second':
      return cycleTime(value, part, amount, {
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
      return set(value, {[part]: segmentValue});
    case 'dayPeriod': {
      let hours = value.hour;
      let wasPM = hours >= 12;
      let isPM = segmentValue >= 12;
      if (isPM === wasPM) {
        return value;
      }
      return setTime(value, {hour: wasPM ? hours - 12 : hours + 12});
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
      return setTime(value, {[part]: segmentValue});
  }
}

function createPlaceholderDate(calendar, timeZone) {
  return setTime(toCalendar(now(timeZone), calendar), {
    hour: 12,
    minute: 0,
    second: 0,
    millisecond: 0
  });
}
