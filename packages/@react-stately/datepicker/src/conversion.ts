import { AnyCalendarDate, AnyDateTime, Calendar, CalendarDate, CalendarDateTime, Disambiguation, getLocalTimeZone, GregorianCalendar, isEqualCalendar, ZonedDateTime } from "@internationalized/date";
import { IncompleteDate, IncompleteDateTime, IncompleteZonedDateTime } from "./IncompleteDate";
import {  epochFromParts, getTimeZoneOffset } from "../../../@internationalized/date/src/conversion";
import { Mutable } from "./manipulation";
import { getExtendedYear } from "../../../@internationalized/date/src/calendars/GregorianCalendar";
import { DateValue } from "@react-types/datepicker";
import { timeToString } from "../../../@internationalized/date/src/string";

const DAYMILLIS = 86400000;

/** An interface that is compatible with any object with time fields. */
export interface AnyTime {
  readonly hour: number,
  readonly minute: number,
  readonly second: number,
  readonly millisecond: number,
  copy(): this
}

export function toIncompleteDate(dateTime: AnyCalendarDate) {
      return new IncompleteDate(dateTime.calendar, dateTime.era, dateTime.year, dateTime.month, dateTime.day);
}

export function toIncompleteZonedDateTime(date: ZonedDateTime) {
      return new IncompleteZonedDateTime(date.calendar, date.era, date.year, date.month, date.day, date.timeZone, date.offset, date.hour, date.minute, date.second, date.millisecond);
}

export function toDate(dateTime: IncompleteDate | IncompleteDateTime, timeZone: string, disambiguation: Disambiguation = 'compatible'): Date {
  return new Date(toAbsolute(dateTime, timeZone, disambiguation));
}

export function toAbsolute(date: IncompleteDate | IncompleteDateTime, timeZone: string, disambiguation: Disambiguation = 'compatible'): number {
  let dateTime = toIncompleteDateTime(date);

  // Fast path: if the time zone is UTC, use native Date.
  if (timeZone === 'UTC') {
    return epochFromDate(dateTime);
  }

  // Fast path: if the time zone is the local timezone and disambiguation is compatible, use native Date.
  if (timeZone === getLocalTimeZone() && disambiguation === 'compatible') {
    dateTime = toCalendar(dateTime, new GregorianCalendar());

    // Don't use Date constructor here because two-digit years are interpreted in the 20th century.
    let date = new Date();
    let year = getExtendedYear(dateTime.era, dateTime.year);
    date.setFullYear(year, dateTime.month - 1, dateTime.day);
    date.setHours(dateTime.hour, dateTime.minute, dateTime.second, dateTime.millisecond);
    return date.getTime();
  }

  let ms = epochFromDate(dateTime);
  let offsetBefore = getTimeZoneOffset(ms - DAYMILLIS, timeZone);
  let offsetAfter = getTimeZoneOffset(ms + DAYMILLIS, timeZone);
  let valid = getValidWallTimes(dateTime, timeZone, ms - offsetBefore, ms - offsetAfter);

  if (valid.length === 1) {
    return valid[0];
  }

  if (valid.length > 1) {
    switch (disambiguation) {
      // 'compatible' means 'earlier' for "fall back" transitions
      case 'compatible':
      case 'earlier':
        return valid[0];
      case 'later':
        return valid[valid.length - 1];
      case 'reject':
        throw new RangeError('Multiple possible absolute times found');
    }
  }

  switch (disambiguation) {
    case 'earlier':
      return Math.min(ms - offsetBefore, ms - offsetAfter);
    // 'compatible' means 'later' for "spring forward" transitions
    case 'compatible':
    case 'later':
      return Math.max(ms - offsetBefore, ms - offsetAfter);
    case 'reject':
      throw new RangeError('No such absolute time found');
  }
}

export function toIncompleteDateTime(date: IncompleteDate | IncompleteDateTime | IncompleteZonedDateTime | ZonedDateTime, time?: AnyTime): IncompleteDateTime {
  let hour = 0, minute = 0, second = 0, millisecond = 0;
  if ('timeZone' in date) {
    ({hour, minute, second, millisecond} = date);
  } else if ('hour' in date && !time) {
    return date;
  }

  if (time) {
    ({hour, minute, second, millisecond} = time);
  }


  return new IncompleteDateTime(
    date.calendar,
    date.era,
    date.year,
    date.month,
    date.day,
    hour,
    minute,
    second,
    millisecond
  );
}

/** Converts a date from one calendar system to another. */
export function toCalendar<T extends AnyCalendarDate>(date: T, calendar: Calendar): T {
  if (isEqualCalendar(date.calendar, calendar)) {
    return date;
  }

  let calendarDate = calendar.fromJulianDay(date.calendar.toJulianDay(date));
  let copy: Mutable<T> = date.copy();
  copy.calendar = calendar;
  copy.era = calendarDate.era;
  copy.year = calendarDate.year;
  copy.month = calendarDate.month;
  copy.day = calendarDate.day;
  return copy;
}

export function epochFromDate(date: AnyDateTime): number {
  date = toCalendar(date, new GregorianCalendar());
  let year = getExtendedYear(date.era, date.year);
  return epochFromParts(year, date.month, date.day, date.hour, date.minute, date.second, date.millisecond);
}

function getValidWallTimes(date: IncompleteDateTime, timeZone: string, earlier: number, later: number): number[] {
  let found = earlier === later ? [earlier] : [earlier, later];
  return found.filter(absolute => isValidWallTime(date, timeZone, absolute));
}

function isValidWallTime(date: IncompleteDateTime, timeZone: string, absolute: number) {
  let parts = getTimeZoneParts(absolute, timeZone);
  return date.year === parts.year
    && date.month === parts.month
    && date.day === parts.day
    && date.hour === parts.hour
    && date.minute === parts.minute
    && date.second === parts.second;
}

const formattersByTimeZone = new Map<string, Intl.DateTimeFormat>();

function getTimeZoneParts(ms: number, timeZone: string) {
  let formatter = formattersByTimeZone.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour12: false,
      era: 'short',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    });

    formattersByTimeZone.set(timeZone, formatter);
  }

  let parts = formatter.formatToParts(new Date(ms));
  let namedParts: {[name: string]: string} = {};
  for (let part of parts) {
    if (part.type !== 'literal') {
      namedParts[part.type] = part.value;
    }
  }


  return {
    // Firefox returns B instead of BC... https://bugzilla.mozilla.org/show_bug.cgi?id=1752253
    year: namedParts.era === 'BC' || namedParts.era === 'B' ? -namedParts.year + 1 : +namedParts.year,
    month: +namedParts.month,
    day: +namedParts.day,
    hour: namedParts.hour === '24' ? 0 : +namedParts.hour, // bugs.chromium.org/p/chromium/issues/detail?id=1045791
    minute: +namedParts.minute,
    second: +namedParts.second
  };
}

export function fromCalendarToIncompleteDate(date: CalendarDate | CalendarDateTime | ZonedDateTime) {
  if(date instanceof CalendarDate) {
      return new IncompleteDate(date.calendar, date.era, date.year, date.month, date.day);
  } else if (date instanceof CalendarDateTime) {
      return new IncompleteDateTime(date.calendar, date.era, date.year, date.month, date.day, date.hour, date.minute, date.second, date.millisecond);
  }else {
      return new IncompleteZonedDateTime(date.calendar, date.era, date.year, date.month, date.day, date.timeZone, date.offset, date.hour, date.minute, date.second, date.millisecond);
  }
}

/**
 * Takes a Unix epoch (milliseconds since 1970) and converts it to the provided time zone.
 */
export function fromAbsolute(ms: number, timeZone: string): IncompleteZonedDateTime {
  let offset = getTimeZoneOffset(ms, timeZone);
  let date = new Date(ms + offset);
  let year = date.getUTCFullYear();
  let month = date.getUTCMonth() + 1;
  let day = date.getUTCDate();
  let hour = date.getUTCHours();
  let minute = date.getUTCMinutes();
  let second = date.getUTCSeconds();
  let millisecond = date.getUTCMilliseconds();

  return new IncompleteZonedDateTime(year < 1 ? 'BC' : 'AD', year < 1 ? -year + 1 : year, month, day, timeZone, offset, hour, minute, second, millisecond);
}


/** Converts a `ZonedDateTime` from one time zone to another. */
export function toTimeZone(date: IncompleteZonedDateTime, timeZone: string): IncompleteZonedDateTime {
  let ms = epochFromDate(date) - date.offset;
  return toCalendar(fromAbsolute(ms, timeZone), date.calendar);
}


export function zonedToDate(date: IncompleteZonedDateTime): Date {
  let ms = epochFromDate(date) - date.offset;
  return new Date(ms);
}

export function dateToString(date: IncompleteDate): string {
  let gregorianDate = toCalendar(date, new GregorianCalendar());
  let year: string;
  if (gregorianDate.era === 'BC') {
    year = gregorianDate.year === 1
      ? '0000'
      : '-' + String(Math.abs(1 - gregorianDate.year)).padStart(6, '00');
  } else {
    year = String(gregorianDate.year).padStart(4, '0');
  }
  return `${year}-${String(gregorianDate.month).padStart(2, '0')}-${String(gregorianDate.day).padStart(2, '0')}`;
}

export function dateTimeToString(date: AnyDateTime): string {
  // @ts-ignore
  return `${dateToString(date)}T${timeToString(date)}`;
}


export function zonedDateTimeToString(date: IncompleteZonedDateTime): string {
  return `${dateTimeToString(date)}${offsetToString(date.offset)}[${date.timeZone}]`;
}

function offsetToString(offset: number) {
  let sign = Math.sign(offset) < 0 ? '-' : '+';
  offset = Math.abs(offset);
  let offsetHours = Math.floor(offset / (60 * 60 * 1000));
  let offsetMinutes = Math.floor((offset % (60 * 60 * 1000)) / (60 * 1000));
  let offsetSeconds = Math.floor((offset % (60 * 60 * 1000)) % (60 * 1000) / 1000);
  let stringOffset = `${sign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;
  if (offsetSeconds !== 0) {
    stringOffset += `:${String(offsetSeconds).padStart(2, '0')}`;
  }

  return stringOffset;
}