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

import {CalendarDate, HebrewCalendar, JapaneseCalendar, TaiwanCalendar} from '..';

describe('CalendarDate manipulation', function () {
  describe('add', function () {
    it('should add years', function () {
      let date = new CalendarDate(2020, 1, 1);
      expect(date.add({years: 5})).toEqual(new CalendarDate(2025, 1, 1));
    });

    it('should add months', function () {
      let date = new CalendarDate(2020, 1, 1);
      expect(date.add({months: 5})).toEqual(new CalendarDate(2020, 6, 1));
    });

    it('should add months across years', function () {
      let date = new CalendarDate(2020, 9, 1);
      expect(date.add({months: 5})).toEqual(new CalendarDate(2021, 2, 1));
    });

    it('should add months across multiple years', function () {
      let date = new CalendarDate(2020, 9, 1);
      expect(date.add({months: 17})).toEqual(new CalendarDate(2022, 2, 1));
    });

    it('should add months and constrain days', function () {
      let date = new CalendarDate(2020, 8, 31);
      expect(date.add({months: 1})).toEqual(new CalendarDate(2020, 9, 30));
    });

    it('should add days', function () {
      let date = new CalendarDate(2020, 9, 1);
      expect(date.add({days: 5})).toEqual(new CalendarDate(2020, 9, 6));
    });

    it('should add days across months', function () {
      let date = new CalendarDate(2020, 9, 20);
      expect(date.add({days: 15})).toEqual(new CalendarDate(2020, 10, 5));
    });

    it('should add days across multiple months', function () {
      let date = new CalendarDate(2020, 9, 20);
      expect(date.add({days: 46})).toEqual(new CalendarDate(2020, 11, 5));
    });

    it('should add days across years', function () {
      let date = new CalendarDate(2020, 12, 20);
      expect(date.add({days: 15})).toEqual(new CalendarDate(2021, 1, 4));
    });

    it('should add days across multiple years', function () {
      let date = new CalendarDate(2020, 12, 20);
      expect(date.add({days: 380})).toEqual(new CalendarDate(2022, 1, 4));
    });

    it('should handle leap years', function () {
      let date = new CalendarDate(2020, 2, 28);
      expect(date.add({days: 1})).toEqual(new CalendarDate(2020, 2, 29));
      expect(date.add({days: 2})).toEqual(new CalendarDate(2020, 3, 1));
    });

    it('should handle non-leap years', function () {
      let date = new CalendarDate(2019, 2, 28);
      expect(date.add({days: 1})).toEqual(new CalendarDate(2019, 3, 1));
    });

    it('should add weeks', function () {
      let date = new CalendarDate(2020, 9, 1);
      expect(date.add({weeks: 5})).toEqual(new CalendarDate(2020, 10, 6));
    });

    it('should add years, months, and days together', function () {
      let date = new CalendarDate(2020, 10, 25);
      expect(date.add({years: 2, months: 3, days: 10})).toEqual(new CalendarDate(2023, 2, 4));
    });

    describe('Japanese calendar', function () {
      it('should add years and rebalance era', function () {
        let date = new CalendarDate(new JapaneseCalendar(), 'heisei', 31, 4, 30);
        expect(date.add({years: 1})).toEqual(new CalendarDate(new JapaneseCalendar(), 'reiwa', 2, 4, 30));
      });

      it('should add months and rebalance era', function () {
        let date = new CalendarDate(new JapaneseCalendar(), 'heisei', 31, 4, 30);
        expect(date.add({months: 1})).toEqual(new CalendarDate(new JapaneseCalendar(), 'reiwa', 1, 5, 30));
      });

      it('should add days and rebalance era', function () {
        let date = new CalendarDate(new JapaneseCalendar(), 'heisei', 31, 4, 30);
        expect(date.add({days: 1})).toEqual(new CalendarDate(new JapaneseCalendar(), 'reiwa', 1, 5, 1));
      });
    });

    describe('Taiwan calendar', function () {
      it('should add years and rebalance era', function () {
        let date = new CalendarDate(new TaiwanCalendar(), 'before_minguo', 1, 4, 30);
        expect(date.add({years: 1})).toEqual(new CalendarDate(new TaiwanCalendar(), 'minguo', 1, 4, 30));
      });

      it('should add years in before_minguo era', function () {
        let date = new CalendarDate(new TaiwanCalendar(), 'before_minguo', 3, 4, 30);
        expect(date.add({years: 1})).toEqual(new CalendarDate(new TaiwanCalendar(), 'before_minguo', 2, 4, 30));
      });

      it('should add months and rebalance era', function () {
        let date = new CalendarDate(new TaiwanCalendar(), 'before_minguo', 1, 12, 30);
        expect(date.add({months: 1})).toEqual(new CalendarDate(new TaiwanCalendar(), 'minguo', 1, 1, 30));
      });

      it('should add days and rebalance era', function () {
        let date = new CalendarDate(new TaiwanCalendar(), 'before_minguo', 1, 12, 31);
        expect(date.add({days: 1})).toEqual(new CalendarDate(new TaiwanCalendar(), 'minguo', 1, 1, 1));
      });
    });

    describe('Hebrew calendar', function () {
      it('should add months in a non-leap year', function () {
        let date = new CalendarDate(new HebrewCalendar(), 5781, 5, 1);
        expect(date.add({months: 1})).toEqual(new CalendarDate(new HebrewCalendar(), 5781, 6, 1));

        date = new CalendarDate(new HebrewCalendar(), 5781, 12, 1);
        expect(date.add({months: 1})).toEqual(new CalendarDate(new HebrewCalendar(), 5782, 1, 1));
      });

      it('should add months in a leap year', function () {
        let date = new CalendarDate(new HebrewCalendar(), 5782, 5, 1);
        expect(date.add({months: 1})).toEqual(new CalendarDate(new HebrewCalendar(), 5782, 6, 1));

        date = new CalendarDate(new HebrewCalendar(), 5782, 12, 1);
        expect(date.add({months: 1})).toEqual(new CalendarDate(new HebrewCalendar(), 5782, 13, 1));
      });

      it('should add years in a leap year', function () {
        let date = new CalendarDate(new HebrewCalendar(), 5782, 13, 1);
        expect(date.add({years: 1})).toEqual(new CalendarDate(new HebrewCalendar(), 5783, 12, 1));
      });
    });
  });

  describe('subtract', function () {
    it('should subtract years', function () {
      let date = new CalendarDate(2025, 1, 1);
      expect(date.subtract({years: 5})).toEqual(new CalendarDate(2020, 1, 1));
    });

    it('should subtract months', function () {
      let date = new CalendarDate(2020, 6, 1);
      expect(date.subtract({months: 5})).toEqual(new CalendarDate(2020, 1, 1));
    });

    it('should subtract months across years', function () {
      let date = new CalendarDate(2021, 2, 1);
      expect(date.subtract({months: 5})).toEqual(new CalendarDate(2020, 9, 1));
    });

    it('should subtract months across multiple years', function () {
      let date = new CalendarDate(2022, 2, 1);
      expect(date.subtract({months: 17})).toEqual(new CalendarDate(2020, 9, 1));
    });

    it('should subtract months and constrain days', function () {
      let date = new CalendarDate(2020, 10, 31);
      expect(date.subtract({months: 1})).toEqual(new CalendarDate(2020, 9, 30));
    });

    it('should subtract days', function () {
      let date = new CalendarDate(2020, 9, 6);
      expect(date.subtract({days: 5})).toEqual(new CalendarDate(2020, 9, 1));
    });

    it('should subtract days across months', function () {
      let date = new CalendarDate(2020, 10, 5);
      expect(date.subtract({days: 15})).toEqual(new CalendarDate(2020, 9, 20));
    });

    it('should subtract days across multiple months', function () {
      let date = new CalendarDate(2020, 11, 5);
      expect(date.subtract({days: 46})).toEqual(new CalendarDate(2020, 9, 20));
    });

    it('should subtract days across years', function () {
      let date = new CalendarDate(2021, 1, 4);
      expect(date.subtract({days: 15})).toEqual(new CalendarDate(2020, 12, 20));
    });

    it('should subtract days across multiple years', function () {
      let date = new CalendarDate(2022, 1, 4);
      expect(date.subtract({days: 380})).toEqual(new CalendarDate(2020, 12, 20));
    });

    it('should handle leap years', function () {
      let date = new CalendarDate(2020, 2, 28);
      expect(new CalendarDate(2020, 2, 29).subtract({days: 1})).toEqual(date);
      expect(new CalendarDate(2020, 3, 1).subtract({days: 2})).toEqual(date);
    });

    it('should handle non-leap years', function () {
      let date = new CalendarDate(2019, 2, 28);
      expect(new CalendarDate(2019, 3, 1).subtract({days: 1})).toEqual(date);
    });

    it('should subtract weeks', function () {
      let date = new CalendarDate(2020, 10, 6);
      expect(date.subtract({weeks: 5})).toEqual(new CalendarDate(2020, 9, 1));
    });

    describe('Japanese calendar', function () {
      it('should subtract years and rebalance era', function () {
        let date = new CalendarDate(new JapaneseCalendar(), 'reiwa', 1, 5, 30);
        expect(date.subtract({years: 1})).toEqual(new CalendarDate(new JapaneseCalendar(), 'heisei', 30, 5, 30));
      });

      it('should subtract months and rebalance era', function () {
        let date = new CalendarDate(new JapaneseCalendar(), 'reiwa', 1, 5, 30);
        expect(date.subtract({months: 1})).toEqual(new CalendarDate(new JapaneseCalendar(), 'heisei', 31, 4, 30));
      });

      it('should subtract days and rebalance era', function () {
        let date = new CalendarDate(new JapaneseCalendar(), 'reiwa', 1, 5, 1);
        expect(date.subtract({days: 1})).toEqual(new CalendarDate(new JapaneseCalendar(), 'heisei', 31, 4, 30));
      });
    });

    describe('Taiwan calendar', function () {
      it('should subtract years and rebalance era', function () {
        let date = new CalendarDate(new TaiwanCalendar(), 'minguo', 1, 4, 30);
        expect(date.subtract({years: 1})).toEqual(new CalendarDate(new TaiwanCalendar(), 'before_minguo', 1, 4, 30));
      });

      it('should subtract years in before_minguo era', function () {
        let date = new CalendarDate(new TaiwanCalendar(), 'before_minguo', 2, 4, 30);
        expect(date.subtract({years: 1})).toEqual(new CalendarDate(new TaiwanCalendar(), 'before_minguo', 3, 4, 30));
      });

      it('should subtract months and rebalance era', function () {
        let date = new CalendarDate(new TaiwanCalendar(), 'minguo', 1, 1, 30);
        expect(date.subtract({months: 1})).toEqual(new CalendarDate(new TaiwanCalendar(), 'before_minguo', 1, 12, 30));
      });

      it('should subtract days and rebalance era', function () {
        let date = new CalendarDate(new TaiwanCalendar(), 'minguo', 1, 1, 1);
        expect(date.subtract({days: 1})).toEqual(new CalendarDate(new TaiwanCalendar(), 'before_minguo', 1, 12, 31));
      });
    });

    describe('Hebrew calendar', function () {
      it('should subtract months in a non-leap year', function () {
        let date = new CalendarDate(new HebrewCalendar(), 5781, 6, 1);
        expect(date.subtract({months: 1})).toEqual(new CalendarDate(new HebrewCalendar(), 5781, 5, 1));

        date = new CalendarDate(new HebrewCalendar(), 5782, 1, 1);
        expect(date.subtract({months: 1})).toEqual(new CalendarDate(new HebrewCalendar(), 5781, 12, 1));
      });

      it('should subtract months in a leap year', function () {
        let date = new CalendarDate(new HebrewCalendar(), 5782, 6, 1);
        expect(date.subtract({months: 1})).toEqual(new CalendarDate(new HebrewCalendar(), 5782, 5, 1));

        date = new CalendarDate(new HebrewCalendar(), 5782, 13, 1);
        expect(date.subtract({months: 1})).toEqual(new CalendarDate(new HebrewCalendar(), 5782, 12, 1));
      });

      it('should subtract years in a leap year', function () {
        let date = new CalendarDate(new HebrewCalendar(), 5782, 13, 1);
        expect(date.subtract({years: 1})).toEqual(new CalendarDate(new HebrewCalendar(), 5781, 12, 1));
      });
    });
  });

  describe('set', function () {
    it('should set year', function () {
      let date = new CalendarDate(2020, 2, 3);
      expect(date.set({year: 2022})).toEqual(new CalendarDate(2022, 2, 3));
    });

    it('should set month', function () {
      let date = new CalendarDate(2020, 2, 3);
      expect(date.set({month: 5})).toEqual(new CalendarDate(2020, 5, 3));
    });

    it('should balance month', function () {
      let date = new CalendarDate(2020, 2, 3);
      expect(date.set({month: 13})).toEqual(new CalendarDate(2021, 1, 3));
    });

    it('should constrain month', function () {
      let date = new CalendarDate(2020, 2, 3);
      expect(date.set({month: 13}, 'constrain')).toEqual(new CalendarDate(2020, 12, 3));
    });

    it('should set month and balance day', function () {
      let date = new CalendarDate(2020, 2, 31);
      expect(date.set({month: 9})).toEqual(new CalendarDate(2020, 10, 1));
    });

    it('should set month and constrain day', function () {
      let date = new CalendarDate(2020, 2, 31);
      expect(date.set({month: 9}, 'constrain')).toEqual(new CalendarDate(2020, 9, 30));
    });

    it('should set day', function () {
      let date = new CalendarDate(2020, 2, 3);
      expect(date.set({day: 9})).toEqual(new CalendarDate(2020, 2, 9));
    });

    it('should balance day', function () {
      let date = new CalendarDate(2020, 9, 3);
      expect(date.set({day: 31})).toEqual(new CalendarDate(2020, 10, 1));
    });

    it('should constrain day', function () {
      let date = new CalendarDate(2020, 9, 3);
      expect(date.set({day: 31}, 'constrain')).toEqual(new CalendarDate(2020, 9, 30));
    });

    it('should balance day on leap years', function () {
      let date = new CalendarDate(2020, 2, 3);
      expect(date.set({day: 31})).toEqual(new CalendarDate(2020, 3, 2));

      date = new CalendarDate(2019, 2, 3);
      expect(date.set({day: 31})).toEqual(new CalendarDate(2019, 3, 3));
    });

    it('should constrain day on leap years', function () {
      let date = new CalendarDate(2020, 2, 3);
      expect(date.set({day: 31}, 'constrain')).toEqual(new CalendarDate(2020, 2, 29));

      date = new CalendarDate(2019, 2, 3);
      expect(date.set({day: 31}, 'constrain')).toEqual(new CalendarDate(2019, 2, 28));
    });

    describe('Japanese calendar', function () {
      it('should rebalance era', function () {
        let date = new CalendarDate(new JapaneseCalendar(), 'heisei', 31, 4, 30);
        expect(date.set({month: 5})).toEqual(new CalendarDate(new JapaneseCalendar(), 'reiwa', 1, 5, 30));
      });
    });

    describe('Taiwan calendar', function () {
      it('should rebalance era', function () {
        let date = new CalendarDate(new TaiwanCalendar(), 'before_minguo', 5, 4, 30);
        expect(date.set({year: -2})).toEqual(new CalendarDate(new TaiwanCalendar(), 'minguo', 3, 4, 30));
      });
    });
  });
});
