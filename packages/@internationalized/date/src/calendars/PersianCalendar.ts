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

const PERSIAN_EPOCH = 1948321; // 622/03/19 Julian C.E.

function isLeapYear(year: number): boolean {
  let y0 = year > 0 ? year - 474 : year - 473;
  let y1 = mod(y0, 2820) + 474;

  return mod((y1 + 38) * 31, 128) < 31;
}

function persianToJulianDay(year: number, month: number, day: number): number {
  let y0 = year > 0 ? year - 474 : year - 473;
  let y1 = mod(y0, 2820) + 474;
  let offset = month <= 7 ? 31 * (month - 1) : 30 * (month - 1) + 6;

  return (
    PERSIAN_EPOCH -
    1 +
    1029983 * Math.floor(y0 / 2820) +
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
    let d0 = jd - persianToJulianDay(475, 1, 1);
    let n2820 = Math.floor(d0 / 1029983);
    let d1 = mod(d0, 1029983);
    let y2820 = d1 === 1029982 ? 2820 : Math.floor((128 * d1 + 46878) / 46751);
    let year = 474 + 2820 * n2820 + y2820;
    if (year <= 0) {
      year--;
    }

    let yDay = jd - persianToJulianDay(year, 1, 1) + 1;
    let month = yDay <= 186 ? Math.ceil(yDay / 31) : Math.ceil((yDay - 6) / 31);
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
    if (date.month <= 6) {
      return 31;
    }

    if (date.month <= 11) {
      return 30;
    }

    return isLeapYear(date.year) ? 30 : 29;
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
