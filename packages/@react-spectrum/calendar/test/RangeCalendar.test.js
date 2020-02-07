jest.mock('@react-aria/live-announcer');
import {announce} from '@react-aria/live-announcer';
import {cleanup, fireEvent, render} from '@testing-library/react';
import {RangeCalendar} from '../';
import React from 'react';
import {startOfDay} from 'date-fns';
import {triggerPress} from '@react-spectrum/test-utils';
import V2Calendar from '@react/react-spectrum/Calendar';

let cellFormatter = new Intl.DateTimeFormat('en-US', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'});
let keyCodes = {'Enter': 13, ' ': 32, 'PageUp': 33, 'PageDown': 34, 'End': 35, 'Home': 36, 'ArrowLeft': 37, 'ArrowUp': 38, 'ArrowRight': 39, 'ArrowDown': 40, Escape: 27};

describe('RangeCalendar', () => {
  afterEach(cleanup);

  beforeEach(() => {
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => cb());
  });

  afterEach(() => {
    window.requestAnimationFrame.mockRestore();
  });

  describe('basics', () => {
    it.each`
      Name          | RangeCalendar    | props
      ${'v3'}       | ${RangeCalendar} | ${{defaultValue: {start: new Date(2019, 5, 5), end: new Date(2019, 5, 10)}}}
      ${'v2'}       | ${V2Calendar}    | ${{selectionType: 'range', defaultValue: [new Date(2019, 5, 5), new Date(2019, 5, 10)]}}
    `('$Name should render a calendar with a defaultValue', ({RangeCalendar, props}) => {
      let {getAllByLabelText, getByRole, getAllByRole} = render(<RangeCalendar {...props} />);

      let heading = getByRole('heading');
      expect(heading).toHaveTextContent('June 2019');

      let gridCells = getAllByRole('gridcell').filter(cell => cell.getAttribute('aria-disabled') !== 'true');
      expect(gridCells.length).toBe(30);

      let selectedDates = getAllByLabelText('Selected', {exact: false});
      let labels = [
        'Wednesday, June 5, 2019 selected',
        'Thursday, June 6, 2019 selected',
        'Friday, June 7, 2019 selected',
        'Saturday, June 8, 2019 selected',
        'Sunday, June 9, 2019 selected',
        'Monday, June 10, 2019 selected'
      ];
      expect(selectedDates.length).toBe(6);

      let i = 0;
      for (let cell of selectedDates) {
        expect(cell).toHaveAttribute('role', 'gridcell');
        expect(cell).toHaveAttribute('aria-selected', 'true');
        expect(cell).toHaveAttribute('aria-label', labels[i++]);
      }
    });

    it.each`
      Name          | RangeCalendar    | props
      ${'v3'}       | ${RangeCalendar} | ${{value: {start: new Date(2019, 5, 5), end: new Date(2019, 5, 10)}}}
      ${'v2'}       | ${V2Calendar}    | ${{selectionType: 'range', value: [new Date(2019, 5, 5), new Date(2019, 5, 10)]}}
    `('$Name should render a calendar with a value', ({RangeCalendar, props}) => {
      let {getAllByLabelText, getByRole, getAllByRole} = render(<RangeCalendar {...props} />);

      let heading = getByRole('heading');
      expect(heading).toHaveTextContent('June 2019');

      let gridCells = getAllByRole('gridcell').filter(cell => cell.getAttribute('aria-disabled') !== 'true');
      expect(gridCells.length).toBe(30);

      let selectedDates = getAllByLabelText('Selected', {exact: false});
      let labels = [
        'Wednesday, June 5, 2019 selected',
        'Thursday, June 6, 2019 selected',
        'Friday, June 7, 2019 selected',
        'Saturday, June 8, 2019 selected',
        'Sunday, June 9, 2019 selected',
        'Monday, June 10, 2019 selected'
      ];
      expect(selectedDates.length).toBe(6);

      let i = 0;
      for (let cell of selectedDates) {
        expect(cell).toHaveAttribute('role', 'gridcell');
        expect(cell).toHaveAttribute('aria-selected', 'true');
        expect(cell).toHaveAttribute('aria-label', labels[i++]);
      }
    });

    it.each`
      Name          | RangeCalendar    | props
      ${'v3'}       | ${RangeCalendar} | ${{value: {start: new Date(2019, 1, 3), end: new Date(2019, 1, 18)}}}
      ${'v2'}       | ${V2Calendar}    | ${{selectionType: 'range', value: [new Date(2019, 1, 3), new Date(2019, 1, 18)]}}
    `('$Name should focus the first selected date if autoFocus is set', ({Name, RangeCalendar, props}) => {
      const isV2 = Name.indexOf('v2') === 0;
      let {getByRole, getAllByLabelText} = render(<RangeCalendar {...props} autoFocus />);

      let cells = getAllByLabelText('selected', {exact: false});
      expect(cells[0]).toHaveAttribute('role', 'gridcell');
      expect(cells[0]).toHaveAttribute('aria-selected', 'true');

      let grid = getByRole('grid');
      expect(isV2 ? grid : cells[0]).toHaveFocus();
      expect(grid).toHaveAttribute('aria-activedescendant', cells[0].id);
    });

    // v2 doesn't pass this test - it starts by showing the end date instead of the start date.
    it('should show selected dates across multiple months', () => {
      let {getByRole, getByLabelText, getAllByLabelText, getAllByRole} = render(<RangeCalendar value={{start: new Date(2019, 5, 20), end: new Date(2019, 6, 10)}} />);

      let heading = getByRole('heading');
      expect(heading).toHaveTextContent('June 2019');

      let gridCells = getAllByRole('gridcell').filter(cell => cell.getAttribute('aria-disabled') !== 'true');
      expect(gridCells.length).toBe(30);

      let selected = getAllByLabelText('selected', {exact: false}).filter(cell => cell.getAttribute('aria-disabled') !== 'true');
      expect(selected.length).toBe(11);
      let juneLabels = [
        'Thursday, June 20, 2019 selected',
        'Friday, June 21, 2019 selected',
        'Saturday, June 22, 2019 selected',
        'Sunday, June 23, 2019 selected',
        'Monday, June 24, 2019 selected',
        'Tuesday, June 25, 2019 selected',
        'Wednesday, June 26, 2019 selected',
        'Thursday, June 27, 2019 selected',
        'Friday, June 28, 2019 selected',
        'Saturday, June 29, 2019 selected',
        'Sunday, June 30, 2019 selected'
      ];

      let i = 0;
      for (let cell of selected) {
        expect(cell).toHaveAttribute('aria-selected', 'true');
        expect(cell).toHaveAttribute('aria-label', juneLabels[i++]);
      }

      let nextButton = getByLabelText('Next');
      triggerPress(nextButton);

      selected = getAllByLabelText('selected', {exact: false}).filter(cell => cell.getAttribute('aria-disabled') !== 'true');
      expect(selected.length).toBe(10);
      let julyLabels = [
        'Monday, July 1, 2019 selected',
        'Tuesday, July 2, 2019 selected',
        'Wednesday, July 3, 2019 selected',
        'Thursday, July 4, 2019 selected',
        'Friday, July 5, 2019 selected',
        'Saturday, July 6, 2019 selected',
        'Sunday, July 7, 2019 selected',
        'Monday, July 8, 2019 selected',
        'Tuesday, July 9, 2019 selected',
        'Wednesday, July 10, 2019 selected'
      ];

      i = 0;
      for (let cell of selected) {
        expect(cell).toHaveAttribute('aria-selected', 'true');
        expect(cell).toHaveAttribute('aria-label', julyLabels[i++]);
      }

      expect(heading).toHaveTextContent('July 2019');
      gridCells = getAllByRole('gridcell').filter(cell => cell.getAttribute('aria-disabled') !== 'true');
      expect(gridCells.length).toBe(31);

      expect(nextButton).toHaveFocus();

      let prevButton = getByLabelText('Previous');
      triggerPress(prevButton);

      expect(heading).toHaveTextContent('June 2019');
      gridCells = getAllByRole('gridcell').filter(cell => cell.getAttribute('aria-disabled') !== 'true');
      expect(gridCells.length).toBe(30);

      selected = getAllByLabelText('selected', {exact: false}).filter(cell => cell.getAttribute('aria-disabled') !== 'true');
      expect(selected.length).toBe(11);
      i = 0;
      for (let cell of selected) {
        expect(cell).toHaveAttribute('aria-selected', 'true');
        expect(cell).toHaveAttribute('aria-label', juneLabels[i++]);
      }

      expect(prevButton).toHaveFocus();
    });
  });

  describe('selection', () => {
    it.each`
      Name          | RangeCalendar    | props
      ${'v3'}       | ${RangeCalendar} | ${{}}
      ${'v2'}       | ${V2Calendar}    | ${{selectionType: 'range'}}
    `('$Name adds a range selection prompt to the focused cell', ({RangeCalendar, props}) => {
      let {getByRole, getByLabelText} = render(<RangeCalendar {...props} autoFocus />);

      let grid = getByRole('grid');
      let cell = getByLabelText('today', {exact: false});
      expect(grid).toHaveAttribute('aria-activedescendant', cell.id);
      expect(cell).toHaveAttribute('aria-label', `Today, ${cellFormatter.format(new Date())} (Click to start selecting date range)`);

      // enter selection mode
      fireEvent.keyDown(grid, {key: 'Enter', keyCode: keyCodes.Enter});
      expect(grid).toHaveAttribute('aria-activedescendant', cell.id);
      expect(cell).toHaveAttribute('aria-selected');
      expect(cell).toHaveAttribute('aria-label', `Today, ${cellFormatter.format(new Date())} selected (Click to finish selecting date range)`);
    });

    it.each`
      Name          | RangeCalendar    | props
      ${'v3'}       | ${RangeCalendar} | ${{defaultValue: {start: new Date(2019, 5, 5), end: new Date(2019, 5, 10)}}}
      ${'v2'}       | ${V2Calendar}    | ${{selectionType: 'range', defaultValue: [new Date(2019, 5, 5), new Date(2019, 5, 10)]}}
    `('$Name can select a range with the keyboard (uncontrolled)', ({RangeCalendar, props}) => {
      let onChange = jest.fn();
      let {getAllByLabelText, getByRole} = render(
        <RangeCalendar
          {...props}
          autoFocus
          onChange={onChange} />
      );

      let grid = getByRole('grid');
      let selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('5');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('10');

      // Select a new date
      fireEvent.keyDown(grid, {key: 'ArrowLeft', keyCode: keyCodes.ArrowLeft});

      // Begin selecting
      fireEvent.keyDown(grid, {key: 'Enter', keyCode: keyCodes.Enter});

      // Move focus
      fireEvent.keyDown(grid, {key: 'ArrowRight', keyCode: keyCodes.ArrowRight});
      fireEvent.keyDown(grid, {key: 'ArrowRight', keyCode: keyCodes.ArrowRight});
      fireEvent.keyDown(grid, {key: 'ArrowRight', keyCode: keyCodes.ArrowRight});
      fireEvent.keyDown(grid, {key: 'ArrowRight', keyCode: keyCodes.ArrowRight});

      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('4');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('8');
      expect(onChange).toHaveBeenCalledTimes(0);

      // End selection
      fireEvent.keyDown(grid, {key: ' ', keyCode: keyCodes.Enter});
      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('4'); // uncontrolled
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('8');
      expect(onChange).toHaveBeenCalledTimes(1);

      let value = onChange.mock.calls[0][0];
      let start, end;
      if (Array.isArray(value)) { // v2
        [start, end] = value;
      } else { // v3
        ({start, end} = value);
      }

      expect(start.valueOf()).toBe(new Date(2019, 5, 4).valueOf()); // v2 returns a moment object
      expect(startOfDay(end).valueOf()).toBe(new Date(2019, 5, 8).valueOf()); // v2 returns a moment object
    });

    it.each`
      Name          | RangeCalendar    | props
      ${'v3'}       | ${RangeCalendar} | ${{value: {start: new Date(2019, 5, 5), end: new Date(2019, 5, 10)}}}
      ${'v2'}       | ${V2Calendar}    | ${{selectionType: 'range', value: [new Date(2019, 5, 5), new Date(2019, 5, 10)]}}
    `('$Name can select a range with the keyboard (controlled)', ({RangeCalendar, props}) => {
      let onChange = jest.fn();
      let {getAllByLabelText, getByRole} = render(
        <RangeCalendar
          {...props}
          autoFocus
          onChange={onChange} />
      );

      let grid = getByRole('grid');
      let selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('5');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('10');

      // Select a new date
      fireEvent.keyDown(grid, {key: 'ArrowLeft', keyCode: keyCodes.ArrowLeft});

      // Begin selecting
      fireEvent.keyDown(grid, {key: 'Enter', keyCode: keyCodes.Enter});

      // Move focus
      fireEvent.keyDown(grid, {key: 'ArrowRight', keyCode: keyCodes.ArrowRight});
      fireEvent.keyDown(grid, {key: 'ArrowRight', keyCode: keyCodes.ArrowRight});
      fireEvent.keyDown(grid, {key: 'ArrowRight', keyCode: keyCodes.ArrowRight});
      fireEvent.keyDown(grid, {key: 'ArrowRight', keyCode: keyCodes.ArrowRight});

      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('4');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('8');
      expect(onChange).toHaveBeenCalledTimes(0);

      // End selection
      fireEvent.keyDown(grid, {key: ' ', keyCode: keyCodes.Enter});
      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('5'); // controlled
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('10');
      expect(onChange).toHaveBeenCalledTimes(1);

      let value = onChange.mock.calls[0][0];
      let start, end;
      if (Array.isArray(value)) { // v2
        [start, end] = value;
      } else { // v3
        ({start, end} = value);
      }

      expect(start.valueOf()).toBe(new Date(2019, 5, 4).valueOf()); // v2 returns a moment object
      expect(startOfDay(end).valueOf()).toBe(new Date(2019, 5, 8).valueOf()); // v2 returns a moment object
    });

    // v2 does not pass this test.
    it('does not enter selection mode with the keyboard if isReadOnly', () => {
      let {getByRole, getByLabelText} = render(<RangeCalendar isReadOnly autoFocus />);

      let grid = getByRole('grid');
      let cell = getByLabelText('today', {exact: false});
      expect(grid).toHaveAttribute('aria-activedescendant', cell.id);
      expect(cell).toHaveAttribute('aria-label', `Today, ${cellFormatter.format(new Date())}`);

      // try to enter selection mode
      fireEvent.keyDown(grid, {key: 'Enter', keyCode: keyCodes.Enter});
      expect(grid).toHaveAttribute('aria-activedescendant', cell.id);
      expect(cell).not.toHaveAttribute('aria-selected');
      expect(cell).toHaveAttribute('aria-label', `Today, ${cellFormatter.format(new Date())}`);
    });

    it.each`
      Name          | RangeCalendar    | props
      ${'v3'}       | ${RangeCalendar} | ${{defaultValue: {start: new Date(2019, 5, 5), end: new Date(2019, 5, 10)}}}
      ${'v2'}       | ${V2Calendar}    | ${{selectionType: 'range', defaultValue: [new Date(2019, 5, 5), new Date(2019, 5, 10)]}}
    `('$Name selects a range with the mouse (uncontrolled)', ({RangeCalendar, props}) => {
      let onChange = jest.fn();
      let {getAllByLabelText, getByText} = render(
        <RangeCalendar
          {...props}
          onChange={onChange} />
      );

      triggerPress(getByText('17'));

      let selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('17');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('17');
      expect(onChange).toHaveBeenCalledTimes(0);

      // hovering updates the highlighted dates
      fireEvent.mouseEnter(getByText('10'));
      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('10');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('17');
      expect(onChange).toHaveBeenCalledTimes(0);

      fireEvent.mouseEnter(getByText('7'));
      triggerPress(getByText('7'));

      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('7'); // uncontrolled
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('17');
      expect(onChange).toHaveBeenCalledTimes(1);

      let value = onChange.mock.calls[0][0];
      let start, end;
      if (Array.isArray(value)) { // v2
        [start, end] = value;
      } else { // v3
        ({start, end} = value);
      }

      expect(start.valueOf()).toBe(new Date(2019, 5, 7).valueOf()); // v2 returns a moment object
      expect(startOfDay(end).valueOf()).toBe(new Date(2019, 5, 17).valueOf()); // v2 returns a moment object
    });

    it.each`
      Name          | RangeCalendar    | props
      ${'v3'}       | ${RangeCalendar} | ${{value: {start: new Date(2019, 5, 5), end: new Date(2019, 5, 10)}}}
      ${'v2'}       | ${V2Calendar}    | ${{selectionType: 'range', value: [new Date(2019, 5, 5), new Date(2019, 5, 10)]}}
    `('$Name selects a range with the mouse (controlled)', ({RangeCalendar, props}) => {
      let onChange = jest.fn();
      let {getAllByLabelText, getByText} = render(
        <RangeCalendar
          {...props}
          onChange={onChange} />
      );

      triggerPress(getByText('17'));

      let selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('17');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('17');
      expect(onChange).toHaveBeenCalledTimes(0);

      // hovering updates the highlighted dates
      fireEvent.mouseEnter(getByText('10'));
      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('10');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('17');
      expect(onChange).toHaveBeenCalledTimes(0);

      fireEvent.mouseEnter(getByText('7'));
      triggerPress(getByText('7'));

      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('5'); // controlled
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('10');
      expect(onChange).toHaveBeenCalledTimes(1);

      let value = onChange.mock.calls[0][0];
      let start, end;
      if (Array.isArray(value)) { // v2
        [start, end] = value;
      } else { // v3
        ({start, end} = value);
      }

      expect(start.valueOf()).toBe(new Date(2019, 5, 7).valueOf()); // v2 returns a moment object
      expect(startOfDay(end).valueOf()).toBe(new Date(2019, 5, 17).valueOf()); // v2 returns a moment object
    });

    // v2 does not pass this test.
    it('does not enter selection mode with the mouse if isReadOnly', () => {
      let {getByRole, getByLabelText, getByText} = render(<RangeCalendar isReadOnly autoFocus />);

      let grid = getByRole('grid');
      let cell = getByLabelText('today', {exact: false});
      expect(grid).toHaveAttribute('aria-activedescendant', cell.id);

      // try to enter selection mode
      cell = getByText('17').parentNode;
      triggerPress(cell);
      expect(grid).toHaveAttribute('aria-activedescendant', cell.id);
      expect(cell).not.toHaveAttribute('aria-selected');
    });

    it.each`
      Name          | RangeCalendar    | props
      ${'v3'}       | ${RangeCalendar} | ${{isDisabled: true}}
      ${'v2'}       | ${V2Calendar}    | ${{selectionType: 'range', disabled: true}}
    `('$Name does not select a date on click if isDisabled', ({RangeCalendar, props}) => {
      let onChange = jest.fn();
      let {getAllByLabelText, getByText} = render(
        <RangeCalendar
          {...props}
          onChange={onChange} />
      );

      let newDate = getByText('17');
      triggerPress(newDate);

      expect(() => {
        getAllByLabelText('selected', {exact: false});
      }).toThrow();
      expect(onChange).not.toHaveBeenCalled();
    });

    it.each`
      Name          | RangeCalendar    | props
      ${'v3'}       | ${RangeCalendar} | ${{defaultValue: {start: new Date(2019, 1, 8), end: new Date(2019, 1, 15)}, minValue: new Date(2019, 1, 5), maxValue: new Date(2019, 1, 15)}}
      ${'v2'}       | ${V2Calendar}    | ${{selectionType: 'range', defaultValue: [new Date(2019, 1, 8), new Date(2019, 1, 15)], min: new Date(2019, 1, 5), max: new Date(2019, 1, 15)}}
    `('$Name does not select a date on click if outside the valid date range', ({RangeCalendar, props}) => {
      let onChange = jest.fn();
      let {getByLabelText, getAllByLabelText} = render(
        <RangeCalendar
          onChange={onChange}
          {...props} />
      );

      triggerPress(getByLabelText('Sunday, February 3, 2019'));

      let selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('8');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('15');
      expect(onChange).not.toHaveBeenCalled();

      triggerPress(getByLabelText('Sunday, February 17, 2019'));

      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('8');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('15');
      expect(onChange).not.toHaveBeenCalled();

      triggerPress(getByLabelText('Tuesday, February 5, 2019'));

      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('5');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('5');
      expect(onChange).not.toHaveBeenCalled();

      triggerPress(getByLabelText('Friday, February 15, 2019'));

      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('5');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('15');
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it.each`
      Name          | RangeCalendar    | props
      ${'v3'}       | ${RangeCalendar} | ${{value: {start: new Date(2019, 5, 5), end: new Date(2019, 5, 10)}}}
      ${'v2'}       | ${V2Calendar}    | ${{selectionType: 'range', value: [new Date(2019, 5, 5), new Date(2019, 5, 10)]}}
    `('$Name cancels the selection when the escape key is pressed', ({RangeCalendar, props}) => {
      let onChange = jest.fn();
      let {getByText, getAllByLabelText} = render(
        <RangeCalendar
          autoFocus
          onChange={onChange}
          {...props} />
      );

      // start a selection
      triggerPress(getByText('17'));

      let selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('17');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('17');
      expect(onChange).not.toHaveBeenCalled();

      // highlight some dates
      fireEvent.mouseEnter(getByText('10'));
      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('10');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('17');
      expect(onChange).not.toHaveBeenCalled();

      // Cancel
      fireEvent.keyDown(document.activeElement, {key: 'Escape', keyCode: keyCodes.Escape});

      // Should revert selection
      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('5');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('10');
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  // These tests only work against v3
  describe('announcing', () => {
    it('announces when the current month changes', () => {
      let {getByLabelText} = render(<RangeCalendar defaultValue={{start: new Date(2019, 5, 5), end: new Date(2019, 5, 10)}} />);

      let nextButton = getByLabelText('Next');
      triggerPress(nextButton);

      expect(announce).toHaveBeenCalledTimes(1);
      expect(announce).toHaveBeenCalledWith('July 2019');
    });

    it('announces when the selected date range changes', () => {
      let {getByText} = render(<RangeCalendar defaultValue={{start: new Date(2019, 5, 5), end: new Date(2019, 5, 10)}} />);

      triggerPress(getByText('17'));
      triggerPress(getByText('10'));

      expect(announce).toHaveBeenCalledTimes(1);
      expect(announce).toHaveBeenCalledWith('Selected Range: June 10, 2019 to June 17, 2019');
    });

    it('ensures that the active descendant is announced when the focused date changes', () => {
      let {getByRole, getAllByLabelText} = render(<RangeCalendar defaultValue={{start: new Date(2019, 5, 5), end: new Date(2019, 5, 10)}} autoFocus />);

      let grid = getByRole('grid');

      let selectedDates = getAllByLabelText('selected', {exact: false});

      expect(selectedDates[0]).toHaveFocus();
      fireEvent.keyDown(grid, {key: 'ArrowRight'});

      expect(selectedDates[1]).toHaveFocus();
    });

    it('renders a caption with the selected date range', () => {
      let {getByText, getByRole} = render(<RangeCalendar defaultValue={{start: new Date(2019, 5, 5), end: new Date(2019, 5, 10)}} />);

      let grid = getByRole('grid');
      let caption = document.getElementById(grid.getAttribute('aria-describedby'));
      expect(caption.tagName.toLowerCase()).toBe('caption');
      expect(caption).toHaveTextContent('Selected Range: June 5, 2019 to June 10, 2019');

      triggerPress(getByText('17'));

      // in selection mode, the caption should be empty
      expect(grid).not.toHaveAttribute('aria-describedby');
      expect(caption).toHaveTextContent('');

      triggerPress(getByText('10'));

      expect(grid).toHaveAttribute('aria-describedby', caption.id);
      expect(caption).toHaveTextContent('Selected Range: June 10, 2019 to June 17, 2019');
    });
  });
});
