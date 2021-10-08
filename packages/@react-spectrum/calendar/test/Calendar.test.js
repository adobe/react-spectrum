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

jest.mock('@react-aria/live-announcer');
import {announce} from '@react-aria/live-announcer';
import {Calendar} from '../';
import {CalendarDate} from '@internationalized/date';
import {fireEvent, render} from '@testing-library/react';
import React from 'react';
import {triggerPress} from '@react-spectrum/test-utils';

let keyCodes = {'Enter': 13, ' ': 32, 'PageUp': 33, 'PageDown': 34, 'End': 35, 'Home': 36, 'ArrowLeft': 37, 'ArrowUp': 38, 'ArrowRight': 39, 'ArrowDown': 40};

describe('Calendar', () => {
  beforeEach(() => {
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => cb());
  });

  afterEach(() => {
    window.requestAnimationFrame.mockRestore();
  });

  describe('basics', () => {
    it.each`
      Name      | Calendar
      ${'v3'}   | ${Calendar}
    `('$Name should render a calendar with a defaultValue', ({Calendar}) => {
      let {getByLabelText, getByRole, getAllByRole} = render(<Calendar defaultValue={new CalendarDate(2019, 6, 5)} />);

      let heading = getByRole('heading');
      expect(heading).toHaveTextContent('June 2019');

      let gridCells = getAllByRole('gridcell').filter(cell => cell.getAttribute('aria-disabled') !== 'true');
      expect(gridCells.length).toBe(30);

      let selectedDate = getByLabelText('Selected', {exact: false});
      expect(selectedDate.parentElement).toHaveAttribute('role', 'gridcell');
      expect(selectedDate.parentElement).toHaveAttribute('aria-selected', 'true');
      expect(selectedDate).toHaveAttribute('aria-label', 'Wednesday, June 5, 2019 selected');
    });

    it.each`
      Name      | Calendar
      ${'v3'}   | ${Calendar}
    `('$Name should render a calendar with a value', ({Calendar}) => {
      let {getByLabelText, getByRole, getAllByRole} = render(<Calendar value={new CalendarDate(2019, 6, 5)} />);

      let heading = getByRole('heading');
      expect(heading).toHaveTextContent('June 2019');

      let gridCells = getAllByRole('gridcell').filter(cell => cell.getAttribute('aria-disabled') !== 'true');
      expect(gridCells.length).toBe(30);

      let selectedDate = getByLabelText('Selected', {exact: false});
      expect(selectedDate.parentElement).toHaveAttribute('role', 'gridcell');
      expect(selectedDate.parentElement).toHaveAttribute('aria-selected', 'true');
      expect(selectedDate).toHaveAttribute('aria-label', 'Wednesday, June 5, 2019 selected');
    });

    it.each`
      Name      | Calendar
      ${'v3'}   | ${Calendar}
    `('$Name should focus the selected date if autoFocus is set', ({Calendar}) => {
      let {getByRole, getByLabelText} = render(<Calendar value={new CalendarDate(2019, 2, 3)} autoFocus />);

      let cell = getByLabelText('selected', {exact: false});

      let grid = getByRole('grid');
      expect(cell.parentElement).toHaveAttribute('role', 'gridcell');
      expect(cell.parentElement).toHaveAttribute('aria-selected', 'true');
      expect(cell).toHaveFocus();
      expect(grid).not.toHaveAttribute('aria-activedescendant');
    });

    it('should center the selected date if multiple months are visible', () => {
      let {getAllByRole, getByLabelText} = render(<Calendar value={new CalendarDate(2019, 2, 3)} visibleMonths={3} />);

      let grids = getAllByRole('grid');
      expect(grids).toHaveLength(3);

      let cell = getByLabelText('selected', {exact: false});
      expect(grids[1].contains(cell)).toBe(true);
    });

    it('should constrain the visible region depending on the minValue', () => {
      let {getAllByRole, getByLabelText} = render(<Calendar value={new CalendarDate(2019, 2, 3)} minValue={new CalendarDate(2019, 2, 1)} visibleMonths={3} />);

      let grids = getAllByRole('grid');
      expect(grids).toHaveLength(3);

      let cell = getByLabelText('selected', {exact: false});
      expect(grids[0].contains(cell)).toBe(true);
    });
  });

  describe('selection', () => {
    it.each`
      Name      | Calendar
      ${'v3'}   | ${Calendar}
    `('$Name selects a date on keyDown Enter/Space (uncontrolled)', ({Calendar}) => {
      let onChange = jest.fn();
      let {getByLabelText, getByRole} = render(
        <Calendar
          defaultValue={new CalendarDate(2019, 6, 5)}
          autoFocus
          onChange={onChange} />
      );

      let grid = getByRole('grid');
      let selectedDate = getByLabelText('selected', {exact: false});
      expect(selectedDate.textContent).toBe('5');

      // Select a new date
      fireEvent.keyDown(grid, {key: 'ArrowLeft', keyCode: keyCodes.ArrowLeft});
      fireEvent.keyDown(grid, {key: 'Enter', keyCode: keyCodes.Enter});
      selectedDate = getByLabelText('selected', {exact: false});
      expect(selectedDate.textContent).toBe('4');
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0]).toEqual(new CalendarDate(2019, 6, 4));

      fireEvent.keyDown(grid, {key: 'ArrowLeft', keyCode: keyCodes.ArrowLeft});
      fireEvent.keyDown(grid, {key: ' ', keyCode: keyCodes[' ']});
      selectedDate = getByLabelText('selected', {exact: false});
      expect(selectedDate.textContent).toBe('3');
      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange.mock.calls[1][0]).toEqual(new CalendarDate(2019, 6, 3));
    });

    it.each`
      Name      | Calendar
      ${'v3'}   | ${Calendar}
    `('$Name selects a date on keyDown Enter/Space (controlled)', ({Calendar}) => {
      let onChange = jest.fn();
      let {getByLabelText, getByRole} = render(
        <Calendar
          value={new CalendarDate(2019, 6, 5)}
          autoFocus
          onChange={onChange} />
      );

      let grid = getByRole('grid');
      let selectedDate = getByLabelText('selected', {exact: false});
      expect(selectedDate.textContent).toBe('5');

      // Select a new date
      fireEvent.keyDown(grid, {key: 'ArrowLeft', keyCode: keyCodes.ArrowLeft});
      fireEvent.keyDown(grid, {key: 'Enter', keyCode: keyCodes.Enter});
      selectedDate = getByLabelText('selected', {exact: false});
      expect(selectedDate.textContent).toBe('5'); // controlled
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0]).toEqual(new CalendarDate(2019, 6, 4));

      fireEvent.keyDown(grid, {key: 'ArrowLeft', keyCode: keyCodes.ArrowLeft});
      fireEvent.keyDown(grid, {key: ' ', keyCode: keyCodes[' ']});
      selectedDate = getByLabelText('selected', {exact: false});
      expect(selectedDate.textContent).toBe('5'); // controlled
      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange.mock.calls[1][0]).toEqual(new CalendarDate(2019, 6, 3));
    });

    it.each`
      Name      | Calendar      | props
      ${'v3'}   | ${Calendar}   | ${{isReadOnly: true}}
    `('$Name does not select a date on keyDown Enter/Space if isReadOnly', ({Calendar, props}) => {
      let onChange = jest.fn();
      let {getByLabelText} = render(
        <Calendar
          defaultValue={new CalendarDate(2019, 6, 5)}
          autoFocus
          onChange={onChange}
          {...props} />
      );

      let selectedDate = getByLabelText('selected', {exact: false});
      expect(selectedDate.textContent).toBe('5');

      fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft', keyCode: keyCodes.ArrowLeft});
      fireEvent.keyDown(document.activeElement, {key: 'Enter', keyCode: keyCodes.Enter});
      selectedDate = getByLabelText('selected', {exact: false});
      expect(selectedDate.textContent).toBe('5');
      expect(onChange).not.toHaveBeenCalled();

      fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft', keyCode: keyCodes.ArrowLeft});
      fireEvent.keyDown(document.activeElement, {key: ' ', keyCode: keyCodes[' ']});
      selectedDate = getByLabelText('selected', {exact: false});
      expect(selectedDate.textContent).toBe('5');
      expect(onChange).not.toHaveBeenCalled();
    });

    it.each`
      Name      | Calendar
      ${'v3'}   | ${Calendar}
    `('$Name selects a date on click (uncontrolled)', ({Calendar}) => {
      let onChange = jest.fn();
      let {getByLabelText, getByText} = render(
        <Calendar
          defaultValue={new CalendarDate(2019, 6, 5)}
          onChange={onChange} />
      );

      let newDate = getByText('17');
      triggerPress(newDate);

      let selectedDate = getByLabelText('selected', {exact: false});
      expect(selectedDate.textContent).toBe('17');
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0]).toEqual(new CalendarDate(2019, 6, 17));
    });

    it.each`
      Name      | Calendar
      ${'v3'}   | ${Calendar}
    `('$Name selects a date on click (controlled)', ({Calendar}) => {
      let onChange = jest.fn();
      let {getByLabelText, getByText} = render(
        <Calendar
          value={new CalendarDate(2019, 6, 5)}
          onChange={onChange} />
      );

      let newDate = getByText('17');
      triggerPress(newDate);

      let selectedDate = getByLabelText('selected', {exact: false});
      expect(selectedDate.textContent).toBe('5');
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0]).toEqual(new CalendarDate(2019, 6, 17));
    });

    it.each`
      Name      | Calendar      | props
      ${'v3'}   | ${Calendar}   | ${{isDisabled: true}}
    `('$Name does not select a date on click if isDisabled', ({Calendar, props}) => {
      let onChange = jest.fn();
      let {getByLabelText, getByText} = render(
        <Calendar
          value={new CalendarDate(2019, 6, 5)}
          onChange={onChange}
          {...props} />
      );

      let newDate = getByText('17');
      triggerPress(newDate);

      let selectedDate = getByLabelText('selected', {exact: false});
      expect(selectedDate.textContent).toBe('5');
      expect(onChange).not.toHaveBeenCalled();
    });

    it.each`
      Name      | Calendar      | props
      ${'v3'}   | ${Calendar}   | ${{isReadOnly: true}}
    `('$Name does not select a date on click if isReadOnly', ({Calendar, props}) => {
      let onChange = jest.fn();
      let {getByLabelText, getByText} = render(
        <Calendar
          value={new CalendarDate(2019, 6, 5)}
          onChange={onChange}
          {...props} />
      );

      let newDate = getByText('17');
      triggerPress(newDate);

      let selectedDate = getByLabelText('selected', {exact: false});
      expect(selectedDate.textContent).toBe('5');
      expect(onChange).not.toHaveBeenCalled();
    });

    it.each`
      Name      | Calendar      | props
      ${'v3'}   | ${Calendar}   | ${{defaultValue: new CalendarDate(2019, 2, 8), minValue: new CalendarDate(2019, 2, 5), maxValue: new CalendarDate(2019, 2, 15)}}
    `('$Name does not select a date on click if outside the valid date range', ({Calendar, props}) => {
      let onChange = jest.fn();
      let {getByLabelText} = render(
        <Calendar
          onChange={onChange}
          {...props} />
      );

      triggerPress(getByLabelText('Sunday, February 3, 2019'));

      let selectedDate = getByLabelText('selected', {exact: false});
      expect(selectedDate.textContent).toBe('8');
      expect(onChange).not.toHaveBeenCalled();

      triggerPress(getByLabelText('Sunday, February 17, 2019'));

      selectedDate = getByLabelText('selected', {exact: false});
      expect(selectedDate.textContent).toBe('8');
      expect(onChange).not.toHaveBeenCalled();

      triggerPress(getByLabelText('Tuesday, February 5, 2019'));

      selectedDate = getByLabelText('selected', {exact: false});
      expect(selectedDate.textContent).toBe('5');
      expect(onChange).toHaveBeenCalledTimes(1);

      triggerPress(getByLabelText('Friday, February 15, 2019'));

      selectedDate = getByLabelText('selected', {exact: false});
      expect(selectedDate.textContent).toBe('15');
      expect(onChange).toHaveBeenCalledTimes(2);
    });
  });

  // These tests only work against v3
  describe('announcing', () => {
    it('announces when the current month changes', () => {
      let {getByLabelText} = render(<Calendar defaultValue={new CalendarDate(2019, 6, 5)} />);

      let nextButton = getByLabelText('Next');
      triggerPress(nextButton);

      expect(announce).toHaveBeenCalledTimes(1);
      expect(announce).toHaveBeenCalledWith('July 2019');
    });

    it('announces when the selected date changes', () => {
      let {getByText} = render(<Calendar defaultValue={new CalendarDate(2019, 6, 5)} />);

      let newDate = getByText('17');
      triggerPress(newDate);

      expect(announce).toHaveBeenCalledTimes(1);
      expect(announce).toHaveBeenCalledWith('Selected Date: Monday, June 17, 2019', 'polite', 4000);
    });

    it('ensures that the active descendant is announced when the focused date changes', () => {
      let {getByRole, getByLabelText} = render(<Calendar defaultValue={new CalendarDate(2019, 6, 5)} autoFocus />);

      let grid = getByRole('grid');
      let selectedDate = getByLabelText('selected', {exact: false});
      expect(selectedDate).toHaveFocus();

      fireEvent.keyDown(grid, {key: 'ArrowRight'});
      expect(getByLabelText('Thursday, June 6, 2019', {exact: false})).toHaveFocus();
    });

    it('renders a description with the selected date', () => {
      let {getByText, getByRole} = render(<Calendar defaultValue={new CalendarDate(2019, 6, 5)} />);

      let grid = getByRole('grid');
      let caption = document.getElementById(grid.getAttribute('aria-describedby'));
      expect(caption).toHaveTextContent('Selected Date: Wednesday, June 5, 2019');

      let newDate = getByText('17');
      triggerPress(newDate);

      caption = document.getElementById(grid.getAttribute('aria-describedby'));
      expect(caption).toHaveTextContent('Selected Date: Monday, June 17, 2019');
    });
  });
});
