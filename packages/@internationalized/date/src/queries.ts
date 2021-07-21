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

import {CalendarDate, CalendarDateTime} from './CalendarDate';
import {fromAbsolute, toCalendar, toCalendarDate} from './conversion';

export function isSameDay(a: CalendarDate, b: CalendarDate): boolean {
  b = toCalendar(b, a.calendar);
  return a.era === b.era && a.year === b.year && a.month === b.month && a.day === b.day;
}

export function isSameMonth(a: CalendarDate, b: CalendarDate): boolean {
  b = toCalendar(b, a.calendar);
  return a.era === b.era && a.year === b.year && a.month === b.month;
}

export function isSameYear(a: CalendarDate, b: CalendarDate): boolean {
  b = toCalendar(b, a.calendar);
  return a.era === b.era && a.year === b.year;
}

export function isToday(date: CalendarDate, timeZone: string): boolean {
  return isSameDay(date, today(timeZone));
}

export function getDayOfWeek(date: CalendarDate) {
  let julian = date.calendar.toJulianDay(date);

  // If julian is negative, then julian % 7 will be negative, so we adjust
  // accordingly.  Julian day 0 is Monday.
  let dayOfWeek = Math.ceil((julian + 1)) % 7;
  if (dayOfWeek < 0) {
    dayOfWeek += 7;
  }

  return dayOfWeek;
}

export function now(timeZone: string): CalendarDateTime {
  return fromAbsolute(Date.now(), timeZone);
}

export function today(timeZone: string): CalendarDate {
  return toCalendarDate(now(timeZone));
}

export function compare(a: CalendarDate, b: CalendarDate): number {
  return a.calendar.toJulianDay(a) - b.calendar.toJulianDay(b);
}
