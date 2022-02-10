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

import {AnyCalendarDate, AnyTime} from './types';
import {CalendarDate, CalendarDateTime, ZonedDateTime} from './CalendarDate';
import {fromAbsolute, toAbsolute, toCalendar, toCalendarDate} from './conversion';
import {weekStartData} from './weekStartData';

type DateValue = CalendarDate | CalendarDateTime | ZonedDateTime;

export function isSameDay(a: DateValue, b: DateValue): boolean {
  b = toCalendar(b, a.calendar);
  return a.era === b.era && a.year === b.year && a.month === b.month && a.day === b.day;
}

export function isSameMonth(a: DateValue, b: DateValue): boolean {
  b = toCalendar(b, a.calendar);
  // In the Japanese calendar, months can span multiple eras/years, so only compare the first of the month.
  a = startOfMonth(a);
  b = startOfMonth(b);
  return a.era === b.era && a.year === b.year && a.month === b.month;
}

export function isSameYear(a: DateValue, b: DateValue): boolean {
  b = toCalendar(b, a.calendar);
  a = startOfYear(a);
  b = startOfYear(b);
  return a.era === b.era && a.year === b.year;
}

export function isEqualDay(a: DateValue, b: DateValue): boolean {
  return a.calendar.identifier === b.calendar.identifier && a.era === b.era && a.year === b.year && a.month === b.month && a.day === b.day;
}

export function isEqualMonth(a: DateValue, b: DateValue): boolean {
  a = startOfMonth(a);
  b = startOfMonth(b);
  return a.calendar.identifier === b.calendar.identifier && a.era === b.era && a.year === b.year && a.month === b.month;
}

export function isEqualYear(a: DateValue, b: DateValue): boolean {
  a = startOfYear(a);
  b = startOfYear(b);
  return a.calendar.identifier === b.calendar.identifier && a.era === b.era && a.year === b.year;
}

export function isToday(date: DateValue, timeZone: string): boolean {
  return isSameDay(date, today(timeZone));
}

export function getDayOfWeek(date: DateValue, locale: string) {
  let julian = date.calendar.toJulianDay(date);

  // If julian is negative, then julian % 7 will be negative, so we adjust
  // accordingly.  Julian day 0 is Monday.
  let dayOfWeek = Math.ceil(julian + 1 - getWeekStart(locale)) % 7;
  if (dayOfWeek < 0) {
    dayOfWeek += 7;
  }

  return dayOfWeek;
}

export function now(timeZone: string): ZonedDateTime {
  return fromAbsolute(Date.now(), timeZone);
}

export function today(timeZone: string): CalendarDate {
  return toCalendarDate(now(timeZone));
}

export function compareDate(a: AnyCalendarDate, b: AnyCalendarDate): number {
  return a.calendar.toJulianDay(a) - b.calendar.toJulianDay(b);
}

export function compareTime(a: AnyTime, b: AnyTime): number {
  return timeToMs(a) - timeToMs(b);
}

function timeToMs(a: AnyTime): number {
  return a.hour * 60 * 60 * 1000 + a.minute * 60 * 1000 + a.second * 1000 + a.millisecond;
}

export function getHoursInDay(a: CalendarDate, timeZone: string): number {
  let ms = toAbsolute(a, timeZone);
  let tomorrow = a.add({days: 1});
  let tomorrowMs = toAbsolute(tomorrow, timeZone);
  return (tomorrowMs - ms) / 3600000;
}

let localTimeZone = null;
export function getLocalTimeZone(): string {
  // TODO: invalidate this somehow?
  if (localTimeZone == null) {
    localTimeZone = new Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  return localTimeZone;
}

export function startOfMonth(date: ZonedDateTime): ZonedDateTime;
export function startOfMonth(date: CalendarDateTime): CalendarDateTime;
export function startOfMonth(date: CalendarDate): CalendarDate;
export function startOfMonth(date: DateValue): DateValue;
export function startOfMonth(date: DateValue) {
  // Use `subtract` instead of `set` so we don't get constrained in an era.
  return date.subtract({days: date.day - 1});
}

export function endOfMonth(date: ZonedDateTime): ZonedDateTime;
export function endOfMonth(date: CalendarDateTime): CalendarDateTime;
export function endOfMonth(date: CalendarDate): CalendarDate;
export function endOfMonth(date: DateValue): DateValue;
export function endOfMonth(date: DateValue) {
  return date.add({days: date.calendar.getDaysInMonth(date) - date.day});
}

export function startOfYear(date: ZonedDateTime): ZonedDateTime;
export function startOfYear(date: CalendarDateTime): CalendarDateTime;
export function startOfYear(date: CalendarDate): CalendarDate;
export function startOfYear(date: DateValue): DateValue;
export function startOfYear(date: DateValue) {
  return startOfMonth(date.subtract({months: date.month - 1}));
}

export function endOfYear(date: ZonedDateTime): ZonedDateTime;
export function endOfYear(date: CalendarDateTime): CalendarDateTime;
export function endOfYear(date: CalendarDate): CalendarDate;
export function endOfYear(date: DateValue): DateValue;
export function endOfYear(date: DateValue) {
  return endOfMonth(date.add({months: date.calendar.getMonthsInYear(date) - date.month}));
}

export function getMinimumMonthInYear(date: AnyCalendarDate) {
  if (date.calendar.getMinimumMonthInYear) {
    return date.calendar.getMinimumMonthInYear(date);
  }

  return 1;
}

export function getMinimumDayInMonth(date: AnyCalendarDate) {
  if (date.calendar.getMinimumDayInMonth) {
    return date.calendar.getMinimumDayInMonth(date);
  }

  return 1;
}

export function startOfWeek(date: ZonedDateTime, locale: string): ZonedDateTime;
export function startOfWeek(date: CalendarDateTime, locale: string): CalendarDateTime;
export function startOfWeek(date: CalendarDate, locale: string): CalendarDate;
export function startOfWeek(date: DateValue, locale: string): DateValue;
export function startOfWeek(date: DateValue, locale: string) {
  let dayOfWeek = getDayOfWeek(date, locale);
  return date.subtract({days: dayOfWeek});
}

export function endOfWeek(date: ZonedDateTime, locale: string): ZonedDateTime;
export function endOfWeek(date: CalendarDateTime, locale: string): CalendarDateTime;
export function endOfWeek(date: CalendarDate, locale: string): CalendarDate;
export function endOfWeek(date: DateValue, locale: string) {
  return startOfWeek(date, locale).add({days: 6});
}

const cachedRegions = new Map<string, string>();

function getRegion(locale: string) {
  // If the Intl.Locale API is available, use it to get the region for the locale.
  // @ts-ignore
  if (Intl.Locale) {
    // Constructing an Intl.Locale is expensive, so cache the result.
    let region = cachedRegions.get(locale);
    if (!region) {
      // @ts-ignore
      region = new Intl.Locale(locale).maximize().region;
      cachedRegions.set(locale, region);
    }
    return region;
  }

  // If not, just try splitting the string.
  // If the second part of the locale string is 'u',
  // then this is a unicode extension, so ignore it.
  // Otherwise, it should be the region.
  let part = locale.split('-')[1];
  return part === 'u' ? null : part;
}

function getWeekStart(locale: string) {
  // TODO: use Intl.Locale for this once browsers support the weekInfo property
  // https://github.com/tc39/proposal-intl-locale-info
  let region = getRegion(locale);
  return weekStartData[region] || 0;
}

export function getWeeksInMonth(date: DateValue, locale: string) {
  let days = date.calendar.getDaysInMonth(date);
  return Math.ceil((getDayOfWeek(startOfMonth(date), locale) + days) / 7);
}

export function minDate<A extends DateValue, B extends DateValue>(a: A, b: B): A | B {
  return a.compare(b) <= 0 ? a : b;
}

export function maxDate<A extends DateValue, B extends DateValue>(a: A, b: B): A | B {
  return a.compare(b) >= 0 ? a : b;
}

const WEEKEND_DATA = {
  AF: [4, 5],
  AE: [5, 6],
  BH: [5, 6],
  DZ: [5, 6],
  EG: [5, 6],
  IL: [5, 6],
  IQ: [5, 6],
  IR: [5, 5],
  JO: [5, 6],
  KW: [5, 6],
  LY: [5, 6],
  OM: [5, 6],
  QA: [5, 6],
  SA: [5, 6],
  SD: [5, 6],
  SY: [5, 6],
  YE: [5, 6]
};

export function isWeekend(date: DateValue, locale: string) {
  let julian = date.calendar.toJulianDay(date);

  // If julian is negative, then julian % 7 will be negative, so we adjust
  // accordingly.  Julian day 0 is Monday.
  let dayOfWeek = Math.ceil(julian + 1) % 7;
  if (dayOfWeek < 0) {
    dayOfWeek += 7;
  }

  let region = getRegion(locale);
  // Use Intl.Locale for this once weekInfo is supported.
  // https://github.com/tc39/proposal-intl-locale-info
  let [start, end] = WEEKEND_DATA[region] || [6, 0];
  return dayOfWeek === start || dayOfWeek === end;
}

export function isWeekday(date: DateValue, locale: string) {
  return !isWeekend(date, locale);
}
