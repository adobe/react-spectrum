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

// Portions of the code in this file are based on code from the TC39 Temporal proposal.
// Original licensing can be found in the NOTICE file in the root directory of this source tree.

import {CalendarDate} from '../CalendarDate';
import {GregorianCalendar} from './GregorianCalendar';
import {Mutable} from '../utils';

const ERA_START_DATES = [[1868, 9, 8], [1912, 7, 30], [1926, 12, 25], [1989, 1, 8], [2019, 5, 1]];
const ERA_ADDENDS = [1867, 1911, 1925, 1988, 2018];
const ERA_NAMES = ['meiji', 'taisho', 'showa', 'heisei', 'reiwa'];

function findEraFromGregorianDate(date: CalendarDate) {
  const idx = ERA_START_DATES.findIndex(([year, month, day]) => {
    if (date.year < year) {
      return true;
    }

    if (date.year === year && date.month < month) {
      return true;
    }

    if (date.year === year && date.month === month && date.day < day) {
      return true;
    }

    return false;
  });

  if (idx === -1) {
    return ERA_START_DATES.length - 1;
  }

  if (idx === 0) {
    return 0;
  }

  return idx - 1;
}

function toGregorian(date: CalendarDate) {
  let eraAddend = ERA_ADDENDS[ERA_NAMES.indexOf(date.era)];
  if (!eraAddend) {
    throw new Error('Unknown era: ' + date.era);
  }

  return new CalendarDate(
    date.year + eraAddend,
    date.month,
    date.day
  );
}

export class JapaneseCalendar extends GregorianCalendar {
  identifier = 'japanese';

  fromJulianDay(jd: number): CalendarDate {
    let date = super.fromJulianDay(jd) as Mutable<CalendarDate>;

    let era = findEraFromGregorianDate(date);
    date.era = ERA_NAMES[era];
    date.year -= ERA_ADDENDS[era];
    return date;
  }

  toJulianDay(date: CalendarDate) {
    return super.toJulianDay(toGregorian(date));
  }

  balanceDate(date: Mutable<CalendarDate>) {
    let gregorianDate = toGregorian(date);
    let era = findEraFromGregorianDate(gregorianDate);

    if (ERA_NAMES[era] !== date.era) {
      date.era = ERA_NAMES[era];
      date.year = gregorianDate.year - ERA_ADDENDS[era];
    }
  }

  getEras() {
    return ERA_NAMES;
  }

  getYearsInEra(date: CalendarDate): number {
    let gregorianDate = toGregorian(date);
    let era = findEraFromGregorianDate(gregorianDate);
    let next = ERA_START_DATES[era + 1];
    if (next == null) {
      return 9999;
    }

    let cur = ERA_START_DATES[era];
    let years = next[0] - cur[0];

    if (date.month < next[1] || (date.month === next[1] && date.day < next[2])) {
      years++;
    }

    return years;
  }
}
