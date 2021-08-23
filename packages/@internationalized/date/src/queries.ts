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
import {CalendarDate, ZonedDateTime} from './CalendarDate';
import {fromAbsolute, toAbsolute, toCalendar, toCalendarDate} from './conversion';
import {Mutable} from './utils';

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

export function isToday(date: AnyCalendarDate, timeZone: string): boolean {
  return isSameDay(date, today(timeZone));
}

export function getDayOfWeek(date: AnyCalendarDate) {
  let julian = date.calendar.toJulianDay(date);

  // If julian is negative, then julian % 7 will be negative, so we adjust
  // accordingly.  Julian day 0 is Monday.
  let dayOfWeek = Math.ceil((julian + 1)) % 7;
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

export function getLocalTimeZone(): string {
  // TODO: cache? but how to invalidate...
  return new Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function startOfMonth<T extends AnyCalendarDate>(date: T): T {
  let mutableDate: Mutable<T> = date.copy();
  // TODO: should this use getMinimumDayInMonth? That breaks Calendar...
  mutableDate.day = 1;
  return mutableDate;
}

export function endOfMonth<T extends AnyCalendarDate>(date: T): T {
  let mutableDate: Mutable<T> = date.copy();
  mutableDate.day = date.calendar.getDaysInMonth(date);
  return mutableDate;
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
