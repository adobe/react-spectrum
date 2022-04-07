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

import {CalendarDate, CalendarDateTime, parseAbsolute, parseDate, parseDateTime, parseTime, parseZonedDateTime, Time, ZonedDateTime} from '../';

describe('string conversion', function () {
  describe('parseTime', function () {
    it('should parse a time with only hours', function () {
      let time = parseTime('14');
      let expected = new Time(14);
      expect(time).toEqual(expected);
    });

    it('should parse a padded time with only hours', function () {
      let time = parseTime('04');
      let expected = new Time(4);
      expect(time).toEqual(expected);
    });

    it('should parse a time with hours and minutes', function () {
      let time = parseTime('14:05');
      let expected = new Time(14, 5);
      expect(time).toEqual(expected);
    });

    it('should parse a time with hours, minutes, and seconds', function () {
      let time = parseTime('14:05:25');
      let expected = new Time(14, 5, 25);
      expect(time).toEqual(expected);
    });

    it('should parse a time with hours, minutes, seconds, and milliseconds', function () {
      let time = parseTime('14:05:25.1');
      let expected = new Time(14, 5, 25, 100);
      expect(time).toEqual(expected);

      time = parseTime('14:05:25.12');
      expected = new Time(14, 5, 25, 120);
      expect(time).toEqual(expected);
    });

    it('should error if time is not padded', function () {
      expect(() => parseTime('1')).toThrow();
      expect(() => parseTime('01:4')).toThrow();
    });

    it('should error if components are out of range', function () {
      expect(() => parseTime('45:23')).toThrow();
      expect(() => parseTime('12:99')).toThrow();
      expect(() => parseTime('12:45:99')).toThrow();
    });
  });

  describe('Time#toString', function () {
    it('should stringify a time', function () {
      let time = new Time(14, 45, 25);
      expect(time.toString()).toBe('14:45:25');
    });

    it('should stringify a time with padding', function () {
      let time = new Time(4, 5, 25);
      expect(time.toString()).toBe('04:05:25');
    });

    it('should stringify a time milliseconds', function () {
      let time = new Time(4, 5, 25, 100);
      expect(time.toString()).toBe('04:05:25.1');

      time = new Time(4, 5, 25, 120);
      expect(time.toString()).toBe('04:05:25.12');
    });
  });

  describe('parseDate', function () {
    it('should parse a date', function () {
      let date = parseDate('2020-02-03');
      let expected = new CalendarDate(2020, 2, 3);
      expect(date).toEqual(expected);
    });

    it('should parse a padded date', function () {
      let date = parseDate('0128-02-03');
      let expected = new CalendarDate(128, 2, 3);
      expect(date).toEqual(expected);
    });

    it('should error if date is not padded', function () {
      expect(() => parseDate('128-02-03')).toThrow();
      expect(() => parseDate('2020-2-03')).toThrow();
      expect(() => parseDate('2020-02-3')).toThrow();
    });

    it('should error if not all components are provided', function () {
      expect(() => parseDate('2020')).toThrow();
      expect(() => parseDate('2020-02')).toThrow();
    });

    it('should error if components are out of range', function () {
      expect(() => parseDate('2020-00-03')).toThrow();
      expect(() => parseDate('2020-13-03')).toThrow();
      expect(() => parseDate('2020-01-32')).toThrow();
      expect(() => parseDate('2020-02-30')).toThrow();
    });
  });

  describe('CalendarDate#toString', function () {
    it('should stringify a date', function () {
      let date = new CalendarDate(2020, 11, 20);
      expect(date.toString()).toBe('2020-11-20');
    });

    it('should stringify a date with padding', function () {
      let date = new CalendarDate(123, 2, 3);
      expect(date.toString()).toBe('0123-02-03');
    });
  });

  describe('parseDateTime', function () {
    it('should parse a date without a time', function () {
      let date = parseDateTime('2020-02-03');
      let expected = new CalendarDateTime(2020, 2, 3);
      expect(date).toEqual(expected);
    });

    it('should parse a date with a time', function () {
      let date = parseDateTime('2020-02-03T12:23:24.12');
      let expected = new CalendarDateTime(2020, 2, 3, 12, 23, 24, 120);
      expect(date).toEqual(expected);
    });

    it('should parse a date with only hours', function () {
      let date = parseDateTime('2020-02-03T12');
      let expected = new CalendarDateTime(2020, 2, 3, 12, 0, 0, 0);
      expect(date).toEqual(expected);
    });

    it('should parse a date with only hours and minutes', function () {
      let date = parseDateTime('2020-02-03T12:24');
      let expected = new CalendarDateTime(2020, 2, 3, 12, 24, 0, 0);
      expect(date).toEqual(expected);
    });

    it('should parse a date with only hours, minutes, and seconds', function () {
      let date = parseDateTime('2020-02-03T12:24:45');
      let expected = new CalendarDateTime(2020, 2, 3, 12, 24, 45, 0);
      expect(date).toEqual(expected);
    });

    it('should error if date is not padded', function () {
      expect(() => parseDateTime('123-02-03T12:24:45')).toThrow();
      expect(() => parseDateTime('2020-2-03T12:24:45')).toThrow();
      expect(() => parseDateTime('2020-02-3T12:24:45')).toThrow();
    });

    it('should error if time is not padded', function () {
      expect(() => parseDateTime('2020-02-03T1:24:45')).toThrow();
      expect(() => parseDateTime('2020-02-03T01:4:45')).toThrow();
      expect(() => parseDateTime('2020-02-03T01:04:5')).toThrow();
    });

    it('should error if components are out of range', function () {
      expect(() => parseDateTime('2020-00-03')).toThrow();
      expect(() => parseDateTime('2020-13-03')).toThrow();
      expect(() => parseDateTime('2020-01-32')).toThrow();
      expect(() => parseDateTime('2020-02-30')).toThrow();
      expect(() => parseDateTime('2020-02-03T33:00')).toThrow();
      expect(() => parseDateTime('2020-02-03T23:99')).toThrow();
      expect(() => parseDateTime('2020-02-03T12:22:99')).toThrow();
    });
  });

  describe('CalendarDateTime#toString', function () {
    it('should stringify a date with a zero time', function () {
      let date = new CalendarDateTime(2020, 2, 3);
      expect(date.toString()).toBe('2020-02-03T00:00:00');
    });

    it('should stringify a date with a time', function () {
      let date = new CalendarDateTime(2020, 2, 3, 12, 23, 45);
      expect(date.toString()).toBe('2020-02-03T12:23:45');
    });

    it('should stringify a date with a time and milliseconds', function () {
      let date = new CalendarDateTime(2020, 2, 3, 12, 23, 45, 120);
      expect(date.toString()).toBe('2020-02-03T12:23:45.12');
    });
  });

  describe('parseZonedDateTime', function () {
    it('should parse a date without a time or offset', function () {
      let date = parseZonedDateTime('2020-02-03[America/Los_Angeles]');
      let expected = new ZonedDateTime(2020, 2, 3, 'America/Los_Angeles', -28800000);
      expect(date).toEqual(expected);
    });

    it('should parse a date with a time but no offset', function () {
      let date = parseZonedDateTime('2020-02-03T12:24:45[America/Los_Angeles]');
      let expected = new ZonedDateTime(2020, 2, 3, 'America/Los_Angeles', -28800000, 12, 24, 45);
      expect(date).toEqual(expected);
    });

    it('should parse a date with a time with milliseconds but no offset', function () {
      let date = parseZonedDateTime('2020-02-03T12:24:45.12[America/Los_Angeles]');
      let expected = new ZonedDateTime(2020, 2, 3, 'America/Los_Angeles', -28800000, 12, 24, 45, 120);
      expect(date).toEqual(expected);
    });

    it('should parse a date with a time and an offset with only hours', function () {
      let date = parseZonedDateTime('2020-02-03T12:24:45-08[America/Los_Angeles]');
      let expected = new ZonedDateTime(2020, 2, 3, 'America/Los_Angeles', -28800000, 12, 24, 45);
      expect(date).toEqual(expected);
    });

    it('should parse a date with a time and an offset with hours and minutes', function () {
      let date = parseZonedDateTime('2020-02-03T12:24:45-08:00[America/Los_Angeles]');
      let expected = new ZonedDateTime(2020, 2, 3, 'America/Los_Angeles', -28800000, 12, 24, 45);
      expect(date).toEqual(expected);
    });

    it('should parse a date with a time with milliseconds and an offset', function () {
      let date = parseZonedDateTime('2020-02-03T12:24:45.12-08:00[America/Los_Angeles]');
      let expected = new ZonedDateTime(2020, 2, 3, 'America/Los_Angeles', -28800000, 12, 24, 45, 120);
      expect(date).toEqual(expected);
    });

    it('should disambiguate ambiguous times without an offset', function () {
      let date = parseZonedDateTime('2020-11-01T01:00[America/Los_Angeles]');
      let expected = new ZonedDateTime(2020, 11, 1, 'America/Los_Angeles', -25200000, 1, 0, 0);
      expect(date).toEqual(expected);

      date = parseZonedDateTime('2021-03-14T02:00[America/Los_Angeles]');
      expected = new ZonedDateTime(2021, 3, 14, 'America/Los_Angeles', -25200000, 3, 0, 0);
      expect(date).toEqual(expected);
    });

    it('should accept a disambiguation option', function () {
      let date = parseZonedDateTime('2020-11-01T01:00[America/Los_Angeles]', 'later');
      let expected = new ZonedDateTime(2020, 11, 1, 'America/Los_Angeles', -28800000, 1, 0, 0);
      expect(date).toEqual(expected);

      date = parseZonedDateTime('2021-03-14T02:00[America/Los_Angeles]', 'earlier');
      expected = new ZonedDateTime(2021, 3, 14, 'America/Los_Angeles', -28800000, 1, 0, 0);
      expect(date).toEqual(expected);
    });

    it('should disambiguate ambiguous times with an offset', function () {
      let date = parseZonedDateTime('2020-11-01T01:00-08:00[America/Los_Angeles]');
      let expected = new ZonedDateTime(2020, 11, 1, 'America/Los_Angeles', -28800000, 1, 0, 0);
      expect(date).toEqual(expected);

      date = parseZonedDateTime('2020-11-01T01:00-07:00[America/Los_Angeles]');
      expected = new ZonedDateTime(2020, 11, 1, 'America/Los_Angeles', -25200000, 1, 0, 0);
      expect(date).toEqual(expected);
    });

    it('should error if parsing a date with an invalid offset', function () {
      expect(() => parseZonedDateTime('2020-02-03T12:24:45.12-04:00[America/Los_Angeles]')).toThrow();
      expect(() => parseZonedDateTime('2020-02-03T12:24:45.12-08:24[America/Los_Angeles]')).toThrow();
      expect(() => parseZonedDateTime('2021-03-14T02:00-08:00[America/Los_Angeles]')).toThrow();
      expect(() => parseZonedDateTime('2021-03-14T02:00-07:00[America/Los_Angeles]')).toThrow();
    });

    it('should error if components are out of range', function () {
      expect(() => parseZonedDateTime('2020-00-03[America/Los_Angeles]')).toThrow();
      expect(() => parseZonedDateTime('2020-13-03[America/Los_Angeles]')).toThrow();
      expect(() => parseZonedDateTime('2020-01-32[America/Los_Angeles]')).toThrow();
      expect(() => parseZonedDateTime('2020-02-30[America/Los_Angeles]')).toThrow();
      expect(() => parseZonedDateTime('2020-02-03T33:00[America/Los_Angeles]')).toThrow();
      expect(() => parseZonedDateTime('2020-02-03T23:99[America/Los_Angeles]')).toThrow();
      expect(() => parseZonedDateTime('2020-02-03T12:22:99[America/Los_Angeles]')).toThrow();
    });
  });

  describe('ZonedDateTime#toString', function () {
    it('should stringify a date', function () {
      let date = new ZonedDateTime(2020, 2, 3, 'America/Los_Angeles', -28800000, 12, 24, 45);
      expect(date.toString()).toBe('2020-02-03T12:24:45-08:00[America/Los_Angeles]');
    });

    it('should stringify a date with milliseconds', function () {
      let date = new ZonedDateTime(2020, 2, 3, 'America/Los_Angeles', -28800000, 12, 24, 45, 120);
      expect(date.toString()).toBe('2020-02-03T12:24:45.12-08:00[America/Los_Angeles]');
    });
  });

  describe('parseAbsolute', function () {
    it('should parse a date without a time', function () {
      let date = parseAbsolute('2020-02-03Z', 'America/Los_Angeles');
      let expected = new ZonedDateTime(2020, 2, 2, 'America/Los_Angeles', -28800000, 16);
      expect(date).toEqual(expected);
    });

    it('should parse a date with an offset but no time', function () {
      let date = parseAbsolute('2020-02-03-08:00', 'America/Los_Angeles');
      let expected = new ZonedDateTime(2020, 2, 3, 'America/Los_Angeles', -28800000);
      expect(date).toEqual(expected);
    });

    it('should parse a date with a time', function () {
      let date = parseAbsolute('2020-02-03T22:32:45Z', 'America/Los_Angeles');
      let expected = new ZonedDateTime(2020, 2, 3, 'America/Los_Angeles', -28800000, 14, 32, 45);
      expect(date).toEqual(expected);
    });

    it('should parse a date with a time and offset', function () {
      let date = parseAbsolute('2020-02-03T22:32:45-08:00', 'America/Los_Angeles');
      let expected = new ZonedDateTime(2020, 2, 3, 'America/Los_Angeles', -28800000, 22, 32, 45);
      expect(date).toEqual(expected);
    });

    it('should handle daylight saving time', function () {
      let date = parseAbsolute('2021-03-14T02:00-08:00', 'America/Los_Angeles');
      let expected = new ZonedDateTime(2021, 3, 14, 'America/Los_Angeles', -25200000, 3, 0, 0);
      expect(date).toEqual(expected);

      date = parseAbsolute('2021-11-07T01:00-07:00', 'America/Los_Angeles');
      expected = new ZonedDateTime(2021, 11, 7, 'America/Los_Angeles', -25200000, 1, 0, 0);
      expect(date).toEqual(expected);

      date = parseAbsolute('2021-11-07T01:00-08:00', 'America/Los_Angeles');
      expected = new ZonedDateTime(2021, 11, 7, 'America/Los_Angeles', -28800000, 1, 0, 0);
      expect(date).toEqual(expected);
    });

    it('should error if missing offset or Z', function () {
      expect(() => parseAbsolute('2020-02-03')).toThrow();
    });

    it('should error if components are out of range', function () {
      expect(() => parseAbsolute('2020-00-03Z')).toThrow();
      expect(() => parseAbsolute('2020-13-03Z')).toThrow();
      expect(() => parseAbsolute('2020-01-32Z')).toThrow();
      expect(() => parseAbsolute('2020-02-30Z')).toThrow();
      expect(() => parseAbsolute('2020-02-03T33:00Z')).toThrow();
      expect(() => parseAbsolute('2020-02-03T23:99Z')).toThrow();
      expect(() => parseAbsolute('2020-02-03T12:22:99Z')).toThrow();
    });
  });

  describe('ZonedDateTime#toAbsoluteString', function () {
    it('should stringify a date', function () {
      let date = new ZonedDateTime(2020, 2, 3, 'America/Los_Angeles', -28800000, 14, 32, 45);
      expect(date.toAbsoluteString()).toBe('2020-02-03T22:32:45.000Z');
    });
  });
});
