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

import {CalendarDate, endOfMonth, endOfWeek, EthiopicCalendar, getDayOfWeek, getMinimumDayInMonth, getMinimumMonthInYear, getWeeksInMonth, isEqualDay, isEqualMonth, isEqualYear, IslamicUmalquraCalendar, isSameDay, isSameMonth, isSameYear, JapaneseCalendar, startOfMonth, startOfWeek} from '..';

describe('queries', function () {
  describe('isSameDay', function () {
    it('works with two dates in the same calendar', function () {
      expect(isSameDay(new CalendarDate(2020, 2, 3), new CalendarDate(2020, 2, 3))).toBe(true);
      expect(isSameDay(new CalendarDate(2019, 2, 3), new CalendarDate(2020, 2, 3))).toBe(false);
      expect(isSameDay(new CalendarDate(2020, 3, 3), new CalendarDate(2020, 2, 3))).toBe(false);
      expect(isSameDay(new CalendarDate(2020, 2, 4), new CalendarDate(2020, 2, 3))).toBe(false);
    });

    it('works with two dates in different calendars', function () {
      expect(isSameDay(new CalendarDate(2021, 4, 16), new CalendarDate(new IslamicUmalquraCalendar(), 1442, 9, 4))).toBe(true);
      expect(isSameDay(new CalendarDate(new IslamicUmalquraCalendar(), 1442, 9, 4), new CalendarDate(2021, 4, 16))).toBe(true);
      expect(isSameDay(new CalendarDate(2019, 4, 16), new CalendarDate(new IslamicUmalquraCalendar(), 1442, 9, 4))).toBe(false);
      expect(isSameDay(new CalendarDate(2021, 4, 16), new CalendarDate(new IslamicUmalquraCalendar(), 1441, 9, 4))).toBe(false);
      expect(isSameDay(new CalendarDate(2021, 5, 16), new CalendarDate(new IslamicUmalquraCalendar(), 1442, 9, 4))).toBe(false);
      expect(isSameDay(new CalendarDate(2021, 4, 16), new CalendarDate(new IslamicUmalquraCalendar(), 1442, 10, 4))).toBe(false);
      expect(isSameDay(new CalendarDate(2021, 4, 17), new CalendarDate(new IslamicUmalquraCalendar(), 1442, 9, 4))).toBe(false);
      expect(isSameDay(new CalendarDate(2021, 4, 16), new CalendarDate(new IslamicUmalquraCalendar(), 1442, 9, 3))).toBe(false);
    });
  });

  describe('isSameMonth', function () {
    it('works with two dates in the same calendar', function () {
      expect(isSameMonth(new CalendarDate(2020, 2, 3), new CalendarDate(2020, 2, 3))).toBe(true);
      expect(isSameMonth(new CalendarDate(2019, 2, 3), new CalendarDate(2020, 2, 3))).toBe(false);
      expect(isSameMonth(new CalendarDate(2020, 3, 3), new CalendarDate(2020, 2, 3))).toBe(false);
      expect(isSameMonth(new CalendarDate(2020, 2, 4), new CalendarDate(2020, 2, 3))).toBe(true);
    });

    it('works with two dates in different calendars', function () {
      expect(isSameMonth(new CalendarDate(2021, 4, 16), new CalendarDate(new IslamicUmalquraCalendar(), 1442, 9, 4))).toBe(true);
      expect(isSameMonth(new CalendarDate(new IslamicUmalquraCalendar(), 1442, 9, 4), new CalendarDate(2021, 4, 16))).toBe(true);
      expect(isSameMonth(new CalendarDate(2019, 4, 16), new CalendarDate(new IslamicUmalquraCalendar(), 1442, 9, 4))).toBe(false);
      expect(isSameMonth(new CalendarDate(2021, 4, 16), new CalendarDate(new IslamicUmalquraCalendar(), 1441, 9, 4))).toBe(false);
      expect(isSameMonth(new CalendarDate(2021, 5, 16), new CalendarDate(new IslamicUmalquraCalendar(), 1442, 9, 4))).toBe(false);
      expect(isSameMonth(new CalendarDate(2021, 4, 16), new CalendarDate(new IslamicUmalquraCalendar(), 1442, 10, 4))).toBe(false);
      expect(isSameMonth(new CalendarDate(2021, 4, 17), new CalendarDate(new IslamicUmalquraCalendar(), 1442, 9, 4))).toBe(true);
      expect(isSameMonth(new CalendarDate(2021, 4, 16), new CalendarDate(new IslamicUmalquraCalendar(), 1442, 9, 3))).toBe(true);
    });
  });

  describe('isSameYear', function () {
    it('works with two dates in the same calendar', function () {
      expect(isSameYear(new CalendarDate(2020, 2, 3), new CalendarDate(2020, 2, 3))).toBe(true);
      expect(isSameYear(new CalendarDate(2019, 2, 3), new CalendarDate(2020, 2, 3))).toBe(false);
      expect(isSameYear(new CalendarDate(2020, 3, 3), new CalendarDate(2020, 2, 3))).toBe(true);
      expect(isSameYear(new CalendarDate(2020, 2, 4), new CalendarDate(2020, 2, 3))).toBe(true);
    });

    it('works with two dates in different calendars', function () {
      expect(isSameYear(new CalendarDate(2021, 4, 16), new CalendarDate(new IslamicUmalquraCalendar(), 1442, 9, 4))).toBe(true);
      expect(isSameYear(new CalendarDate(new IslamicUmalquraCalendar(), 1442, 9, 4), new CalendarDate(2021, 4, 16))).toBe(true);
      expect(isSameYear(new CalendarDate(2019, 4, 16), new CalendarDate(new IslamicUmalquraCalendar(), 1442, 9, 4))).toBe(false);
      expect(isSameYear(new CalendarDate(2021, 4, 16), new CalendarDate(new IslamicUmalquraCalendar(), 1441, 9, 4))).toBe(false);
      expect(isSameYear(new CalendarDate(2021, 5, 16), new CalendarDate(new IslamicUmalquraCalendar(), 1442, 9, 4))).toBe(true);
      expect(isSameYear(new CalendarDate(2021, 4, 16), new CalendarDate(new IslamicUmalquraCalendar(), 1442, 10, 4))).toBe(true);
      expect(isSameYear(new CalendarDate(2021, 4, 17), new CalendarDate(new IslamicUmalquraCalendar(), 1442, 9, 4))).toBe(true);
      expect(isSameYear(new CalendarDate(2021, 4, 16), new CalendarDate(new IslamicUmalquraCalendar(), 1442, 9, 3))).toBe(true);
    });
  });

  describe('isEqualDay', function () {
    it('works with two dates in the same calendar', function () {
      expect(isEqualDay(new CalendarDate(2020, 2, 3), new CalendarDate(2020, 2, 3))).toBe(true);
      expect(isEqualDay(new CalendarDate(2019, 2, 3), new CalendarDate(2020, 2, 3))).toBe(false);
      expect(isEqualDay(new CalendarDate(2020, 3, 3), new CalendarDate(2020, 2, 3))).toBe(false);
      expect(isEqualDay(new CalendarDate(2020, 2, 4), new CalendarDate(2020, 2, 3))).toBe(false);
    });

    it('does not work with two dates in different calendars', function () {
      expect(isEqualDay(new CalendarDate(2021, 4, 16), new CalendarDate(new IslamicUmalquraCalendar(), 1442, 9, 4))).toBe(false);
      expect(isEqualDay(new CalendarDate(new IslamicUmalquraCalendar(), 1442, 9, 4), new CalendarDate(2021, 4, 16))).toBe(false);
    });
  });

  describe('isEqualMonth', function () {
    it('works with two dates in the same calendar', function () {
      expect(isEqualMonth(new CalendarDate(2020, 2, 3), new CalendarDate(2020, 2, 3))).toBe(true);
      expect(isEqualMonth(new CalendarDate(2019, 2, 3), new CalendarDate(2020, 2, 3))).toBe(false);
      expect(isEqualMonth(new CalendarDate(2020, 3, 3), new CalendarDate(2020, 2, 3))).toBe(false);
      expect(isEqualMonth(new CalendarDate(2020, 2, 4), new CalendarDate(2020, 2, 3))).toBe(true);
    });

    it('does not work with two dates in different calendars', function () {
      expect(isEqualMonth(new CalendarDate(2021, 4, 16), new CalendarDate(new IslamicUmalquraCalendar(), 1442, 9, 4))).toBe(false);
      expect(isEqualMonth(new CalendarDate(new IslamicUmalquraCalendar(), 1442, 9, 4), new CalendarDate(2021, 4, 16))).toBe(false);
    });
  });

  describe('isEqualYear', function () {
    it('works with two dates in the same calendar', function () {
      expect(isEqualYear(new CalendarDate(2020, 2, 3), new CalendarDate(2020, 2, 3))).toBe(true);
      expect(isEqualYear(new CalendarDate(2019, 2, 3), new CalendarDate(2020, 2, 3))).toBe(false);
      expect(isEqualYear(new CalendarDate(2020, 3, 3), new CalendarDate(2020, 2, 3))).toBe(true);
      expect(isEqualYear(new CalendarDate(2020, 2, 4), new CalendarDate(2020, 2, 3))).toBe(true);
    });

    it('does not work with two dates in different calendars', function () {
      expect(isEqualYear(new CalendarDate(2021, 4, 16), new CalendarDate(new IslamicUmalquraCalendar(), 1442, 9, 4))).toBe(false);
      expect(isEqualYear(new CalendarDate(new IslamicUmalquraCalendar(), 1442, 9, 4), new CalendarDate(2021, 4, 16))).toBe(false);
    });
  });

  describe('startOfMonth', function () {
    it('moves the day to the first of the month', function () {
      expect(startOfMonth(new CalendarDate(2020, 2, 3))).toEqual(new CalendarDate(2020, 2, 1));
      expect(startOfMonth(new CalendarDate(new IslamicUmalquraCalendar(), 1442, 9, 4))).toEqual(new CalendarDate(new IslamicUmalquraCalendar(), 1442, 9, 1));
    });
  });

  describe('endOfMonth', function () {
    it('moves the day to the last day of the month', function () {
      expect(endOfMonth(new CalendarDate(2020, 2, 3))).toEqual(new CalendarDate(2020, 2, 29));
      expect(endOfMonth(new CalendarDate(new IslamicUmalquraCalendar(), 1442, 9, 4))).toEqual(new CalendarDate(new IslamicUmalquraCalendar(), 1442, 9, 30));
    });
  });

  describe('getDayOfWeek', function () {
    it('should return the day of week in en-US', function () {
      expect(getDayOfWeek(new CalendarDate(2021, 8, 4), 'en-US')).toBe(3);
    });

    it('should return the day of week in fr-CA', function () {
      expect(getDayOfWeek(new CalendarDate(2021, 8, 4), 'fr-CA')).toBe(3);
    });

    it('should return the day of week in fr-FR', function () {
      expect(getDayOfWeek(new CalendarDate(2021, 8, 4), 'fr-FR')).toBe(2);
    });

    it('should return the day of week in fr', function () {
      expect(getDayOfWeek(new CalendarDate(2021, 8, 4), 'fr')).toBe(2);
    });
  });

  describe('startOfWeek', function () {
    it('should return the start of week in en-US', function () {
      expect(startOfWeek(new CalendarDate(2021, 8, 4), 'en-US')).toEqual(new CalendarDate(2021, 8, 1));
    });

    it('should return the start of week in fr-FR', function () {
      expect(startOfWeek(new CalendarDate(2021, 8, 4), 'fr-FR')).toEqual(new CalendarDate(2021, 8, 2));
    });
  });

  describe('endOfWeek', function () {
    it('should return the start of week in en-US', function () {
      expect(endOfWeek(new CalendarDate(2021, 8, 4), 'en-US')).toEqual(new CalendarDate(2021, 8, 7));
    });

    it('should return the start of week in fr-FR', function () {
      expect(endOfWeek(new CalendarDate(2021, 8, 4), 'fr-FR')).toEqual(new CalendarDate(2021, 8, 8));
    });
  });

  describe('getWeeksInMonth', function () {
    it('should work for months starting at the beginning of the week', function () {
      expect(getWeeksInMonth(new CalendarDate(2021, 8, 4), 'en-US')).toBe(5);
    });

    it('should work for months starting at the end of the week', function () {
      expect(getWeeksInMonth(new CalendarDate(2021, 10, 4), 'en-US')).toBe(6);
    });

    it('should work for other calendars', function () {
      expect(getWeeksInMonth(new CalendarDate(new EthiopicCalendar(), 2013, 13, 4), 'en-US')).toBe(1);
    });
  });

  describe('getMinimumMonthInYear', function () {
    it('returns the minimum month of the year', function () {
      expect(getMinimumMonthInYear(new CalendarDate(2020, 2, 3))).toBe(1);
    });

    it('returns the minimum month of the year in japanese eras', function () {
      expect(getMinimumMonthInYear(new CalendarDate(new JapaneseCalendar(), 'showa', 1, 12, 30))).toBe(12);
      expect(getMinimumMonthInYear(new CalendarDate(new JapaneseCalendar(), 'showa', 2, 12, 30))).toBe(1);
    });
  });

  describe('getMinimumDayInMonth', function () {
    it('returns the minimum day in a month', function () {
      expect(getMinimumDayInMonth(new CalendarDate(2020, 2, 3))).toBe(1);
    });

    it('returns the minimum day in a month in japanese eras', function () {
      expect(getMinimumDayInMonth(new CalendarDate(new JapaneseCalendar(), 'showa', 1, 12, 30))).toBe(25);
      expect(getMinimumDayInMonth(new CalendarDate(new JapaneseCalendar(), 'showa', 2, 12, 30))).toBe(1);
    });
  });
});
