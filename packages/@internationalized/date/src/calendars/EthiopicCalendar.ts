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
import {Mutable} from '../utils';

const ETHIOPIC_EPOCH = 1723856;
const COPTIC_EPOCH = 1824665;

// The delta between Amete Alem 1 and Amete Mihret 1
// AA 5501 = AM 1
const AMETE_MIHRET_DELTA = 5500;

function ceToJulianDay(epoch: number, year: number, month: number, day: number): number {
  return (
    epoch                   // difference from Julian epoch to 1,1,1
    + 365 * year            // number of days from years
    + Math.floor(year / 4)  // extra day of leap year
    + 30 * (month - 1)      // number of days from months (1 based)
    + day - 1               // number of days for present month (1 based)
  );
}

function julianDayToCE(calendar: Calendar, epoch: number, jd: number): Mutable<CalendarDate> {
  let year = Math.floor((4 * (jd - epoch)) / 1461);
  let month = 1 + Math.floor((jd - ceToJulianDay(epoch, year, 1, 1)) / 30);
  let day = jd + 1 - ceToJulianDay(epoch, year, month, 1);

  return new CalendarDate(calendar, year, month, day);
}

function getLeapDay(year: number) {
  return Math.floor((year % 4) / 3);
}

function getDaysInMonth(year: number, month: number) {
  // The Ethiopian and Coptic calendars have 13 months, 12 of 30 days each and
  // an intercalary month at the end of the year of 5 or 6 days, depending whether
  // the year is a leap year or not. The Leap Year follows the same rules as the
  // Julian Calendar so that the extra month always has six days in the year before
  // a Julian Leap Year.
  if (month % 13 !== 0) {
    // not intercalary month
    return 30;
  } else {
    // intercalary month 5 days + possible leap day
    return getLeapDay(year) + 5;
  }
}

/**
 * The Ethiopic calendar system is the official calendar used in Ethiopia.
 * It includes 12 months of 30 days each, plus 5 or 6 intercalary days depending
 * on whether it is a leap year. Two eras are supported: 'AA' and 'AM'.
 */
export class EthiopicCalendar implements Calendar {
  identifier = 'ethiopic';

  fromJulianDay(jd: number): CalendarDate {
    let date = julianDayToCE(this, ETHIOPIC_EPOCH, jd);
    if (date.year > 0) {
      date.era = 'AM';
    } else {
      date.era = 'AA';
      date.year += AMETE_MIHRET_DELTA;
    }

    return date as CalendarDate;
  }

  toJulianDay(date: AnyCalendarDate) {
    let year = date.year;
    if (date.era === 'AA') {
      year -= AMETE_MIHRET_DELTA;
    }

    return ceToJulianDay(ETHIOPIC_EPOCH, year, date.month, date.day);
  }

  getDaysInMonth(date: AnyCalendarDate): number {
    let year = date.year;
    if (date.era === 'AA') {
      year -= AMETE_MIHRET_DELTA;
    }

    return getDaysInMonth(year, date.month);
  }

  getMonthsInYear(): number {
    return 13;
  }

  getDaysInYear(date: AnyCalendarDate): number {
    return 365 + getLeapDay(date.year);
  }

  getYearsInEra(): number {
    return 9999;
  }

  getEras() {
    return ['AA', 'AM'];
  }
}

/**
 * The Ethiopic (Amete Alem) calendar is the same as the modern Ethiopic calendar,
 * except years were measured from a different epoch. Only one era is supported: 'AA'.
 */
export class EthiopicAmeteAlemCalendar extends EthiopicCalendar {
  identifier = 'ethioaa'; // also known as 'ethiopic-amete-alem' in ICU

  fromJulianDay(jd: number): CalendarDate {
    let date = julianDayToCE(this, ETHIOPIC_EPOCH, jd);
    date.era = 'AA';
    date.year += AMETE_MIHRET_DELTA;
    return date as CalendarDate;
  }

  getEras() {
    return ['AA'];
  }
}

/**
 * The Coptic calendar is similar to the Ethiopic calendar.
 * It includes 12 months of 30 days each, plus 5 or 6 intercalary days depending
 * on whether it is a leap year. Two eras are supported: 'BCE' and 'CE'.
 */
export class CopticCalendar extends EthiopicCalendar {
  identifier = 'coptic';

  fromJulianDay(jd: number): CalendarDate {
    let date = julianDayToCE(this, COPTIC_EPOCH, jd);
    if (date.year <= 0) {
      date.era = 'BCE';
      date.year = 1 - date.year;
    } else {
      date.era = 'CE';
    }

    return date as CalendarDate;
  }

  toJulianDay(date: AnyCalendarDate) {
    let year = date.year;
    if (date.era === 'BCE') {
      year = 1 - year;
    }

    return ceToJulianDay(COPTIC_EPOCH, year, date.month, date.day);
  }

  getDaysInMonth(date: AnyCalendarDate): number {
    let year = date.year;
    if (date.era === 'BCE') {
      year = 1 - year;
    }

    return getDaysInMonth(year, date.month);
  }

  isInverseEra(date: AnyCalendarDate): boolean {
    return date.era === 'BCE';
  }

  balanceDate(date: Mutable<AnyCalendarDate>) {
    if (date.year <= 0) {
      date.era = date.era === 'BCE' ? 'CE' : 'BCE';
      date.year = 1 - date.year;
    }
  }

  getEras() {
    return ['BCE', 'CE'];
  }
}
