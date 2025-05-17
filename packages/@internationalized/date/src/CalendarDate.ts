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

import {add, addTime, addZoned, constrain, constrainTime, cycleDate, cycleTime, cycleZoned, set, setTime, setZoned, subtract, subtractTime, subtractZoned} from './manipulation';
import {AnyCalendarDate, AnyTime, Calendar, CycleOptions, CycleTimeOptions, DateDuration, DateField, DateFields, DateTimeDuration, Disambiguation, TimeDuration, TimeField, TimeFields} from './types';
import {compareDate, compareTime} from './queries';
import {dateTimeToString, dateToString, durationToString, timeToString, zonedDateTimeToString} from './string';
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

/** A CalendarDate represents a date without any time components in a specific calendar system. */
export class CalendarDate {
  // This prevents TypeScript from allowing other types with the same fields to match.
  // i.e. a ZonedDateTime should not be be passable to a parameter that expects CalendarDate.
  // If that behavior is desired, use the AnyCalendarDate interface instead.
  // @ts-ignore
  #type;
  /** The calendar system associated with this date, e.g. Gregorian. */
  public readonly calendar: Calendar;
  /** The calendar era for this date, e.g. "BC" or "AD". */
  public readonly era: string;
  /** The year of this date within the era. */
  public readonly year: number;
  /**
   * The month number within the year. Note that some calendar systems such as Hebrew
   * may have a variable number of months per year. Therefore, month numbers may not
   * always correspond to the same month names in different years.
   */
  public readonly month: number;
  /** The day number within the month. */
  public readonly day: number;

  constructor(year: number, month: number, day: number);
  constructor(era: string, year: number, month: number, day: number);
  constructor(calendar: Calendar, year: number, month: number, day: number);
  constructor(calendar: Calendar, era: string, year: number, month: number, day: number);
  constructor(...args: any[]) {
    let [calendar, era, year, month, day] = shiftArgs(args);
    this.calendar = calendar;
    this.era = era;
    this.year = year;
    this.month = month;
    this.day = day;

    constrain(this);
  }

  /** Returns a copy of this date. */
  copy(): CalendarDate {
    if (this.era) {
      return new CalendarDate(this.calendar, this.era, this.year, this.month, this.day);
    } else {
      return new CalendarDate(this.calendar, this.year, this.month, this.day);
    }
  }

  /** Returns a new `CalendarDate` with the given duration added to it. */
  add(duration: DateDuration): CalendarDate {
    return add(this, duration);
  }

  /** Returns a new `CalendarDate` with the given duration subtracted from it. */
  subtract(duration: DateDuration): CalendarDate {
    return subtract(this, duration);
  }

  /** Returns a new `CalendarDate` with the given fields set to the provided values. Other fields will be constrained accordingly. */
  set(fields: DateFields): CalendarDate {
    return set(this, fields);
  }

  /**
   * Returns a new `CalendarDate` with the given field adjusted by a specified amount.
   * When the resulting value reaches the limits of the field, it wraps around.
   */
  cycle(field: DateField, amount: number, options?: CycleOptions): CalendarDate {
    return cycleDate(this, field, amount, options);
  }

  /** Converts the date to a native JavaScript Date object, with the time set to midnight in the given time zone. */
  toDate(timeZone: string): Date {
    return toDate(this, timeZone);
  }

  /** Converts the date to an ISO 8601 formatted string. */
  toString(): string {
    return dateToString(this);
  }

  /** Compares this date with another. A negative result indicates that this date is before the given one, and a positive date indicates that it is after. */
  compare(b: AnyCalendarDate): number {
    return compareDate(this, b);
  }
}

/** A Time represents a clock time without any date components. */
export class Time {
  // This prevents TypeScript from allowing other types with the same fields to match.
  // @ts-ignore
  #type;
  /** The hour, numbered from 0 to 23. */
  public readonly hour: number;
  /** The minute in the hour. */
  public readonly minute: number;
  /** The second in the minute. */
  public readonly second: number;
  /** The millisecond in the second. */
  public readonly millisecond: number;

  constructor(
    hour: number = 0,
    minute: number = 0,
    second: number = 0,
    millisecond: number = 0
  ) {
    this.hour = hour;
    this.minute = minute;
    this.second = second;
    this.millisecond = millisecond;
    constrainTime(this);
  }

  /** Returns a copy of this time. */
  copy(): Time {
    return new Time(this.hour, this.minute, this.second, this.millisecond);
  }

  /** Returns a new `Time` with the given duration added to it. */
  add(duration: TimeDuration): Time {
    return addTime(this, duration);
  }

  /** Returns a new `Time` with the given duration subtracted from it. */
  subtract(duration: TimeDuration): Time {
    return subtractTime(this, duration);
  }

  /** Returns a new `Time` with the given fields set to the provided values. Other fields will be constrained accordingly. */
  set(fields: TimeFields): Time {
    return setTime(this, fields);
  }

  /**
   * Returns a new `Time` with the given field adjusted by a specified amount.
   * When the resulting value reaches the limits of the field, it wraps around.
   */
  cycle(field: TimeField, amount: number, options?: CycleTimeOptions): Time {
    return cycleTime(this, field, amount, options);
  }

  /** Converts the time to an ISO 8601 formatted string. */
  toString(): string {
    return timeToString(this);
  }

  /** Compares this time with another. A negative result indicates that this time is before the given one, and a positive time indicates that it is after. */
  compare(b: AnyTime): number {
    return compareTime(this, b);
  }
}

/** A CalendarDateTime represents a date and time without a time zone, in a specific calendar system. */
export class CalendarDateTime {
  // This prevents TypeScript from allowing other types with the same fields to match.
  // @ts-ignore
  #type;
  /** The calendar system associated with this date, e.g. Gregorian. */
  public readonly calendar: Calendar;
  /** The calendar era for this date, e.g. "BC" or "AD". */
  public readonly era: string;
  /** The year of this date within the era. */
  public readonly year: number;
  /**
   * The month number within the year. Note that some calendar systems such as Hebrew
   * may have a variable number of months per year. Therefore, month numbers may not
   * always correspond to the same month names in different years.
   */
  public readonly month: number;
  /** The day number within the month. */
  public readonly day: number;
  /** The hour in the day, numbered from 0 to 23. */
  public readonly hour: number;
  /** The minute in the hour. */
  public readonly minute: number;
  /** The second in the minute. */
  public readonly second: number;
  /** The millisecond in the second. */
  public readonly millisecond: number;

  constructor(year: number, month: number, day: number, hour?: number, minute?: number, second?: number, millisecond?: number);
  constructor(era: string, year: number, month: number, day: number, hour?: number, minute?: number, second?: number, millisecond?: number);
  constructor(calendar: Calendar, year: number, month: number, day: number, hour?: number, minute?: number, second?: number, millisecond?: number);
  constructor(calendar: Calendar, era: string, year: number, month: number, day: number, hour?: number, minute?: number, second?: number, millisecond?: number);
  constructor(...args: any[]) {
    let [calendar, era, year, month, day] = shiftArgs(args);
    this.calendar = calendar;
    this.era = era;
    this.year = year;
    this.month = month;
    this.day = day;
    this.hour = args.shift() || 0;
    this.minute = args.shift() || 0;
    this.second = args.shift() || 0;
    this.millisecond = args.shift() || 0;

    constrain(this);
  }

  /** Returns a copy of this date. */
  copy(): CalendarDateTime {
    if (this.era) {
      return new CalendarDateTime(this.calendar, this.era, this.year, this.month, this.day, this.hour, this.minute, this.second, this.millisecond);
    } else {
      return new CalendarDateTime(this.calendar, this.year, this.month, this.day, this.hour, this.minute, this.second, this.millisecond);
    }
  }

  /** Returns a new `CalendarDateTime` with the given duration added to it. */
  add(duration: DateTimeDuration): CalendarDateTime {
    return add(this, duration);
  }

  /** Returns a new `CalendarDateTime` with the given duration subtracted from it. */
  subtract(duration: DateTimeDuration): CalendarDateTime {
    return subtract(this, duration);
  }

  /** Returns a new `CalendarDateTime` with the given fields set to the provided values. Other fields will be constrained accordingly. */
  set(fields: DateFields & TimeFields): CalendarDateTime {
    return set(setTime(this, fields), fields);
  }

  /**
   * Returns a new `CalendarDateTime` with the given field adjusted by a specified amount.
   * When the resulting value reaches the limits of the field, it wraps around.
   */
  cycle(field: DateField | TimeField, amount: number, options?: CycleTimeOptions): CalendarDateTime {
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

  /** Converts the date to a native JavaScript Date object in the given time zone. */
  toDate(timeZone: string, disambiguation?: Disambiguation): Date {
    return toDate(this, timeZone, disambiguation);
  }

  /** Converts the date to an ISO 8601 formatted string. */
  toString(): string {
    return dateTimeToString(this);
  }

  /** Compares this date with another. A negative result indicates that this date is before the given one, and a positive date indicates that it is after. */
  compare(b: CalendarDate | CalendarDateTime | ZonedDateTime): number {
    let res = compareDate(this, b);
    if (res === 0) {
      return compareTime(this, toCalendarDateTime(b));
    }

    return res;
  }
}

/** A ZonedDateTime represents a date and time in a specific time zone and calendar system. */
export class ZonedDateTime {
  // This prevents TypeScript from allowing other types with the same fields to match.
  // @ts-ignore
  #type;
  /** The calendar system associated with this date, e.g. Gregorian. */
  public readonly calendar: Calendar;
  /** The calendar era for this date, e.g. "BC" or "AD". */
  public readonly era: string;
  /** The year of this date within the era. */
  public readonly year: number;
  /**
   * The month number within the year. Note that some calendar systems such as Hebrew
   * may have a variable number of months per year. Therefore, month numbers may not
   * always correspond to the same month names in different years.
   */
  public readonly month: number;
  /** The day number within the month. */
  public readonly day: number;
  /** The hour in the day, numbered from 0 to 23. */
  public readonly hour: number;
  /** The minute in the hour. */
  public readonly minute: number;
  /** The second in the minute. */
  public readonly second: number;
  /** The millisecond in the second. */
  public readonly millisecond: number;
  /** The IANA time zone identifier that this date and time is represented in. */
  public readonly timeZone: string;
  /** The UTC offset for this time, in milliseconds. */
  public readonly offset: number;

  constructor(year: number, month: number, day: number, timeZone: string, offset: number, hour?: number, minute?: number, second?: number, millisecond?: number);
  constructor(era: string, year: number, month: number, day: number, timeZone: string, offset: number, hour?: number, minute?: number, second?: number, millisecond?: number);
  constructor(calendar: Calendar, year: number, month: number, day: number, timeZone: string, offset: number, hour?: number, minute?: number, second?: number, millisecond?: number);
  constructor(calendar: Calendar, era: string, year: number, month: number, day: number, timeZone: string, offset: number, hour?: number, minute?: number, second?: number, millisecond?: number);
  constructor(...args: any[]) {
    let [calendar, era, year, month, day] = shiftArgs(args);
    let timeZone = args.shift();
    let offset = args.shift();
    this.calendar = calendar;
    this.era = era;
    this.year = year;
    this.month = month;
    this.day = day;
    this.timeZone = timeZone;
    this.offset = offset;
    this.hour = args.shift() || 0;
    this.minute = args.shift() || 0;
    this.second = args.shift() || 0;
    this.millisecond = args.shift() || 0;

    constrain(this);
  }

  /** Returns a copy of this date. */
  copy(): ZonedDateTime {
    if (this.era) {
      return new ZonedDateTime(this.calendar, this.era, this.year, this.month, this.day, this.timeZone, this.offset, this.hour, this.minute, this.second, this.millisecond);
    } else {
      return new ZonedDateTime(this.calendar, this.year, this.month, this.day, this.timeZone, this.offset, this.hour, this.minute, this.second, this.millisecond);
    }
  }

  /** Returns a new `ZonedDateTime` with the given duration added to it. */
  add(duration: DateTimeDuration): ZonedDateTime {
    return addZoned(this, duration);
  }

  /** Returns a new `ZonedDateTime` with the given duration subtracted from it. */
  subtract(duration: DateTimeDuration): ZonedDateTime {
    return subtractZoned(this, duration);
  }

  /** Returns a new `ZonedDateTime` with the given fields set to the provided values. Other fields will be constrained accordingly. */
  set(fields: DateFields & TimeFields, disambiguation?: Disambiguation): ZonedDateTime {
    return setZoned(this, fields, disambiguation);
  }

  /**
   * Returns a new `ZonedDateTime` with the given field adjusted by a specified amount.
   * When the resulting value reaches the limits of the field, it wraps around.
   */
  cycle(field: DateField | TimeField, amount: number, options?: CycleTimeOptions): ZonedDateTime {
    return cycleZoned(this, field, amount, options);
  }

  /** Converts the date to a native JavaScript Date object. */
  toDate(): Date {
    return zonedToDate(this);
  }

   /** Converts the date to an ISO 8601 formatted string, including the UTC offset and time zone identifier. */
  toString(): string {
    return zonedDateTimeToString(this);
  }

   /** Converts the date to an ISO 8601 formatted string in UTC. */
  toAbsoluteString(): string {
    return this.toDate().toISOString();
  }

  /** Compares this date with another. A negative result indicates that this date is before the given one, and a positive date indicates that it is after. */
  compare(b: CalendarDate | CalendarDateTime | ZonedDateTime): number {
    // TODO: Is this a bad idea??
    return this.toDate().getTime() - toZoned(b, this.timeZone).toDate().getTime();
  }
}

// TODO: tidy this up...
type MaybePlural<T extends string> = T | `${T}s`
type Opts = {
  fractionalSecondDigits?: 'auto' | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | undefined,
  smallestUnit: MaybePlural<'second' | 'millisecond' | 'microsecond' | 'nanosecond'>
}

/** A Duration represents a difference between two time points, which can be used in date/time arithmetic. */
export class Duration {
  // This prevents TypeScript from allowing other types with the same fields to match.
  // @ts-ignore
  #type;

  /** The number of years. */
  public readonly years: number;
  /** The number of months. */
  public readonly months: number;
  /** The number of weeks. */
  public readonly weeks: number;
  /** The number of days. */
  public readonly days: number;
  /** The number of hours. */
  public readonly hours: number;
  /** The number of minutes. */
  public readonly minutes: number;
  /** The number of seconds. */
  public readonly seconds: number;
  /** The number of milliseconds. */
  public readonly milliseconds: number;
  /** The number of microseconds. */
  public readonly microseconds: number;
  /** The number of nanoseconds. */
  public readonly nanoseconds: number;

  /** An integer between -1 and 1 representing the sign of the duration. Zero if the duration is zero. */
  public readonly sign: number;
  /** Whether this duration represents a zero duration or not. */
  public get blank() {
    return this.sign === 0;
  }

  public constructor(years?: number, months?: number, weeks?: number, days?: number, hours?: number, minutes?: number, seconds?: number, milliseconds?: number, microseconds?: number, nanoseconds?: number) {
    this.years = years ?? 0;
    this.months = months ?? 0;
    this.weeks = weeks ?? 0;
    this.days = days ?? 0;
    this.hours = hours ?? 0;
    this.minutes = minutes ?? 0;
    this.seconds = seconds ?? 0;
    this.milliseconds = milliseconds ?? 0;
    this.microseconds = microseconds ?? 0;
    this.nanoseconds = nanoseconds ?? 0;

    const anyValue = years || months || weeks || days || hours || minutes || seconds || milliseconds || microseconds || nanoseconds || 0;
    this.sign ||= anyValue < 0 ? -1 : 0;
    this.sign ||= anyValue > 0 ? 1 : 0;
    this.#checkValidDuration();
  }

  // with

  negated() {
    // https://tc39.es/proposal-temporal/#sec-temporal.duration.prototype.negated
    return new Duration(-this.years, -this.months, -this.weeks, -this.days, -this.hours, -this.minutes, -this.seconds, -this.milliseconds, -this.microseconds, -this.nanoseconds);
  }

  abs() {
    // https://tc39.es/proposal-temporal/#sec-temporal.duration.prototype.abs
    return this.sign < 0 ? this.negated() : this.copy();
  }

  // add
  add(other: unknown): Duration {
    // https://tc39.es/proposal-temporal/#sec-temporal-adddurations
    const otherDuration = other as Duration; // TODO: https://tc39.es/proposal-temporal/#sec-temporal-totemporalduration
    if (this.years || this.months || this.weeks || otherDuration.years || otherDuration.months || otherDuration.weeks) {
      throw new RangeError('Cannot add or subtract durations involving calendar units (weeks, months, and years).');
    }

    // Fast paths
    if (this.blank) { return otherDuration.copy(); }
    if (otherDuration.blank) { return this.copy(); }

    const hasMicroseconds = !!(this.microseconds || otherDuration.microseconds);
    const hasMilliseconds = hasMicroseconds || !!(this.milliseconds || otherDuration.milliseconds);
    const hasSeconds = hasMilliseconds || !!(this.seconds || otherDuration.seconds);
    const hasMinutes = hasSeconds || !!(this.minutes || otherDuration.minutes);
    const hasHours = hasMinutes || !!(this.hours || otherDuration.hours);
    const hasDays = hasHours || !!(this.days || otherDuration.days);

    const [thisSec, thisSubSec] = this.#timeSeconds();
    const [otherSec, otherSubSec] = otherDuration.#timeSeconds();

    const sumSec = thisSec + otherSec;
    const sumSubSec = thisSubSec + otherSubSec;

    let days = 0, hours = 0, minutes = 0;
    let seconds = sumSec + Math.floor(sumSubSec / 1e9);
    let milliseconds = 0, microseconds  = 0;
    let nanoseconds = sumSubSec % 1e9;

    if (Math.abs(seconds) >= 2 ** 53) {
      // Should not happen unless something is seriously wrong.
      throw new RangeError('The resulting duration is too large.');
    }

    if (hasMicroseconds) {
      microseconds = Math.floor(nanoseconds / 1e3);
      nanoseconds %= 1e3;

      if (hasMilliseconds) {
        milliseconds = Math.floor(microseconds / 1e3);
        microseconds %= 1e3;
      }
    }

    if (!hasDays && !hasHours && !hasMinutes && !hasSeconds) {
      // Sub-second is kind of a pain to deal with.
      if (!hasMilliseconds && !hasMicroseconds) {
        // log2(2**53 / 1e9) === 23.102647146013737
        if (seconds >= 2 ** 23) { throw new RangeError('Cannot represent the resulting duration.'); }
        nanoseconds += seconds * 1e9;
      } else if (!hasMilliseconds) {
        // log2(2**53 / 1e6) === 33.06843143067582
        if (seconds >= 2 ** 33) { throw new RangeError('Cannot represent the resulting duration.'); }
        microseconds += seconds * 1e6;
      } else {
        // log2(2**53 / 1e3) === 43.034215715337915
        if (seconds >= 2 ** 43) { throw new RangeError('Cannot represent the resulting duration.'); }
        milliseconds += seconds * 1e3;
      }
    }

    if (hasMinutes) {
      minutes = Math.floor(seconds / 60);
      seconds %= 60;

      if (hasHours) {
        hours = Math.floor(minutes / 60);
        minutes %= 60;

        if (hasDays) {
          days = Math.floor(hours / 24);
          hours %= 24;
        }
      }
    }

    return new Duration(0, 0, 0, days, hours, minutes, seconds, milliseconds, microseconds, nanoseconds);
  }

  sub(other: unknown) {
    const otherDuration = other as Duration; // TODO: https://tc39.es/proposal-temporal/#sec-temporal-totemporalduration
    return this.add(otherDuration.negated());
  }

  round(roundTo: unknown) {
    // https://tc39.es/proposal-temporal/#sec-temporal.duration.prototype.round
    roundTo;
    throw new Error('Not implemented');
  }

  total(totalOf: unknown) {
    // https://tc39.es/proposal-temporal/#sec-temporal.duration.prototype.total
    totalOf;
    throw new Error('Not implemented');
  }

  toString(opts?: Opts) {
    // https://tc39.es/proposal-temporal/#sec-temporal.duration.prototype.tostring

    // Fast path
    // Picking day is arbitrary; it's the smallest unit that doesn't involve the time designator.
    // It seems Temporal would do `DT0S` instead, including sub-second logic shenanigans...
    if (this.blank) { return '0D'; }

    let fractionalSecondDigits = opts?.fractionalSecondDigits ?? 'auto';
    if ((typeof fractionalSecondDigits === 'number' && (isNaN(fractionalSecondDigits) || fractionalSecondDigits < 0 || fractionalSecondDigits > 9)) || fractionalSecondDigits !== 'auto') {
      throw new RangeError('Invalid fractionalSecondDigits value.');
    }

    const smallestUnit = opts?.smallestUnit;
    if (smallestUnit) {
      switch (smallestUnit) {
        case 'second':
        case 'seconds':
          fractionalSecondDigits = 0;
          break;
        case 'millisecond':
        case 'milliseconds':
          fractionalSecondDigits = 3;
          break;
        case 'microsecond':
        case 'microseconds':
          fractionalSecondDigits = 6;
          break;
        case 'nanosecond':
        case 'nanoseconds':
          fractionalSecondDigits = 9;
          break;
        default:
          throw new RangeError('Invalid smallestUnit value.');
      }
    }

    // TODO: implement balancing (https://tc39.es/proposal-temporal/#sec-temporal-temporaldurationfrominternal)

    return durationToString(this, fractionalSecondDigits);
  }

  toJSON() {
    // https://tc39.es/proposal-temporal/#sec-temporal.duration.prototype.tojson
    return this.toString();
  }

  valueOf() {
    // https://tc39.es/proposal-temporal/#sec-temporal.duration.prototype.valueof
    throw new TypeError('Cannot call valueOf on a Duration object.');
  }

  copy() {
    return new Duration(this.years, this.months, this.weeks, this.days, this.hours, this.minutes, this.seconds, this.milliseconds, this.microseconds, this.nanoseconds);
  }

  #timeSeconds(): [number, number] {
    // https://tc39.es/proposal-temporal/#sec-temporal-timedurationfromcomponents
    // https://tc39.es/proposal-temporal/#sec-temporal-add24hourdaystonormalizedtimeduration
    // https://tc39.es/proposal-temporal/#eqn-nsPerDay
    const seconds = this.days * 864e11 * this.hours * 3600 + this.minutes * 60 + this.seconds;
    const subSeconds = this.milliseconds * 1e6 + this.microseconds * 1e3 + this.nanoseconds;

    const allSeconds = seconds + Math.floor(subSeconds / 1e9);
    const allSubSeconds = subSeconds % 1e9;
    return [allSeconds, allSubSeconds];
  }

  #checkValidDuration() {
    // https://tc39.es/proposal-temporal/#sec-isvalidduration
    for (const unit of ['years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds', 'milliseconds', 'microseconds', 'nanoseconds']) {
      if (!Number.isInteger(this[unit]) || !Number.isFinite(this[unit])) {
        throw new RangeError(`Duration unit ${unit} is not a finite integer.`);
      }

      if ((this[unit] > 0 && this.sign < 0) || (this[unit] < 0 && this.sign > 0)) {
        throw new RangeError('All duration unit values must have the same sign.');
      }
    }

    if (Math.abs(this.years) >= 2 ** 32 || Math.abs(this.months) >= 2 ** 32 || Math.abs(this.weeks) >= 2 ** 32) {
      throw new RangeError('Duration years, months, and weeks cannot exceed 2 ** 32 each.');
    }

    const normalizedSeconds = this.days * 86_400 +
      this.hours * 3600 +
      this.minutes * 60 +
      this.seconds +
      // This is not compliant with the spec 7. -- shouldn't be a big deal, unless for extreme values
      this.milliseconds * 10 ** -3 +
      this.microseconds * 10 ** -6 +
      this.nanoseconds * 10 ** -9;

    if (Math.abs(normalizedSeconds) >= 2 ** 53) {
      throw new RangeError('Duration days, hours, minutes, seconds, milliseconds, microseconds, and nanoseconds cannot add up to more than 2 ** 53 seconds.');
    }
  }
}
