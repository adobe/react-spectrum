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

export type Mutable<T> = {
  -readonly[P in keyof T]: T[P]
};

export function mod(amount: number, numerator: number): number {
  return amount - numerator * Math.floor(amount / numerator);
}

export function copy(date: CalendarDate): Mutable<CalendarDate> {
  if (date.era) {
    return new CalendarDate(date.calendar, date.era, date.year, date.month, date.day);
  } else {
    return new CalendarDate(date.calendar, date.year, date.month, date.day);
  }
}

export function copyDateTime(date: CalendarDateTime): Mutable<CalendarDateTime> {
  if (date.era) {
    return new CalendarDateTime(date.calendar, date.era, date.year, date.month, date.day, date.hour, date.minute, date.second, date.millisecond);
  } else {
    return new CalendarDateTime(date.calendar, date.year, date.month, date.day, date.hour, date.minute, date.second);
  }
}
