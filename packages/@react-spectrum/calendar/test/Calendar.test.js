jest.mock('@react-aria/live-announcer');
import {announce} from '@react-aria/live-announcer';
import {Calendar} from '../';
import {cleanup, fireEvent, render} from '@testing-library/react';
import React from 'react';
import {triggerPress} from '@react-spectrum/button/test/utils';
import V2Calendar from '@react/react-spectrum/Calendar';

let keyCodes = {'Enter': 13, ' ': 32, 'PageUp': 33, 'PageDown': 34, 'End': 35, 'Home': 36, 'ArrowLeft': 37, 'ArrowUp': 38, 'ArrowRight': 39, 'ArrowDown': 40};

describe('Calendar', () => {
  afterEach(cleanup);

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
      ${'v2'}   | ${V2Calendar}
    `('$Name should render a calendar with a defaultValue', ({Calendar}) => {
      let {getByLabelText, getByRole, getAllByRole} = render(<Calendar defaultValue={new Date(2019, 5, 5)} />);

      let heading = getByRole('heading');
      expect(heading).toHaveTextContent('June 2019');

      let gridCells = getAllByRole('gridcell').filter(cell => cell.getAttribute('aria-disabled') !== 'true');
      expect(gridCells.length).toBe(30);
  
      let selectedDate = getByLabelText('Selected', {exact: false});
      expect(selectedDate).toHaveAttribute('role', 'gridcell');
      expect(selectedDate).toHaveAttribute('aria-selected', 'true');
      expect(selectedDate).toHaveAttribute('aria-label', 'Wednesday, June 5, 2019 selected');
    });

    it.each`
      Name      | Calendar
      ${'v3'}   | ${Calendar}
      ${'v2'}   | ${V2Calendar}
    `('$Name should render a calendar with a value', ({Calendar}) => {
      let {getByLabelText, getByRole, getAllByRole} = render(<Calendar value={new Date(2019, 5, 5)} />);

      let heading = getByRole('heading');
      expect(heading).toHaveTextContent('June 2019');

      let gridCells = getAllByRole('gridcell').filter(cell => cell.getAttribute('aria-disabled') !== 'true');
      expect(gridCells.length).toBe(30);
  
      let selectedDate = getByLabelText('Selected', {exact: false});
      expect(selectedDate).toHaveAttribute('role', 'gridcell');
      expect(selectedDate).toHaveAttribute('aria-selected', 'true');
      expect(selectedDate).toHaveAttribute('aria-label', 'Wednesday, June 5, 2019 selected');
    });

    it.each`
      Name      | Calendar
      ${'v3'}   | ${Calendar}
      ${'v2'}   | ${V2Calendar}
    `('$Name should focus the selected date if autoFocus is set', ({Calendar}) => {
      let {getByRole, getByLabelText} = render(<Calendar value={new Date(2019, 1, 3)} autoFocus />);

      let cell = getByLabelText('selected', {exact: false});
      expect(cell).toHaveAttribute('role', 'gridcell');
      expect(cell).toHaveAttribute('aria-selected', 'true');

      let grid = getByRole('grid');
      expect(grid).toHaveFocus();
      expect(grid).toHaveAttribute('aria-activedescendant', cell.id);
    });
  });

  describe('selection', () => {
    it.each`
      Name      | Calendar
      ${'v3'}   | ${Calendar}
      ${'v2'}   | ${V2Calendar}
    `('$Name selects a date on keyDown Enter/Space (uncontrolled)', ({Calendar}) => {
      let onChange = jest.fn();
      let {getByLabelText} = render(
        <Calendar 
          defaultValue={new Date(2019, 5, 5)}
          autoFocus
          onChange={onChange} />
      );

      let selectedDate = getByLabelText('selected', {exact: false});
      expect(selectedDate.textContent).toBe('5');

      // Select a new date
      fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft', keyCode: keyCodes.ArrowLeft});
      fireEvent.keyDown(document.activeElement, {key: 'Enter', keyCode: keyCodes.Enter});
      selectedDate = getByLabelText('selected', {exact: false});
      expect(selectedDate.textContent).toBe('4');
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0].valueOf()).toBe(new Date(2019, 5, 4).valueOf()); // v2 returns a moment object

      fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft', keyCode: keyCodes.ArrowLeft});
      fireEvent.keyDown(document.activeElement, {key: ' ', keyCode: keyCodes[' ']});
      selectedDate = getByLabelText('selected', {exact: false});
      expect(selectedDate.textContent).toBe('3');
      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange.mock.calls[1][0].valueOf()).toBe(new Date(2019, 5, 3).valueOf()); // v2 returns a moment object
    });

    it.each`
      Name      | Calendar
      ${'v3'}   | ${Calendar}
      ${'v2'}   | ${V2Calendar}
    `('$Name selects a date on keyDown Enter/Space (controlled)', ({Calendar}) => {
      let onChange = jest.fn();
      let {getByLabelText} = render(
        <Calendar 
          value={new Date(2019, 5, 5)}
          autoFocus
          onChange={onChange} />
      );

      let selectedDate = getByLabelText('selected', {exact: false});
      expect(selectedDate.textContent).toBe('5');

      // Select a new date
      fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft', keyCode: keyCodes.ArrowLeft});
      fireEvent.keyDown(document.activeElement, {key: 'Enter', keyCode: keyCodes.Enter});
      selectedDate = getByLabelText('selected', {exact: false});
      expect(selectedDate.textContent).toBe('5'); // controlled
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0].valueOf()).toBe(new Date(2019, 5, 4).valueOf()); // v2 returns a moment object

      fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft', keyCode: keyCodes.ArrowLeft});
      fireEvent.keyDown(document.activeElement, {key: ' ', keyCode: keyCodes[' ']});
      selectedDate = getByLabelText('selected', {exact: false});
      expect(selectedDate.textContent).toBe('5'); // controlled
      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange.mock.calls[1][0].valueOf()).toBe(new Date(2019, 5, 3).valueOf()); // v2 returns a moment object
    });

    it.each`
      Name      | Calendar      | props
      ${'v3'}   | ${Calendar}   | ${{isReadOnly: true}}
      ${'v2'}   | ${V2Calendar} | ${{readOnly: true}}
    `('$Name does not select a date on keyDown Enter/Space if isReadOnly', ({Calendar, props}) => {
      let onChange = jest.fn();
      let {getByLabelText} = render(
        <Calendar 
          defaultValue={new Date(2019, 5, 5)}
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
      ${'v2'}   | ${V2Calendar}
    `('$Name selects a date on click (uncontrolled)', ({Calendar}) => {
      let onChange = jest.fn();
      let {getByLabelText, getByText} = render(
        <Calendar 
          defaultValue={new Date(2019, 5, 5)}
          onChange={onChange} />
      );

      let newDate = getByText('17');
      triggerPress(newDate);

      let selectedDate = getByLabelText('selected', {exact: false});
      expect(selectedDate.textContent).toBe('17');
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0].valueOf()).toBe(new Date(2019, 5, 17).valueOf()); // v2 returns a moment object
    });

    it.each`
      Name      | Calendar
      ${'v3'}   | ${Calendar}
      ${'v2'}   | ${V2Calendar}
    `('$Name selects a date on click (controlled)', ({Calendar}) => {
      let onChange = jest.fn();
      let {getByLabelText, getByText} = render(
        <Calendar 
          value={new Date(2019, 5, 5)}
          onChange={onChange} />
      );

      let newDate = getByText('17');
      triggerPress(newDate);

      let selectedDate = getByLabelText('selected', {exact: false});
      expect(selectedDate.textContent).toBe('5');
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0].valueOf()).toBe(new Date(2019, 5, 17).valueOf()); // v2 returns a moment object
    });

    it.each`
      Name      | Calendar      | props
      ${'v3'}   | ${Calendar}   | ${{isDisabled: true}}
      ${'v2'}   | ${V2Calendar} | ${{disabled: true}}
    `('$Name does not select a date on click if isDisabled', ({Calendar, props}) => {
      let onChange = jest.fn();
      let {getByLabelText, getByText} = render(
        <Calendar 
          value={new Date(2019, 5, 5)}
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
      ${'v2'}   | ${V2Calendar} | ${{readOnly: true}}
    `('$Name does not select a date on click if isReadOnly', ({Calendar, props}) => {
      let onChange = jest.fn();
      let {getByLabelText, getByText} = render(
        <Calendar 
          value={new Date(2019, 5, 5)}
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
      ${'v3'}   | ${Calendar}   | ${{defaultValue: new Date(2019, 1, 8), minValue: new Date(2019, 1, 5), maxValue: new Date(2019, 1, 15)}}
      ${'v2'}   | ${V2Calendar} | ${{defaultValue: new Date(2019, 1, 8), min: new Date(2019, 1, 5), max: new Date(2019, 1, 15)}}
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
      let {getByLabelText} = render(<Calendar defaultValue={new Date(2019, 5, 5)} />);
  
      let nextButton = getByLabelText('Next');
      triggerPress(nextButton);

      expect(announce).toHaveBeenCalledTimes(1);
      expect(announce).toHaveBeenCalledWith('July 2019');
    });

    it('announces when the selected date changes', () => {
      let {getByText} = render(<Calendar defaultValue={new Date(2019, 5, 5)} />);
  
      let newDate = getByText('17');
      triggerPress(newDate);

      expect(announce).toHaveBeenCalledTimes(1);
      expect(announce).toHaveBeenCalledWith('Selected Date: Monday, June 17, 2019');
    });

    it('ensures that the active descendant is announced when the focused date changes', () => {
      let {getByRole} = render(<Calendar defaultValue={new Date(2019, 5, 5)} autoFocus />);

      let grid = getByRole('grid');
      let onBlur = jest.fn();
      let onFocus = jest.fn();
      
      grid.addEventListener('blur', onBlur);
      grid.addEventListener('focus', onFocus);

      expect(grid).toHaveFocus();
      fireEvent.keyDown(grid, {key: 'ArrowRight'});

      expect(onBlur).toHaveBeenCalledTimes(1);
      expect(onFocus).toHaveBeenCalledTimes(1);
      expect(grid).toHaveFocus();
    });

    it('renders a caption with the selected date', () => {
      let {getByText, getByRole} = render(<Calendar defaultValue={new Date(2019, 5, 5)} />);

      let grid = getByRole('grid');
      let caption = document.getElementById(grid.getAttribute('aria-describedby'));
      expect(caption.tagName.toLowerCase()).toBe('caption');
      expect(caption).toHaveTextContent('Selected Date: Wednesday, June 5, 2019');

      let newDate = getByText('17');
      triggerPress(newDate);

      expect(caption).toHaveTextContent('Selected Date: Monday, June 17, 2019');
    });
  });
});
