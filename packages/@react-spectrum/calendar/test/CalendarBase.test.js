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

import {act, fireEvent, render} from '@testing-library/react';
import {Calendar, RangeCalendar} from '../';
import {CalendarDate} from '@internationalized/date';
import {getDaysInMonth} from 'date-fns';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {theme} from '@react-spectrum/theme-default';
import {triggerPress} from '@react-spectrum/test-utils';

let cellFormatter = new Intl.DateTimeFormat('en-US', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'});
let headingFormatter = new Intl.DateTimeFormat('en-US', {month: 'long', year: 'numeric'});
let keyCodes = {'Enter': 13, ' ': 32, 'PageUp': 33, 'PageDown': 34, 'End': 35, 'Home': 36, 'ArrowLeft': 37, 'ArrowUp': 38, 'ArrowRight': 39, 'ArrowDown': 40};

describe('CalendarBase', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => cb());
  });

  afterAll(() => {
    jest.useRealTimers();
    window.requestAnimationFrame.mockRestore();
  });

  afterEach(() => {
    // clear any live announcers
    act(() => {
      jest.runAllTimers();
    });
  });

  describe('basics', () => {
    it.each`
      Name                   | Calendar         | props
      ${'v3 Calendar'}       | ${Calendar}      | ${{}}
      ${'v3 RangeCalendar'}  | ${RangeCalendar} | ${{}}
    `('$Name shows the current month by default', ({Calendar, props}) => {
      let {getByLabelText, getByRole, getAllByRole} = render(<Calendar {...props} />);

      let calendar = getByRole('group');
      expect(calendar).toBeVisible();

      let heading = getByRole('heading');
      expect(heading).toHaveTextContent(headingFormatter.format(new Date()));

      let grid = getByRole('grid');
      expect(grid).not.toHaveAttribute('tabIndex');

      let today = getByLabelText('today', {exact: false});
      expect(today.parentElement).toHaveAttribute('role', 'gridcell');
      expect(today).toHaveAttribute('aria-label', `Today, ${cellFormatter.format(new Date())}`);
      expect(today).toHaveAttribute('tabIndex', '0');

      expect(getByLabelText('Previous')).toBeVisible();
      expect(getByLabelText('Next')).toBeVisible();

      let gridCells = getAllByRole('gridcell').filter(cell => cell.getAttribute('aria-disabled') !== 'true');
      expect(gridCells.length).toBe(getDaysInMonth(new Date()));
      for (let cell of gridCells) {
        expect(cell.children[0]).toHaveAttribute('aria-label');
      }
    });

    it.each`
      Name                   | Calendar         | props
      ${'v3 Calendar'}       | ${Calendar}      | ${{isDisabled: true}}
      ${'v3 RangeCalendar'}  | ${RangeCalendar} | ${{isDisabled: true}}
    `('$Name should set aria-disabled when isDisabled', ({Calendar, props}) => {
      let {getByRole, getAllByRole, getByLabelText} = render(<Calendar {...props} />);

      let grid = getByRole('grid');
      expect(grid).toHaveAttribute('aria-disabled', 'true');
      expect(grid).not.toHaveAttribute('tabIndex');

      let gridCells = getAllByRole('gridcell');
      for (let cell of gridCells) {
        expect(cell).toHaveAttribute('aria-disabled', 'true');
      }

      expect(getByLabelText('Previous')).toHaveAttribute('disabled');
      expect(getByLabelText('Next')).toHaveAttribute('disabled');
    });

    it.each`
      Name                   | Calendar         | props
      ${'v3 Calendar'}       | ${Calendar}      | ${{isReadOnly: true}}
      ${'v3 RangeCalendar'}  | ${RangeCalendar} | ${{isReadOnly: true}}
    `('$Name should set aria-readonly when isReadOnly', ({Calendar, props}) => {
      let {getByRole} = render(<Calendar {...props} />);
      let grid = getByRole('grid');
      expect(grid).toHaveAttribute('aria-readonly', 'true');
      expect(grid).not.toHaveAttribute('tabIndex');
    });

    it.each`
      Name                   | Calendar         | props
      ${'v3 Calendar'}       | ${Calendar}      | ${{}}
      ${'v3 RangeCalendar'}  | ${RangeCalendar} | ${{}}
    `('$Name should focus today if autoFocus is set and there is no selected value', ({Name, Calendar}) => {
      let {getByLabelText} = render(<Calendar autoFocus />);

      let cell = getByLabelText('today', {exact: false});
      expect(cell.parentElement).toHaveAttribute('role', 'gridcell');
      expect(cell).toHaveFocus();
    });

    it.each`
      Name                    | Calendar              | props
      ${'v3 Calendar'}        | ${Calendar}           | ${{defaultValue: new CalendarDate(2019, 2, 10), minValue: new CalendarDate(2019, 2, 3), maxValue: new CalendarDate(2019, 2, 20)}}
      ${'v3 RangeCalendar'}   | ${RangeCalendar}      | ${{defaultValue: {start: new CalendarDate(2019, 2, 10), end: new CalendarDate(2019, 2, 15)}, minValue: new CalendarDate(2019, 2, 3), maxValue: new CalendarDate(2019, 2, 20)}}
    `('$Name should set aria-disabled on cells outside the valid date range', ({Calendar, props}) => {
      let {getAllByRole} = render(<Calendar {...props} />);

      let gridCells = getAllByRole('gridcell').filter(cell => cell.getAttribute('aria-disabled') !== 'true');
      expect(gridCells.length).toBe(18);
    });

    it.each`
      Name                    | Calendar              | props
      ${'v3 Calendar'}        | ${Calendar}           | ${{defaultValue: new CalendarDate(2019, 2, 10), minValue: new CalendarDate(2019, 2, 3), maxValue: new CalendarDate(2019, 3, 20)}}
      ${'v3 RangeCalendar'}   | ${RangeCalendar}      | ${{defaultValue: {start: new CalendarDate(2019, 2, 10), end: new CalendarDate(2019, 2, 15)}, minValue: new CalendarDate(2019, 2, 3), maxValue: new CalendarDate(2019, 3, 20)}}
    `('$Name should disable the previous button if outside valid date range', ({Calendar, props}) => {
      let {getByLabelText} = render(<Calendar {...props} />);

      expect(getByLabelText('Previous')).toHaveAttribute('disabled');
      expect(getByLabelText('Next')).not.toHaveAttribute('disabled');
    });

    it.each`
      Name                    | Calendar              | props
      ${'v3 Calendar'}        | ${Calendar}           | ${{defaultValue: new CalendarDate(2019, 3, 10), minValue: new CalendarDate(2019, 2, 3), maxValue: new CalendarDate(2019, 3, 20)}}
      ${'v3 RangeCalendar'}   | ${RangeCalendar}      | ${{defaultValue: {start: new CalendarDate(2019, 3, 10), end: new CalendarDate(2019, 3, 15)}, minValue: new CalendarDate(2019, 2, 3), maxValue: new CalendarDate(2019, 3, 20)}}
    `('$Name should disable the next button if outside valid date range', ({Calendar, props}) => {
      let {getByLabelText} = render(<Calendar {...props} />);

      expect(getByLabelText('Previous')).not.toHaveAttribute('disabled');
      expect(getByLabelText('Next')).toHaveAttribute('disabled');
    });

    it.each`
      Name                    | Calendar              | props
      ${'v3 Calendar'}        | ${Calendar}           | ${{defaultValue: new CalendarDate(2019, 3, 10), minValue: new CalendarDate(2019, 2, 3), maxValue: new CalendarDate(2019, 2, 20)}}
      ${'v3 RangeCalendar'}   | ${RangeCalendar}      | ${{defaultValue: {start: new CalendarDate(2019, 3, 10), end: new CalendarDate(2019, 3, 15)}, minValue: new CalendarDate(2019, 2, 3), maxValue: new CalendarDate(2019, 2, 20)}}
    `('$Name should disable both the next and previous buttons if outside valid date range', ({Calendar, props}) => {
      let {getByLabelText} = render(<Calendar {...props} />);

      expect(getByLabelText('Previous')).toHaveAttribute('disabled');
      expect(getByLabelText('Next')).toHaveAttribute('disabled');
    });

    it.each`
      Name                   | Calendar         | props
      ${'v3 Calendar'}       | ${Calendar}      | ${{defaultValue: new CalendarDate(2019, 6, 5)}}
      ${'v3 RangeCalendar'}  | ${RangeCalendar} | ${{defaultValue: {start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 10)}}}
    `('$Name should change the month when previous or next buttons are clicked', ({Calendar, props}) => {
      let {getByRole, getByLabelText, getAllByLabelText, getAllByRole} = render(<Calendar {...props} />);

      let heading = getByRole('heading');
      expect(heading).toHaveTextContent('June 2019');

      let gridCells = getAllByRole('gridcell').filter(cell => cell.getAttribute('aria-disabled') !== 'true');
      expect(gridCells.length).toBe(30);
      expect(getAllByLabelText('selected', {exact: false}).length).toBeGreaterThan(0);

      let nextButton = getByLabelText('Next');
      triggerPress(nextButton);

      expect(() => {
        getAllByLabelText('selected', {exact: false});
      }).toThrow();

      expect(heading).toHaveTextContent('July 2019');
      gridCells = getAllByRole('gridcell').filter(cell => cell.getAttribute('aria-disabled') !== 'true');
      expect(gridCells.length).toBe(31);

      expect(nextButton).toHaveFocus();

      let prevButton = getByLabelText('Previous');
      triggerPress(prevButton);

      expect(heading).toHaveTextContent('June 2019');
      gridCells = getAllByRole('gridcell').filter(cell => cell.getAttribute('aria-disabled') !== 'true');
      expect(gridCells.length).toBe(30);
      expect(getAllByLabelText('selected', {exact: false}).length).toBeGreaterThan(0);
      expect(prevButton).toHaveFocus();
    });

    it.each`
      Name                   | Calendar         | props
      ${'v3 Calendar'}       | ${Calendar}      | ${{defaultValue: new CalendarDate(2019, 6, 5)}}
      ${'v3 RangeCalendar'}  | ${RangeCalendar} | ${{defaultValue: {start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 10)}}}
    `('$Name should change the month when previous or next buttons are clicked and multiple months are visible', ({Calendar, props}) => {
      let {getAllByRole, getByLabelText} = render(<Calendar {...props} visibleMonths={3} />);

      let grids = getAllByRole('grid');
      expect(grids).toHaveLength(3);
      expect(grids[0]).toHaveAttribute('aria-label', 'May 2019');
      expect(grids[1]).toHaveAttribute('aria-label', 'June 2019');
      expect(grids[2]).toHaveAttribute('aria-label', 'July 2019');

      let nextButton = getByLabelText('Next');
      triggerPress(nextButton);

      grids = getAllByRole('grid');
      expect(grids).toHaveLength(3);
      expect(grids[0]).toHaveAttribute('aria-label', 'August 2019');
      expect(grids[1]).toHaveAttribute('aria-label', 'September 2019');
      expect(grids[2]).toHaveAttribute('aria-label', 'October 2019');

      let prevButton = getByLabelText('Previous');
      triggerPress(prevButton);

      grids = getAllByRole('grid');
      expect(grids).toHaveLength(3);
      expect(grids[0]).toHaveAttribute('aria-label', 'May 2019');
      expect(grids[1]).toHaveAttribute('aria-label', 'June 2019');
      expect(grids[2]).toHaveAttribute('aria-label', 'July 2019');
    });

    it.each`
      Name                   | Calendar         | props
      ${'v3 Calendar'}       | ${Calendar}      | ${{defaultValue: new CalendarDate(2019, 6, 5)}}
      ${'v3 RangeCalendar'}  | ${RangeCalendar} | ${{defaultValue: {start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 10)}}}
    `('$Name should change the month when keyboard navigating and multiple months are visible', ({Calendar, props}) => {
      let {getAllByRole, getByLabelText} = render(<Calendar {...props} visibleMonths={3} />);

      let grids = getAllByRole('grid');
      expect(grids).toHaveLength(3);
      expect(grids[0]).toHaveAttribute('aria-label', 'May 2019');
      expect(grids[1]).toHaveAttribute('aria-label', 'June 2019');
      expect(grids[2]).toHaveAttribute('aria-label', 'July 2019');

      act(() => getByLabelText('Wednesday, July 31, 2019').focus());
      fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});

      grids = getAllByRole('grid');
      expect(grids).toHaveLength(3);
      expect(grids[0]).toHaveAttribute('aria-label', 'August 2019');
      expect(grids[1]).toHaveAttribute('aria-label', 'September 2019');
      expect(grids[2]).toHaveAttribute('aria-label', 'October 2019');

      fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft'});

      grids = getAllByRole('grid');
      expect(grids).toHaveLength(3);
      expect(grids[0]).toHaveAttribute('aria-label', 'May 2019');
      expect(grids[1]).toHaveAttribute('aria-label', 'June 2019');
      expect(grids[2]).toHaveAttribute('aria-label', 'July 2019');
    });
  });

  describe('labeling', () => {
    it.each`
      Name                   | Calendar         | props
      ${'v3 Calendar'}       | ${Calendar}      | ${{defaultValue: new CalendarDate(2019, 6, 5)}}}
      ${'v3 RangeCalendar'}  | ${RangeCalendar} | ${{defaultValue: {start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 5)}}}
    `('$Name should be labeled by month heading by default', async ({Calendar, props}) => {
      let {getByRole} = render(<Calendar  {...props} />);
      let calendar = getByRole('group');
      let body = getByRole('grid');
      expect(calendar).toHaveAttribute('id');
      expect(calendar).toHaveAttribute('aria-describedby');
      expect(document.getElementById(calendar.getAttribute('aria-describedby'))).toHaveTextContent('June 2019');
      expect(body).toHaveAttribute('aria-label', 'June 2019');
    });

    it.each`
      Name                   | Calendar         | props
      ${'v3 Calendar'}       | ${Calendar}      | ${{defaultValue: new CalendarDate(2019, 6, 5)}}
      ${'v3 RangeCalendar'}  | ${RangeCalendar} | ${{defaultValue: {start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 5)}}}
    `('$Name should support labeling with aria-label', ({Calendar, props}) => {
      let {getByRole} = render(<Calendar {...props} aria-label="foo" />);
      let calendar = getByRole('group');
      let body = getByRole('grid');
      expect(calendar).toHaveAttribute('id');
      expect(calendar).toHaveAttribute('aria-label', 'foo');
      expect(calendar).toHaveAttribute('aria-describedby');
      expect(document.getElementById(calendar.getAttribute('aria-describedby'))).toHaveTextContent('June 2019');
      expect(body).toHaveAttribute('aria-label', 'June 2019');
      expect(body).toHaveAttribute('id');
      expect(body).toHaveAttribute('aria-labelledby', `${calendar.id} ${body.id}`);
    });

    it.each`
      Name                   | Calendar         | props
      ${'v3 Calendar'}       | ${Calendar}      | ${{defaultValue: new CalendarDate(2019, 6, 5)}}
      ${'v3 RangeCalendar'}  | ${RangeCalendar} | ${{defaultValue: {start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 5)}}}
    `('$Name should support labeling with aria-labelledby', ({Calendar, props}) => {
      let {getByRole} = render(<Calendar {...props} aria-labelledby="foo" />);
      let calendar = getByRole('group');
      let body = getByRole('grid');
      expect(calendar).toHaveAttribute('id');
      expect(calendar).toHaveAttribute('aria-labelledby', 'foo');
      expect(calendar).toHaveAttribute('aria-describedby');
      expect(document.getElementById(calendar.getAttribute('aria-describedby'))).toHaveTextContent('June 2019');
      expect(body).toHaveAttribute('aria-label', 'June 2019');
      expect(body).toHaveAttribute('id');
      expect(body).toHaveAttribute('aria-labelledby', `${calendar.id} ${body.id}`);
    });

    it.each`
      Name                   | Calendar         | props
      ${'v3 Calendar'}       | ${Calendar}      | ${{defaultValue: new CalendarDate(2019, 6, 5)}}
      ${'v3 RangeCalendar'}  | ${RangeCalendar} | ${{defaultValue: {start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 5)}}}
    `('$Name should support labeling with aria-labelledby and aria-label', ({Calendar, props}) => {
      let {getByRole} = render(<Calendar {...props} aria-label="cal" aria-labelledby="foo" />);
      let calendar = getByRole('group');
      let body = getByRole('grid');
      expect(calendar).toHaveAttribute('id');
      expect(calendar).toHaveAttribute('aria-label', 'cal');
      expect(calendar).toHaveAttribute('aria-labelledby', 'foo');
      expect(calendar).toHaveAttribute('aria-describedby');
      expect(document.getElementById(calendar.getAttribute('aria-describedby'))).toHaveTextContent('June 2019');
      expect(body).toHaveAttribute('aria-label', 'June 2019');
      expect(body).toHaveAttribute('id');
      expect(body).toHaveAttribute('aria-labelledby', `${calendar.id} ${body.id}`);
    });

    it.each`
      Name                   | Calendar         | props
      ${'v3 Calendar'}       | ${Calendar}      | ${{defaultValue: new CalendarDate(2019, 6, 5)}}
      ${'v3 RangeCalendar'}  | ${RangeCalendar} | ${{defaultValue: {start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 5)}}}
    `('$Name should support labeling with a custom id', ({Calendar, props}) => {
      let {getByRole} = render(<Calendar {...props} id="hi" aria-label="cal" aria-labelledby="foo" />);
      let calendar = getByRole('group');
      let body = getByRole('grid');
      expect(calendar).toHaveAttribute('id', 'hi');
      expect(calendar).toHaveAttribute('aria-label', 'cal');
      expect(calendar).toHaveAttribute('aria-labelledby', 'foo');
      expect(calendar).toHaveAttribute('aria-describedby');
      expect(document.getElementById(calendar.getAttribute('aria-describedby'))).toHaveTextContent('June 2019');
      expect(body).toHaveAttribute('aria-label', 'June 2019');
      expect(body).toHaveAttribute('id');
      expect(body).toHaveAttribute('aria-labelledby', `${calendar.id} ${body.id}`);
    });

    it.each`
      Name                   | Calendar         | props
      ${'v3 Calendar'}       | ${Calendar}      | ${{defaultValue: new CalendarDate(2019, 6, 5)}}
      ${'v3 RangeCalendar'}  | ${RangeCalendar} | ${{defaultValue: {start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 5)}}}
    `('$Name should support labeling with multiple visible months', ({Calendar, props}) => {
      let {getByRole, getAllByRole} = render(<Calendar {...props} aria-label="Calendar" visibleMonths={3} />);
      let calendar = getByRole('group');
      let months = getAllByRole('grid');
      expect(months).toHaveLength(3);
      expect(calendar).toHaveAttribute('id');
      expect(calendar).toHaveAttribute('aria-label', 'Calendar');
      expect(calendar).toHaveAttribute('aria-describedby');
      expect(document.getElementById(calendar.getAttribute('aria-describedby'))).toHaveTextContent('May – July 2019');
      expect(months[0]).toHaveAttribute('aria-label', 'May 2019');
      expect(months[0]).toHaveAttribute('id');
      expect(months[0]).toHaveAttribute('aria-labelledby', `${calendar.id} ${months[0].id}`);
      expect(months[1]).toHaveAttribute('aria-label', 'June 2019');
      expect(months[1]).toHaveAttribute('id');
      expect(months[1]).toHaveAttribute('aria-labelledby', `${calendar.id} ${months[1].id}`);
      expect(months[2]).toHaveAttribute('aria-label', 'July 2019');
      expect(months[2]).toHaveAttribute('id');
      expect(months[2]).toHaveAttribute('aria-labelledby', `${calendar.id} ${months[2].id}`);
    });
  });

  describe('keyboard navigation', () => {
    async function testKeyboard(Calendar, defaultValue, key, value, month, props, opts) {
      // For range calendars, convert the value to a range of one day
      if (Calendar === RangeCalendar) {
        defaultValue = {start: defaultValue, end: defaultValue};
      }

      let {getAllByRole, getByLabelText, getAllByLabelText, unmount} = render(<Calendar defaultValue={defaultValue} autoFocus {...props} />);
      let grid = getAllByRole('grid')[0]; // get by role will see two, role=grid and implicit <table> which also has role=grid

      let cell = getAllByLabelText('selected', {exact: false}).filter(cell => cell.role !== 'grid')[0];
      expect(grid).not.toHaveAttribute('aria-activedescendant');
      expect(document.activeElement).toBe(cell);

      fireEvent.keyDown(document.activeElement, {key, keyCode: keyCodes[key], ...opts});
      fireEvent.keyUp(document.activeElement, {key, keyCode: keyCodes[key], ...opts});

      cell = getByLabelText(value, {exact: false});
      expect(grid).not.toHaveAttribute('aria-activedescendant');
      expect(document.activeElement.outerHTML).toBe(cell.outerHTML);

      let heading = getAllByRole('heading')[0];
      expect(heading).toHaveTextContent(month);

      // clear any live announcers
      act(() => {
        jest.runAllTimers();
      });

      unmount();
    }

    it.each`
      Name                    | Calendar          | props
      ${'v3 Calendar'}        | ${Calendar}       | ${{}}
      ${'v3 RangeCalendar'}   | ${RangeCalendar}  | ${{}}
    `('$Name should move the focused date by one day with the left/right arrows', async ({Calendar, props}) => {
      await testKeyboard(Calendar, new CalendarDate(2019, 6, 5), 'ArrowLeft', 'Tuesday, June 4, 2019', 'June 2019', props);
      await testKeyboard(Calendar, new CalendarDate(2019, 6, 5), 'ArrowRight', 'Thursday, June 6, 2019', 'June 2019', props);

      await testKeyboard(Calendar, new CalendarDate(2019, 6, 1), 'ArrowLeft', 'Friday, May 31, 2019', 'May 2019', props);
      await testKeyboard(Calendar, new CalendarDate(2019, 6, 30), 'ArrowRight', 'Monday, July 1, 2019', 'July 2019', props);
    });

    it.each`
      Name                    | Calendar          | props
      ${'v3 Calendar'}        | ${Calendar}       | ${{}}
      ${'v3 RangeCalendar'}   | ${RangeCalendar}  | ${{}}
    `('$Name should move the focused date by one week with the up/down arrows', async ({Calendar, props}) => {
      await testKeyboard(Calendar, new CalendarDate(2019, 6, 12), 'ArrowUp', 'Wednesday, June 5, 2019', 'June 2019', props);
      await testKeyboard(Calendar, new CalendarDate(2019, 6, 12), 'ArrowDown', 'Wednesday, June 19, 2019', 'June 2019', props);

      await testKeyboard(Calendar, new CalendarDate(2019, 6, 5), 'ArrowUp', 'Wednesday, May 29, 2019', 'May 2019', props);
      await testKeyboard(Calendar, new CalendarDate(2019, 6, 26), 'ArrowDown', 'Wednesday, July 3, 2019', 'July 2019', props);
    });

    it.each`
      Name                    | Calendar          | props
      ${'v3 Calendar'}        | ${Calendar}       | ${{}}
      ${'v3 RangeCalendar'}   | ${RangeCalendar}  | ${{}}
    `('$Name should move the focused date to the start or end of the month with the home/end keys', async ({Calendar, props}) => {
      await testKeyboard(Calendar, new CalendarDate(2019, 6, 12), 'Home', 'Saturday, June 1, 2019', 'June 2019', props);
      await testKeyboard(Calendar, new CalendarDate(2019, 6, 12), 'End', 'Sunday, June 30, 2019', 'June 2019', props);
    });

    it.each`
      Name                    | Calendar          | props
      ${'v3 Calendar'}        | ${Calendar}       | ${{visibleMonths: 3}}
      ${'v3 RangeCalendar'}   | ${RangeCalendar}  | ${{visibleMonths: 3}}
    `('$Name should move the focused date to the start or end of the page with the home/end keys when multiple months are visible', async ({Calendar, props}) => {
      await testKeyboard(Calendar, new CalendarDate(2019, 6, 12), 'Home', 'Wednesday, May 1, 2019', 'May 2019', props);
      await testKeyboard(Calendar, new CalendarDate(2019, 6, 12), 'End', 'Wednesday, July 31, 2019', 'May 2019', props);
    });

    it.each`
      Name                    | Calendar          | props
      ${'v3 Calendar'}        | ${Calendar}       | ${{}}
      ${'v3 RangeCalendar'}   | ${RangeCalendar}  | ${{}}
    `('$Name should move the focused date by one month with the page up/page down keys', async ({Calendar, props}) => {
      await testKeyboard(Calendar, new CalendarDate(2019, 6, 5), 'PageUp', 'Sunday, May 5, 2019', 'May 2019', props);
      await testKeyboard(Calendar, new CalendarDate(2019, 6, 5), 'PageDown', 'Friday, July 5, 2019', 'July 2019', props);
    });

    it.each`
      Name                    | Calendar          | props
      ${'v3 Calendar'}        | ${Calendar}       | ${{visibleMonths: 3}}
      ${'v3 RangeCalendar'}   | ${RangeCalendar}  | ${{visibleMonths: 3}}
    `('$Name should move the focused date by one page with the page up/page down keys when multiple months are visible', async ({Calendar, props}) => {
      await testKeyboard(Calendar, new CalendarDate(2019, 6, 5), 'PageUp', 'Tuesday, March 5, 2019', 'February 2019', props);
      await testKeyboard(Calendar, new CalendarDate(2019, 6, 5), 'PageDown', 'Thursday, September 5, 2019', 'August 2019', props);
    });

    it.each`
      Name                    | Calendar          | props
      ${'v3 Calendar'}        | ${Calendar}       | ${{}}
      ${'v3 RangeCalendar'}   | ${RangeCalendar}  | ${{}}
    `('$Name should move the focused date by one year with the shift + page up/shift + page down keys', async ({Calendar, props}) => {
      await testKeyboard(Calendar, new CalendarDate(2019, 6, 5), 'PageUp', 'Tuesday, June 5, 2018', 'June 2018', props, {shiftKey: true});
      await testKeyboard(Calendar, new CalendarDate(2019, 6, 5), 'PageDown', 'Friday, June 5, 2020', 'June 2020', props, {shiftKey: true});
    });

    it.each`
      Name                    | Calendar          | props
      ${'v3 Calendar'}        | ${Calendar}       | ${{minValue: new CalendarDate(2019, 6, 2), maxValue: new CalendarDate(2019, 6, 8)}}
      ${'v3 RangeCalendar'}   | ${RangeCalendar}  | ${{minValue: new CalendarDate(2019, 6, 2), maxValue: new CalendarDate(2019, 6, 8)}}
    `('$Name should not move the focused date outside the valid range', async ({Calendar, props}) => {
      await testKeyboard(Calendar, new CalendarDate(2019, 6, 2), 'ArrowLeft', 'Sunday, June 2, 2019 selected', 'June 2019', props);
      await testKeyboard(Calendar, new CalendarDate(2019, 6, 8), 'ArrowRight', 'Saturday, June 8, 2019 selected', 'June 2019', props);
      await testKeyboard(Calendar, new CalendarDate(2019, 6, 5), 'ArrowUp', 'Sunday, June 2, 2019', 'June 2019', props);
      await testKeyboard(Calendar, new CalendarDate(2019, 6, 5), 'ArrowDown', 'Saturday, June 8, 2019', 'June 2019', props);
      await testKeyboard(Calendar, new CalendarDate(2019, 6, 5), 'Home', 'Sunday, June 2, 2019', 'June 2019', props);
      await testKeyboard(Calendar, new CalendarDate(2019, 6, 5), 'End', 'Saturday, June 8, 2019', 'June 2019', props);
      await testKeyboard(Calendar, new CalendarDate(2019, 6, 5), 'PageUp', 'Sunday, June 2, 2019', 'June 2019', props);
      await testKeyboard(Calendar, new CalendarDate(2019, 6, 5), 'PageDown', 'Saturday, June 8, 2019', 'June 2019', props);
      await testKeyboard(Calendar, new CalendarDate(2019, 6, 5), 'PageUp', 'Sunday, June 2, 2019', 'June 2019', props, {shiftKey: true});
      await testKeyboard(Calendar, new CalendarDate(2019, 6, 5), 'PageDown', 'Saturday, June 8, 2019', 'June 2019', props, {shiftKey: true});
    });
  });

  // These tests only apply to v3
  describe('internationalization', () => {
    it.each`
      Name                   | Calendar         | props
      ${'v3 Calendar'}       | ${Calendar}      | ${{}}
      ${'v3 RangeCalendar'}  | ${RangeCalendar} | ${{}}
    `('$Name should change the week start day based on the locale', ({Calendar}) => {
      let {getAllByRole, rerender} = render(
        <Provider theme={theme} locale="en-US">
          <Calendar />
        </Provider>
      );

      let headers = getAllByRole('columnheader');
      expect(headers[0]).toHaveTextContent('S');

      rerender(
        <Provider theme={theme} locale="de-DE">
          <Calendar />
        </Provider>
      );

      headers = getAllByRole('columnheader');
      expect(headers[0]).toHaveTextContent('M');
    });

    it.each`
      Name                   | Calendar         | props
      ${'v3 Calendar'}       | ${Calendar}      | ${{defaultValue: new CalendarDate(2019, 6, 5)}}
      ${'v3 RangeCalendar'}  | ${RangeCalendar} | ${{defaultValue: {start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 10)}}}
    `('$Name should mirror arrow key movement in an RTL locale', ({Calendar, props}) => {
      // LTR
      let {getByRole, getAllByRole, rerender} = render(
        <Provider theme={theme} locale="en-US">
          <Calendar {...props} autoFocus />
        </Provider>
      );

      let grid = getByRole('grid');
      let selected = getAllByRole('button').find(cell => cell.getAttribute('tabIndex') === '0');
      expect(document.activeElement).toBe(selected);

      fireEvent.keyDown(grid, {key: 'ArrowLeft'});
      expect(document.activeElement).toBe(selected.parentNode.previousSibling.children[0]);

      fireEvent.keyDown(grid, {key: 'ArrowRight'});
      expect(document.activeElement).toBe(selected);

      // RTL
      rerender(
        <Provider theme={theme} locale="ar-EG">
          <Calendar {...props} autoFocus />
        </Provider>
      );

      // make sure focused cell gets updated after rerender
      fireEvent.blur(grid);
      fireEvent.focus(grid);

      selected = getAllByRole('button').find(cell => cell.getAttribute('tabIndex') === '0');
      expect(document.activeElement).toBe(selected);

      fireEvent.keyDown(grid, {key: 'ArrowLeft'});
      expect(document.activeElement).toBe(selected.parentNode.nextSibling.children[0]);


      fireEvent.keyDown(grid, {key: 'ArrowRight'});
      expect(document.activeElement).toBe(selected);
    });
  });
});
