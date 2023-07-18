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

import {CalendarDateTime, toZoned} from '../src';

describe('ZonedDateTime', function () {
  describe('add', function () {
    describe('should handle forward timezone transitions', function () {
      it('should add hours across forward timezone transitions', function () {
        let zoned = toZoned(new CalendarDateTime(2021, 3, 14, 1), 'America/Los_Angeles');
        let expected = toZoned(new CalendarDateTime(2021, 3, 14, 3), 'America/Los_Angeles');
        expect(zoned.add({hours: 1})).toEqual(expected);

        zoned = toZoned(new CalendarDateTime(2021, 3, 14, 1), 'America/Los_Angeles');
        expected = toZoned(new CalendarDateTime(2021, 3, 14, 4), 'America/Los_Angeles');
        expect(zoned.add({hours: 2})).toEqual(expected);
      });

      it('should subtract hours across forward timezone transitions', function () {
        let zoned = toZoned(new CalendarDateTime(2021, 3, 14, 3), 'America/Los_Angeles');
        let expected = toZoned(new CalendarDateTime(2021, 3, 14, 1), 'America/Los_Angeles');
        expect(zoned.subtract({hours: 1})).toEqual(expected);

        zoned = toZoned(new CalendarDateTime(2021, 3, 14, 4), 'America/Los_Angeles');
        expected = toZoned(new CalendarDateTime(2021, 3, 14, 1), 'America/Los_Angeles');
        expect(zoned.subtract({hours: 2})).toEqual(expected);
      });

      it('should add across forward timezone transitions at midnight', function () {
        let zoned = toZoned(new CalendarDateTime(2018, 11, 3, 23), 'America/Sao_Paulo');
        let expected = toZoned(new CalendarDateTime(2018, 11, 4, 1), 'America/Sao_Paulo');
        expect(zoned.add({hours: 1})).toEqual(expected);

        zoned = toZoned(new CalendarDateTime(2018, 11, 3, 23), 'America/Sao_Paulo');
        expected = toZoned(new CalendarDateTime(2018, 11, 4, 2), 'America/Sao_Paulo');
        expect(zoned.add({hours: 2})).toEqual(expected);
      });

      it('should add across forward timezone transitions at midnight', function () {
        let zoned = toZoned(new CalendarDateTime(2018, 11, 4, 1), 'America/Sao_Paulo');
        let expected = toZoned(new CalendarDateTime(2018, 11, 3, 23), 'America/Sao_Paulo');
        expect(zoned.subtract({hours: 1})).toEqual(expected);

        zoned = toZoned(new CalendarDateTime(2018, 11, 4, 1), 'America/Sao_Paulo');
        expected = toZoned(new CalendarDateTime(2018, 11, 3, 22), 'America/Sao_Paulo');
        expect(zoned.subtract({hours: 2})).toEqual(expected);
      });

      it('should add days and adjust hours', function () {
        let zoned = toZoned(new CalendarDateTime(2021, 3, 13, 2), 'America/Los_Angeles');
        let expected = toZoned(new CalendarDateTime(2021, 3, 14, 3), 'America/Los_Angeles');
        expect(zoned.add({days: 1})).toEqual(expected);
      });

      it('should subtract days and adjust hours', function () {
        let zoned = toZoned(new CalendarDateTime(2021, 3, 15, 2), 'America/Los_Angeles');
        let expected = toZoned(new CalendarDateTime(2021, 3, 14, 3), 'America/Los_Angeles');
        expect(zoned.subtract({days: 1})).toEqual(expected);
      });

      it('should add months and adjust hours', function () {
        let zoned = toZoned(new CalendarDateTime(2021, 2, 14, 2), 'America/Los_Angeles');
        let expected = toZoned(new CalendarDateTime(2021, 3, 14, 3), 'America/Los_Angeles');
        expect(zoned.add({months: 1})).toEqual(expected);
      });

      it('should subtract months and adjust hours', function () {
        let zoned = toZoned(new CalendarDateTime(2021, 4, 14, 2), 'America/Los_Angeles');
        let expected = toZoned(new CalendarDateTime(2021, 3, 14, 3), 'America/Los_Angeles');
        expect(zoned.subtract({months: 1})).toEqual(expected);
      });

      it('should add years and adjust hours', function () {
        let zoned = toZoned(new CalendarDateTime(2020, 3, 14, 2), 'America/Los_Angeles');
        let expected = toZoned(new CalendarDateTime(2021, 3, 14, 3), 'America/Los_Angeles');
        expect(zoned.add({years: 1})).toEqual(expected);
      });

      it('should subtract years and adjust hours', function () {
        let zoned = toZoned(new CalendarDateTime(2022, 3, 14, 2), 'America/Los_Angeles');
        let expected = toZoned(new CalendarDateTime(2021, 3, 14, 3), 'America/Los_Angeles');
        expect(zoned.subtract({years: 1})).toEqual(expected);
      });
    });

    describe('should handle backward timezone transitions', function () {
      it('should add hours across backward timezone transitions', function () {
        let zoned = toZoned(new CalendarDateTime(2021, 11, 7, 1), 'America/Los_Angeles', 'earlier');
        let expected = toZoned(new CalendarDateTime(2021, 11, 7, 1), 'America/Los_Angeles', 'later');
        expect(zoned.add({hours: 1})).toEqual(expected);

        zoned = toZoned(new CalendarDateTime(2021, 11, 7, 1), 'America/Los_Angeles', 'earlier');
        expected = toZoned(new CalendarDateTime(2021, 11, 7, 2), 'America/Los_Angeles');
        expect(zoned.add({hours: 2})).toEqual(expected);
      });

      it('should subtract hours across backward timezone transitions', function () {
        let zoned = toZoned(new CalendarDateTime(2021, 11, 7, 1), 'America/Los_Angeles', 'later');
        let expected = toZoned(new CalendarDateTime(2021, 11, 7, 1), 'America/Los_Angeles', 'earlier');
        expect(zoned.subtract({hours: 1})).toEqual(expected);

        zoned = toZoned(new CalendarDateTime(2021, 11, 7, 1), 'America/Los_Angeles', 'later');
        expected = toZoned(new CalendarDateTime(2021, 11, 7, 0), 'America/Los_Angeles');
        expect(zoned.subtract({hours: 2})).toEqual(expected);
      });

      it('should add across backward timezone transitions at midnight', function () {
        let zoned = toZoned(new CalendarDateTime(2019, 2, 16, 23), 'America/Sao_Paulo', 'earlier');
        let expected = toZoned(new CalendarDateTime(2019, 2, 16, 23), 'America/Sao_Paulo', 'later');
        expect(zoned.add({hours: 1})).toEqual(expected);

        zoned = toZoned(new CalendarDateTime(2019, 2, 16, 23), 'America/Sao_Paulo', 'earlier');
        expected = toZoned(new CalendarDateTime(2019, 2, 17, 0), 'America/Sao_Paulo');
        expect(zoned.add({hours: 2})).toEqual(expected);
      });

      it('should subtract across backward timezone transitions at midnight', function () {
        let zoned = toZoned(new CalendarDateTime(2019, 2, 16, 23), 'America/Sao_Paulo', 'later');
        let expected = toZoned(new CalendarDateTime(2019, 2, 16, 23), 'America/Sao_Paulo', 'earlier');
        expect(zoned.subtract({hours: 1})).toEqual(expected);

        zoned = toZoned(new CalendarDateTime(2019, 2, 17, 0), 'America/Sao_Paulo', 'later');
        expected = toZoned(new CalendarDateTime(2019, 2, 16, 23), 'America/Sao_Paulo');
        expect(zoned.subtract({hours: 2})).toEqual(expected);
      });
    });
  });

  describe('cycle', function () {
    describe('should handle forward timezone transitions', function () {
      it('forward', function () {
        let zoned = toZoned(new CalendarDateTime(2021, 3, 14, 1), 'America/Los_Angeles');
        let expected = toZoned(new CalendarDateTime(2021, 3, 14, 3), 'America/Los_Angeles');
        expect(zoned.cycle('hour', 1)).toEqual(expected);

        zoned = toZoned(new CalendarDateTime(2021, 3, 13, 2), 'America/Los_Angeles');
        expect(zoned.cycle('day', 1)).toEqual(expected);
      });

      it('reverse', function () {
        let zoned = toZoned(new CalendarDateTime(2021, 3, 14, 3), 'America/Los_Angeles');
        let expected = toZoned(new CalendarDateTime(2021, 3, 14, 1), 'America/Los_Angeles');
        expect(zoned.cycle('hour', -1)).toEqual(expected);

        zoned = toZoned(new CalendarDateTime(2021, 3, 15, 2), 'America/Los_Angeles');
        expected = toZoned(new CalendarDateTime(2021, 3, 14, 3), 'America/Los_Angeles');
        expect(zoned.cycle('day', -1)).toEqual(expected);
      });
    });

    describe('should handle backward timezone transitions', function () {
      it('forward', function () {
        let zoned = toZoned(new CalendarDateTime(2021, 11, 7, 1), 'America/Los_Angeles', 'earlier');
        let expected = toZoned(new CalendarDateTime(2021, 11, 7, 1), 'America/Los_Angeles', 'later');
        expect(zoned.cycle('hour', 1)).toEqual(expected);

        zoned = toZoned(new CalendarDateTime(2021, 11, 6, 1), 'America/Los_Angeles');
        expected = toZoned(new CalendarDateTime(2021, 11, 7, 1), 'America/Los_Angeles', 'earlier');
        expect(zoned.cycle('day', 1)).toEqual(expected);
      });

      it('reverse', function () {
        let zoned = toZoned(new CalendarDateTime(2021, 11, 7, 1), 'America/Los_Angeles', 'later');
        let expected = toZoned(new CalendarDateTime(2021, 11, 7, 1), 'America/Los_Angeles', 'earlier');
        expect(zoned.cycle('hour', -1)).toEqual(expected);

        zoned = toZoned(new CalendarDateTime(2021, 11, 8, 1), 'America/Los_Angeles');
        expected = toZoned(new CalendarDateTime(2021, 11, 7, 1), 'America/Los_Angeles', 'earlier');
        expect(zoned.cycle('day', -1)).toEqual(expected);
      });
    });

    describe('should handle forward timezone transitions at midnight', function () {
      describe('24 hour time', function () {
        it('forward', function () {
          let zoned = toZoned(new CalendarDateTime(2018, 11, 4, 23), 'America/Sao_Paulo');
          let expected = toZoned(new CalendarDateTime(2018, 11, 4, 1), 'America/Sao_Paulo');
          expect(zoned.cycle('hour', 1)).toEqual(expected);
        });

        it('reverse', function () {
          let zoned = toZoned(new CalendarDateTime(2018, 11, 4, 1), 'America/Sao_Paulo');
          let expected = toZoned(new CalendarDateTime(2018, 11, 4, 23), 'America/Sao_Paulo');
          expect(zoned.cycle('hour', -1)).toEqual(expected);
        });
      });

      describe('12 hour time', function () {
        it('forward', function () {
          let zoned = toZoned(new CalendarDateTime(2018, 11, 4, 23), 'America/Sao_Paulo');
          let expected = toZoned(new CalendarDateTime(2018, 11, 4, 12), 'America/Sao_Paulo');
          expect(zoned.cycle('hour', 1, {hourCycle: 12})).toEqual(expected);
        });

        it('reverse', function () {
          let zoned = toZoned(new CalendarDateTime(2018, 11, 4, 12), 'America/Sao_Paulo');
          let expected = toZoned(new CalendarDateTime(2018, 11, 4, 23), 'America/Sao_Paulo');
          expect(zoned.cycle('hour', -1, {hourCycle: 12})).toEqual(expected);
        });
      });
    });

    describe('should handle backward timezone transitions at midnight', function () {
      it('forward', function () {
        let zoned = toZoned(new CalendarDateTime(2019, 2, 16, 23), 'America/Sao_Paulo', 'earlier');
        let expected = toZoned(new CalendarDateTime(2019, 2, 16, 23), 'America/Sao_Paulo', 'later');
        expect(zoned.cycle('hour', 1)).toEqual(expected);
      });

      it('reverse', function () {
        let zoned = toZoned(new CalendarDateTime(2019, 2, 16, 23), 'America/Sao_Paulo', 'later');
        let expected = toZoned(new CalendarDateTime(2019, 2, 16, 23), 'America/Sao_Paulo', 'earlier');
        expect(zoned.cycle('hour', -1)).toEqual(expected);
      });
    });
  });

  describe('set', function () {
    it('should preserve wall time when changing the date', function () {
      let zoned = toZoned(new CalendarDateTime(2021, 2, 14, 4), 'America/Los_Angeles');
      let expected = toZoned(new CalendarDateTime(2021, 3, 14, 4), 'America/Los_Angeles');
      expect(zoned.offset).not.toBe(expected.offset);
      expect(zoned.set({month: 3})).toEqual(expected);
    });

    it('should move time forward during forward DST transitions if time does not exist', function () {
      let zoned = toZoned(new CalendarDateTime(2021, 2, 14, 2), 'America/Los_Angeles');
      let expected = toZoned(new CalendarDateTime(2021, 3, 14, 3), 'America/Los_Angeles');
      expect(zoned.offset).not.toBe(expected.offset);
      expect(zoned.set({month: 3})).toEqual(expected);
    });

    it('should preserve the offset if setting identical fields', function () {
      let zoned = toZoned(new CalendarDateTime(2021, 11, 7, 1), 'America/Los_Angeles', 'later');
      expect(zoned.set({hour: 1})).toBe(zoned);
    });
  });
});
