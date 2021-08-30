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

import {AnyCalendarDate} from '../types';
import {CalendarDate} from '../CalendarDate';
import {GregorianCalendar} from './GregorianCalendar';
import {Mutable} from '../utils';

const BUDDHIST_ERA_START = -543;

export class BuddhistCalendar extends GregorianCalendar {
  identifier = 'buddhist';

  fromJulianDay(jd: number): CalendarDate {
    let date = super.fromJulianDay(jd) as Mutable<CalendarDate>;
    date.year -= BUDDHIST_ERA_START;
    return date as CalendarDate;
  }

  toJulianDay(date: AnyCalendarDate) {
    return super.toJulianDay(
      new CalendarDate(
        date.year + BUDDHIST_ERA_START,
        date.month,
        date.day
      )
    );
  }

  getEras() {
    return ['BE'];
  }
}
