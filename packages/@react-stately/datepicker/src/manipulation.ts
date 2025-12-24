import {AnyTime, epochFromDate, fromAbsolute, toAbsolute, toCalendar, toIncompleteDateTime, toTimeZone} from './conversion';
import {Calendar, CycleTimeOptions, Disambiguation, GregorianCalendar, TimeField, TimeFields} from '@internationalized/date';
import {IncompleteDate, IncompleteDateTime, IncompleteZonedDateTime} from './IncompleteDate';

export interface DateFields {
  era?: string,
  year?: number,
  month?: number,
  day?: number
}

export type DateField = keyof DateFields;

export type Mutable<T> = {
  -readonly[P in keyof T]: T[P]
};

export interface CycleOptions {
  /** Whether to round the field value to the nearest interval of the amount. */
  round?: boolean
}

export interface AnyCalendarDate {
  readonly calendar: Calendar,
  readonly era: string,
  readonly year: number,
  readonly month: number,
  readonly day: number,
  copy(): this
}

const ONE_HOUR = 3600000;


export function set(date: IncompleteDate, fields: DateFields): IncompleteDate;
export function set(date: IncompleteDateTime, fields: DateFields): IncompleteDateTime;
export function set(date: IncompleteDate | IncompleteDateTime, fields: DateFields): Mutable<IncompleteDate | IncompleteDateTime> {
  let mutableDate: Mutable<IncompleteDate | IncompleteDateTime> = date.copy();

  if (fields.era != null) {
    mutableDate.era = fields.era;
  }

  if (fields.year != null) {
    mutableDate.year = fields.year;
  }

  if (fields.month != null) {
    mutableDate.month = fields.month;
  }

  if (fields.day != null) {
    mutableDate.day = fields.day;
  }

  return mutableDate;
}

export function cycleDate(value: IncompleteDate, field: DateField, amount: number, options?: CycleOptions): IncompleteDate;
export function cycleDate(value: IncompleteDateTime, field: DateField, amount: number, options?: CycleOptions): IncompleteDateTime;
export function cycleDate(value: IncompleteDate | IncompleteDateTime, field: DateField, amount: number, options?: CycleOptions): Mutable<IncompleteDate | IncompleteDateTime> {
  let mutable: Mutable<IncompleteDate | IncompleteDateTime> = value.copy();

  switch (field) {
    case 'era': {
      let eras = value.calendar.getEras();
      let eraIndex = eras.indexOf(value.era);
      eraIndex = cycleValue(eraIndex, amount, 0, eras.length - 1, options?.round);
      mutable.era = eras[eraIndex];
      break;
    }
    case 'year': {
      if (mutable.calendar.isInverseEra?.(mutable)) {
        amount = -amount;
      }

      // The year field should not cycle within the era as that can cause weird behavior affecting other fields.
      // We need to also allow values < 1 so that decrementing goes to the previous era. If we get -Infinity back
      // we know we wrapped around after reaching 9999 (the maximum), so set the year back to 1.
      mutable.year = cycleValue(value.year, amount, -Infinity, 9999, options?.round);
      if (mutable.year === -Infinity) {
        mutable.year = 1;
      }

      break;
    }
    case 'month':
      mutable.month = cycleValue(value.month, amount, 1, value.calendar.getMaxMonths(), options?.round);
      break;
    default:
      mutable.day = cycleValue(value.day, amount, 1, value.calendar.getDaysInMonth(value), options?.round);
  }

  if (value.calendar.balanceDate) {
    value.calendar.balanceDate(mutable);
  }
  return mutable;
}


function cycleValue(value: number, amount: number, min: number, max: number, round = false) {
  if (round) {
    value += Math.sign(amount);

    if (value < min) {
      value = max;
    }

    let div = Math.abs(amount);
    if (amount > 0) {
      value = Math.ceil(value / div) * div;
    } else {
      value = Math.floor(value / div) * div;
    }

    if (value > max) {
      value = min;
    }
  } else {
    value += amount;
    if (value < min) {
      value = max - (min - value - 1);
    } else if (value > max) {
      value = min + (value - max - 1);
    }
  }

  return value;
}

export function cycleTime(value: IncompleteDateTime, field: TimeField, amount: number, options?: CycleTimeOptions): IncompleteDateTime;
export function cycleTime(value: IncompleteDateTime, field: TimeField, amount: number, options?: CycleTimeOptions): Mutable<IncompleteDateTime> {
  let mutable: Mutable<IncompleteDateTime> = value.copy();

  switch (field) {
    case 'hour': {
      let hours = value.hour;
      let min = 0;
      let max = 23;
      if (options?.hourCycle === 12) {
        let isPM = hours >= 12;
        min = isPM ? 12 : 0;
        max = isPM ? 23 : 11;
      }
      mutable.hour = cycleValue(hours, amount, min, max, options?.round);
      break;
    }
    case 'minute':
      mutable.minute = cycleValue(value.minute, amount, 0, 59, options?.round);
      break;
    case 'second':
      mutable.second = cycleValue(value.second, amount, 0, 59, options?.round);
      break;
    case 'millisecond':
      mutable.millisecond = cycleValue(value.millisecond, amount, 0, 999, options?.round);
      break;
    default:
      throw new Error('Unsupported field ' + field);
  }

  return mutable;
}

export function setTime(value: IncompleteDateTime, fields: TimeFields): IncompleteDateTime;
export function setTime(value: IncompleteDateTime, fields: TimeFields): Mutable<IncompleteDateTime> {
  let mutableValue: Mutable<IncompleteDateTime> = value.copy();

  if (fields.hour != null) {
    mutableValue.hour = fields.hour;
  }

  if (fields.minute != null) {
    mutableValue.minute = fields.minute;
  }

  if (fields.second != null) {
    mutableValue.second = fields.second;
  }

  if (fields.millisecond != null) {
    mutableValue.millisecond = fields.millisecond;
  }

  constrainTime(mutableValue);
  return mutableValue;
}

export function constrainTime(time: Mutable<AnyTime>): void {
  time.millisecond = Math.max(0, Math.min(time.millisecond, 1000));
  time.second = Math.max(0, Math.min(time.second, 59));
  time.minute = Math.max(0, Math.min(time.minute, 59));
  time.hour = Math.max(0, Math.min(time.hour, 23));
}

export function setZoned(dateTime: IncompleteZonedDateTime, fields: DateFields & TimeFields, disambiguation?: Disambiguation): IncompleteZonedDateTime {
  // Set the date/time fields, and recompute the UTC offset to account for DST changes.
  // We also need to validate by converting back to a local time in case hours are skipped during forward DST transitions.
  let plainDateTime = toIncompleteDateTime(dateTime);
  let res = setTime(set(plainDateTime, fields), fields);

  // If the resulting plain date time values are equal, return the original time.
  // We don't want to change the offset when setting the time to the same value.
  if (res.compare(plainDateTime) === 0) {
    return dateTime;
  }

  let ms = toAbsolute(res, dateTime.timeZone, disambiguation);
  return toCalendar(fromAbsolute(ms, dateTime.timeZone), dateTime.calendar);
}

/**
 * Converts a date value to a `ZonedDateTime` in the provided time zone. The `disambiguation` option can be set
 * to control how values that fall on daylight saving time changes are interpreted.
 */
export function toZoned(date: IncompleteDate | IncompleteDateTime | IncompleteZonedDateTime, timeZone: string, disambiguation?: Disambiguation): IncompleteZonedDateTime {
  if (date instanceof IncompleteZonedDateTime) {
    if (date.timeZone === timeZone) {
      return date;
    }

    return toTimeZone(date, timeZone);
  }

  let ms = toAbsolute(date, timeZone, disambiguation);
  return fromAbsolute(ms, timeZone);
}


export function cycleZoned(dateTime: IncompleteZonedDateTime, field: DateField | TimeField, amount: number, options?: CycleTimeOptions): IncompleteZonedDateTime {
  // For date fields, we want the time to remain consistent and the UTC offset to potentially change to account for DST changes.
  // For time fields, we want the time to change by the amount given. This may result in the hour field staying the same, but the UTC
  // offset changing in the case of a backward DST transition, or skipping an hour in the case of a forward DST transition.
  switch (field) {
    case 'hour': {
      let min = 0;
      let max = 23;
      if (options?.hourCycle === 12) {
        let isPM = dateTime.hour >= 12;
        min = isPM ? 12 : 0;
        max = isPM ? 23 : 11;
      }

      // The minimum and maximum hour may be affected by daylight saving time.
      // For example, it might jump forward at midnight, and skip 1am.
      // Or it might end at midnight and repeat the 11pm hour. To handle this, we get
      // the possible absolute times for the min and max, and find the maximum range
      // that is within the current day.
      let plainDateTime = toIncompleteDateTime(dateTime);
      let minDate = toCalendar(setTime(plainDateTime, {hour: min}), new GregorianCalendar());
      let minAbsolute = [toAbsolute(minDate, dateTime.timeZone, 'earlier'), toAbsolute(minDate, dateTime.timeZone, 'later')]
        .filter(ms => fromAbsolute(ms, dateTime.timeZone).day === minDate.day)[0];

      let maxDate = toCalendar(setTime(plainDateTime, {hour: max}), new GregorianCalendar());
      let maxAbsolute = [toAbsolute(maxDate, dateTime.timeZone, 'earlier'), toAbsolute(maxDate, dateTime.timeZone, 'later')]
        .filter(ms => fromAbsolute(ms, dateTime.timeZone).day === maxDate.day).pop()!;

      // Since hours may repeat, we need to operate on the absolute time in milliseconds.
      // This is done in hours from the Unix epoch so that cycleValue works correctly,
      // and then converted back to milliseconds.
      let ms = epochFromDate(dateTime) - dateTime.offset;
      let hours = Math.floor(ms / ONE_HOUR);
      let remainder = ms % ONE_HOUR;
      ms = cycleValue(
        hours,
        amount,
        Math.floor(minAbsolute / ONE_HOUR),
        Math.floor(maxAbsolute / ONE_HOUR),
        options?.round
      ) * ONE_HOUR + remainder;

      // Now compute the new timezone offset, and convert the absolute time back to local time.
      return toCalendar(fromAbsolute(ms, dateTime.timeZone), dateTime.calendar);
    }
    case 'minute':
    case 'second':
    case 'millisecond':
      // @ts-ignore
      return cycleTime(dateTime, field, amount, options);
    case 'era':
    case 'year':
    case 'month':
    case 'day': {
      let res = cycleDate(toIncompleteDateTime(dateTime), field, amount, options);
      let ms = toAbsolute(res, dateTime.timeZone);
      return toCalendar(fromAbsolute(ms, dateTime.timeZone), dateTime.calendar);
    }
    default:
      throw new Error('Unsupported field ' + field);
  }
}
