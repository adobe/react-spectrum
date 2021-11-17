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

import {Calendar, CalendarDateTime, DateFormatter, getMinimumDayInMonth, getMinimumMonthInYear, GregorianCalendar, toCalendar} from '@internationalized/date';
import {convertValue, createPlaceholderDate, FieldOptions, getFormatOptions, isInvalid, useDefaultProps} from './utils';
import {DatePickerProps, DateValue, Granularity} from '@react-types/datepicker';
import {useControlledState} from '@react-stately/utils';
import {useEffect, useMemo, useRef, useState} from 'react';
import {ValidationState} from '@react-types/shared';

export interface DateSegment {
  type: Intl.DateTimeFormatPartTypes,
  text: string,
  value?: number,
  minValue?: number,
  maxValue?: number,
  isPlaceholder: boolean,
  isEditable: boolean
}

export interface DatePickerFieldState {
  value: DateValue,
  dateValue: Date,
  setValue: (value: CalendarDateTime) => void,
  segments: DateSegment[],
  dateFormatter: DateFormatter,
  validationState: ValidationState,
  granularity: Granularity,
  increment: (type: Intl.DateTimeFormatPartTypes) => void,
  decrement: (type: Intl.DateTimeFormatPartTypes) => void,
  incrementPage: (type: Intl.DateTimeFormatPartTypes) => void,
  decrementPage: (type: Intl.DateTimeFormatPartTypes) => void,
  setSegment: (type: Intl.DateTimeFormatPartTypes, value: number) => void,
  confirmPlaceholder: (type?: Intl.DateTimeFormatPartTypes) => void,
  clearSegment: (type?: Intl.DateTimeFormatPartTypes) => void,
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

interface DatePickerFieldProps<T extends DateValue> extends DatePickerProps<T> {
  maxGranularity?: 'year' | 'month' | DatePickerProps<T>['granularity'],
  locale: string,
  createCalendar: (name: string) => Calendar
}

export function useDatePickerFieldState<T extends DateValue>(props: DatePickerFieldProps<T>): DatePickerFieldState {
  let {
    locale,
    createCalendar,
    hideTimeZone
  } = props;

  let v: DateValue = (props.value || props.defaultValue || props.placeholderValue);
  let [granularity, defaultTimeZone] = useDefaultProps(v, props.granularity);
  let timeZone = defaultTimeZone || 'UTC';

  // props.granularity must actually exist in the value if one is provided.
  if (v && !(granularity in v)) {
    throw new Error('Invalid granularity ' + granularity + ' for value ' + v.toString());
  }

  let formatOpts = useMemo(() => ({
    granularity,
    maxGranularity: props.maxGranularity ?? 'year',
    timeZone: defaultTimeZone,
    hideTimeZone,
    hourCycle: props.hourCycle
  }), [props.maxGranularity, granularity, props.hourCycle, defaultTimeZone, hideTimeZone]);
  let opts = useMemo(() => getFormatOptions({}, formatOpts), [formatOpts]);

  let dateFormatter = useMemo(() => new DateFormatter(locale, opts), [locale, opts]);
  let resolvedOptions = useMemo(() => dateFormatter.resolvedOptions(), [dateFormatter]);
  let calendar = useMemo(() => createCalendar(resolvedOptions.calendar), [createCalendar, resolvedOptions.calendar]);

  // Determine how many editable segments there are for validation purposes.
  // The result is cached for performance.
  let allSegments = useMemo(() =>
    dateFormatter.formatToParts(new Date())
      .filter(seg => EDITABLE_SEGMENTS[seg.type])
      .reduce((p, seg) => (p[seg.type] = true, p), {})
  , [dateFormatter]);

  let [validSegments, setValidSegments] = useState<Partial<typeof EDITABLE_SEGMENTS>>(
    () => props.value || props.defaultValue ? {...allSegments} : {}
  );

  // We keep track of the placeholder date separately in state so that onChange is not called
  // until all segments are set. If the value === null (not undefined), then assume the component
  // is controlled, so use the placeholder as the value until all segments are entered so it doesn't
  // change from uncontrolled to controlled and emit a warning.
  let [placeholderDate, setPlaceholderDate] = useState(
    () => createPlaceholderDate(props.placeholderValue, granularity, calendar, defaultTimeZone)
  );

  // Reset placeholder when calendar changes
  let lastCalendarIdentifier = useRef(calendar.identifier);
  useEffect(() => {
    if (calendar.identifier !== lastCalendarIdentifier.current) {
      lastCalendarIdentifier.current = calendar.identifier;
      setPlaceholderDate(placeholder =>
        Object.keys(validSegments).length > 0
          ? toCalendar(placeholder, calendar)
          : createPlaceholderDate(props.placeholderValue, granularity, calendar, defaultTimeZone)
      );
    }
  }, [calendar, granularity, validSegments, defaultTimeZone, props.placeholderValue]);

  let [value, setDate] = useControlledState<DateValue>(
    props.value,
    props.defaultValue,
    props.onChange
  );

  let calendarValue = useMemo(() => convertValue(value, calendar), [value, calendar]);

  // If there is a value prop, and some segments were previously placeholders, mark them all as valid.
  if (value && Object.keys(validSegments).length < Object.keys(allSegments).length) {
    validSegments = {...allSegments};
    setValidSegments(validSegments);
  }

  // If the value is set to null and all segments are valid, reset the placeholder.
  if (value == null && Object.keys(validSegments).length === Object.keys(allSegments).length) {
    validSegments = {};
    setValidSegments(validSegments);
    setPlaceholderDate(createPlaceholderDate(props.placeholderValue, granularity, calendar, defaultTimeZone));
  }

  // If all segments are valid, use the date from state, otherwise use the placeholder date.
  let displayValue = calendarValue && Object.keys(validSegments).length >= Object.keys(allSegments).length ? calendarValue : placeholderDate;
  let setValue = (newValue: DateValue) => {
    if (props.isDisabled || props.isReadOnly) {
      return;
    }

    if (Object.keys(validSegments).length >= Object.keys(allSegments).length) {
      // The display calendar should not have any effect on the emitted value.
      // Emit dates in the same calendar as the original value, if any, otherwise gregorian.
      newValue = toCalendar(newValue, v?.calendar || new GregorianCalendar());
      setDate(newValue);
    } else {
      setPlaceholderDate(newValue);
    }
  };

  let dateValue = useMemo(() => displayValue.toDate(timeZone), [displayValue, timeZone]);
  let segments = useMemo(() =>
    dateFormatter.formatToParts(dateValue)
      .map(segment => {
        let isEditable = EDITABLE_SEGMENTS[segment.type];
        if (segment.type === 'era' && calendar.getEras().length === 1) {
          isEditable = false;
        }

        return {
          type: TYPE_MAPPING[segment.type] || segment.type,
          text: segment.value,
          ...getSegmentLimits(displayValue, segment.type, resolvedOptions),
          isPlaceholder: EDITABLE_SEGMENTS[segment.type] && !validSegments[segment.type],
          isEditable
        } as DateSegment;
      })
  , [dateValue, validSegments, dateFormatter, resolvedOptions, displayValue, calendar]);

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
    setValue(addSegment(displayValue, type, amount, resolvedOptions));
  };

  let validationState: ValidationState = props.validationState ||
    (isInvalid(calendarValue, props.minValue, props.maxValue) ? 'invalid' : null);

  return {
    value: calendarValue,
    dateValue,
    setValue,
    segments,
    dateFormatter,
    validationState,
    granularity,
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
      setValue(setSegment(displayValue, part, v, resolvedOptions));
    },
    confirmPlaceholder(part) {
      if (props.isDisabled || props.isReadOnly) {
        return;
      }

      if (!part) {
        // Confirm the rest of the placeholder if any of the segments are valid.
        let numValid = Object.keys(validSegments).length;
        if (numValid > 0 && numValid < Object.keys(allSegments).length) {
          validSegments = {...allSegments};
          setValidSegments(validSegments);
          setValue(displayValue.copy());
        }
      } else if (!validSegments[part]) {
        markValid(part);
        setValue(displayValue.copy());
      }
    },
    clearSegment(part) {
      delete validSegments[part];
      setValidSegments({...validSegments});

      let placeholder = createPlaceholderDate(props.placeholderValue, granularity, calendar, defaultTimeZone);
      let value = displayValue;

      // Reset day period to default without changing the hour.
      if (part === 'dayPeriod' && 'hour' in displayValue && 'hour' in placeholder) {
        let isPM = displayValue.hour >= 12;
        let shouldBePM = placeholder.hour >= 12;
        if (isPM && !shouldBePM) {
          value = displayValue.set({hour: displayValue.hour - 12});
        } else if (!isPM && shouldBePM) {
          value = displayValue.set({hour: displayValue.hour + 12});
        }
      } else if (part in displayValue) {
        value = displayValue.set({[part]: placeholder[part]});
      }

      setDate(null);
      setValue(value);
    },
    getFormatOptions(fieldOptions: FieldOptions) {
      return getFormatOptions(fieldOptions, formatOpts);
    }
  };
}

function getSegmentLimits(date: DateValue, type: string, options: Intl.ResolvedDateTimeFormatOptions) {
  switch (type) {
    case 'era': {
      let eras = date.calendar.getEras();
      return {
        value: eras.indexOf(date.era),
        minValue: 0,
        maxValue: eras.length - 1
      };
    }
    case 'year':
      return {
        value: date.year,
        minValue: 1,
        maxValue: date.calendar.getYearsInEra(date)
      };
    case 'month':
      return {
        value: date.month,
        minValue: getMinimumMonthInYear(date),
        maxValue: date.calendar.getMonthsInYear(date)
      };
    case 'day':
      return {
        value: date.day,
        minValue: getMinimumDayInMonth(date),
        maxValue: date.calendar.getDaysInMonth(date)
      };
  }

  if ('hour' in date) {
    switch (type) {
      case 'dayPeriod':
        return {
          value: date.hour >= 12 ? 12 : 0,
          minValue: 0,
          maxValue: 12
        };
      case 'hour':
        if (options.hour12) {
          let isPM = date.hour >= 12;
          return {
            value: date.hour,
            minValue: isPM ? 12 : 0,
            maxValue: isPM ? 23 : 11
          };
        }

        return {
          value: date.hour,
          minValue: 0,
          maxValue: 23
        };
      case 'minute':
        return {
          value: date.minute,
          minValue: 0,
          maxValue: 59
        };
      case 'second':
        return {
          value: date.second,
          minValue: 0,
          maxValue: 59
        };
    }
  }

  return {};
}

function addSegment(value: DateValue, part: string, amount: number, options: Intl.ResolvedDateTimeFormatOptions) {
  switch (part) {
    case 'era':
    case 'year':
    case 'month':
    case 'day':
      return value.cycle(part, amount, {round: part === 'year'});
  }

  if ('hour' in value) {
    switch (part) {
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
}

function setSegment(value: DateValue, part: string, segmentValue: number, options: Intl.ResolvedDateTimeFormatOptions) {
  switch (part) {
    case 'day':
    case 'month':
    case 'year':
      return value.set({[part]: segmentValue});
  }

  if ('hour' in value) {
    switch (part) {
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
}
