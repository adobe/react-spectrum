import {AnyCalendarDate, CalendarDate, GregorianCalendar, toCalendar} from '../src';
import {compareDate, startOfWeek} from '../src/queries';
import {set as setDate} from '../src/manipulation';

export class Custom454Calendar extends GregorianCalendar {
  identifier = 'custom-454';
  // The anchor date, in Gregorian calendar.
  private anchorDate: CalendarDate;

  constructor() {
    super();
    this.anchorDate = new CalendarDate(2001, 2, 4);
  }

  getDaysInMonth(date: AnyCalendarDate) {
    const [, isBigYear] = this.getCurrentYear(date.year);
    const weekPattern = this.getWeekPattern(isBigYear);
    return weekPattern[date.month % weekPattern.length] * 7;
  }

  fromJulianDay(jd: number): CalendarDate {
    const gregorian = super.fromJulianDay(jd);
    let [startOfYear, isBigYear] = this.getCurrentYear(gregorian.year);

    let year = gregorian.year;
    if (compareDate(gregorian, startOfYear) < 0) {
      year--;
      [startOfYear, isBigYear] = this.getCurrentYear(year);
    }

    const months = this.getWeekPattern(isBigYear);
    let pointer = startOfYear;
    for (let k = 1; k <= months.length; k++) {
      const weeksInMonth = months[k % months.length];
      const end = pointer.add({weeks: weeksInMonth});
      if (compareDate(end, gregorian) > 0) {
        return new CalendarDate(this, year, k, compareDate(gregorian, pointer) + 1);
      }
      pointer = end;
    }

    throw new Error('date not found');
  }

  toJulianDay(date: AnyCalendarDate): number {
    const [startOfYear, isBigYear] = this.getCurrentYear(date.year);

    let startOfMonth = startOfYear;
    const months = this.getWeekPattern(isBigYear);
    for (let i = 1; i < date.month; i++) {
      startOfMonth = startOfMonth.add({weeks: months[i % months.length]});
    }

    const gregorian = startOfMonth.add({days: date.day - 1});
    return super.toJulianDay(gregorian);
  }

  getFormattableMonth(date: AnyCalendarDate): CalendarDate {
    const gregorian = toCalendar(date, new GregorianCalendar()) as CalendarDate;
    const anchorMonth = this.anchorDate.month - 1;
    const dateMonth = date.month - 1;
    const month = ((anchorMonth + dateMonth) % 12) + 1;
    return setDate(gregorian, {month, day: 1});
  }

  private getWeekPattern(isBigYear: boolean) {
    // Retail calendars begin in Feb, but we index months with Jan as month 1, so we shift the week pattern by 1.
    return isBigYear ? [5, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5] : [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5];
  }

  private getCurrentYear(year: number): [CalendarDate, boolean] {
    const anchor = this.anchorDate.set({year});
    const startOfYear = startOfWeek(anchor, 'en', 'sun');
    const isBigYear = !startOfYear.add({weeks: 53}).compare(anchor.add({years: 1}));
    return [startOfYear, isBigYear];
  }
}
