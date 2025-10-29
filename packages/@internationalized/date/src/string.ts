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

import {AnyDateTime, DateTimeDuration, Disambiguation} from './types';
import {CalendarDate, CalendarDateTime, Duration, Time, ZonedDateTime} from './CalendarDate';
import {epochFromDate, fromAbsolute, possibleAbsolutes, toAbsolute, toCalendar, toCalendarDateTime, toTimeZone} from './conversion';
import {getLocalTimeZone} from './queries';
import {GregorianCalendar} from './calendars/GregorianCalendar';
import {Mutable} from './utils';

const TIME_RE = /^(\d{2})(?::(\d{2}))?(?::(\d{2}))?(\.\d+)?$/;
const DATE_RE = /^([+-]\d{6}|\d{4})-(\d{2})-(\d{2})$/;
const DATE_TIME_RE = /^([+-]\d{6}|\d{4})-(\d{2})-(\d{2})(?:T(\d{2}))?(?::(\d{2}))?(?::(\d{2}))?(\.\d+)?$/;
const ZONED_DATE_TIME_RE = /^([+-]\d{6}|\d{4})-(\d{2})-(\d{2})(?:T(\d{2}))?(?::(\d{2}))?(?::(\d{2}))?(\.\d+)?(?:([+-]\d{2})(?::?(\d{2}))?(?::?(\d{2}))?)?\[(.*?)\]$/;
const ABSOLUTE_RE = /^([+-]\d{6}|\d{4})-(\d{2})-(\d{2})(?:T(\d{2}))?(?::(\d{2}))?(?::(\d{2}))?(\.\d+)?(?:(?:([+-]\d{2})(?::?(\d{2}))?)|Z)$/;
const DATE_TIME_DURATION_RE =
    /^((?<negative>-)|\+)?P((?<years>\d*[.,]?\d{1,9})Y)?((?<months>\d*[.,]?\d{1,9})M)?((?<weeks>\d*[.,]?\d{1,9})W)?((?<days>\d*[.,]?\d{1,9})D)?((?<time>T)((?<hours>\d*[.,]?\d{1,9})H)?((?<minutes>\d*[.,]?\d{1,9})M)?((?<seconds>\d*[.,]?\d{1,9})S)?)?$/;
const requiredDurationTimeGroups = ['hours', 'minutes', 'seconds'];
const requiredDurationGroups = ['years', 'months', 'weeks', 'days', ...requiredDurationTimeGroups];

/** Parses an ISO 8601 time string. */
export function parseTime(value: string): Time {
  let m = value.match(TIME_RE);
  if (!m) {
    throw new Error('Invalid ISO 8601 time string: ' + value);
  }

  return new Time(
    parseNumber(m[1], 0, 23),
    m[2] ? parseNumber(m[2], 0, 59) : 0,
    m[3] ? parseNumber(m[3], 0, 59) : 0,
    m[4] ? parseNumber(m[4], 0, Infinity) * 1000 : 0
  );
}

/** Parses an ISO 8601 date string, with no time components. */
export function parseDate(value: string): CalendarDate {
  let m = value.match(DATE_RE);
  if (!m) {
    if (ABSOLUTE_RE.test(value)) {
      throw new Error(`Invalid ISO 8601 date string: ${value}. Use parseAbsolute() instead.`);
    }
    throw new Error('Invalid ISO 8601 date string: ' + value);
  }

  let date: Mutable<CalendarDate> = new CalendarDate(
    parseNumber(m[1], 0, 9999),
    parseNumber(m[2], 1, 12),
    1
  );

  date.day = parseNumber(m[3], 1, date.calendar.getDaysInMonth(date));
  return date as CalendarDate;
}

/** Parses an ISO 8601 date and time string, with no time zone. */
export function parseDateTime(value: string): CalendarDateTime {
  let m = value.match(DATE_TIME_RE);
  if (!m) {
    if (ABSOLUTE_RE.test(value)) {
      throw new Error(`Invalid ISO 8601 date time string: ${value}. Use parseAbsolute() instead.`);
    }
    throw new Error('Invalid ISO 8601 date time string: ' + value);
  }

  let year = parseNumber(m[1], -9999, 9999);
  let era = year < 1 ? 'BC' : 'AD';

  let date: Mutable<CalendarDateTime> = new CalendarDateTime(
    era,
    year < 1 ? -year + 1 : year,
    parseNumber(m[2], 1, 12),
    1,
    m[4] ? parseNumber(m[4], 0, 23) : 0,
    m[5] ? parseNumber(m[5], 0, 59) : 0,
    m[6] ? parseNumber(m[6], 0, 59) : 0,
    m[7] ? parseNumber(m[7], 0, Infinity) * 1000 : 0
  );

  date.day = parseNumber(m[3], 0, date.calendar.getDaysInMonth(date));
  return date as CalendarDateTime;
}

/**
 * Parses an ISO 8601 date and time string with a time zone extension and optional UTC offset
 * (e.g. "2021-11-07T00:45[America/Los_Angeles]" or "2021-11-07T00:45-07:00[America/Los_Angeles]").
 * Ambiguous times due to daylight saving time transitions are resolved according to the `disambiguation`
 * parameter.
 */
export function parseZonedDateTime(value: string, disambiguation?: Disambiguation): ZonedDateTime {
  let m = value.match(ZONED_DATE_TIME_RE);
  if (!m) {
    throw new Error('Invalid ISO 8601 date time string: ' + value);
  }

  let year = parseNumber(m[1], -9999, 9999);
  let era = year < 1 ? 'BC' : 'AD';

  let date: Mutable<ZonedDateTime> = new ZonedDateTime(
    era,
    year < 1 ? -year + 1 : year,
    parseNumber(m[2], 1, 12),
    1,
    m[11],
    0,
    m[4] ? parseNumber(m[4], 0, 23) : 0,
    m[5] ? parseNumber(m[5], 0, 59) : 0,
    m[6] ? parseNumber(m[6], 0, 59) : 0,
    m[7] ? parseNumber(m[7], 0, Infinity) * 1000 : 0
  );

  date.day = parseNumber(m[3], 0, date.calendar.getDaysInMonth(date));

  let plainDateTime = toCalendarDateTime(date as ZonedDateTime);

  let ms: number;
  if (m[8]) {
    let hourOffset = parseNumber(m[8], -23, 23);
    date.offset = Math.sign(hourOffset) * (Math.abs(hourOffset) * 60 * 60 * 1000 + parseNumber(m[9] ?? '0', 0, 59) * 60 * 1000 + parseNumber(m[10] ?? '0', 0, 59) * 1000);
    ms = epochFromDate(date as ZonedDateTime) - date.offset;

    // Validate offset against parsed date.
    let absolutes = possibleAbsolutes(plainDateTime, date.timeZone);
    if (!absolutes.includes(ms)) {
      throw new Error(`Offset ${offsetToString(date.offset)} is invalid for ${dateTimeToString(date)} in ${date.timeZone}`);
    }
  } else {
    // Convert to absolute and back to fix invalid times due to DST.
    ms = toAbsolute(toCalendarDateTime(plainDateTime), date.timeZone, disambiguation);
  }

  return fromAbsolute(ms, date.timeZone);
}

/**
 * Parses an ISO 8601 date and time string with a UTC offset (e.g. "2021-11-07T07:45:00Z"
 * or "2021-11-07T07:45:00-07:00"). The result is converted to the provided time zone.
 */
export function parseAbsolute(value: string, timeZone: string): ZonedDateTime {
  let m = value.match(ABSOLUTE_RE);
  if (!m) {
    throw new Error('Invalid ISO 8601 date time string: ' + value);
  }

  let year = parseNumber(m[1], -9999, 9999);
  let era = year < 1 ? 'BC' : 'AD';

  let date: Mutable<ZonedDateTime> = new ZonedDateTime(
    era,
    year < 1 ? -year + 1 : year,
    parseNumber(m[2], 1, 12),
    1,
    timeZone,
    0,
    m[4] ? parseNumber(m[4], 0, 23) : 0,
    m[5] ? parseNumber(m[5], 0, 59) : 0,
    m[6] ? parseNumber(m[6], 0, 59) : 0,
    m[7] ? parseNumber(m[7], 0, Infinity) * 1000 : 0
  );

  date.day = parseNumber(m[3], 0, date.calendar.getDaysInMonth(date));

  if (m[8]) {
    date.offset = parseNumber(m[8], -23, 23) * 60 * 60 * 1000 + parseNumber(m[9] ?? '0', 0, 59) * 60 * 1000;
  }

  return toTimeZone(date as ZonedDateTime, timeZone);
}

/**
 * Parses an ISO 8601 date and time string with a UTC offset (e.g. "2021-11-07T07:45:00Z"
 * or "2021-11-07T07:45:00-07:00"). The result is converted to the user's local time zone.
 */
export function parseAbsoluteToLocal(value: string): ZonedDateTime {
  return parseAbsolute(value, getLocalTimeZone());
}

function parseNumber(value: string, min: number, max: number) {
  let val = Number(value);
  if (val < min || val > max) {
    throw new RangeError(`Value out of range: ${min} <= ${val} <= ${max}`);
  }

  return val;
}

export function timeToString(time: Time): string {
  return `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}:${String(time.second).padStart(2, '0')}${time.millisecond ? String(time.millisecond / 1000).slice(1) : ''}`;
}

export function dateToString(date: CalendarDate): string {
  let gregorianDate = toCalendar(date, new GregorianCalendar());
  let year: string;
  if (gregorianDate.era === 'BC') {
    year = gregorianDate.year === 1
      ? '0000'
      : '-' + String(Math.abs(1 - gregorianDate.year)).padStart(6, '00');
  } else {
    year = String(gregorianDate.year).padStart(4, '0');
  }
  return `${year}-${String(gregorianDate.month).padStart(2, '0')}-${String(gregorianDate.day).padStart(2, '0')}`;
}

export function dateTimeToString(date: AnyDateTime): string {
  // @ts-ignore
  return `${dateToString(date)}T${timeToString(date)}`;
}

function offsetToString(offset: number) {
  let sign = Math.sign(offset) < 0 ? '-' : '+';
  offset = Math.abs(offset);
  let offsetHours = Math.floor(offset / (60 * 60 * 1000));
  let offsetMinutes = Math.floor((offset % (60 * 60 * 1000)) / (60 * 1000));
  let offsetSeconds = Math.floor((offset % (60 * 60 * 1000)) % (60 * 1000) / 1000);
  let stringOffset = `${sign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;
  if (offsetSeconds !== 0) {
    stringOffset += `:${String(offsetSeconds).padStart(2, '0')}`;
  }

  return stringOffset;
}

export function zonedDateTimeToString(date: ZonedDateTime): string {
  return `${dateTimeToString(date)}${offsetToString(date.offset)}[${date.timeZone}]`;
}

function validateDurationDecimal(duration: DateTimeDuration): boolean {
  // Using fallthrough to make code concise.
  // Note: this wouldn't catch invalid strings such as `PT1.5H0M0S` during parse.
  switch (true) {
    case (duration.years || 0) % 1 !== 0:
      if (duration.months) { return false; }

    case (duration.months || 0) % 1 !== 0:
      if (duration.weeks) { return false; }

    case (duration.weeks || 0) % 1 !== 0:
      if (duration.days) { return false; }

    case (duration.days || 0) % 1 !== 0:
      if (duration.hours) { return false; }

    case (duration.hours || 0) % 1 !== 0:
      if (duration.minutes) { return false; }

    case (duration.minutes || 0) % 1 !== 0:
      if (duration.seconds || duration.milliseconds) { return false; }
  }

  return true;
}

/**
 * Parses an ISO 8601 duration string (e.g. "P3Y6M6W4DT12H30M5S").
 * @param value An ISO 8601 duration string.
 * @returns A DateTimeDuration object.
 */
export function parseDuration(value: string): Required<DateTimeDuration> {
  const match = value.match(DATE_TIME_DURATION_RE);

  if (!match) {
    throw new Error(`Invalid ISO 8601 Duration string: ${value}`);
  }

  const parseDurationGroup = (
    group: string | undefined,
    isNegative: boolean
  ): number => {
    if (!group) {
      return 0;
    }
    try {
      const sign = isNegative ? -1 : 1;
      return sign * Number(group.replace(',', '.'));
    } catch {
      throw new Error(`Invalid ISO 8601 Duration string: ${value}`);
    }
  };

  const isNegative = !!match.groups?.negative;

  const hasRequiredGroups = requiredDurationGroups.some(group => match.groups?.[group]);

  if (!hasRequiredGroups) {
    throw new Error(`Invalid ISO 8601 Duration string: ${value}`);
  }

  const durationStringIncludesTime = match.groups?.time;

  if (durationStringIncludesTime) {
    const hasRequiredDurationTimeGroups = requiredDurationTimeGroups.some(group => match.groups?.[group]);
    if (!hasRequiredDurationTimeGroups) {
      throw new Error(`Invalid ISO 8601 Duration string: ${value}`);
    }
  }

  const duration: Mutable<Required<DateTimeDuration>> = {
    years: parseDurationGroup(match.groups?.years, isNegative),
    months: parseDurationGroup(match.groups?.months, isNegative),
    weeks: parseDurationGroup(match.groups?.weeks, isNegative),
    days: parseDurationGroup(match.groups?.days, isNegative),
    hours: parseDurationGroup(match.groups?.hours, isNegative),
    minutes: parseDurationGroup(match.groups?.minutes, isNegative),
    seconds: parseDurationGroup(match.groups?.seconds, isNegative),
    milliseconds: 0
  };

  if (!validateDurationDecimal(duration)) {
    throw new Error(`Invalid ISO 8601 Duration string: ${value} - only the smallest unit can be fractional`);
  }

  return duration;
}

/**
 * Parses an ISO 8601 duration string (e.g. "P3Y6M6W4DT12H30M5S").
 * @param value An ISO 8601 duration string.
 * @returns A Duration object.
 */
export function parseTemporalDuration(value: string): Duration {
  const result = parseDuration(value);
  const nanoseconds = (result.milliseconds / 1e6) | 0;
  const microseconds = ((result.milliseconds - nanoseconds * 1e6) / 1e3) | 0;
  const milliseconds = result.milliseconds % 1e3;

  return new Duration(
    result.years,
    result.months,
    result.weeks,
    result.days,
    result.hours,
    result.minutes,
    result.seconds,
    milliseconds,
    microseconds,
    nanoseconds
  );
}

/**
 * Formats a DateTimeDuration to an ISO 8601 duration string (e.g. "P3Y6M6W4DT12H30M5S").
 * @param value A DateTimeDuration object.
 * @returns An ISO 8601 duration string.
 */
export function durationToString(duration: Duration, fractionalDigits: number | 'auto'): string {
  let durationString = 'P';
  let timeDurationString = 'T';

  if (duration.years) { durationString += `${duration.years}Y`; }
  if (duration.months) { durationString += `${duration.months}M`; }
  // Invalid per ISO 8601-1, but accepted by ISO 8601-2 used by Temporal
  if (duration.weeks) { durationString += `${duration.weeks}W`; }
  if (duration.days) { durationString += `${duration.days}D`; }

  if (duration.hours) { timeDurationString += `${duration.hours}H`; }
  if (duration.minutes) { timeDurationString += `${duration.minutes}M`; }

  const seconds = duration.seconds + (duration.milliseconds / 1e3) + (duration.microseconds / 1e6) + (duration.nanoseconds / 1e9);
  if (seconds || fractionalDigits !== 'auto') {
    timeDurationString += fractionalDigits !== 'auto'
      ? `${seconds.toFixed(fractionalDigits)}S`
      : `${seconds.toPrecision(9)}S`;
  }

  if (timeDurationString.length > 1) { durationString += timeDurationString; }

  // ISO 8601-1:2019 § 5.5.2.3 a) "[...] at least one number and its designator shall be present."
  // Picking day is arbitrary; it's the smallest unit that doesn't involve the time designator.
  // It seems Temporal would do `DT0S` instead, but this shouldn't matter (and involves annoying sub-second logic).
  if (durationString.length < 2) { durationString += '0D'; }

  return duration.sign < 0 ? `-${durationString}` : durationString;
}
