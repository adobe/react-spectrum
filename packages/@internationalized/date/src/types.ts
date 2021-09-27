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

import {CalendarDate} from './CalendarDate';

export interface AnyCalendarDate {
  readonly calendar: Calendar,
  readonly era: string,
  readonly year: number,
  readonly month: number,
  readonly day: number,
  copy(): this
}

export interface AnyTime {
  readonly hour: number,
  readonly minute: number,
  readonly second: number,
  readonly millisecond: number,
  copy(): this
}

export interface AnyDateTime extends AnyCalendarDate, AnyTime {}

export interface Calendar {
  identifier: string,

  fromJulianDay(jd: number): CalendarDate,
  toJulianDay(date: AnyCalendarDate): number,

  getDaysInMonth(date: AnyCalendarDate): number,
  getMonthsInYear(date: AnyCalendarDate): number,
  getYearsInEra(date: AnyCalendarDate): number,
  getEras(): string[],

  getMinimumMonthInYear?(date: AnyCalendarDate): number,
  getMinimumDayInMonth?(date: AnyCalendarDate): number,

  balanceDate?(date: AnyCalendarDate): void,
  balanceYearMonth?(date: AnyCalendarDate, previousDate: AnyCalendarDate): void,
  getYearsToAdd?(date: AnyCalendarDate, years: number): number,
  constrainDate?(date: AnyCalendarDate): void
}

export interface Duration {
  years?: number,
  months?: number,
  weeks?: number,
  days?: number,
  hours?: number,
  minutes?: number,
  seconds?: number,
  milliseconds?: number
}

export interface DateFields {
  era?: string,
  year?: number,
  month?: number,
  day?: number
}

export interface TimeFields {
  hour?: number,
  minute?: number,
  second?: number,
  millisecond?: number
}

export type DateField = keyof DateFields;
export type TimeField = keyof TimeFields;

export type Disambiguation = 'compatible' | 'earlier' | 'later' | 'reject';

export interface CycleOptions {
  /** Whether to round the field value to the nearest interval of the amount. */
  round?: boolean
}

export interface CycleTimeOptions extends CycleOptions {
  /**
   * Whether to use 12 or 24 hour time. If 12 hour time is chosen, the resulting value
   * will remain in the same day period as the original value (e.g. if the value is AM,
   * the resulting value also be AM).
   * @default 24
   */
  hourCycle?: 12 | 24
}
