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

import {Calendar, CalendarIdentifier, DateFormatter, GregorianCalendar, isEqualCalendar, toCalendar} from '@internationalized/date';
import {convertValue, createPlaceholderDate, FieldOptions, FormatterOptions, getFormatOptions, getValidationResult, useDefaultProps} from './utils';
import {DatePickerProps, DateValue, Granularity, MappedDateValue} from '@react-types/datepicker';
import {FormValidationState, useFormValidationState} from '@react-stately/form';
import {getPlaceholder} from './placeholders';
import {IncompleteDate} from './IncompleteDate';
import {NumberFormatter} from '@internationalized/number';
import {useControlledState} from '@react-stately/utils';
import {useMemo, useState} from 'react';
import {ValidationState} from '@react-types/shared';

export type SegmentType = 'era' | 'year' | 'month' | 'day' |  'hour' | 'minute' | 'second' | 'dayPeriod' | 'literal' | 'timeZoneName';
export interface DateSegment {
  /** The type of segment. */
  type: SegmentType,
  /** The formatted text for the segment. */
  text: string,
  /** The numeric value for the segment, if applicable. */
  value?: number | null,
  /** The minimum numeric value for the segment, if applicable. */
  minValue?: number,
  /** The maximum numeric value for the segment, if applicable. */
  maxValue?: number,
  /** Whether the value is a placeholder. */
  isPlaceholder: boolean,
  /** A placeholder string for the segment. */
  placeholder: string,
  /** Whether the segment is editable. */
  isEditable: boolean
}

export interface DateFieldState extends FormValidationState {
  /** The current field value. */
  value: DateValue | null,
  /** The default field value. */
  defaultValue: DateValue | null,
  /** The current value, converted to a native JavaScript `Date` object.  */
  dateValue: Date,
  /** The calendar system currently in use. */
  calendar: Calendar,
  /** Sets the field's value. */
  setValue(value: DateValue | null): void,
  /** A list of segments for the current value. */
  segments: DateSegment[],
  /** A date formatter configured for the current locale and format. */
  dateFormatter: DateFormatter,
  /**
   * The current validation state of the date field, based on the `validationState`, `minValue`, and `maxValue` props.
   * @deprecated Use `isInvalid` instead.
   */
  validationState: ValidationState | null,
  /** Whether the date field is invalid, based on the `isInvalid`, `minValue`, and `maxValue` props. */
  isInvalid: boolean,
  /** The granularity for the field, based on the `granularity` prop and current value. */
  granularity: Granularity,
  /** The maximum date or time unit that is displayed in the field. */
  maxGranularity: 'year' | 'month' | Granularity,
  /** Whether the field is disabled. */
  isDisabled: boolean,
  /** Whether the field is read only. */
  isReadOnly: boolean,
  /** Whether the field is required. */
  isRequired: boolean,
  /** Increments the given segment. Upon reaching the minimum or maximum value, the value wraps around to the opposite limit. */
  increment(type: SegmentType): void,
  /** Decrements the given segment. Upon reaching the minimum or maximum value, the value wraps around to the opposite limit. */
  decrement(type: SegmentType): void,
  /**
   * Increments the given segment by a larger amount, rounding it to the nearest increment.
   * The amount to increment by depends on the field, for example 15 minutes, 7 days, and 5 years.
   * Upon reaching the minimum or maximum value, the value wraps around to the opposite limit.
   */
  incrementPage(type: SegmentType): void,
  /**
   * Decrements the given segment by a larger amount, rounding it to the nearest increment.
   * The amount to decrement by depends on the field, for example 15 minutes, 7 days, and 5 years.
   * Upon reaching the minimum or maximum value, the value wraps around to the opposite limit.
   */
  decrementPage(type: SegmentType): void,
  /** Increments the given segment to its maxiumum value. */
  incrementToMax(type: SegmentType): void,
  /** Decrements the given segment to its minimum value. */
  decrementToMin(type: SegmentType): void,
  /** Sets the value of the given segment. */
  setSegment(type: 'era', value: string): void,
  setSegment(type: SegmentType, value: number): void,
  /** Updates the remaining unfilled segments with the placeholder value. */
  confirmPlaceholder(): void,
  /** Clears the value of the given segment, reverting it to the placeholder. */
  clearSegment(type: SegmentType): void,
  /** Formats the current date value using the given options. */
  formatValue(fieldOptions: FieldOptions): string,
  /** Gets a formatter based on state's props. */
  getDateFormatter(locale: string, formatOptions: FormatterOptions): DateFormatter
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

const TYPE_MAPPING = {
  // Node seems to convert everything to lowercase...
  dayperiod: 'dayPeriod',
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/formatToParts#named_years
  relatedYear: 'year',
  yearName: 'literal', // not editable
  unknown: 'literal'
};

export interface DateFieldStateOptions<T extends DateValue = DateValue> extends DatePickerProps<T> {
  /**
   * The maximum unit to display in the date field.
   * @default 'year'
   */
  maxGranularity?: 'year' | 'month' | Granularity,
  /** The locale to display and edit the value according to. */
  locale: string,
  /**
   * A function that creates a [Calendar](../internationalized/date/Calendar.html)
   * object for a given calendar identifier. Such a function may be imported from the
   * `@internationalized/date` package, or manually implemented to include support for
   * only certain calendars.
   */
  createCalendar: (name: CalendarIdentifier) => Calendar
}

/**
 * Provides state management for a date field component.
 * A date field allows users to enter and edit date and time values using a keyboard.
 * Each part of a date value is displayed in an individually editable segment.
 */
export function useDateFieldState<T extends DateValue = DateValue>(props: DateFieldStateOptions<T>): DateFieldState {
  let {
    locale,
    createCalendar,
    hideTimeZone,
    isDisabled = false,
    isReadOnly = false,
    isRequired = false,
    minValue,
    maxValue,
    isDateUnavailable
  } = props;

  let v: DateValue | null = props.value || props.defaultValue || props.placeholderValue || null;
  let [granularity, defaultTimeZone] = useDefaultProps(v, props.granularity);
  let timeZone = defaultTimeZone || 'UTC';

  // props.granularity must actually exist in the value if one is provided.
  if (v && !(granularity in v)) {
    throw new Error('Invalid granularity ' + granularity + ' for value ' + v.toString());
  }

  // Resolve default hour cycle and calendar system.
  let [calendar, hourCycle] = useMemo(() => {
    let formatter = new DateFormatter(locale, {
      dateStyle: 'short',
      timeStyle: 'short',
      hour12: props.hourCycle != null ? props.hourCycle === 12 : undefined
    });
    let opts = formatter.resolvedOptions();
    let calendar = createCalendar(opts.calendar as CalendarIdentifier);
    return [calendar, opts.hourCycle!];
  }, [locale, props.hourCycle, createCalendar]);

  let [value, setDate] = useControlledState<DateValue | null, MappedDateValue<T> | null>(
    props.value,
    props.defaultValue ?? null,
    props.onChange
  );

  let [initialValue] = useState(value);
  let calendarValue = useMemo(() => convertValue(value, calendar) ?? null, [value, calendar]);
  let [displayValue, setDisplayValue] = useState(
    () => new IncompleteDate(calendar, hourCycle, calendarValue)
  );

  let showEra = calendar.identifier === 'gregory' && displayValue.era === 'BC';
  let formatOpts = useMemo(() => ({
    granularity,
    maxGranularity: props.maxGranularity ?? 'year',
    timeZone: defaultTimeZone,
    hideTimeZone,
    hourCycle: props.hourCycle,
    showEra,
    shouldForceLeadingZeros: props.shouldForceLeadingZeros
  }), [props.maxGranularity, granularity, props.hourCycle, props.shouldForceLeadingZeros, defaultTimeZone, hideTimeZone, showEra]);
  let opts = useMemo(() => getFormatOptions({}, formatOpts), [formatOpts]);

  let dateFormatter = useMemo(() => new DateFormatter(locale, opts), [locale, opts]);
  let resolvedOptions = useMemo(() => dateFormatter.resolvedOptions(), [dateFormatter]);
  let placeholder = useMemo(() => createPlaceholderDate(props.placeholderValue, granularity, calendar, defaultTimeZone), [props.placeholderValue, granularity, calendar, defaultTimeZone]);
  let displaySegments = useMemo(() => {
    let is12HourClock = hourCycle === 'h11' || hourCycle === 'h12';
    let segments: SegmentType[] = ['era', 'year', 'month', 'day', 'hour', ...(is12HourClock ? ['dayPeriod' as const] : []), 'minute', 'second'];
    let minIndex = segments.indexOf(props.maxGranularity || 'era');
    let maxIndex = segments.indexOf(granularity === 'hour' && is12HourClock ? 'dayPeriod' : granularity);
    return segments.slice(minIndex, maxIndex + 1);
  }, [props.maxGranularity, granularity, hourCycle]);

  let [lastValue, setLastValue] = useState(calendarValue);
  let [lastCalendar, setLastCalendar] = useState(calendar);
  let [lastHourCycle, setLastHourCycle] = useState(hourCycle);
  if (calendarValue !== lastValue || hourCycle !== lastHourCycle || !isEqualCalendar(calendar, lastCalendar)) {
    displayValue = new IncompleteDate(calendar, hourCycle, calendarValue);
    setLastValue(calendarValue);
    setLastCalendar(calendar);
    setLastHourCycle(hourCycle);
    setDisplayValue(displayValue);
  }

  let setValue = (newValue: DateValue | IncompleteDate | null) => {
    if (props.isDisabled || props.isReadOnly) {
      return;
    }

    if (newValue == null || (newValue instanceof IncompleteDate && newValue.isCleared(displaySegments))) {
      setDisplayValue(new IncompleteDate(calendar, hourCycle, calendarValue));
      setDate(null);
    } else if (!(newValue instanceof IncompleteDate)) {
      // The display calendar should not have any effect on the emitted value.
      // Emit dates in the same calendar as the original value, if any, otherwise gregorian.
      newValue = toCalendar(newValue, v?.calendar || new GregorianCalendar());
      setDisplayValue(new IncompleteDate(calendar, hourCycle, calendarValue));
      setDate(newValue);
    } else {
      // If the new value is complete and valid, trigger onChange eagerly.
      // If it represents an incomplete or invalid value (e.g. February 30th),
      // wait until the field is blurred to trigger onChange.
      if (newValue.isComplete(displaySegments)) {
        let dateValue = newValue.toValue(calendarValue ?? placeholder);
        if (newValue.validate(dateValue, displaySegments)) {
          let newDateValue = toCalendar(dateValue, v?.calendar || new GregorianCalendar());
          if (!value || newDateValue.compare(value) !== 0) {
            setDisplayValue(new IncompleteDate(calendar, hourCycle, calendarValue)); // reset in case prop isn't updated
            setDate(newDateValue);
            return;
          }
        }
      }

      // Incomplete/invalid value. Set temporary display override.
      setDisplayValue(newValue);
    }
  };

  let dateValue = useMemo(() => {
    let v = displayValue.toValue(calendarValue ?? placeholder);
    return v.toDate(timeZone);
  }, [displayValue, timeZone, calendarValue, placeholder]);

  let segments = useMemo(
    () => processSegments(dateValue, displayValue, dateFormatter, resolvedOptions, calendar, locale, granularity),
    [dateValue, dateFormatter, resolvedOptions, displayValue, calendar, locale, granularity]
  );

  let adjustSegment = (type: SegmentType, amount: number) => {
    setValue(displayValue.cycle(type, amount, placeholder, displaySegments));
  };

  let builtinValidation = useMemo(() => getValidationResult(
    value,
    minValue,
    maxValue,
    isDateUnavailable,
    formatOpts
  ), [value, minValue, maxValue, isDateUnavailable, formatOpts]);

  let validation = useFormValidationState({
    ...props,
    value: value as MappedDateValue<T> | null,
    builtinValidation
  });

  let isValueInvalid = validation.displayValidation.isInvalid;
  let validationState: ValidationState | null = props.validationState || (isValueInvalid ? 'invalid' : null);

  return {
    ...validation,
    value: calendarValue,
    defaultValue: props.defaultValue ?? initialValue,
    dateValue,
    calendar,
    setValue,
    segments,
    dateFormatter,
    validationState,
    isInvalid: isValueInvalid,
    granularity,
    maxGranularity: props.maxGranularity ?? 'year',
    isDisabled,
    isReadOnly,
    isRequired,
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
    incrementToMax(part) {
      let maxValue = part === 'hour' && hourCycle === 'h12'
        ? 11
        : displayValue.getSegmentLimits(part)!.maxValue;
      setValue(displayValue.set(part, maxValue, placeholder));
    },
    decrementToMin(part) {
      let minValue = part === 'hour' && hourCycle === 'h12'
        ? 12
        : displayValue.getSegmentLimits(part)!.minValue;
      setValue(displayValue.set(part, minValue, placeholder));
    },
    setSegment(part, v: string | number) {
      setValue(displayValue.set(part, v, placeholder));
    },
    confirmPlaceholder() {
      if (props.isDisabled || props.isReadOnly) {
        return;
      }

      // If the display value is complete but invalid, we need to constrain it and emit onChange on blur.
      if (displayValue.isComplete(displaySegments)) {
        let dateValue = displayValue.toValue(calendarValue ?? placeholder);
        let newDateValue = toCalendar(dateValue, v?.calendar || new GregorianCalendar());
        if (!value || newDateValue.compare(value) !== 0) {
          setDate(newDateValue);
        }
        setDisplayValue(new IncompleteDate(calendar, hourCycle, calendarValue));
      }
    },
    clearSegment(part) {
      let value = displayValue;

      if (part !== 'timeZoneName' && part !== 'literal') {
        value = displayValue.clear(part);
      }

      setValue(value);
    },
    formatValue(fieldOptions: FieldOptions) {
      if (!calendarValue) {
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

function processSegments(
  dateValue: Date,
  displayValue: IncompleteDate,
  dateFormatter: Intl.DateTimeFormat,
  resolvedOptions: Intl.ResolvedDateTimeFormatOptions,
  calendar: Calendar,
  locale: string,
  granularity: Granularity
) : DateSegment[] {
  let timeValue = ['hour', 'minute', 'second'];
  let segments = dateFormatter.formatToParts(dateValue);

  // In order to allow formatting temporarily invalid dates during editing (e.g. February 30th),
  // use a NumberFormatter to manually format segments directly from raw numbers.
  // When the user blurs the date field, the invalid segments will be constrained.
  let numberFormatter = new NumberFormatter(locale, {useGrouping: false});
  let twoDigitFormatter = new NumberFormatter(locale, {useGrouping: false, minimumIntegerDigits: 2});
  for (let segment of segments) {
    if (segment.type === 'year' || segment.type === 'month' || segment.type === 'day' || segment.type === 'hour') {
      let value = displayValue[segment.type] ?? 0;
      if (resolvedOptions[segment.type] === '2-digit') {
        segment.value = twoDigitFormatter.format(value);
      } else {
        segment.value = numberFormatter.format(value);
      }
    }
  }

  let processedSegments: DateSegment[] = [];
  for (let segment of segments) {
    let type = TYPE_MAPPING[segment.type] || segment.type;
    let isEditable = EDITABLE_SEGMENTS[type];
    if (type === 'era' && calendar.getEras().length === 1) {
      isEditable = false;
    }

    let isPlaceholder = EDITABLE_SEGMENTS[type] && displayValue[segment.type] == null;
    let placeholder = EDITABLE_SEGMENTS[type] ? getPlaceholder(type, segment.value, locale) : null;

    let dateSegment = {
      type,
      text: isPlaceholder ? placeholder : segment.value,
      ...displayValue.getSegmentLimits(type),
      isPlaceholder,
      placeholder,
      isEditable
    } as DateSegment;

    // There is an issue in RTL languages where time fields render (minute:hour) instead of (hour:minute).
    // To force an LTR direction on the time field since, we wrap the time segments in LRI (left-to-right) isolate unicode. See https://www.w3.org/International/questions/qa-bidi-unicode-controls.
    // These unicode characters will be added to the array of processed segments as literals and will mark the start and end of the embedded direction change.
    if (type === 'hour') {
      // This marks the start of the embedded direction change.
      processedSegments.push({
        type: 'literal',
        text: '\u2066',
        isPlaceholder: false,
        placeholder: '',
        isEditable: false
      });
      processedSegments.push(dateSegment);
      // This marks the end of the embedded direction change in the case that the granularity it set to "hour".
      if (type === granularity) {
        processedSegments.push({
          type: 'literal',
          text: '\u2069',
          isPlaceholder: false,
          placeholder: '',
          isEditable: false
        });
      }
    } else if (timeValue.includes(type) && type === granularity) {
      processedSegments.push(dateSegment);
      // This marks the end of the embedded direction change.
      processedSegments.push({
        type: 'literal',
        text: '\u2069',
        isPlaceholder: false,
        placeholder: '',
        isEditable: false
      });
    } else {
      // We only want to "wrap" the unicode around segments that are hour, minute, or second. If they aren't, just process as normal.
      processedSegments.push(dateSegment);
    }
  }

  return processedSegments;
}
