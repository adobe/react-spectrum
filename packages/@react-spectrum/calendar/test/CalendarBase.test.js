import {Calendar, RangeCalendar} from '../';
import {cleanup, fireEvent, render} from '@testing-library/react';
import {getDaysInMonth} from 'date-fns';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light-unique.css';
import {triggerPress} from '@react-spectrum/test-utils';
import V2Calendar from '@react/react-spectrum/Calendar';

let theme = {
  light: themeLight,
  medium: scaleMedium
};

let cellFormatter = new Intl.DateTimeFormat('en-US', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'});
let headingFormatter = new Intl.DateTimeFormat('en-US', {month: 'long', year: 'numeric'});
let keyCodes = {'Enter': 13, ' ': 32, 'PageUp': 33, 'PageDown': 34, 'End': 35, 'Home': 36, 'ArrowLeft': 37, 'ArrowUp': 38, 'ArrowRight': 39, 'ArrowDown': 40};

describe('CalendarBase', () => {
  afterEach(cleanup);

  beforeEach(() => {
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => cb());
  });

  afterEach(() => {
    window.requestAnimationFrame.mockRestore();
  });

  describe('basics', () => {
    it.each`
      Name                   | Calendar         | props
      ${'v3 Calendar'}       | ${Calendar}      | ${{}}
      ${'v3 RangeCalendar'}  | ${RangeCalendar} | ${{}}
      ${'v2 Calendar'}       | ${V2Calendar}    | ${{}}
      ${'v2 range Calendar'} | ${V2Calendar}    | ${{selectionType: 'range'}}
    `('$Name shows the current month by default', ({Calendar, props}) => {
      let {getByLabelText, getByRole, getAllByRole} = render(<Calendar {...props} />);

      let calendar = getByRole('group');
      expect(calendar).toBeVisible();

      let heading = getByRole('heading');
      expect(heading).toHaveTextContent(headingFormatter.format(new Date()));

      let grid = getByRole('grid');
      expect(grid).toHaveAttribute('tabIndex', '0');

      let today = getByLabelText('today', {exact: false});
      expect(today).toHaveAttribute('role', 'gridcell');
      expect(today).toHaveAttribute('aria-label', `Today, ${cellFormatter.format(new Date())}`);

      expect(getByLabelText('Previous')).toBeVisible();
      expect(getByLabelText('Next')).toBeVisible();

      let gridCells = getAllByRole('gridcell').filter(cell => cell.getAttribute('aria-disabled') !== 'true');
      expect(gridCells.length).toBe(getDaysInMonth(new Date()));
      for (let cell of gridCells) {
        expect(cell).toHaveAttribute('aria-label');
      }
    });

    it.each`
      Name                   | Calendar         | props
      ${'v3 Calendar'}       | ${Calendar}      | ${{isDisabled: true}}
      ${'v3 RangeCalendar'}  | ${RangeCalendar} | ${{isDisabled: true}}
      ${'v2 Calendar'}       | ${V2Calendar}    | ${{disabled: true}}
      ${'v2 range Calendar'} | ${V2Calendar}    | ${{selectionType: 'range', disabled: true}}
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
      ${'v2 Calendar'}       | ${V2Calendar}    | ${{readOnly: true}}
      ${'v2 range Calendar'} | ${V2Calendar}    | ${{selectionType: 'range', readOnly: true}}
    `('$Name should set aria-readonly when isReadOnly', ({Calendar, props}) => {
      let {getByRole} = render(<Calendar {...props} />);
      let grid = getByRole('grid');
      expect(grid).toHaveAttribute('aria-readonly', 'true');
      expect(grid).toHaveAttribute('tabIndex', '0');
    });

    it.each`
      Name                   | Calendar         | props
      ${'v3 Calendar'}       | ${Calendar}      | ${{}}
      ${'v3 RangeCalendar'}  | ${RangeCalendar} | ${{}}
      ${'v2 Calendar'}       | ${V2Calendar}    | ${{}}
      ${'v2 range Calendar'} | ${V2Calendar}    | ${{selectionType: 'range'}}
    `('$Name should focus today if autoFocus is set and there is no selected value', ({Calendar}) => {
      let {getByRole, getByLabelText} = render(<Calendar autoFocus />);

      let cell = getByLabelText('today', {exact: false});
      expect(cell).toHaveAttribute('role', 'gridcell');

      let grid = getByRole('grid');
      expect(grid).toHaveFocus();
      expect(grid).toHaveAttribute('aria-activedescendant', cell.id);
    });

    it.each`
      Name                    | Calendar              | props
      ${'v3 Calendar'}        | ${Calendar}           | ${{defaultValue: new Date(2019, 1, 10), minValue: new Date(2019, 1, 3), maxValue: new Date(2019, 1, 20)}}
      ${'v2 Calendar'}        | ${V2Calendar}         | ${{defaultValue: new Date(2019, 1, 10), min: new Date(2019, 1, 3), max: new Date(2019, 1, 20)}}
      ${'v3 RangeCalendar'}   | ${RangeCalendar}      | ${{defaultValue: {start: new Date(2019, 1, 10), end: new Date(2019, 1, 15)}, minValue: new Date(2019, 1, 3), maxValue: new Date(2019, 1, 20)}}
      ${'v2 range Calendar'}  | ${V2Calendar}         | ${{selectionType: 'range', defaultValue: [new Date(2019, 1, 10), new Date(2019, 1, 15)], min: new Date(2019, 1, 3), max: new Date(2019, 1, 20)}}
    `('$Name should set aria-disabled on cells outside the valid date range', ({Calendar, props}) => {
      let {getAllByRole} = render(<Calendar {...props} />);

      let gridCells = getAllByRole('gridcell').filter(cell => cell.getAttribute('aria-disabled') !== 'true');
      expect(gridCells.length).toBe(18);
    });

    it.each`
      Name                   | Calendar         | props
      ${'v3 Calendar'}       | ${Calendar}      | ${{defaultValue: new Date(2019, 5, 5)}}
      ${'v3 RangeCalendar'}  | ${RangeCalendar} | ${{defaultValue: {start: new Date(2019, 5, 5), end: new Date(2019, 5, 10)}}}
      ${'v2 Calendar'}       | ${V2Calendar}    | ${{defaultValue: new Date(2019, 5, 5)}}
      ${'v2 range Calendar'} | ${V2Calendar}    | ${{selectionType: 'range', defaultValue: [new Date(2019, 5, 5), new Date(2019, 5, 10)]}}
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
  });

  describe('labeling', () => {
    it.each`
      Name                   | Calendar         | props
      ${'v3 Calendar'}       | ${Calendar}      | ${{}}
      ${'v3 RangeCalendar'}  | ${RangeCalendar} | ${{}}
      ${'v2 Calendar'}       | ${V2Calendar}    | ${{}}
      ${'v2 range Calendar'} | ${V2Calendar}    | ${{selectionType: 'range'}}
    `('$Name should be labeled by month heading by default', ({Calendar, props}) => {
      let {getByRole} = render(<Calendar {...props} />);
      let calendar = getByRole('group');
      let heading = getByRole('heading');
      let body = getByRole('grid');
      expect(calendar).toHaveAttribute('id');
      expect(calendar).toHaveAttribute('aria-labelledby', heading.id);
      expect(body).toHaveAttribute('aria-labelledby', heading.id);
    });

    it.each`
      Name                   | Calendar         | props
      ${'v3 Calendar'}       | ${Calendar}      | ${{}}
      ${'v3 RangeCalendar'}  | ${RangeCalendar} | ${{}}
      ${'v2 Calendar'}       | ${V2Calendar}    | ${{}}
      ${'v2 range Calendar'} | ${V2Calendar}    | ${{selectionType: 'range'}}
    `('$Name should support labeling with aria-label', ({Calendar, props}) => {
      let {getByRole} = render(<Calendar {...props} aria-label="foo" />);
      let calendar = getByRole('group');
      let heading = getByRole('heading');
      let body = getByRole('grid');
      expect(calendar).toHaveAttribute('id');
      expect(calendar).toHaveAttribute('aria-label', 'foo');
      expect(calendar).toHaveAttribute('aria-labelledby', `${calendar.id} ${heading.id}`);
      expect(body).toHaveAttribute('aria-labelledby', `${calendar.id} ${heading.id}`);
    });

    it.each`
      Name                   | Calendar         | props
      ${'v3 Calendar'}       | ${Calendar}      | ${{}}
      ${'v3 RangeCalendar'}  | ${RangeCalendar} | ${{}}
      ${'v2 Calendar'}       | ${V2Calendar}    | ${{}}
      ${'v2 range Calendar'} | ${V2Calendar}    | ${{selectionType: 'range'}}
    `('$Name should support labeling with aria-labelledby', ({Calendar, props}) => {
      let {getByRole} = render(<Calendar {...props} aria-labelledby="foo" />);
      let calendar = getByRole('group');
      let heading = getByRole('heading');
      let body = getByRole('grid');
      expect(calendar).toHaveAttribute('id');
      expect(calendar).toHaveAttribute('aria-labelledby', `foo ${heading.id}`);
      expect(body).toHaveAttribute('aria-labelledby', `foo ${heading.id}`);
    });

    it.each`
      Name                   | Calendar         | props
      ${'v3 Calendar'}       | ${Calendar}      | ${{}}
      ${'v3 RangeCalendar'}  | ${RangeCalendar} | ${{}}
      ${'v2 Calendar'}       | ${V2Calendar}    | ${{}}
      ${'v2 range Calendar'} | ${V2Calendar}    | ${{selectionType: 'range'}}
    `('$Name should support labeling with aria-labelledby and aria-label', ({Calendar, props}) => {
      let {getByRole} = render(<Calendar {...props} aria-label="cal" aria-labelledby="foo" />);
      let calendar = getByRole('group');
      let heading = getByRole('heading');
      let body = getByRole('grid');
      expect(calendar).toHaveAttribute('id');
      expect(calendar).toHaveAttribute('aria-label', 'cal');
      expect(calendar).toHaveAttribute('aria-labelledby', `foo ${calendar.id} ${heading.id}`);
      expect(body).toHaveAttribute('aria-labelledby', `foo ${calendar.id} ${heading.id}`);
    });

    it.each`
      Name                   | Calendar         | props
      ${'v3 Calendar'}       | ${Calendar}      | ${{}}
      ${'v3 RangeCalendar'}  | ${RangeCalendar} | ${{}}
      ${'v2 Calendar'}       | ${V2Calendar}    | ${{}}
      ${'v2 range Calendar'} | ${V2Calendar}    | ${{selectionType: 'range'}}
    `('$Name should support labeling with a custom id', ({Calendar, props}) => {
      let {getByRole} = render(<Calendar {...props} id="hi" aria-label="cal" aria-labelledby="foo" />);
      let calendar = getByRole('group');
      let heading = getByRole('heading');
      let body = getByRole('grid');
      expect(calendar).toHaveAttribute('id', 'hi');
      expect(calendar).toHaveAttribute('aria-label', 'cal');
      expect(calendar).toHaveAttribute('aria-labelledby', `foo hi ${heading.id}`);
      expect(body).toHaveAttribute('aria-labelledby', `foo hi ${heading.id}`);
    });
  });

  describe('keyboard navigation', () => {
    function testKeyboard(Calendar, defaultValue, key, value, month, props, opts) {
      // For range calendars, convert the value to a range of one day
      if (Calendar === RangeCalendar) {
        defaultValue = {start: defaultValue, end: defaultValue};
      } else if (Calendar === V2Calendar && props && props.selectionType === 'range') {
        defaultValue = [defaultValue, defaultValue];
      }

      let {getByRole, getByLabelText} = render(<Calendar defaultValue={defaultValue} autoFocus {...props} />);
      let grid = getByRole('grid');

      let cell = getByLabelText('selected', {exact: false});
      expect(grid).toHaveAttribute('aria-activedescendant', cell.id);

      fireEvent.keyDown(document.activeElement, {key, keyCode: keyCodes[key], ...opts});
      cell = getByLabelText(value, {exact: false});
      expect(grid).toHaveAttribute('aria-activedescendant', cell.id);

      let heading = getByRole('heading');
      expect(heading).toHaveTextContent(month);

      cleanup();
    }

    it.each`
      Name                    | Calendar          | props
      ${'v3 Calendar'}        | ${Calendar}       | ${{}}
      ${'v3 RangeCalendar'}   | ${RangeCalendar}  | ${{}}
      ${'v2 Calendar'}        | ${V2Calendar}     | ${{}}
      ${'v2 range Calendar'}  | ${V2Calendar}     | ${{selectionType: 'range'}}
    `('$Name should move the focused date by one day with the left/right arrows', ({Calendar, props}) => {
      testKeyboard(Calendar, new Date(2019, 5, 5), 'ArrowLeft', 'Tuesday, June 4, 2019', 'June 2019', props);
      testKeyboard(Calendar, new Date(2019, 5, 5), 'ArrowRight', 'Thursday, June 6, 2019', 'June 2019', props);

      testKeyboard(Calendar, new Date(2019, 5, 1), 'ArrowLeft', 'Friday, May 31, 2019', 'May 2019', props);
      testKeyboard(Calendar, new Date(2019, 5, 30), 'ArrowRight', 'Monday, July 1, 2019', 'July 2019', props);
    });

    it.each`
      Name                    | Calendar          | props
      ${'v3 Calendar'}        | ${Calendar}       | ${{}}
      ${'v3 RangeCalendar'}   | ${RangeCalendar}  | ${{}}
      ${'v2 Calendar'}        | ${V2Calendar}     | ${{}}
      ${'v2 range Calendar'}  | ${V2Calendar}     | ${{selectionType: 'range'}}
    `('$Name should move the focused date by one week with the up/down arrows', ({Calendar, props}) => {
      testKeyboard(Calendar, new Date(2019, 5, 12), 'ArrowUp', 'Wednesday, June 5, 2019', 'June 2019', props);
      testKeyboard(Calendar, new Date(2019, 5, 12), 'ArrowDown', 'Wednesday, June 19, 2019', 'June 2019', props);

      testKeyboard(Calendar, new Date(2019, 5, 5), 'ArrowUp', 'Wednesday, May 29, 2019', 'May 2019', props);
      testKeyboard(Calendar, new Date(2019, 5, 26), 'ArrowDown', 'Wednesday, July 3, 2019', 'July 2019', props);
    });

    it.each`
      Name                    | Calendar          | props
      ${'v3 Calendar'}        | ${Calendar}       | ${{}}
      ${'v3 RangeCalendar'}   | ${RangeCalendar}  | ${{}}
      ${'v2 Calendar'}        | ${V2Calendar}     | ${{}}
      ${'v2 range Calendar'}  | ${V2Calendar}     | ${{selectionType: 'range'}}
    `('$Name should move the focused date to the start or end of the month with the home/end keys', ({Calendar, props}) => {
      testKeyboard(Calendar, new Date(2019, 5, 12), 'Home', 'Saturday, June 1, 2019', 'June 2019', props);
      testKeyboard(Calendar, new Date(2019, 5, 12), 'End', 'Sunday, June 30, 2019', 'June 2019', props);
    });

    it.each`
      Name                    | Calendar          | props
      ${'v3 Calendar'}        | ${Calendar}       | ${{}}
      ${'v3 RangeCalendar'}   | ${RangeCalendar}  | ${{}}
      ${'v2 Calendar'}        | ${V2Calendar}     | ${{}}
      ${'v2 range Calendar'}  | ${V2Calendar}     | ${{selectionType: 'range'}}
    `('$Name should move the focused date by one month with the page up/page down keys', ({Calendar, props}) => {
      testKeyboard(Calendar, new Date(2019, 5, 5), 'PageUp', 'Sunday, May 5, 2019', 'May 2019', props);
      testKeyboard(Calendar, new Date(2019, 5, 5), 'PageDown', 'Friday, July 5, 2019', 'July 2019', props);
    });

    // v2 tests disabled until next release
    // it.each`
    //   Name                    | Calendar          | props
    //   ${'v3 Calendar'}        | ${Calendar}       | ${{}}
    //   ${'v3 RangeCalendar'}   | ${RangeCalendar}  | ${{}}
    //   ${'v2 Calendar'}        | ${V2Calendar}     | ${{}}
    //   ${'v2 range Calendar'}  | ${V2Calendar}     | ${{selectionType: 'range'}}
    it.each`
      Name                    | Calendar          | props
      ${'v3 Calendar'}        | ${Calendar}       | ${{}}
      ${'v3 RangeCalendar'}   | ${RangeCalendar}  | ${{}}
    `('$Name should move the focused date by one year with the shift + page up/shift + page down keys', ({Calendar, props}) => {
      testKeyboard(Calendar, new Date(2019, 5, 5), 'PageUp', 'Tuesday, June 5, 2018', 'June 2018', props, {shiftKey: true});
      testKeyboard(Calendar, new Date(2019, 5, 5), 'PageDown', 'Friday, June 5, 2020', 'June 2020', props, {shiftKey: true});
    });

    it.each`
      Name                    | Calendar          | props
      ${'v3 Calendar'}        | ${Calendar}       | ${{minValue: new Date(2019, 5, 2), maxValue: new Date(2019, 5, 8)}}
      ${'v3 RangeCalendar'}   | ${RangeCalendar}  | ${{minValue: new Date(2019, 5, 2), maxValue: new Date(2019, 5, 8)}}
      ${'v2 Calendar'}        | ${V2Calendar}     | ${{min: new Date(2019, 5, 5), max: new Date(2019, 5, 8)}}
      ${'v2 range Calendar'}  | ${V2Calendar}     | ${{selectionType: 'range', min: new Date(2019, 5, 5), max: new Date(2019, 5, 8)}}
    `('$Name should not move the focused date outside the valid range', ({Calendar, props}) => {
      testKeyboard(Calendar, new Date(2019, 5, 2), 'ArrowLeft', 'Sunday, June 2, 2019 selected', 'June 2019', props);
      testKeyboard(Calendar, new Date(2019, 5, 8), 'ArrowRight', 'Saturday, June 8, 2019 selected', 'June 2019', props);
      testKeyboard(Calendar, new Date(2019, 5, 5), 'ArrowUp', 'Wednesday, June 5, 2019 selected', 'June 2019', props);
      testKeyboard(Calendar, new Date(2019, 5, 5), 'ArrowDown', 'Wednesday, June 5, 2019 selected', 'June 2019', props);
      testKeyboard(Calendar, new Date(2019, 5, 5), 'Home', 'Wednesday, June 5, 2019 selected', 'June 2019', props);
      testKeyboard(Calendar, new Date(2019, 5, 5), 'End', 'Wednesday, June 5, 2019 selected', 'June 2019', props);
      testKeyboard(Calendar, new Date(2019, 5, 5), 'PageUp', 'Wednesday, June 5, 2019 selected', 'June 2019', props);
      testKeyboard(Calendar, new Date(2019, 5, 5), 'PageDown', 'Wednesday, June 5, 2019 selected', 'June 2019', props);
      testKeyboard(Calendar, new Date(2019, 5, 5), 'PageUp', 'Wednesday, June 5, 2019 selected', 'June 2019', props, {shiftKey: true});
      testKeyboard(Calendar, new Date(2019, 5, 5), 'PageDown', 'Wednesday, June 5, 2019 selected', 'June 2019', props, {shiftKey: true});
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
      expect(headers[0]).toHaveTextContent('Su');

      rerender(
        <Provider theme={theme} locale="de-DE">
          <Calendar />
        </Provider>
      );

      headers = getAllByRole('columnheader');
      expect(headers[0]).toHaveTextContent('Mo');
    });

    it.each`
      Name                   | Calendar         | props
      ${'v3 Calendar'}       | ${Calendar}      | ${{defaultValue: new Date(2019, 5, 5)}}
      ${'v3 RangeCalendar'}  | ${RangeCalendar} | ${{defaultValue: {start: new Date(2019, 5, 5), end: new Date(2019, 5, 10)}}}
    `('$Name should mirror arrow key movement in an RTL locale', ({Calendar, props}) => {
      // LTR
      let {getByRole, getAllByRole, rerender} = render(
        <Provider theme={theme} locale="en-US">
          <Calendar {...props} autoFocus />
        </Provider>
      );

      let grid = getByRole('grid');
      let selected = getAllByRole('gridcell').find(cell => cell.hasAttribute('aria-selected'));
      expect(grid).toHaveAttribute('aria-activedescendant', selected.id);

      fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft'});
      expect(grid).toHaveAttribute('aria-activedescendant', selected.previousSibling.id);

      fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
      expect(grid).toHaveAttribute('aria-activedescendant', selected.id);

      // RTL
      rerender(
        <Provider theme={theme} locale="ar-EG">
          <Calendar {...props} autoFocus />
        </Provider>
      );

      selected = getAllByRole('gridcell').find(cell => cell.hasAttribute('aria-selected'));
      expect(grid).toHaveAttribute('aria-activedescendant', selected.id);

      fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft'});
      expect(grid).toHaveAttribute('aria-activedescendant', selected.nextSibling.id);

      fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
      expect(grid).toHaveAttribute('aria-activedescendant', selected.id);
    });
  });
});
