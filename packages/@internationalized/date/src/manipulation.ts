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
import { toCalendarDateTime } from './conversion';
import {DateFields, Duration} from './types';
import {Mutable} from './utils';

/* eslint-disable no-redeclare */
export function add(date: CalendarDateTime, duration: Duration): CalendarDateTime;
export function add(date: CalendarDate, duration: Duration): CalendarDate;
export function add(date: CalendarDate | CalendarDateTime, duration: Duration): CalendarDate | CalendarDateTime {
/* eslint-enable no-redeclare */
  let mutableDate: Mutable<CalendarDate> = date.copy();
  let days = addTime(toCalendarDateTime(date), duration);

  addYears(mutableDate, duration.years || 0);
  mutableDate.month += duration.months || 0;

  balanceYearMonth(mutableDate);
  constrain(mutableDate);

  mutableDate.day += (duration.weeks || 0) * 7;
  mutableDate.day += duration.days || 0;
  mutableDate.day += days;

  balanceDay(mutableDate);

  if (mutableDate.calendar.balanceDate) {
    mutableDate.calendar.balanceDate(mutableDate);
  }

  return mutableDate;
}

function addYears(date: Mutable<CalendarDate>, years: number) {
  if (date.calendar.addYears) {
    date.calendar.addYears(date, years);
  } else {
    date.year += years;
  }
}

function balanceYearMonth(date: Mutable<CalendarDate>) {
  while (date.month < 1) {
    addYears(date, -1);
    date.month += date.calendar.getMonthsInYear(date);
  }

  let monthsInYear = 0;
  while (date.month > (monthsInYear = date.calendar.getMonthsInYear(date))) {
    addYears(date, 1);
    date.month -= monthsInYear;
  }
}

function balanceDay(date: Mutable<CalendarDate>) {
  while (date.day < 1) {
    date.month--;
    balanceYearMonth(date);
    date.day += date.calendar.getDaysInMonth(date);
  }

  while (date.day > date.calendar.getDaysInMonth(date)) {
    date.day -= date.calendar.getDaysInMonth(date);
    date.month++;
    balanceYearMonth(date);
  }
}

function balance(date: Mutable<CalendarDate>) {
  balanceYearMonth(date);
  balanceDay(date);

  if (date.calendar.balanceDate) {
    date.calendar.balanceDate(date);
  }
}

function constrain(date: Mutable<CalendarDate>) {
  date.month = Math.max(1, Math.min(date.calendar.getMonthsInYear(date), date.month));
  date.day = Math.max(1, Math.min(date.calendar.getDaysInMonth(date), date.day));
}

/* eslint-disable no-redeclare */
export function subtract(date: CalendarDateTime, duration: Duration): CalendarDateTime;
export function subtract(date: CalendarDate, duration: Duration): CalendarDate;
export function subtract(date: CalendarDate | CalendarDateTime, duration: Duration): CalendarDate | CalendarDateTime {
/* eslint-enable no-redeclare */
  let inverseDuration = {};
  for (let key in duration) {
    if (typeof duration[key] === 'number') {
      inverseDuration[key] = -duration[key];
    }
  }

  return add(date, inverseDuration);
}

/* eslint-disable no-redeclare */
export function set(date: CalendarDateTime, fields: DateFields, behavior?: 'balance' | 'constrain'): CalendarDateTime;
export function set(date: CalendarDate, fields: DateFields, behavior: 'balance' | 'constrain' = 'balance'): CalendarDate {
/* eslint-enable no-redeclare */
  let mutableDate: Mutable<CalendarDate> = date.copy();

  if (fields.era != null) {
    mutableDate.era = fields.era;
  }

  if (fields.year != null) {
    // mutableDate.year = fields.year;
    addYears(mutableDate, fields.year - mutableDate.year);
  }

  if (fields.month != null) {
    mutableDate.month = fields.month;
  }

  if (fields.day != null) {
    mutableDate.day = fields.day;
  }

  switch (behavior) {
    case 'balance':
      balance(mutableDate);
      break;
    case 'constrain':
      constrain(mutableDate);
      break;
    default:
      throw new Error(`Invalid behavior: ${behavior}. Must be either 'balance' or 'constrain'.`);
  }

  return mutableDate;
}

interface TimeFields {
  hour?: number,
  minute?: number,
  second?: number,
  millisecond?: number
}

/* eslint-disable no-redeclare */
export function setTime(value: CalendarDateTime, fields: TimeFields, behavior?: 'balance' | 'constrain'): CalendarDateTime;
export function setTime(value: Time, fields: TimeFields, behavior?: 'balance' | 'constrain'): Time {
/* eslint-enable no-redeclare */
  let mutableValue: Mutable<Time> = value.copy();

  if (fields.hour != null) {
    mutableValue.hour = fields.hour;
  }

  if (fields.minute != null) {
    mutableValue.minute = fields.minute;
  }

  if (fields.second != null) {
    mutableValue.second = fields.second;
  }

  if (fields.millisecond != null) {
    mutableValue.millisecond = fields.millisecond;
  }

  switch (behavior) {
    case 'balance': {
      let days = balanceTime(mutableValue);
      if (mutableValue instanceof CalendarDateTime) {
        // @ts-ignore
        mutableValue.day += days;
        balance(mutableValue);
      } else if (days > 0) {
        throw new Error('Hours cannot be greater than 24');
      }
      break;
    }
    case 'constrain':
      constrainTime(mutableValue);
      break;
  }

  return mutableValue;
}

function balanceTime(time: Mutable<Time>): number {
  time.second += Math.floor(time.millisecond / 1000);
  time.millisecond = nonNegativeMod(time.millisecond, 1000);

  time.minute += Math.floor(time.second / 60);
  time.second = nonNegativeMod(time.second, 60);

  time.hour += Math.floor(time.minute / 60);
  time.minute = nonNegativeMod(time.minute, 60);

  let days = Math.floor(time.hour / 24);
  time.hour = nonNegativeMod(time.hour, 24);

  return days;
}

function constrainTime(time: Mutable<Time>) {
  time.millisecond = Math.max(0, Math.min(time.millisecond, 1000));
  time.second = Math.max(0, Math.min(time.second, 59));
  time.minute = Math.max(0, Math.min(time.minute, 59));
  time.hour = Math.max(0, Math.min(time.hour, 23));
}

function nonNegativeMod(a: number, b: number) {
  let result = a % b;
  if (result < 0) {
    result += b;
  }
  return result;
}

function addTime(time: Mutable<Time>, duration: Duration): number {
  time.hour += duration.hours || 0;
  time.minute += duration.minutes || 0;
  time.second += duration.seconds || 0;
  time.millisecond += duration.milliseconds || 0;
  return balanceTime(time);
}

export function startOfMonth(date: CalendarDate): CalendarDate {
  let mutableDate: Mutable<CalendarDate> = date.copy();
  mutableDate.day = 1;
  return mutableDate;
}

export function endOfMonth(date: CalendarDate): CalendarDate {
  let mutableDate: Mutable<CalendarDate> = date.copy();
  mutableDate.day = date.calendar.getDaysInMonth(date);
  return mutableDate;
}

type DateField = keyof DateFields;
type TimeField = keyof TimeFields;

interface CycleDateOptions {
  /** Whether to round the field value to the nearest interval of the amount. */
  round?: boolean
}

interface CycleTimeOptions extends CycleDateOptions {
  /**
   * Whether to use 12 or 24 hour time. If 12 hour time is chosen, the resulting value
   * will remain in the same day period as the original value (e.g. if the value is AM,
   * the resulting value also be AM).
   * @default 24
   */
  hourCycle?: 12 | 24
}

/* eslint-disable no-redeclare */
export function cycleDate(value: CalendarDateTime, field: DateField, amount: number, options?: CycleDateOptions): CalendarDateTime;
export function cycleDate(value: CalendarDate, field: DateField, amount: number, options?: CycleDateOptions) {
/* eslint-enable no-redeclare */
  let mutable: Mutable<CalendarDate> = value.copy();

  switch (field) {
    case 'era': {
      let eras = value.calendar.getEras();
      let eraIndex = eras.indexOf(value.era);
      if (eraIndex < 0) {
        throw new Error('Invalid era: ' + value.era);
      }
      eraIndex = cycleValue(eraIndex, amount, 0, eras.length - 1, options?.round);
      mutable.era = eras[eraIndex];
      break;
    }
    case 'year': {
      // TODO: limit to min/max date of era?
      let year = cycleValue(value.year, amount, 1, value.calendar.getYearsInEra(value), options?.round);
      addYears(mutable, year - value.year);
      break;
    }
    case 'month':
      mutable.month = cycleValue(value.month, amount, 1, value.calendar.getMonthsInYear(value), options?.round);
      break;
    case 'day':
      mutable.day = cycleValue(value.day, amount, 1, value.calendar.getDaysInMonth(value), options?.round);
      break;
    default:
      throw new Error('Unsupported field ' + field);
  }

  if (mutable.calendar.balanceDate) {
    mutable.calendar.balanceDate(mutable);
  }

  return mutable;
}

/* eslint-disable no-redeclare */
export function cycleTime(value: CalendarDateTime, field: TimeField, amount: number, options?: CycleTimeOptions): CalendarDateTime;
export function cycleTime(value: Time, field: TimeField, amount: number, options?: CycleTimeOptions) {
/* eslint-enable no-redeclare */
  let mutable: Mutable<Time> = value.copy();

  switch (field) {
    case 'hour': {
      let hours = value.hour;
      let min = 0;
      let max = 23;
      if (options.hourCycle === 12) {
        let isPM = hours >= 12;
        min = isPM ? 12 : 0;
        max = isPM ? 23 : 11;
      }
      mutable.hour = cycleValue(hours, amount, min, max, options?.round);
      break;
    }
    case 'minute':
      mutable.minute = cycleValue(value.minute, amount, 0, 59, options?.round);
      break;
    case 'second':
      mutable.second = cycleValue(value.second, amount, 0, 59, options?.round);
      break;
    case 'millisecond':
      mutable.millisecond = cycleValue(value.millisecond, amount, 0, 999, options?.round);
      break;
    default:
      throw new Error('Unsupported field ' + field);
  }

  return mutable;
}

function cycleValue(value: number, amount: number, min: number, max: number, round = false) {
  if (round) {
    value += Math.sign(amount);

    if (value < min) {
      value = max;
    }

    let div = Math.abs(amount);
    if (amount > 0) {
      value = Math.ceil(value / div) * div;
    } else {
      value = Math.floor(value / div) * div;
    }

    if (value > max) {
      value = min;
    }
  } else {
    value += amount;
    if (value < min) {
      value = max - (min - value - 1);
    } else if (value > max) {
      value = min + (value - max - 1);
    }
  }

  return value;
}
