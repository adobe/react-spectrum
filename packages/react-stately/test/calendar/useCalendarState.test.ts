/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {actHook as act, renderHook} from '@react-spectrum/test-utils-internal';
import {createCalendar, getLocalTimeZone, today} from '@internationalized/date';
import {useCalendarState} from '../../src/calendar/useCalendarState';

describe('useCalendarState', () => {
  describe('selectDate', () => {
    // https://github.com/adobe/react-spectrum/issues/7779
    it('selects a date before the visible range when isDateUnavailable is provided', () => {
      let {result} = renderHook(() =>
        useCalendarState({
          locale: 'en-US',
          createCalendar,
          isDateUnavailable: () => false
        })
      );

      let todayDate = today(getLocalTimeZone());

      // Navigate to the next month so today is before the visible range.
      act(() => {result.current.focusNextPage();});
      expect(result.current.visibleRange.start.compare(todayDate)).toBeGreaterThan(0);

      // Selecting today (which is before the visible range) should still work.
      act(() => {result.current.selectDate(todayDate);});

      expect(result.current.value).not.toBeNull();
      expect(result.current.value!.compare(todayDate)).toBe(0);
    });

    it('selects a date after the visible range when isDateUnavailable is provided', () => {
      let {result} = renderHook(() =>
        useCalendarState({
          locale: 'en-US',
          createCalendar,
          isDateUnavailable: () => false
        })
      );

      let todayDate = today(getLocalTimeZone());

      // Navigate to the previous month so today is after the visible range.
      act(() => {result.current.focusPreviousPage();});
      expect(result.current.visibleRange.end.compare(todayDate)).toBeLessThan(0);

      act(() => {result.current.selectDate(todayDate);});

      expect(result.current.value).not.toBeNull();
      expect(result.current.value!.compare(todayDate)).toBe(0);
    });
  });
});
