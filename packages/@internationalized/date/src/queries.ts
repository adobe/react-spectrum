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

export function isSameDay(a: AnyCalendarDate, b: AnyCalendarDate): boolean {
  b = toCalendar(b, a.calendar);
  return a.era === b.era && a.year === b.year && a.month === b.month && a.day === b.day;
}

export function isSameMonth(a: AnyCalendarDate, b: AnyCalendarDate): boolean {
  b = toCalendar(b, a.calendar);
  return a.era === b.era && a.year === b.year && a.month === b.month;
}

export function isSameYear(a: AnyCalendarDate, b: AnyCalendarDate): boolean {
  b = toCalendar(b, a.calendar);
  return a.era === b.era && a.year === b.year;
}

export function isEqualDay(a: AnyCalendarDate, b: AnyCalendarDate): boolean {
  return a.calendar.identifier === b.calendar.identifier && a.era === b.era && a.year === b.year && a.month === b.month && a.day === b.day;
}

export function isEqualMonth(a: AnyCalendarDate, b: AnyCalendarDate): boolean {
  return a.calendar.identifier === b.calendar.identifier && a.era === b.era && a.year === b.year && a.month === b.month;
}

export function isEqualYear(a: AnyCalendarDate, b: AnyCalendarDate): boolean {
  return a.calendar.identifier === b.calendar.identifier && a.era === b.era && a.year === b.year;
}

export function isToday(date: AnyCalendarDate, timeZone: string): boolean {
  return isSameDay(date, today(timeZone));
}

export function getDayOfWeek(date: AnyCalendarDate, locale: string) {
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

/* eslint-disable no-redeclare */
export function startOfMonth(date: ZonedDateTime): ZonedDateTime;
export function startOfMonth(date: CalendarDateTime): CalendarDateTime;
export function startOfMonth(date: CalendarDate): CalendarDate;
export function startOfMonth(date: CalendarDate | CalendarDateTime | ZonedDateTime): CalendarDate | CalendarDateTime | ZonedDateTime;
export function startOfMonth(date: CalendarDate | CalendarDateTime | ZonedDateTime) {
/* eslint-enable no-redeclare */
  return date.set({day: 1});
}

/* eslint-disable no-redeclare */
export function endOfMonth(date: ZonedDateTime): ZonedDateTime;
export function endOfMonth(date: CalendarDateTime): CalendarDateTime;
export function endOfMonth(date: CalendarDate): CalendarDate;
export function endOfMonth(date: CalendarDate | CalendarDateTime | ZonedDateTime): CalendarDate | CalendarDateTime | ZonedDateTime;
export function endOfMonth(date: CalendarDate | CalendarDateTime | ZonedDateTime) {
/* eslint-enable no-redeclare */
  return date.set({day: date.calendar.getDaysInMonth(date)});
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

/* eslint-disable no-redeclare */
export function startOfWeek(date: ZonedDateTime, locale: string): ZonedDateTime;
export function startOfWeek(date: CalendarDateTime, locale: string): CalendarDateTime;
export function startOfWeek(date: CalendarDate, locale: string): CalendarDate;
export function startOfWeek(date: CalendarDate | CalendarDateTime | ZonedDateTime, locale: string): CalendarDate | CalendarDateTime | ZonedDateTime;
export function startOfWeek(date: CalendarDate | CalendarDateTime | ZonedDateTime, locale: string) {
/* eslint-enable no-redeclare */
  let dayOfWeek = getDayOfWeek(date, locale);
  return date.subtract({days: dayOfWeek});
}

/* eslint-disable no-redeclare */
export function endOfWeek(date: ZonedDateTime, locale: string): ZonedDateTime;
export function endOfWeek(date: CalendarDateTime, locale: string): CalendarDateTime;
export function endOfWeek(date: CalendarDate, locale: string): CalendarDate;
export function endOfWeek(date: CalendarDate | CalendarDateTime | ZonedDateTime, locale: string) {
/* eslint-enable no-redeclare */
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

export function getWeeksInMonth(date: CalendarDate | CalendarDateTime | ZonedDateTime, locale: string) {
  let days = date.calendar.getDaysInMonth(date);
  return Math.ceil((getDayOfWeek(startOfMonth(date), locale) + days) / 7);
}
