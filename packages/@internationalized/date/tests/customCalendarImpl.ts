import {AnyCalendarDate, CalendarDate, GregorianCalendar, toCalendar} from '../src';
import {compareDate, startOfWeek} from '../src/queries';

export class Custom454Calendar extends GregorianCalendar {
  identifier = 'custom-454';
  #anchorDate: CalendarDate;

  constructor() {
    super();
    this.#anchorDate = new CalendarDate(2001, 2, 4);
  }

  getDaysInMonth(date: AnyCalendarDate) {
    let [, isBigYear] = this.#getCurrentYear(date.year);
    const weekPattern = this.#getWeekPattern(isBigYear);
    return weekPattern[date.month % weekPattern.length] * 7;
  }

  fromJulianDay(jd: number): CalendarDate {
    let gregorian = super.fromJulianDay(jd);
    let [startOfYear, isBigYear] = this.#getCurrentYear(gregorian.year);
    const months = this.#getWeekPattern(isBigYear);

    let year = gregorian.year;
    if (compareDate(gregorian, startOfYear) < 0) {
      year--;
      [startOfYear, isBigYear] = this.#getCurrentYear(year);
    }

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
    let [startOfYear, isBigYear] = this.#getCurrentYear(date.year);

    let startOfMonth = startOfYear;
    const months = this.#getWeekPattern(isBigYear);
    for (let i = 1; i < date.month; i++) {
      startOfMonth = startOfMonth.add({weeks: months[i % months.length]});
    }

    let gregorian = startOfMonth.add({days: date.day - 1});
    return super.toJulianDay(gregorian);
  }

  #getWeekPattern(isBigYear: boolean) {
    // Retail calendars begin in Feb, but we index months with Jan as month 1, so we shift the week pattern by 1.
    return isBigYear ? [5, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5] : [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5];
  }

  #getCurrentYear(year: number): [CalendarDate, boolean] {
    let anchor = this.#anchorDate.set({year});
    let startOfYear = startOfWeek(anchor, 'en', 'sun');
    let isBigYear = !startOfYear.add({weeks: 53}).compare(anchor.add({years: 1}));
    return [startOfYear, isBigYear];
  }

  getFormattableMonth(date: AnyCalendarDate): CalendarDate {
    let gregorian = toCalendar(date, new GregorianCalendar());
    let month = (this.#anchorDate.month - 1 + date.month - 1) % 12 + 1;
    return gregorian.set({month, day: 1});
  }
}
