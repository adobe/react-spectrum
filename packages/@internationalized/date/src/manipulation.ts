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
import {copy, Mutable} from './utils';
import {DateFields, Duration} from './types';

export function add(date: CalendarDate, duration: Duration): CalendarDate {
  let mutableDate = copy(date);
  addYears(mutableDate, duration.years || 0);
  mutableDate.month += duration.months || 0;

  balanceYearMonth(mutableDate);
  constrain(mutableDate);

  mutableDate.day += (duration.weeks || 0) * 7;
  mutableDate.day += duration.days || 0;

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

export function subtract(date: CalendarDate, duration: Duration): CalendarDate {
  let inverseDuration = {};
  for (let key in duration) {
    if (typeof duration[key] === 'number') {
      inverseDuration[key] = -duration[key];
    }
  }

  return add(date, inverseDuration);
}

export function set(date: CalendarDate, fields: DateFields, behavior: 'balance' | 'constrain' = 'balance'): CalendarDate {
  let mutableDate = copy(date);

  if (fields.year != null) {
    mutableDate.year = fields.year;
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

export function startOfMonth(date: CalendarDate): CalendarDate {
  let mutableDate = copy(date);
  mutableDate.day = 1;
  return mutableDate;
}

export function endOfMonth(date: CalendarDate): CalendarDate {
  let mutableDate = copy(date);
  mutableDate.day = date.calendar.getDaysInMonth(date);
  return mutableDate;
}
