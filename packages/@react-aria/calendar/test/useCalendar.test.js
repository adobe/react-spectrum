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

import {act, fireEvent, render} from '@react-spectrum/test-utils';
import {CalendarDate} from '@internationalized/date';
import {Example} from '../stories/Example';
import React from 'react';

describe('useCalendar', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    // clear any live announcers
    act(() => {
      jest.runAllTimers();
    });
  });

  async function testKeyboard(defaultValue, beforeRange, key, count, value, afterRange, props, opts) {
    let {getByRole, getByLabelText, getAllByLabelText, unmount} = render(<Example defaultValue={defaultValue} autoFocus {...props} />);
    let grid = getByRole('grid');
    expect(grid).toHaveAttribute('aria-label', beforeRange);

    let cell = getAllByLabelText('selected', {exact: false}).filter(cell => cell.role !== 'grid')[0];
    expect(document.activeElement).toBe(cell);

    for (let i = 0; i < count; i++) {
      fireEvent.keyDown(document.activeElement, {key, ...opts});
      fireEvent.keyUp(document.activeElement, {key, ...opts});
    }

    cell = getByLabelText(value, {exact: false});
    expect(document.activeElement).toBe(cell);

    expect(grid).toHaveAttribute('aria-label', afterRange);

    // clear any live announcers
    act(() => {
      jest.runAllTimers();
    });

    unmount();
  }

  describe('visibleDuration: 3 days', () => {
    it('should move the focused date by one day with the left/right arrows', async () => {
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 4 to 6, 2019', 'ArrowLeft', 1, 'Tuesday, June 4, 2019', 'June 4 to 6, 2019', {visibleDuration: {days: 3}});
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 4 to 6, 2019', 'ArrowLeft', 2, 'Monday, June 3, 2019', 'June 1 to 3, 2019', {visibleDuration: {days: 3}});
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 4 to 6, 2019', 'ArrowRight', 1, 'Thursday, June 6, 2019', 'June 4 to 6, 2019', {visibleDuration: {days: 3}});
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 4 to 6, 2019', 'ArrowRight', 2, 'Friday, June 7, 2019', 'June 7 to 9, 2019', {visibleDuration: {days: 3}});
    });

    it('should move the focused date by one row with the up/down arrows', async () => {
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 4 to 6, 2019', 'ArrowUp', 1, 'Sunday, June 2, 2019', 'June 1 to 3, 2019', {visibleDuration: {days: 3}});
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 4 to 6, 2019', 'ArrowDown', 1, 'Saturday, June 8, 2019', 'June 7 to 9, 2019', {visibleDuration: {days: 3}});
    });

    it('should move the focused date by one row with the page up/page down arrows', async () => {
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 4 to 6, 2019', 'PageUp', 1, 'Sunday, June 2, 2019', 'June 1 to 3, 2019', {visibleDuration: {days: 3}});
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 4 to 6, 2019', 'PageDown', 1, 'Saturday, June 8, 2019', 'June 7 to 9, 2019', {visibleDuration: {days: 3}});
    });

    it('should move the focused date by one row with the shift + page up/page down arrows', async () => {
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 4 to 6, 2019', 'PageUp', 1, 'Sunday, June 2, 2019', 'June 1 to 3, 2019', {visibleDuration: {days: 3}}, {shiftKey: true});
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 4 to 6, 2019', 'PageDown', 1, 'Saturday, June 8, 2019', 'June 7 to 9, 2019', {visibleDuration: {days: 3}}, {shiftKey: true});
    });

    it('should move the focused date to the start/end of the visible range with the home/end keys', async () => {
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 4 to 6, 2019', 'Home', 1, 'Tuesday, June 4, 2019', 'June 4 to 6, 2019', {visibleDuration: {days: 3}});
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 4 to 6, 2019', 'End', 1, 'Thursday, June 6, 2019', 'June 4 to 6, 2019', {visibleDuration: {days: 3}});
    });
  });

  describe('visibleDuration: 1 week', () => {
    it('should move the focused date by one day with the left/right arrows', async () => {
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 2 to 8, 2019', 'ArrowLeft', 1, 'Tuesday, June 4, 2019', 'June 2 to 8, 2019', {visibleDuration: {weeks: 1}});
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 2 to 8, 2019', 'ArrowLeft', 4, 'Saturday, June 1, 2019', 'May 26 to June 1, 2019', {visibleDuration: {weeks: 1}});
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 2 to 8, 2019', 'ArrowRight', 1, 'Thursday, June 6, 2019', 'June 2 to 8, 2019', {visibleDuration: {weeks: 1}});
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 2 to 8, 2019', 'ArrowRight', 4, 'Sunday, June 9, 2019', 'June 9 to 15, 2019', {visibleDuration: {weeks: 1}});
    });

    it('should move the focused date by one week with the up/down arrows', async () => {
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 2 to 8, 2019', 'ArrowUp', 1, 'Wednesday, May 29, 2019', 'May 26 to June 1, 2019', {visibleDuration: {weeks: 1}});
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 2 to 8, 2019', 'ArrowDown', 1, 'Wednesday, June 12, 2019', 'June 9 to 15, 2019', {visibleDuration: {weeks: 1}});
    });

    it('should move the focused date by one week with the page up/page down arrows', async () => {
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 2 to 8, 2019', 'PageUp', 1, 'Wednesday, May 29, 2019', 'May 26 to June 1, 2019', {visibleDuration: {weeks: 1}});
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 2 to 8, 2019', 'PageDown', 1, 'Wednesday, June 12, 2019', 'June 9 to 15, 2019', {visibleDuration: {weeks: 1}});
    });

    it('should move the focused date by one month with the shift + page up/page down arrows', async () => {
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 2 to 8, 2019', 'PageUp', 1, 'Sunday, May 5, 2019', 'May 5 to 11, 2019', {visibleDuration: {weeks: 1}}, {shiftKey: true});
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 2 to 8, 2019', 'PageDown', 1, 'Friday, July 5, 2019', 'June 30 to July 6, 2019', {visibleDuration: {weeks: 1}}, {shiftKey: true});
    });

    it('should move the focused date to the start/end of the week with the home/end keys', async () => {
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 2 to 8, 2019', 'Home', 1, 'Sunday, June 2, 2019', 'June 2 to 8, 2019', {visibleDuration: {weeks: 1}});
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 2 to 8, 2019', 'End', 1, 'Saturday, June 8, 2019', 'June 2 to 8, 2019', {visibleDuration: {weeks: 1}});
    });
  });

  describe('visibleDuration: 2 weeks', () => {
    it('should move the focused date by one day with the left/right arrows', async () => {
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 2 to 15, 2019', 'ArrowLeft', 1, 'Tuesday, June 4, 2019', 'June 2 to 15, 2019', {visibleDuration: {weeks: 2}});
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 2 to 15, 2019', 'ArrowLeft', 4, 'Saturday, June 1, 2019', 'May 19 to June 1, 2019', {visibleDuration: {weeks: 2}});
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 2 to 15, 2019', 'ArrowRight', 1, 'Thursday, June 6, 2019', 'June 2 to 15, 2019', {visibleDuration: {weeks: 2}});
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 2 to 15, 2019', 'ArrowRight', 4, 'Sunday, June 9, 2019', 'June 2 to 15, 2019', {visibleDuration: {weeks: 2}});
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 2 to 15, 2019', 'ArrowRight', 11, 'Sunday, June 16, 2019', 'June 16 to 29, 2019', {visibleDuration: {weeks: 2}});
    });

    it('should move the focused date by one week with the up/down arrows', async () => {
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 2 to 15, 2019', 'ArrowUp', 1, 'Wednesday, May 29, 2019', 'May 19 to June 1, 2019', {visibleDuration: {weeks: 2}});
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 2 to 15, 2019', 'ArrowDown', 1, 'Wednesday, June 12, 2019', 'June 2 to 15, 2019', {visibleDuration: {weeks: 2}});
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 2 to 15, 2019', 'ArrowDown', 2, 'Wednesday, June 19, 2019', 'June 16 to 29, 2019', {visibleDuration: {weeks: 2}});
    });

    it('should move the focused date by one week with the page up/page down arrows', async () => {
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 2 to 15, 2019', 'PageUp', 1, 'Wednesday, May 29, 2019', 'May 19 to June 1, 2019', {visibleDuration: {weeks: 2}});
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 2 to 15, 2019', 'PageDown', 1, 'Wednesday, June 12, 2019', 'June 2 to 15, 2019', {visibleDuration: {weeks: 2}});
    });

    it('should move the focused date by one month with the shift + page up/page down arrows', async () => {
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 2 to 15, 2019', 'PageUp', 1, 'Sunday, May 5, 2019', 'April 28 to May 11, 2019', {visibleDuration: {weeks: 2}}, {shiftKey: true});
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 2 to 15, 2019', 'PageDown', 1, 'Friday, July 5, 2019', 'June 30 to July 13, 2019', {visibleDuration: {weeks: 2}}, {shiftKey: true});
    });

    it('should move the focused date to the start/end of the visible range with the home/end keys', async () => {
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 2 to 15, 2019', 'Home', 1, 'Sunday, June 2, 2019', 'June 2 to 15, 2019', {visibleDuration: {weeks: 2}});
      await testKeyboard(new CalendarDate(2019, 6, 5), 'June 2 to 15, 2019', 'End', 1, 'Saturday, June 8, 2019', 'June 2 to 15, 2019', {visibleDuration: {weeks: 2}});
    });
  });
});
