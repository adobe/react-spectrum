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

import {add, addTime, addZoned, cycleDate, cycleTime, cycleZoned, set, setTime, setZoned, subtract, subtractTime, subtractZoned} from './manipulation';
import {Calendar, CycleOptions, CycleTimeOptions, DateField, DateFields, Disambiguation, Duration, OverflowBehavior, TimeField, TimeFields} from './types';
import {compareDate, compareTime} from './queries';
import {dateTimeToString, dateToString, timeToString, zonedDateTimeToString} from './string';
import {GregorianCalendar} from './calendars/GregorianCalendar';
import {toCalendarDateTime, toDate, toZoned, zonedToDate} from './conversion';

function shiftArgs(args: any[]) {
  let calendar: Calendar = typeof args[0] === 'object'
    ? args.shift()
    : new GregorianCalendar();

  let era: string;
  if (typeof args[0] === 'string') {
    era = args.shift();
  } else {
    let eras = calendar.getEras();
    era = eras[eras.length - 1];
  }

  let year = args.shift();
  let month = args.shift();
  let day = args.shift();

  return [calendar, era, year, month, day];
}

export class CalendarDate {
  public readonly calendar: Calendar;
  public readonly era: string;
  public readonly year: number;
  public readonly month: number;
  public readonly day: number;

  constructor(year: number, month: number, day: number);
  constructor(calendar: Calendar, year: number, month: number, day: number);
  constructor(calendar: Calendar, era: string, year: number, month: number, day: number);
  constructor(...args: any[]) {
    let [calendar, era, year, month, day] = shiftArgs(args);
    this.calendar = calendar;
    this.era = era;
    this.year = year;
    this.month = month;
    this.day = day;

    if (this.calendar.balanceDate) {
      this.calendar.balanceDate(this);
    }
  }

  copy(): CalendarDate {
    if (this.era) {
      return new CalendarDate(this.calendar, this.era, this.year, this.month, this.day);
    } else {
      return new CalendarDate(this.calendar, this.year, this.month, this.day);
    }
  }

  add(duration: Duration) {
    return add(this, duration);
  }

  subtract(duration: Duration) {
    return subtract(this, duration);
  }

  set(fields: DateFields, behavior?: OverflowBehavior) {
    return set(this, fields, behavior);
  }

  cycle(field: DateField, amount: number, options?: CycleOptions) {
    return cycleDate(this, field, amount, options);
  }

  toDate(timeZone: string) {
    return toDate(this, timeZone);
  }

  toString() {
    return dateToString(this);
  }

  compare(b: CalendarDate) {
    return compareDate(this, b);
  }
}

export class Time {
  constructor(
    public readonly hour: number = 0,
    public readonly minute: number = 0,
    public readonly second: number = 0,
    public readonly millisecond: number = 0
  ) {}

  copy(): Time {
    return new Time(this.hour, this.minute, this.second, this.millisecond);
  }

  add(duration: Duration) {
    return addTime(this, duration);
  }

  subtract(duration: Duration) {
    return subtractTime(this, duration);
  }

  set(fields: TimeFields, behavior?: OverflowBehavior) {
    return setTime(this, fields, behavior);
  }

  cycle(field: TimeField, amount: number, options?: CycleTimeOptions) {
    return cycleTime(this, field, amount, options);
  }

  toString() {
    return timeToString(this);
  }

  compare(b: Time) {
    return compareTime(this, b);
  }
}

export class CalendarDateTime extends CalendarDate {
  public readonly hour: number;
  public readonly minute: number;
  public readonly second: number;
  public readonly millisecond: number;

  constructor(year: number, month: number, day: number, hour?: number, minute?: number, second?: number, millisecond?: number);
  constructor(calendar: Calendar, year: number, month: number, day: number, hour?: number, minute?: number, second?: number, millisecond?: number);
  constructor(calendar: Calendar, era: string, year: number, month: number, day: number, hour?: number, minute?: number, second?: number, millisecond?: number);
  constructor(...args: any[]) {
    let [calendar, era, year, month, day] = shiftArgs(args);
    super(calendar, era, year, month, day);
    this.hour = args.shift() || 0;
    this.minute = args.shift() || 0;
    this.second = args.shift() || 0;
    this.millisecond = args.shift() || 0;
  }

  copy(): CalendarDateTime {
    if (this.era) {
      return new CalendarDateTime(this.calendar, this.era, this.year, this.month, this.day, this.hour, this.minute, this.second, this.millisecond);
    } else {
      return new CalendarDateTime(this.calendar, this.year, this.month, this.day, this.hour, this.minute, this.second, this.millisecond);
    }
  }

  set(fields: DateFields & TimeFields, behavior?: OverflowBehavior) {
    return set(setTime(this, fields, behavior), fields, behavior);
  }

  cycle(field: DateField | TimeField, amount: number, options?: CycleTimeOptions) {
    switch (field) {
      case 'era':
      case 'year':
      case 'month':
      case 'day':
        return cycleDate(this, field, amount, options);
      default:
        return cycleTime(this, field, amount, options);
    }
  }

  toString() {
    return dateTimeToString(this);
  }

  compare(b: CalendarDate | CalendarDateTime) {
    let res = compareDate(this, b);
    if (res === 0) {
      return compareTime(this, toCalendarDateTime(b));
    }

    return res;
  }
}

export class ZonedDateTime extends CalendarDateTime {
  public readonly timeZone: string;
  public readonly offset: number;

  constructor(year: number, month: number, day: number, timeZone: string, offset: number, hour?: number, minute?: number, second?: number, millisecond?: number);
  constructor(calendar: Calendar, year: number, month: number, day: number, timeZone: string, offset: number, hour?: number, minute?: number, second?: number, millisecond?: number);
  constructor(calendar: Calendar, era: string, year: number, month: number, day: number, timeZone: string, offset: number, hour?: number, minute?: number, second?: number, millisecond?: number);
  constructor(...args: any[]) {
    let [calendar, era, year, month, day] = shiftArgs(args);
    let timeZone = args.shift();
    let offset = args.shift();
    super(calendar, era, year, month, day, ...args);
    this.timeZone = timeZone;
    this.offset = offset;
  }

  copy(): ZonedDateTime {
    if (this.era) {
      return new ZonedDateTime(this.calendar, this.era, this.year, this.month, this.day, this.timeZone, this.offset, this.hour, this.minute, this.second, this.millisecond);
    } else {
      return new ZonedDateTime(this.calendar, this.year, this.month, this.day, this.timeZone, this.offset, this.hour, this.minute, this.second, this.millisecond);
    }
  }

  add(duration: Duration) {
    return addZoned(this, duration);
  }

  subtract(duration: Duration) {
    return subtractZoned(this, duration);
  }

  set(fields: DateFields & TimeFields, behavior?: OverflowBehavior, disambiguation?: Disambiguation) {
    return setZoned(this, fields, behavior, disambiguation);
  }

  cycle(field: DateField | TimeField, amount: number, options?: CycleTimeOptions) {
    return cycleZoned(this, field, amount, options);
  }

  toDate() {
    return zonedToDate(this);
  }

  toString() {
    return zonedDateTimeToString(this);
  }

  toAbsoluteString() {
    return this.toDate().toISOString();
  }

  compare(b: CalendarDate | CalendarDateTime | ZonedDateTime) {
    // TODO: Is this a bad idea??
    return this.toDate() - toZoned(b, this.timeZone).toDate();
  }
}
