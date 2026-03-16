import {AnyCalendarDate, Calendar, CalendarDate, CalendarIdentifier, GregorianCalendar} from '../src';
import {compareDate, startOfWeek} from '../src/queries';

// This calendar gives each month a 4-5-4 week pattern, with February as the first month of the year.
// This means that in this calendar, 2024-01-01 translates to 2024-02-04 in the Gregorian calendar.
// Months begin on day 1, and go through 7*weeksInMonth days, ending on either the 28th or 35th day of the month.
export class Custom454Calendar extends GregorianCalendar {
  identifier: CalendarIdentifier = 'gregory';
  // The anchor date, in Gregorian calendar.
  // The anchor date is a date that occurs in the first week of the first month of every fiscal year.
  private anchorDate: CalendarDate;
  private is454 = true;

  constructor() {
    super();
    this.anchorDate = new CalendarDate(2001, 2, 4);
  }

  getDaysInMonth(date: AnyCalendarDate): number {
    const [, isBigYear] = this.getCurrentYear(date.year);
    const weekPattern = this.getWeekPattern(isBigYear);
    return weekPattern[date.month - 1] * 7;
  }

  fromJulianDay(jd: number): CalendarDate {
    const date = super.fromJulianDay(jd);
    let year = date.year;

    let [startOfYear, isBigYear] = this.getCurrentYear(year);
    if (compareDate(date, startOfYear) < 0) {
      year--;
      [startOfYear, isBigYear] = this.getCurrentYear(year);
    }

    const weeksInMonth = this.getWeekPattern(isBigYear);
    let pointer = startOfYear;
    for (let i = 0; i < weeksInMonth.length; i++) {
      const weeks = weeksInMonth[i];
      const end = pointer.add({weeks});
      if (compareDate(end, date) > 0) {
        return new CalendarDate(this, year, i + 1, compareDate(date, pointer) + 1);
      }
      pointer = end;
    }

    throw new Error('date not found');
  }

  toJulianDay(date: AnyCalendarDate): number {
    const [startOfYear, isBigYear] = this.getCurrentYear(date.year);

    let startOfMonth = startOfYear;
    const weeksInMonth = this.getWeekPattern(isBigYear);
    for (let i = 0; i < date.month - 1; i++) {
      const weeks = weeksInMonth[i];
      startOfMonth = startOfMonth.add({weeks});
    }

    const gregorian = startOfMonth.add({days: date.day - 1});
    return super.toJulianDay(gregorian);
  }

  getFormattableMonth(date: AnyCalendarDate): CalendarDate {
    const anchorMonth = this.anchorDate.month - 1;
    const dateMonth = date.month - 1;
    const month = ((anchorMonth + dateMonth) % 12) + 1;
    let year = date.year;
    if (anchorMonth + dateMonth >= 12) {
      year++;
    }
    // Return as Gregorian date
    return new CalendarDate(year, month, 1);
  }

  isEqual(other: Calendar): boolean {
    let other454 = other as Custom454Calendar;
    return other454.is454 === true && other454.anchorDate.compare(this.anchorDate) === 0;
  }

  private getWeekPattern(isBigYear: boolean): number[] {
    return isBigYear ? [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 5] : [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4];
  }

  private getCurrentYear(year: number): [CalendarDate, boolean] {
    const anchor = this.anchorDate.set({year});
    const startOfYear = startOfWeek(anchor, 'en', 'sun');
    const isBigYear = !startOfYear.add({weeks: 53}).compare(anchor.add({years: 1}));
    return [startOfYear, isBigYear];
  }
}
