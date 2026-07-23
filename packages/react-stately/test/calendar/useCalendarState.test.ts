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
import {CalendarDate, createCalendar} from '@internationalized/date';
import {useCalendarState} from '../../src/calendar/useCalendarState';

describe('useCalendarState', () => {
  describe('selectDate', () => {
    // https://github.com/adobe/react-spectrum/issues/7779
    let selectedDate = new CalendarDate(2026, 4, 15);

    it('selects a date before the visible range when isDateUnavailable is provided', () => {
      let {result} = renderHook(() =>
        useCalendarState({
          locale: 'en-US',
          createCalendar,
          isDateUnavailable: () => false,
          defaultFocusedValue: selectedDate
        })
      );

      // Navigate to the next month so the selected date is before the visible range.
      act(() => {
        result.current.focusNextPage();
      });
      expect(result.current.visibleRange.start.compare(selectedDate)).toBeGreaterThan(0);

      // Selecting a date before the visible range should still work.
      act(() => {
        result.current.selectDate(selectedDate);
      });

      expect(result.current.value).not.toBeNull();
      expect(result.current.value!.compare(selectedDate)).toBe(0);
    });

    it('selects a date after the visible range when isDateUnavailable is provided', () => {
      let {result} = renderHook(() =>
        useCalendarState({
          locale: 'en-US',
          createCalendar,
          isDateUnavailable: () => false,
          defaultFocusedValue: selectedDate
        })
      );

      // Navigate to the previous month so the selected date is after the visible range.
      act(() => {
        result.current.focusPreviousPage();
      });
      expect(result.current.visibleRange.end.compare(selectedDate)).toBeLessThan(0);

      act(() => {
        result.current.selectDate(selectedDate);
      });

      expect(result.current.value).not.toBeNull();
      expect(result.current.value!.compare(selectedDate)).toBe(0);
    });
  });
});
