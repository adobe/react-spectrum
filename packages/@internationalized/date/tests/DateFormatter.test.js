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

import {DateFormatter} from '..';

describe('DateFormatter', function () {
  beforeAll(function () {
    // Mock to ensure buggy WebKit behavior
    let resolvedOptions = Intl.DateTimeFormat.prototype.resolvedOptions;
    jest.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockImplementation(function () {
      let s = resolvedOptions.call(this);
      if (s.locale === 'fr' && s.hour12 === false) {
        s.hour12 = true;
        s.hourCycle = 'h12';
      }
      return s;
    });
  });

  it('should format a basic date', function () {
    let formatter = new DateFormatter('en-US');
    expect(formatter.format(new Date(2020, 1, 3))).toBe('2/3/2020');
  });

  it('should format to parts', function () {
    let formatter = new DateFormatter('en-US');
    expect(formatter.formatToParts(new Date(2020, 1, 3))).toEqual([
      {type: 'month', value: '2'},
      {type: 'literal', value: '/'},
      {type: 'day', value: '3'},
      {type: 'literal', value: '/'},
      {type: 'year', value: '2020'}
    ]);
  });

  it('should format a range', function () {
    let formatter = new DateFormatter('en-US');
    // Test fallback
    formatter.formatter.formatRange = null;
    expect(formatter.formatRange(new Date(2020, 1, 3), new Date(2020, 1, 5))).toBe('2/3/2020 – 2/5/2020');
  });

  it('should format a range to parts', function () {
    let formatter = new DateFormatter('en-US');
    // Test fallback
    formatter.formatter.formatRangeToParts = null;
    expect(formatter.formatRangeToParts(new Date(2020, 1, 3), new Date(2020, 1, 5))).toEqual([
      {type: 'month', value: '2', source: 'startRange'},
      {type: 'literal', value: '/', source: 'startRange'},
      {type: 'day', value: '3', source: 'startRange'},
      {type: 'literal', value: '/', source: 'startRange'},
      {type: 'year', value: '2020', source: 'startRange'},
      {type: 'literal', value: ' – ', source: 'shared'},
      {type: 'month', value: '2', source: 'endRange'},
      {type: 'literal', value: '/', source: 'endRange'},
      {type: 'day', value: '5', source: 'endRange'},
      {type: 'literal', value: '/', source: 'endRange'},
      {type: 'year', value: '2020', source: 'endRange'}
    ]);
  });

  it('should work around buggy hour12 behavior', function () {
    let formatter = new DateFormatter('en-US', {timeStyle: 'short', hour12: false});
    expect(formatter.format(new Date(2020, 1, 3, 0))).toBe('00:00');
    expect(formatter.resolvedOptions().hourCycle).toBe('h23');

    formatter = new DateFormatter('fr-CA', {hour: 'numeric', hour12: true});
    expect(formatter.format(new Date(2020, 1, 3, 0))).toBe('12 h a.m.');
    expect(formatter.resolvedOptions().hourCycle).toBe('h12');

    formatter = new DateFormatter('ja', {hour: 'numeric', hour12: true});
    expect(formatter.format(new Date(2020, 1, 3, 0))).toBe('午前12時');
    expect(formatter.resolvedOptions().hourCycle).toBe('h12');
  });

  it('should work around buggy resolved hour cycle', function () {
    let formatter = new DateFormatter('fr', {hour: 'numeric', hour12: false});
    expect(formatter.resolvedOptions().hour12).toBe(false);
    expect(formatter.resolvedOptions().hourCycle).toBe('h23');
  });
});
