import {Calendar, CalendarDate, CalendarDateTime, CycleTimeOptions, Disambiguation, GregorianCalendar, TimeField, TimeFields, ZonedDateTime} from '@internationalized/date';
import { set, DateFields, DateField, CycleOptions, cycleDate, cycleTime, setTime, setZoned, toZoned, AnyCalendarDate, cycleZoned } from './manipulation';
import { dateTimeToString, dateToString, toDate, toIncompleteDateTime, zonedDateTimeToString, zonedToDate } from './conversion';
import { compareDate, compareTime } from '../../../@internationalized/date/src/queries';

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

export class IncompleteDate {
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

  constructor();
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
    }
   

  /** Returns a copy of this date. */
  copy(): IncompleteDate {
    if (this.era) {
      return new IncompleteDate(this.calendar, this.era, this.year, this.month, this.day);
    } else {
      return new IncompleteDate(this.calendar, this.year, this.month, this.day);
    }
  }

  /** Returns a new `CalendarDate` with the given fields set to the provided values. Other fields will be constrained accordingly. */
  set(fields: DateFields): IncompleteDate {
    return set(this, fields);
  }

  /**
   * Returns a new `CalendarDate` with the given field adjusted by a specified amount.
   * When the resulting value reaches the limits of the field, it wraps around.
   */
  cycle(field: DateField, amount: number, options?: CycleOptions): IncompleteDate {
      return cycleDate(this, field, amount, options);
  }

   /** Converts the date to a native JavaScript Date object, with the time set to midnight in the given time zone. */
    toDate(timeZone: string): Date {
      return toDate(this, timeZone);
    }

    toCalendar() : CalendarDate {
      if (this.era) {
        return new CalendarDate(this.calendar, this.era, this.year, this.month, this.day);
      } else {
        return new CalendarDate(this.calendar, this.year, this.month, this.day);
      }
  }

    /** Compares this date with another. A negative result indicates that this date is before the given one, and a positive date indicates that it is after. */
    compare(b: AnyCalendarDate): number {
      return compareDate(this, b);
    }

    /** Converts the date to an ISO 8601 formatted string. */
    toString(): string {
        return dateToString(this);
    }

}

/** A CalendarDateTime represents a date and time without a time zone, in a specific calendar system. */
export class IncompleteDateTime {
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
  }

    /** Returns a copy of this date. */
  copy(): IncompleteDateTime {
    if (this.era) {
      return new IncompleteDateTime(this.calendar, this.era, this.year, this.month, this.day, this.hour, this.minute, this.second, this.millisecond);
    } else {
      return new IncompleteDateTime(this.calendar, this.year, this.month, this.day, this.hour, this.minute, this.second, this.millisecond);
    }
  }

    /** Returns a new `CalendarDateTime` with the given fields set to the provided values. Other fields will be constrained accordingly. */
    set(fields: DateFields & TimeFields): IncompleteDateTime {
      return set(setTime(this, fields), fields);
    }
  

    /**
     * Returns a new `IncompleteDateTime` with the given field adjusted by a specified amount.
     * When the resulting value reaches the limits of the field, it wraps around.
     */
    cycle(field: DateField | TimeField, amount: number, options?: CycleTimeOptions): IncompleteDateTime {
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
  

    toCalendar() : CalendarDateTime {
      if (this.era) {
        return new CalendarDateTime(this.calendar, this.era, this.year, this.month, this.day, this.hour, this.minute, this.second, this.millisecond);
      } else {
        return new CalendarDateTime(this.calendar, this.year, this.month, this.day, this.hour, this.minute, this.second, this.millisecond);
      }
  }

    /** Compares this date with another. A negative result indicates that this date is before the given one, and a positive date indicates that it is after. */
    compare(b: IncompleteDate | IncompleteDateTime | IncompleteZonedDateTime): number {
      let res = compareDate(this, b);
      if (res === 0) {
        return compareTime(this, toIncompleteDateTime(b));
      }
  
      return res;
    }

  /** Converts the date to an ISO 8601 formatted string. */
  toString(): string {
    return dateTimeToString(this);
  }
}


/** A ZonedDateTime represents a date and time in a specific time zone and calendar system. */
export class IncompleteZonedDateTime {
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
  }

  /** Returns a copy of this date. */
  copy(): IncompleteZonedDateTime {
    if (this.era) {
      return new IncompleteZonedDateTime(this.calendar, this.era, this.year, this.month, this.day, this.timeZone, this.offset, this.hour, this.minute, this.second, this.millisecond);
    } else {
      return new IncompleteZonedDateTime(this.calendar, this.year, this.month, this.day, this.timeZone, this.offset, this.hour, this.minute, this.second, this.millisecond);
    }
  }

  /** Returns a new `ZonedDateTime` with the given fields set to the provided values. Other fields will be constrained accordingly. */
  set(fields: DateFields & TimeFields, disambiguation?: Disambiguation): IncompleteZonedDateTime { 
    return setZoned(this, fields, disambiguation); 
  }


  /**
   * Returns a new `ZonedDateTime` with the given field adjusted by a specified amount.
   * When the resulting value reaches the limits of the field, it wraps around.
   */
  cycle(field: DateField | TimeField, amount: number, options?: CycleTimeOptions): IncompleteZonedDateTime {
    return cycleZoned(this, field, amount, options);
  }

  /** Converts the date to a native JavaScript Date object. */
  toDate(): Date {
    return zonedToDate(this);

  }

  /** Compares this date with another. A negative result indicates that this date is before the given one, and a positive date indicates that it is after. */
  compare(b: IncompleteDate | IncompleteDateTime | IncompleteZonedDateTime): number {
    // TODO: Is this a bad idea??
    return this.toDate().getTime() - toZoned(b, this.timeZone).toDate().getTime();
  }

  toCalendar() {
    if (this.era) {
      return new ZonedDateTime(this.calendar, this.era, this.year, this.month, this.day, this.timeZone, this.offset, this.hour, this.minute, this.second, this.millisecond);
    } else {
      return new ZonedDateTime(this.calendar, this.year, this.month, this.day, this.timeZone, this.offset, this.hour, this.minute, this.second, this.millisecond);
    }
  }

     /** Converts the date to an ISO 8601 formatted string, including the UTC offset and time zone identifier. */
    toString(): string {
      return zonedDateTimeToString(this);
    }
}
