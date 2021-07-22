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

import {CalendarDate, CalendarDateTime, Time} from './CalendarDate';
import { GregorianCalendar } from './calendars/GregorianCalendar';
import { toAbsolute, toCalendar } from './conversion';
import {Mutable} from './utils';

const TIME_RE = /^(\d{2})(?::(\d{2}))?(?::(\d{2}))?(?:\.(\d+))?$/;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATE_TIME_RE = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}))?(?::(\d{2}))?(?::(\d{2}))?(?:\.(\d+))?$/;

export function parseTime(value: string): Time {
  let m = value.match(TIME_RE);
  if (!m) {
    throw new Error('Invalid ISO 8601 time string: ' + value);
  }

  return new Time(
    parseNumber(m[1], 0, 23),
    m[2] ? parseNumber(m[2], 0, 59) : 0,
    m[3] ? parseNumber(m[3], 0, 59) : 0,
    m[4] ? parseNumber(m[4], 0, Infinity) : 0
  );
}

export function parseDate(value: string): CalendarDate {
  let m = value.match(DATE_RE);
  if (!m) {
    throw new Error('Invalid ISO 8601 date string: ' + value);
  }

  let date: Mutable<CalendarDate> = new CalendarDate(
    parseNumber(m[1], 0, 9999),
    parseNumber(m[2], 1, 12),
    1
  );

  date.day = parseNumber(m[3], 0, date.calendar.getDaysInMonth(date));
  return date;
}

export function parseDateTime(value: string): CalendarDateTime {
  let m = value.match(DATE_TIME_RE);
  if (!m) {
    throw new Error('Invalid ISO 8601 date time string: ' + value);
  }

  let date: Mutable<CalendarDateTime> = new CalendarDateTime(
    parseNumber(m[1], 1, 9999),
    parseNumber(m[2], 1, 12),
    1,
    m[4] ? parseNumber(m[4], 0, 23) : 0,
    m[2] ? parseNumber(m[5], 0, 59) : 0,
    m[3] ? parseNumber(m[6], 0, 59) : 0,
    m[4] ? parseNumber(m[7], 0, Infinity) : 0
  );

  date.day = parseNumber(m[3], 0, date.calendar.getDaysInMonth(date));
  return date;
}

function parseNumber(value: string, min: number, max: number) {
  let val = Number(value);
  if (val < min || val > max) {
    throw new RangeError(`Value out of range: ${min} <= ${val} <= ${max}`);
  }

  return val;
}

export function timeToString(time: Time): string {
  return `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}:${String(time.second).padStart(2, '0')}${time.millisecond ? '.' + time.millisecond : ''}`;
}

export function dateToString(date: CalendarDate): string {
  let gregorianDate = toCalendar(date, new GregorianCalendar());
  return `${String(gregorianDate.year).padStart(4, '0')}-${String(gregorianDate.month).padStart(2, '0')}-${String(gregorianDate.day).padStart(2, '0')}`;
}

export function dateTimeToString(date: CalendarDateTime): string {
  return `${dateToString(date)}T${timeToString(date)}`;
}

export function toAbsoluteString(date: CalendarDateTime, timeZone: string) {
  return new Date(toAbsolute(date, timeZone)).toISOString();
}
