/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {BuddhistCalendar, CalendarDate, CalendarDateTime, EthiopicAmeteAlemCalendar, EthiopicCalendar, GregorianCalendar, HebrewCalendar, IndianCalendar, IslamicCivilCalendar, IslamicTabularCalendar, IslamicUmalquraCalendar, JapaneseCalendar, PersianCalendar, TaiwanCalendar, Time, toCalendar, toCalendarDate, toCalendarDateTime, toTime, ZonedDateTime} from '..';
import {fromAbsolute, possibleAbsolutes, toAbsolute, toDate} from '../src/conversion';

describe('CalendarDate conversion', function () {
  describe('toAbsolute', function () {
    it('should handle a normal date', function () {
      let date = new CalendarDateTime(2020, 2, 3, 2);
      expect(toAbsolute(date, 'America/Los_Angeles')).toBe(new Date('2020-02-03T10:00Z').getTime());
    });

    it('should handle daylight saving time start', function () {
      let date = new CalendarDateTime(2020, 3, 8, 2);
      expect(toAbsolute(date, 'America/Los_Angeles')).toBe(new Date('2020-03-08T10:00Z').getTime());
    });

    it('should handle daylight saving time start with disambiguation = earlier', function () {
      let date = new CalendarDateTime(2020, 3, 8, 2);
      expect(toAbsolute(date, 'America/Los_Angeles', 'earlier')).toBe(new Date('2020-03-08T09:00Z').getTime());
    });

    it('should throw with daylight saving time start if disambiguation = reject', function () {
      let date = new CalendarDateTime(2020, 3, 8, 2);
      expect(() => {
        toAbsolute(date, 'America/Los_Angeles', 'reject');
      }).toThrow('No such absolute time found');
    });

    it('should handle daylight saving time end', function () {
      let date = new CalendarDateTime(2020, 11, 1, 1);
      expect(toAbsolute(date, 'America/Los_Angeles')).toBe(new Date('2020-11-01T08:00:00.000Z').getTime());
    });

    it('should handle daylight saving time end with disambiguation = later', function () {
      let date = new CalendarDateTime(2020, 11, 1, 1);
      expect(toAbsolute(date, 'America/Los_Angeles', 'later')).toBe(new Date('2020-11-01T09:00:00.000Z').getTime());
    });

    it('should throw with daylight saving time end if disambiguation = reject', function () {
      let date = new CalendarDateTime(2020, 11, 1, 1);
      expect(() => {
        toAbsolute(date, 'America/Los_Angeles', 'reject');
      }).toThrow('Multiple possible absolute times found');
    });

    it('should support passing a CalendarDate without a time', function () {
      let date = new CalendarDate(2020, 2, 3);
      expect(toAbsolute(date, 'America/Los_Angeles')).toBe(new Date('2020-02-03T08:00Z').getTime());
    });

    it('should support BC dates', function () {
      let date = new CalendarDateTime('BC', 2, 1, 1);
      expect(toAbsolute(date, 'UTC')).toEqual(new Date('-000001-01-01T00:00Z').getTime());
    });
  });

  describe('toDate', function () {
    it('should handle a normal date', function () {
      let date = new CalendarDateTime(2020, 2, 3, 2);
      expect(toDate(date, 'America/Los_Angeles')).toEqual(new Date('2020-02-03T10:00Z'));
    });

    it('should handle daylight saving time start', function () {
      let date = new CalendarDateTime(2020, 3, 8, 2);
      expect(toDate(date, 'America/Los_Angeles')).toEqual(new Date('2020-03-08T10:00Z'));
    });

    it('should handle daylight saving time start with disambiguation = earlier', function () {
      let date = new CalendarDateTime(2020, 3, 8, 2);
      expect(toDate(date, 'America/Los_Angeles', 'earlier')).toEqual(new Date('2020-03-08T09:00Z'));
    });

    it('should throw with daylight saving time start if disambiguation = reject', function () {
      let date = new CalendarDateTime(2020, 3, 8, 2);
      expect(() => {
        toDate(date, 'America/Los_Angeles', 'reject');
      }).toThrow('No such absolute time found');
    });

    it('should handle daylight saving time end', function () {
      let date = new CalendarDateTime(2020, 11, 1, 1);
      expect(toDate(date, 'America/Los_Angeles')).toEqual(new Date('2020-11-01T08:00:00.000Z'));
    });

    it('should handle daylight saving time end with disambiguation = later', function () {
      let date = new CalendarDateTime(2020, 11, 1, 1);
      expect(toDate(date, 'America/Los_Angeles', 'later')).toEqual(new Date('2020-11-01T09:00:00.000Z'));
    });

    it('should throw with daylight saving time end if disambiguation = reject', function () {
      let date = new CalendarDateTime(2020, 11, 1, 1);
      expect(() => {
        toDate(date, 'America/Los_Angeles', 'reject');
      }).toThrow('Multiple possible absolute times found');
    });

    it('should support passing a CalendarDate without a time', function () {
      let date = new CalendarDate(2020, 2, 3);
      expect(toDate(date, 'America/Los_Angeles')).toEqual(new Date('2020-02-03T08:00Z'));
    });

    it('should support BC dates', function () {
      let date = new CalendarDateTime('BC', 2, 1, 1);
      expect(toDate(date, 'UTC')).toEqual(new Date('-000001-01-01T00:00Z'));
    });
  });

  describe('possibleAbsolutes', function () {
    it('should handle a normal date', function () {
      let date = new CalendarDateTime(2020, 2, 3, 2);
      expect(possibleAbsolutes(date, 'America/Los_Angeles')).toEqual([
        new Date('2020-02-03T10:00Z').getTime()
      ]);
    });

    it('should handle daylight saving time start', function () {
      let date = new CalendarDateTime(2020, 3, 8, 2);
      expect(possibleAbsolutes(date, 'America/Los_Angeles')).toEqual([]);
    });

    it('should handle daylight saving time end', function () {
      let date = new CalendarDateTime(2020, 11, 1, 1);
      expect(possibleAbsolutes(date, 'America/Los_Angeles')).toEqual([
        new Date('2020-11-01T08:00:00.000Z').getTime(),
        new Date('2020-11-01T09:00:00.000Z').getTime()
      ]);
    });
  });

  describe('fromAbsolute', function () {
    it('should convert a date from absolute using a timezone', function () {
      let date = fromAbsolute(new Date('2020-02-03T10:00Z').getTime(), 'America/Los_Angeles');
      expect(date).toEqual(new ZonedDateTime(2020, 2, 3, 'America/Los_Angeles', -28800000, 2));

      date = fromAbsolute(new Date('2020-02-03T10:00Z').getTime(), 'America/New_York');
      expect(date).toEqual(new ZonedDateTime(2020, 2, 3, 'America/New_York', -18000000, 5));
    });

    it('should convert a date from absolute in the BC era', function () {
      let date = fromAbsolute(new Date('0000-01-01T00:00:00.000Z').getTime(), 'UTC');
      expect(date).toEqual(new ZonedDateTime('BC', 1, 1, 1, 'UTC', 0, 0, 0, 0));
      date = fromAbsolute(new Date('0001-01-01T00:00:00.000Z').getTime(), 'UTC');
      expect(date).toEqual(new ZonedDateTime('AD', 1, 1, 1, 'UTC', 0, 0, 0, 0));
      date = fromAbsolute(new Date('-000001-01-01T00:00:00.000Z').getTime(), 'UTC');
      expect(date).toEqual(new ZonedDateTime('BC', 2, 1, 1, 'UTC', 0, 0, 0, 0));
      date = fromAbsolute(new Date('-000009-01-01T00:00:00.000Z').getTime(), 'UTC');
      expect(date).toEqual(new ZonedDateTime('BC', 10, 1, 1, 'UTC', 0, 0, 0, 0));
    });
  });

  describe('toCalendar', function () {
    it('should support converting a CalendarDateTime between calendars', function () {
      let date = new CalendarDateTime(new JapaneseCalendar(), 'heisei', 31, 4, 30, 8, 20, 30, 80);
      expect(toCalendar(date, new GregorianCalendar())).toEqual(new CalendarDateTime(2019, 4, 30, 8, 20, 30, 80));
    });

    it('should round trip to the same date in gregorian', function () {
      let date = new CalendarDate(2020, 9, 1);
      expect(date.calendar.fromJulianDay(date.calendar.toJulianDay(date))).toEqual(new CalendarDate(2020, 9, 1));
    });

    describe('japanese', function () {
      it('japanese to gregorian', function () {
        let date = new CalendarDate(new JapaneseCalendar(), 'heisei', 31, 4, 30);
        expect(toCalendar(date, new GregorianCalendar())).toEqual(new CalendarDate(2019, 4, 30));

        date = new CalendarDate(new JapaneseCalendar(), 'reiwa', 2, 4, 30);
        expect(toCalendar(date, new GregorianCalendar())).toEqual(new CalendarDate(2020, 4, 30));
      });

      it('gregorian to japanese', function () {
        let date = new CalendarDate(2019, 4, 30);
        expect(toCalendar(date, new JapaneseCalendar())).toEqual(new CalendarDate(new JapaneseCalendar(), 'heisei', 31, 4, 30));

        date = new CalendarDate(2020, 4, 30);
        expect(toCalendar(date, new JapaneseCalendar())).toEqual(new CalendarDate(new JapaneseCalendar(), 'reiwa', 2, 4, 30));
      });

      it('returns the correct number of days for leap and non-leap years', function () {
        let date = new CalendarDate(new JapaneseCalendar(), 'reiwa', 4, 2, 5);
        expect(date.calendar.getDaysInMonth(date)).toBe(28);

        date = new CalendarDate(new JapaneseCalendar(), 'reiwa', 2, 2, 5);
        expect(date.calendar.getDaysInMonth(date)).toBe(29);
      });

      it('constrains dates outside supported eras', function () {
        let date = new CalendarDate(1700, 4, 30);
        expect(toCalendar(date, new JapaneseCalendar())).toEqual(new CalendarDate(new JapaneseCalendar(), 'meiji', 1, 9, 30));
      });
    });

    describe('taiwan', function () {
      it('taiwan to gregorian', function () {
        let date = new CalendarDate(new TaiwanCalendar(), 'minguo', 109, 2, 3);
        expect(toCalendar(date, new GregorianCalendar())).toEqual(new CalendarDate(2020, 2, 3));
      });

      it('gregorian to taiwan', function () {
        let date = new CalendarDate(2020, 2, 3);
        expect(toCalendar(date, new TaiwanCalendar())).toEqual(new CalendarDate(new TaiwanCalendar(), 'minguo', 109, 2, 3));
      });

      it('taiwan to gregorian at era boundaries', function () {
        let date = new CalendarDate(new TaiwanCalendar(), 'minguo', 1, 1, 1);
        expect(toCalendar(date, new GregorianCalendar())).toEqual(new CalendarDate(1912, 1, 1));

        date = new CalendarDate(new TaiwanCalendar(), 'before_minguo', 1, 1, 1);
        expect(toCalendar(date, new GregorianCalendar())).toEqual(new CalendarDate(1911, 1, 1));
      });

      it('gregorian to taiwan at era boundaries', function () {
        let date = new CalendarDate(1912, 1, 1);
        expect(toCalendar(date, new TaiwanCalendar())).toEqual(new CalendarDate(new TaiwanCalendar(), 'minguo', 1, 1, 1));

        date = new CalendarDate(1911, 1, 1);
        expect(toCalendar(date, new TaiwanCalendar())).toEqual(new CalendarDate(new TaiwanCalendar(), 'before_minguo', 1, 1, 1));
      });

      it('handles BC dates', function () {
        let date = new CalendarDate('BC', 2, 1, 1);
        expect(toCalendar(date, new TaiwanCalendar())).toEqual(new CalendarDate(new TaiwanCalendar(), 'before_minguo', 1913, 1, 1));

        date = new CalendarDate(new TaiwanCalendar(), 'before_minguo', 1913, 1, 1);
        expect(toCalendar(date, new GregorianCalendar())).toEqual(new CalendarDate('BC', 2, 1, 1));
      });
    });

    describe('buddhist', function () {
      it('buddhist to gregorian', function () {
        let date = new CalendarDate(new BuddhistCalendar(), 2563, 4, 30);
        expect(toCalendar(date, new GregorianCalendar())).toEqual(new CalendarDate(2020, 4, 30));
      });

      it('gregorian to buddhist', function () {
        let date = new CalendarDate(2020, 4, 30);
        expect(toCalendar(date, new BuddhistCalendar())).toEqual(new CalendarDate(new BuddhistCalendar(), 2563, 4, 30));
      });

      it('handles BC dates', function () {
        let date = new CalendarDate('BC', 2, 1, 1);
        expect(toCalendar(date, new BuddhistCalendar())).toEqual(new CalendarDate(new BuddhistCalendar(), 542, 1, 1));

        date = new CalendarDate(new BuddhistCalendar(), 542, 1, 1);
        expect(toCalendar(date, new GregorianCalendar())).toEqual(new CalendarDate('BC', 2, 1, 1));
      });
    });

    describe('indian', function () {
      it('indian to gregorian', function () {
        let date = new CalendarDate(new IndianCalendar(), 1941, 4, 30);
        expect(toCalendar(date, new GregorianCalendar())).toEqual(new CalendarDate(2019, 7, 21));

        date = new CalendarDate(new IndianCalendar(), 1941, 1, 1);
        expect(toCalendar(date, new GregorianCalendar())).toEqual(new CalendarDate(2019, 3, 22));

        date = new CalendarDate(new IndianCalendar(), 1941, 9, 1);
        expect(toCalendar(date, new GregorianCalendar())).toEqual(new CalendarDate(2019, 11, 22));
      });

      it('indian to gregorian in a leap year', function () {
        let date = new CalendarDate(new IndianCalendar(), 1942, 4, 30);
        expect(toCalendar(date, new GregorianCalendar())).toEqual(new CalendarDate(2020, 7, 21));

        date = new CalendarDate(new IndianCalendar(), 1942, 1, 1);
        expect(toCalendar(date, new GregorianCalendar())).toEqual(new CalendarDate(2020, 3, 21));

        date = new CalendarDate(new IndianCalendar(), 1942, 9, 1);
        expect(toCalendar(date, new GregorianCalendar())).toEqual(new CalendarDate(2020, 11, 22));
      });

      it('gregorian to indian', function () {
        let date = new CalendarDate(2019, 7, 21);
        expect(toCalendar(date, new IndianCalendar())).toEqual(new CalendarDate(new IndianCalendar(), 1941, 4, 30));

        date = new CalendarDate(2019, 1, 22);
        expect(toCalendar(date, new IndianCalendar())).toEqual(new CalendarDate(new IndianCalendar(), 1940, 11, 2));

        date = new CalendarDate(2019, 3, 22);
        expect(toCalendar(date, new IndianCalendar())).toEqual(new CalendarDate(new IndianCalendar(), 1941, 1, 1));

        date = new CalendarDate(2019, 11, 22);
        expect(toCalendar(date, new IndianCalendar())).toEqual(new CalendarDate(new IndianCalendar(), 1941, 9, 1));
      });

      it('gregorian to indian in a leap year', function () {
        let date = new CalendarDate(2020, 7, 21);
        expect(toCalendar(date, new IndianCalendar())).toEqual(new CalendarDate(new IndianCalendar(), 1942, 4, 30));

        date = new CalendarDate(2021, 1, 22);
        expect(toCalendar(date, new IndianCalendar())).toEqual(new CalendarDate(new IndianCalendar(), 1942, 11, 2));

        date = new CalendarDate(2020, 3, 21);
        expect(toCalendar(date, new IndianCalendar())).toEqual(new CalendarDate(new IndianCalendar(), 1942, 1, 1));

        date = new CalendarDate(2020, 11, 22);
        expect(toCalendar(date, new IndianCalendar())).toEqual(new CalendarDate(new IndianCalendar(), 1942, 9, 1));
      });
    });

    describe('islamic-civil', function () {
      it('islamic-civil to gregorian', function () {
        let date = new CalendarDate(new IslamicCivilCalendar(), 1442, 2, 4);
        expect(toCalendar(date, new GregorianCalendar())).toEqual(new CalendarDate(2020, 9, 22));
      });

      it('gregorian to islamic-civil', function () {
        let date = new CalendarDate(2020, 9, 22);
        expect(toCalendar(date, new IslamicCivilCalendar())).toEqual(new CalendarDate(new IslamicCivilCalendar(), 1442, 2, 4));
      });
    });

    describe('islamic-tbla', function () {
      it('islamic-tbla to gregorian', function () {
        let date = new CalendarDate(new IslamicTabularCalendar(), 1442, 2, 4);
        expect(toCalendar(date, new GregorianCalendar())).toEqual(new CalendarDate(2020, 9, 21));
      });

      it('gregorian to islamic-tbla', function () {
        let date = new CalendarDate(2020, 9, 21);
        expect(toCalendar(date, new IslamicTabularCalendar())).toEqual(new CalendarDate(new IslamicTabularCalendar(), 1442, 2, 4));
      });
    });

    describe('islamic-umalqura', function () {
      it('islamic-umalqura to gregorian', function () {
        let date = new CalendarDate(new IslamicUmalquraCalendar(), 1442, 9, 4);
        expect(toCalendar(date, new GregorianCalendar())).toEqual(new CalendarDate(2021, 4, 16));

        date = new CalendarDate(new IslamicUmalquraCalendar(), 1600, 9, 4);
        expect(toCalendar(date, new GregorianCalendar())).toEqual(new CalendarDate(2174, 8, 2));

        date = new CalendarDate(new IslamicUmalquraCalendar(), 1601, 9, 4);
        expect(toCalendar(date, new GregorianCalendar())).toEqual(new CalendarDate(2175, 7, 23));

        date = new CalendarDate(new IslamicUmalquraCalendar(), 1200, 9, 4);
        expect(toCalendar(date, new GregorianCalendar())).toEqual(new CalendarDate(1786, 7, 1));
      });

      it('gregorian to islamic-umalqura', function () {
        let date = new CalendarDate(2021, 4, 16);
        expect(toCalendar(date, new IslamicUmalquraCalendar())).toEqual(new CalendarDate(new IslamicUmalquraCalendar(), 1442, 9, 4));

        date = new CalendarDate(2174, 8, 2);
        expect(toCalendar(date, new IslamicUmalquraCalendar())).toEqual(new CalendarDate(new IslamicUmalquraCalendar(), 1600, 9, 4));

        date = new CalendarDate(2175, 7, 23);
        expect(toCalendar(date, new IslamicUmalquraCalendar())).toEqual(new CalendarDate(new IslamicUmalquraCalendar(), 1601, 9, 4));

        date = new CalendarDate(1786, 7, 1);
        expect(toCalendar(date, new IslamicUmalquraCalendar())).toEqual(new CalendarDate(new IslamicUmalquraCalendar(), 1200, 9, 4));
      });
    });

    describe('persian', function () {
      it('persian to gregorian', function () {
        let date = new CalendarDate(new PersianCalendar(), 1399, 6, 12);
        expect(toCalendar(date, new GregorianCalendar())).toEqual(new CalendarDate(2020, 9, 2));
      });

      it('persian to gregorian for months greater than 6', function () {
        let date = new CalendarDate(new PersianCalendar(), 1403, 12, 1);
        expect(toCalendar(date, new GregorianCalendar())).toEqual(new CalendarDate(2025, 2, 19));
      });

      it('gregorian to persian', function () {
        let date = new CalendarDate(2020, 9, 2);
        expect(toCalendar(date, new PersianCalendar())).toEqual(new CalendarDate(new PersianCalendar(), 1399, 6, 12));
      });

      it('gregorian to persian for months lower than 6', function () {
        let date = new CalendarDate(2025, 3, 21);
        expect(toCalendar(date, new PersianCalendar())).toEqual(new CalendarDate(new PersianCalendar(), 1404, 1, 1));
      });

      it('persian to gregorian in leap years', function () {
        let date = new CalendarDate(new PersianCalendar(), 1403, 12, 30);
        expect(toCalendar(date, new GregorianCalendar())).toEqual(new CalendarDate(2025, 3, 20));
      });
    });

    describe('hebrew', function () {
      it('hebrew to gregorian', function () {
        let date = new CalendarDate(new HebrewCalendar(), 5781, 1, 1);
        expect(toCalendar(date, new GregorianCalendar())).toEqual(new CalendarDate(2020, 9, 19));
      });

      it('hebrew to gregorian in a leap year', function () {
        let date = new CalendarDate(new HebrewCalendar(), 5782, 6, 1);
        expect(toCalendar(date, new GregorianCalendar())).toEqual(new CalendarDate(2022, 2, 2));
      });

      it('gregorian to hebrew', function () {
        let date = new CalendarDate(2020, 9, 19);
        expect(toCalendar(date, new HebrewCalendar())).toEqual(new CalendarDate(new HebrewCalendar(), 5781, 1, 1));
      });

      it('gregorian to hebrew in a leap year', function () {
        let date = new CalendarDate(2022, 2, 2);
        expect(toCalendar(date, new HebrewCalendar())).toEqual(new CalendarDate(new HebrewCalendar(), 5782, 6, 1));
      });
    });

    describe('ethiopic', function () {
      it('ethiopic to gregorian', function () {
        let date = new CalendarDate(new EthiopicCalendar(), 'AA', 9999, 13, 5);
        expect(toCalendar(date, new GregorianCalendar())).toEqual(new CalendarDate(4507, 9, 29));

        date = new CalendarDate(new EthiopicCalendar(), 'AM', 9991, 13, 5);
        expect(toCalendar(date, new GregorianCalendar())).toEqual(new CalendarDate(9999, 11, 9));
      });

      it('gregorian to ethioaa', function () {
        let date = new CalendarDate(4507, 9, 29);
        expect(toCalendar(date, new EthiopicCalendar())).toEqual(new CalendarDate(new EthiopicCalendar(), 'AM', 4499, 13, 5));

        date = new CalendarDate(1, 9, 29);
        expect(toCalendar(date, new EthiopicCalendar())).toEqual(new CalendarDate(new EthiopicCalendar(), 'AA', 5494, 2, 4));

        date = new CalendarDate('BC', 1200, 9, 29);
        expect(toCalendar(date, new EthiopicCalendar())).toEqual(new CalendarDate(new EthiopicCalendar(), 'AA', 4294, 2, 13));
      });
    });

    describe('ethioaa', function () {
      it('ethioaa to gregorian', function () {
        let date = new CalendarDate(new EthiopicAmeteAlemCalendar(), 9999, 13, 5);
        expect(toCalendar(date, new GregorianCalendar())).toEqual(new CalendarDate(4507, 9, 29));
      });

      it('gregorian to ethioaa', function () {
        let date = new CalendarDate(4507, 9, 29);
        expect(toCalendar(date, new EthiopicAmeteAlemCalendar())).toEqual(new CalendarDate(new EthiopicAmeteAlemCalendar(), 9999, 13, 5));
      });
    });
  });

  describe('toCalendarDate', function () {
    it('should convert a CalendarDateTime to a CalendarDate', function () {
      let dateTime = new CalendarDateTime(2020, 2, 3, 8, 23, 10, 80);
      expect(toCalendarDate(dateTime)).toEqual(new CalendarDate(2020, 2, 3));
    });

    it('should preserve calendar', function () {
      let dateTime = new CalendarDateTime(new TaiwanCalendar(), 1912, 2, 3, 8, 23, 10, 80);
      expect(toCalendarDate(dateTime)).toEqual(new CalendarDate(new TaiwanCalendar(), 1912, 2, 3));
    });
  });

  describe('toCalendarDateTime', function () {
    it('should convert a CalendarDate to a CalendarDateTime', function () {
      let date = new CalendarDate(2020, 2, 3);
      expect(toCalendarDateTime(date)).toEqual(new CalendarDateTime(2020, 2, 3));
    });

    it('should preserve calendar', function () {
      let date = new CalendarDate(new TaiwanCalendar(), 1912, 2, 3);
      expect(toCalendarDateTime(date)).toEqual(new CalendarDateTime(new TaiwanCalendar(), 1912, 2, 3));
    });

    it('should return the same instance if it is already a CalendarDateTime', function () {
      let dateTime = new CalendarDateTime(2020, 2, 3, 8, 23, 10, 80);
      expect(toCalendarDateTime(dateTime)).toBe(dateTime);
    });

    it('should combine a CalendarDate with a Time', function () {
      let date = new CalendarDate(2020, 2, 3);
      let time = new Time(8, 23, 10, 80);
      expect(toCalendarDateTime(date, time)).toEqual(new CalendarDateTime(2020, 2, 3, 8, 23, 10, 80));
    });

    it('should combine a CalendarDate with a Time and preserve calendar', function () {
      let date = new CalendarDate(new TaiwanCalendar(), 1912, 2, 3);
      let time = new Time(8, 23, 10, 80);
      expect(toCalendarDateTime(date, time)).toEqual(new CalendarDateTime(new TaiwanCalendar(), 1912, 2, 3, 8, 23, 10, 80));
    });

    it('should override the time of an existing CalendarDateTime', function () {
      let date = new CalendarDateTime(2020, 2, 3, 10, 11, 50, 80);
      let time = new Time(8, 23, 10, 80);
      expect(toCalendarDateTime(date, time)).toEqual(new CalendarDateTime(2020, 2, 3, 8, 23, 10, 80));
    });
  });

  describe('toTime', function () {
    it('should convert a CalendarDateTime to a Time', function () {
      let dateTime = new CalendarDateTime(2020, 2, 3, 8, 23, 10, 80);
      expect(toTime(dateTime)).toEqual(new Time(8, 23, 10, 80));
    });
  });
});
