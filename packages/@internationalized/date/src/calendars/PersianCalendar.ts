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

// Portions of the code in this file are based on code from ICU.
// Original licensing can be found in the NOTICE file in the root directory of this source tree.

import {AnyCalendarDate, Calendar} from '../types';
import {CalendarDate} from '../CalendarDate';
import {mod} from '../utils';

const PERSIAN_EPOCH = 1948320.5; // 622/03/19 Julian C.E.

function isLeapYear(year: number): boolean {
  return (
    ((((year - (year > 0 ? 474 : 473)) % 2820) + 474 + 38) * 682) % 2816 < 682
  );
}

function persianToJulianDay(year: number, month: number, day: number): number {
  let y0 = year > 0 ? year - 474 : year - 473;
  let y1 = mod(y0, 2820) + 474;
  let offset = month <= 7 ? 31 * (month - 1) : 30 * (month - 1) + 6;

  return (
    PERSIAN_EPOCH - 1 +
    1029983 * Math.floor(y0 / 2820) +
    Math.floor(((y1 * 682) - 110) / 2816) +
    365 * (y1 - 1) +
    Math.floor((31 * y1 - 5) / 128) +
    offset +
    day
  );
}

/**
 * The Persian calendar is the main calendar used in Iran and Afghanistan. It has 12 months
 * in each year, the first 6 of which have 31 days, and the next 5 have 30 days. The 12th month
 * has either 29 or 30 days depending on whether it is a leap year. The Persian year starts
 * around the March equinox.
 */
export class PersianCalendar implements Calendar {
  identifier = 'persian';

  fromJulianDay(jd: number): CalendarDate {
    let aux1, aux2;
    let d0 = jd - persianToJulianDay(475, 1, 1);
    let n2820 = Math.floor(d0 / 1029983);
    let d1 = mod(d0, 1029983);
    let y2820;

    if (d1 === 1029982) {
      y2820 = 2820;
    } else {
      aux1 = Math.floor(d1 / 366);
      aux2 = mod(d1, 366);
      y2820 = Math.floor(((2134 * aux1) + (2816 * aux2) + 2815) / 1028522) + aux1 + 1;
    }

    let year = 474 + 2820 * n2820 + y2820;
    if (year <= 0) {
      year--;
    }

    let yDay = jd - persianToJulianDay(year, 1, 1) + 1;
    let month = yDay <= 186 ? Math.ceil(yDay / 31) : Math.ceil((yDay - 6) / 30);
    let day = jd - persianToJulianDay(year, month, 1) + 1;

    return new CalendarDate(this, year, month, day);
  }

  toJulianDay(date: AnyCalendarDate): number {
    return persianToJulianDay(date.year, date.month, date.day);
  }

  getMonthsInYear(): number {
    return 12;
  }

  getDaysInMonth(date: AnyCalendarDate): number {
    let gregorianDaysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];

    if (date.month < 1 || date.month > 12) {
      throw new Error('$month Out Of Range Exception');
    }

    if (date.year && isLeapYear(date.year) && date.month === 12) {
      return 30;
    }

    return gregorianDaysInMonth[date.month - 1];
  }

  getEras() {
    return ['AP'];
  }

  getYearsInEra(): number {
    // 9378-10-10 persian is 9999-12-31 gregorian.
    // Round down to 9377 to set the maximum full year.
    return 9377;
  }
}
