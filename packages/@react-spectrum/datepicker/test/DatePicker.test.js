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

import {act, fireEvent, render as render_, within} from '@testing-library/react';
import {CalendarDate, CalendarDateTime, getLocalTimeZone, toCalendarDateTime, today} from '@internationalized/date';
import {DatePicker} from '../';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {theme} from '@react-spectrum/theme-default';
import {triggerPress} from '@react-spectrum/test-utils';
import userEvent from '@testing-library/user-event';

function beforeInput(target, key) {
  // JSDOM doesn't support the beforeinput event
  let e = new InputEvent('beforeinput', {cancelable: true, data: key, inputType: 'insertText'});
  fireEvent(target, e);
}

function getTextValue(el) {
  if (el.hasAttribute('aria-hidden')) {
    return '';
  }

  return [...el.childNodes].map(el => el.nodeType === 3 ? el.textContent : getTextValue(el)).join('');
}

function expectPlaceholder(el, placeholder) {
  expect(getTextValue(el)).toBe(placeholder);
}

function render(el) {
  if (el.type === Provider) {
    return render_(el);
  }
  let res = render_(
    <Provider theme={theme}>
      {el}
    </Provider>
  );
  return {
    ...res,
    rerender(el) {
      return res.rerender(<Provider theme={theme}>{el}</Provider>);
    }
  };
}

describe.skip('DatePicker', function () {
  beforeAll(() => {
    jest.useFakeTimers('legacy');
  });
  afterEach(() => {
    act(() => {
      jest.runAllTimers();
    });
  });
  describe('basics', function () {
    it('should render a datepicker with a specified date', function () {
      let {getAllByRole} = render(<DatePicker label="Date" value={new CalendarDate(2019, 2, 3)} />);

      let combobox = getAllByRole('group')[0];
      expect(combobox).toBeVisible();
      expect(combobox).not.toHaveAttribute('aria-disabled');
      expect(combobox).not.toHaveAttribute('aria-invalid');

      let segments = getAllByRole('spinbutton');
      expect(segments.length).toBe(3);

      expect(segments[0].textContent).toBe('2');
      expect(segments[0].getAttribute('aria-label')).toBe('month');
      expect(segments[0].getAttribute('aria-valuenow')).toBe('2');
      expect(segments[0].getAttribute('aria-valuetext')).toBe('2 – February');
      expect(segments[0].getAttribute('aria-valuemin')).toBe('1');
      expect(segments[0].getAttribute('aria-valuemax')).toBe('12');

      expect(segments[1].textContent).toBe('3');
      expect(segments[1].getAttribute('aria-label')).toBe('day');
      expect(segments[1].getAttribute('aria-valuenow')).toBe('3');
      expect(segments[1].getAttribute('aria-valuetext')).toBe('3');
      expect(segments[1].getAttribute('aria-valuemin')).toBe('1');
      expect(segments[1].getAttribute('aria-valuemax')).toBe('28');

      expect(segments[2].textContent).toBe('2019');
      expect(segments[2].getAttribute('aria-label')).toBe('year');
      expect(segments[2].getAttribute('aria-valuenow')).toBe('2019');
      expect(segments[2].getAttribute('aria-valuetext')).toBe('2019');
      expect(segments[2].getAttribute('aria-valuemin')).toBe('1');
      expect(segments[2].getAttribute('aria-valuemax')).toBe('9999');
    });

    it('should render a datepicker with granularity="second"', function () {
      let {getAllByRole} = render(<DatePicker label="Date" value={new CalendarDateTime(2019, 2, 3)} granularity="second" />);

      let combobox = getAllByRole('group')[0];
      expect(combobox).toBeVisible();
      expect(combobox).not.toHaveAttribute('aria-disabled');
      expect(combobox).not.toHaveAttribute('aria-invalid');

      let segments = getAllByRole('spinbutton');
      expect(segments.length).toBe(7);

      expect(segments[0].textContent).toBe('2');
      expect(segments[0].getAttribute('aria-label')).toBe('month');
      expect(segments[0].getAttribute('aria-valuenow')).toBe('2');
      expect(segments[0].getAttribute('aria-valuetext')).toBe('2 – February');
      expect(segments[0].getAttribute('aria-valuemin')).toBe('1');
      expect(segments[0].getAttribute('aria-valuemax')).toBe('12');

      expect(segments[1].textContent).toBe('3');
      expect(segments[1].getAttribute('aria-label')).toBe('day');
      expect(segments[1].getAttribute('aria-valuenow')).toBe('3');
      expect(segments[1].getAttribute('aria-valuetext')).toBe('3');
      expect(segments[1].getAttribute('aria-valuemin')).toBe('1');
      expect(segments[1].getAttribute('aria-valuemax')).toBe('28');

      expect(segments[2].textContent).toBe('2019');
      expect(segments[2].getAttribute('aria-label')).toBe('year');
      expect(segments[2].getAttribute('aria-valuenow')).toBe('2019');
      expect(segments[2].getAttribute('aria-valuetext')).toBe('2019');
      expect(segments[2].getAttribute('aria-valuemin')).toBe('1');
      expect(segments[2].getAttribute('aria-valuemax')).toBe('9999');

      expect(segments[3].textContent).toBe('12');
      expect(segments[3].getAttribute('aria-label')).toBe('hour');
      expect(segments[3].getAttribute('aria-valuenow')).toBe('0');
      expect(segments[3].getAttribute('aria-valuetext')).toBe('12 AM');
      expect(segments[3].getAttribute('aria-valuemin')).toBe('0');
      expect(segments[3].getAttribute('aria-valuemax')).toBe('11');

      expect(segments[4].textContent).toBe('00');
      expect(segments[4].getAttribute('aria-label')).toBe('minute');
      expect(segments[4].getAttribute('aria-valuenow')).toBe('0');
      expect(segments[4].getAttribute('aria-valuetext')).toBe('00');
      expect(segments[4].getAttribute('aria-valuemin')).toBe('0');
      expect(segments[4].getAttribute('aria-valuemax')).toBe('59');

      expect(segments[5].textContent).toBe('00');
      expect(segments[5].getAttribute('aria-label')).toBe('second');
      expect(segments[5].getAttribute('aria-valuenow')).toBe('0');
      expect(segments[5].getAttribute('aria-valuetext')).toBe('00');
      expect(segments[5].getAttribute('aria-valuemin')).toBe('0');
      expect(segments[5].getAttribute('aria-valuemax')).toBe('59');

      expect(segments[6].textContent).toBe('AM');
      expect(segments[6].getAttribute('aria-label')).toBe('AM/PM');
      expect(segments[6].getAttribute('aria-valuetext')).toBe('AM');
    });

    it('should support focusing via a ref', function () {
      let ref = React.createRef();
      let {getAllByRole} = render(<DatePicker label="Date" ref={ref} />);
      expect(ref.current).toHaveProperty('focus');

      act(() => ref.current.focus());
      expect(document.activeElement).toBe(getAllByRole('spinbutton')[0]);
    });

    it('should support autoFocus', function () {
      let {getAllByRole} = render(<DatePicker label="Date" autoFocus />);
      expect(document.activeElement).toBe(getAllByRole('spinbutton')[0]);
    });

    it('should pass through data attributes', function () {
      let {getByTestId} = render(<DatePicker label="Date" data-testid="foo" />);
      expect(getByTestId('foo')).toHaveAttribute('role', 'group');
    });

    it('should return the outer most DOM element from the ref', function () {
      let ref = React.createRef();
      render(<DatePicker label="Date" ref={ref} />);
      expect(ref.current).toHaveProperty('UNSAFE_getDOMNode');

      let wrapper = ref.current.UNSAFE_getDOMNode();
      expect(wrapper).toBeInTheDocument();
      expect(within(wrapper).getByText('Date')).toBeInTheDocument();
      expect(within(wrapper).getAllByRole('spinbutton')[0]).toBeInTheDocument();
    });
  });

  describe('calendar popover', function () {
    it('should emit onChange when selecting a date in the calendar in controlled mode', function () {
      let onChange = jest.fn();
      let {getByRole, getAllByRole, queryByLabelText} = render(
        <Provider theme={theme}>
          <DatePicker label="Date" value={new CalendarDate(2019, 2, 3)} onChange={onChange} />
        </Provider>
      );

      let combobox = getAllByRole('group')[0];
      expect(combobox).toHaveTextContent('2/3/2019');

      let button = getByRole('button');
      triggerPress(button);

      let dialog = getByRole('dialog');
      expect(dialog).toBeVisible();

      expect(queryByLabelText('Time')).toBeNull();

      let cells = getAllByRole('gridcell');
      let selected = cells.find(cell => cell.getAttribute('aria-selected') === 'true');
      expect(selected.children[0]).toHaveAttribute('aria-label', 'Sunday, February 3, 2019 selected');

      triggerPress(selected.nextSibling.children[0]);

      expect(dialog).not.toBeInTheDocument();
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(new CalendarDate(2019, 2, 4));
      expect(combobox).toHaveTextContent('2/3/2019'); // controlled
    });

    it('should emit onChange when selecting a date in the calendar in uncontrolled mode', function () {
      let onChange = jest.fn();
      let {getByRole, getAllByRole} = render(
        <Provider theme={theme}>
          <DatePicker label="Date" defaultValue={new CalendarDate(2019, 2, 3)} onChange={onChange} />
        </Provider>
      );

      let combobox = getAllByRole('group')[0];
      expect(combobox).toHaveTextContent('2/3/2019');

      let button = getByRole('button');
      triggerPress(button);

      let dialog = getByRole('dialog');
      expect(dialog).toBeVisible();

      let cells = getAllByRole('gridcell');
      let selected = cells.find(cell => cell.getAttribute('aria-selected') === 'true');
      expect(selected.children[0]).toHaveAttribute('aria-label', 'Sunday, February 3, 2019 selected');

      triggerPress(selected.nextSibling.children[0]);

      expect(dialog).not.toBeInTheDocument();
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(new CalendarDate(2019, 2, 4));
      expect(combobox).toHaveTextContent('2/4/2019'); // uncontrolled
    });

    it('should display a time field when a CalendarDateTime value is used', function () {
      let onChange = jest.fn();
      let {getByRole, getAllByRole, getAllByLabelText} = render(
        <Provider theme={theme}>
          <DatePicker label="Date" defaultValue={new CalendarDateTime(2019, 2, 3, 8, 45)} onChange={onChange} />
        </Provider>
      );

      let combobox = getAllByRole('group')[0];
      expect(combobox).toHaveTextContent('2/3/2019, 8:45 AM');

      let button = getByRole('button');
      triggerPress(button);

      let dialog = getByRole('dialog');
      expect(dialog).toBeVisible();

      let cells = getAllByRole('gridcell');
      let selected = cells.find(cell => cell.getAttribute('aria-selected') === 'true');
      expect(selected.children[0]).toHaveAttribute('aria-label', 'Sunday, February 3, 2019 selected');

      let timeField = getAllByLabelText('Time')[0];
      expect(timeField).toHaveTextContent('8:45 AM');

      // selecting a date should not close the popover
      triggerPress(selected.nextSibling.children[0]);

      expect(dialog).toBeVisible();
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(new CalendarDateTime(2019, 2, 4, 8, 45));
      expect(combobox).toHaveTextContent('2/4/2019, 8:45 AM');

      let hour = within(timeField).getByLabelText('hour');
      expect(hour).toHaveAttribute('role', 'spinbutton');
      expect(hour).toHaveAttribute('aria-valuetext', '8 AM');

      act(() => hour.focus());
      fireEvent.keyDown(hour, {key: 'ArrowUp'});
      fireEvent.keyUp(hour, {key: 'ArrowUp'});

      expect(hour).toHaveAttribute('aria-valuetext', '9 AM');

      expect(dialog).toBeVisible();
      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange).toHaveBeenCalledWith(new CalendarDateTime(2019, 2, 4, 9, 45));
      expect(combobox).toHaveTextContent('2/4/2019, 9:45 AM');
    });

    it('should not fire onChange until both date and time are selected', function () {
      let onChange = jest.fn();
      let {getByRole, getAllByRole, getAllByLabelText} = render(
        <Provider theme={theme}>
          <DatePicker label="Date" granularity="minute" onChange={onChange} />
        </Provider>
      );

      let combobox = getAllByRole('group')[0];
      let formatter = new Intl.DateTimeFormat('en-US', {year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric'});
      let placeholder = formatter.format(toCalendarDateTime(today(getLocalTimeZone())).toDate(getLocalTimeZone()));
      expectPlaceholder(combobox, placeholder);

      let button = getByRole('button');
      triggerPress(button);

      let dialog = getByRole('dialog');
      expect(dialog).toBeVisible();

      let cells = getAllByRole('gridcell');
      let selected = cells.find(cell => cell.getAttribute('aria-selected') === 'true');
      expect(selected).toBeUndefined();

      let timeField = getAllByLabelText('Time')[0];
      expectPlaceholder(timeField, '12:00 AM');

      // selecting a date should not close the popover
      let todayCell = cells.find(cell => cell.firstChild.getAttribute('aria-label')?.startsWith('Today'));
      triggerPress(todayCell.firstChild);

      expect(todayCell).toHaveAttribute('aria-selected', 'true');

      expect(dialog).toBeVisible();
      expect(onChange).not.toHaveBeenCalled();
      expectPlaceholder(combobox, placeholder);

      let hour = within(timeField).getByLabelText('hour');
      expect(hour).toHaveAttribute('role', 'spinbutton');
      expect(hour).toHaveAttribute('aria-valuetext', '12 AM');

      act(() => hour.focus());
      fireEvent.keyDown(hour, {key: 'ArrowUp'});
      fireEvent.keyUp(hour, {key: 'ArrowUp'});

      expect(hour).toHaveAttribute('aria-valuetext', '1 AM');

      expect(onChange).not.toHaveBeenCalled();
      expectPlaceholder(combobox, placeholder);

      fireEvent.keyDown(hour, {key: 'ArrowRight'});
      fireEvent.keyUp(hour, {key: 'ArrowRight'});

      expect(document.activeElement).toHaveAttribute('aria-label', 'minute');
      expect(document.activeElement).toHaveAttribute('aria-valuetext', '00');
      fireEvent.keyDown(document.activeElement, {key: 'ArrowUp'});
      fireEvent.keyUp(document.activeElement, {key: 'ArrowUp'});

      expect(document.activeElement).toHaveAttribute('aria-valuetext', '01');

      expect(onChange).not.toHaveBeenCalled();
      expectPlaceholder(combobox, placeholder);

      fireEvent.keyDown(hour, {key: 'ArrowRight'});
      fireEvent.keyUp(hour, {key: 'ArrowRight'});

      expect(document.activeElement).toHaveAttribute('aria-label', 'AM/PM');
      expect(document.activeElement).toHaveAttribute('aria-valuetext', 'AM');

      fireEvent.keyDown(document.activeElement, {key: 'Enter'});
      fireEvent.keyUp(document.activeElement, {key: 'Enter'});

      expect(dialog).toBeVisible();
      expect(onChange).toHaveBeenCalledTimes(1);
      let value = toCalendarDateTime(today(getLocalTimeZone())).set({hour: 1, minute: 1});
      expect(onChange).toHaveBeenCalledWith(value);
      expectPlaceholder(combobox, formatter.format(value.toDate(getLocalTimeZone())));
    });

    it('should confirm time placeholder on blur if date is selected', function () {
      let onChange = jest.fn();
      let {getByRole, getAllByRole} = render(
        <Provider theme={theme}>
          <DatePicker label="Date" granularity="minute" onChange={onChange} />
        </Provider>
      );

      let combobox = getAllByRole('group')[0];
      let formatter = new Intl.DateTimeFormat('en-US', {year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric'});
      let placeholder = formatter.format(toCalendarDateTime(today(getLocalTimeZone())).toDate(getLocalTimeZone()));
      expectPlaceholder(combobox, placeholder);

      let button = getByRole('button');
      triggerPress(button);
      act(() => jest.runAllTimers());

      let dialog = getByRole('dialog');
      expect(dialog).toBeVisible();

      let cells = getAllByRole('gridcell');
      let todayCell = cells.find(cell => cell.firstChild.getAttribute('aria-label')?.startsWith('Today'));
      triggerPress(todayCell.firstChild);
      expect(todayCell).toHaveAttribute('aria-selected', 'true');
      expect(onChange).not.toHaveBeenCalled();

      userEvent.click(document.body);
      act(() => jest.runAllTimers());

      expect(dialog).not.toBeInTheDocument();

      expect(onChange).toHaveBeenCalledTimes(1);
      let value = toCalendarDateTime(today(getLocalTimeZone()));
      expect(onChange).toHaveBeenCalledWith(value);
      expectPlaceholder(combobox, formatter.format(value.toDate(getLocalTimeZone())));
    });

    it('should not confirm on blur if date is not selected', function () {
      let onChange = jest.fn();
      let {getByRole, getAllByRole, getAllByLabelText} = render(
        <Provider theme={theme}>
          <DatePicker label="Date" granularity="minute" onChange={onChange} />
        </Provider>
      );

      let combobox = getAllByRole('group')[0];
      let formatter = new Intl.DateTimeFormat('en-US', {year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric'});
      let placeholder = formatter.format(toCalendarDateTime(today(getLocalTimeZone())).toDate(getLocalTimeZone()));
      expectPlaceholder(combobox, placeholder);

      let button = getByRole('button');
      triggerPress(button);
      act(() => jest.runAllTimers());

      let dialog = getByRole('dialog');
      expect(dialog).toBeVisible();

      let timeField = getAllByLabelText('Time')[0];
      expectPlaceholder(timeField, '12:00 AM');

      let hour = within(timeField).getByLabelText('hour');
      expect(hour).toHaveAttribute('role', 'spinbutton');
      expect(hour).toHaveAttribute('aria-valuetext', '12 AM');

      act(() => hour.focus());
      fireEvent.keyDown(hour, {key: 'ArrowUp'});
      fireEvent.keyUp(hour, {key: 'ArrowUp'});

      expect(hour).toHaveAttribute('aria-valuetext', '1 AM');

      userEvent.click(document.body);
      act(() => jest.runAllTimers());

      expect(dialog).not.toBeInTheDocument();
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('labeling', function () {
    it('should support labeling', function () {
      let {getByRole, getAllByRole, getByText} = render(<DatePicker label="Date" />);

      let label = getByText('Date');

      let combobox = getAllByRole('group')[0];
      expect(combobox).toHaveAttribute('aria-labelledby', label.id);

      let button = getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Calendar');
      expect(button).toHaveAttribute('id');
      let buttonId = button.getAttribute('id');
      expect(button).toHaveAttribute('aria-labelledby', `${label.id} ${buttonId}`);

      let segments = getAllByRole('spinbutton');
      for (let segment of segments) {
        expect(segment).toHaveAttribute('id');
        let segmentId = segment.getAttribute('id');
        expect(segment).toHaveAttribute('aria-labelledby', `${label.id} ${segmentId}`);
      }
    });

    it('should support labeling with aria-label', function () {
      let {getByRole, getAllByRole, getByTestId} = render(<DatePicker aria-label="Birth date" />);

      let group = getByRole('group');
      expect(group).toHaveAttribute('id');
      expect(group).toHaveAttribute('aria-label', 'Birth date');
      let comboboxId = group.getAttribute('id');

      let field = getByTestId('date-field');
      expect(field).toHaveAttribute('role', 'presentation');
      expect(field).not.toHaveAttribute('aria-label');

      let button = getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Calendar');
      expect(button).toHaveAttribute('id');
      let buttonId = button.getAttribute('id');
      expect(button).toHaveAttribute('aria-labelledby', `${comboboxId} ${buttonId}`);

      let segments = getAllByRole('spinbutton');
      for (let segment of segments) {
        expect(segment).toHaveAttribute('id');
        expect(segment.getAttribute('aria-label').startsWith('Birth date ')).toBe(true);
        expect(segment).not.toHaveAttribute('aria-labelledby');
      }
    });

    it('should support labeling with aria-labelledby', function () {
      let {getByRole, getAllByRole, getByTestId} = render(<DatePicker aria-labelledby="foo" />);

      let combobox = getByRole('group');
      expect(combobox).not.toHaveAttribute('aria-label');
      expect(combobox).toHaveAttribute('aria-labelledby', 'foo');

      let field = getByTestId('date-field');
      expect(field).toHaveAttribute('role', 'presentation');
      expect(field).not.toHaveAttribute('aria-labelledby');

      let button = getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Calendar');
      expect(button).toHaveAttribute('id');
      let buttonId = button.getAttribute('id');
      expect(button).toHaveAttribute('aria-labelledby', `foo ${buttonId}`);

      let segments = getAllByRole('spinbutton');
      for (let segment of segments) {
        expect(segment).toHaveAttribute('id');
        let segmentId = segment.getAttribute('id');
        expect(segment).toHaveAttribute('aria-labelledby', `foo ${segmentId}`);
      }
    });

    it('should support help text description', function () {
      let {getAllByRole, getByRole, getByTestId} = render(<DatePicker label="Date" description="Help text" />);

      let group = getByRole('group');
      let field = getByTestId('date-field');
      expect(group).toHaveAttribute('aria-describedby');
      expect(field).not.toHaveAttribute('aria-describedby');

      let description = document.getElementById(group.getAttribute('aria-describedby'));
      expect(description).toHaveTextContent('Help text');

      let segments = getAllByRole('spinbutton');
      expect(segments[0]).toHaveAttribute('aria-describedby', description.id);

      for (let segment of segments.slice(1)) {
        expect(segment).not.toHaveAttribute('aria-describedby');
      }
    });

    it('should support error message', function () {
      let {getAllByRole, getByRole, getByTestId} = render(<DatePicker label="Date" errorMessage="Error message" validationState="invalid" />);

      let group = getByRole('group');
      let field = getByTestId('date-field');
      expect(group).toHaveAttribute('aria-describedby');
      expect(field).not.toHaveAttribute('aria-describedby');

      let description = document.getElementById(group.getAttribute('aria-describedby'));
      expect(description).toHaveTextContent('Error message');

      let segments = getAllByRole('spinbutton');
      for (let segment of segments) {
        expect(segment).toHaveAttribute('aria-describedby', group.getAttribute('aria-describedby'));
      }
    });

    it('should not display error message if not invalid', function () {
      let {getAllByRole, getByRole, getByTestId} = render(<DatePicker label="Date" errorMessage="Error message" />);

      let group = getByRole('group');
      let field = getByTestId('date-field');
      expect(group).not.toHaveAttribute('aria-describedby');
      expect(field).not.toHaveAttribute('aria-describedby');

      let segments = getAllByRole('spinbutton');
      for (let segment of segments) {
        expect(segment).not.toHaveAttribute('aria-describedby');
      }
    });

    it('should support help text with a value', function () {
      let {getAllByRole, getByRole, getByTestId} = render(<DatePicker label="Date" description="Help text" value={new CalendarDate(2020, 2, 3)} />);

      let group = getByRole('group');
      let field = getByTestId('date-field');
      expect(group).toHaveAttribute('aria-describedby');
      expect(field).not.toHaveAttribute('aria-describedby');

      let description = group.getAttribute('aria-describedby').split(' ').map(d => document.getElementById(d).textContent).join(' ');
      expect(description).toBe('Selected Date: February 3, 2020 Help text');

      let segments = getAllByRole('spinbutton');
      expect(segments[0]).toHaveAttribute('aria-describedby', group.getAttribute('aria-describedby'));

      for (let segment of segments.slice(1)) {
        expect(segment).not.toHaveAttribute('aria-describedby');
      }
    });

    it('should support error message with a value', function () {
      let {getAllByRole, getByRole, getByTestId} = render(<DatePicker label="Date" errorMessage="Error message" validationState="invalid" value={new CalendarDate(2020, 2, 3)} />);

      let group = getByRole('group');
      let field = getByTestId('date-field');
      expect(group).toHaveAttribute('aria-describedby');
      expect(field).not.toHaveAttribute('aria-describedby');

      let description = group.getAttribute('aria-describedby').split(' ').map(d => document.getElementById(d).textContent).join(' ');
      expect(description).toBe('Selected Date: February 3, 2020 Error message');

      let segments = getAllByRole('spinbutton');
      for (let segment of segments) {
        expect(segment).toHaveAttribute('aria-describedby', group.getAttribute('aria-describedby'));
      }
    });

    it('should support format help text', function () {
      let {getAllByRole, getByText, getByRole, getByTestId} = render(<DatePicker label="Date" showFormatHelpText />);

      // Not needed in aria-described by because each segment has a label already, so this would be duplicative.
      let group = getByRole('group');
      let field = getByTestId('date-field');
      expect(group).not.toHaveAttribute('aria-describedby');
      expect(field).not.toHaveAttribute('aria-describedby');

      expect(getByText('month / day / year')).toBeVisible();

      let segments = getAllByRole('spinbutton');
      for (let segment of segments) {
        expect(segment).not.toHaveAttribute('aria-describedby');
      }
    });

    it('should include era for BC dates', function () {
      let {getAllByRole} = render(<DatePicker label="Date" value={new CalendarDate('BC', 5, 2, 3)} />);
      let group = getAllByRole('group')[0];
      expect(group).toHaveAttribute('aria-describedby');

      let description = group.getAttribute('aria-describedby').split(' ').map(d => document.getElementById(d).textContent).join(' ');
      expect(description).toBe('Selected Date: February 3, 5 BC');

      let segments = getAllByRole('spinbutton');
      expect(segments[3]).toHaveTextContent('BC');
    });
  });

  describe('focus management', function () {
    it('should focus the first segment on mouse down in the field', function () {
      let {getAllByRole, getByTestId} = render(<DatePicker label="Date" />);
      let field = getByTestId('date-field');
      let segments = getAllByRole('spinbutton');

      triggerPress(field);
      expect(segments[0]).toHaveFocus();
    });

    it('should focus the first unfilled segment on mouse down in the field', function () {
      let {getAllByRole, getByTestId} = render(<DatePicker label="Date" />);
      let field = getByTestId('date-field');
      let segments = getAllByRole('spinbutton');

      act(() => segments[0].focus());
      fireEvent.keyDown(segments[0], {key: 'ArrowUp'});
      fireEvent.keyUp(segments[0], {key: 'ArrowUp'});
      expect(segments[0]).toHaveFocus();

      triggerPress(field);
      expect(segments[1]).toHaveFocus();
    });

    it('should focus the last segment on mouse down in the field with a value', function () {
      let {getAllByRole, getByTestId} = render(<DatePicker label="Date" value={new CalendarDate(2020, 2, 3)} />);
      let field = getByTestId('date-field');
      let segments = getAllByRole('spinbutton');

      triggerPress(field);
      expect(segments[2]).toHaveFocus();
    });
  });

  describe('editing', function () {
    describe('arrow keys', function () {
      function testArrows(label, value, incremented, decremented, options = {}) {
        let onChange = jest.fn();

        // Test controlled mode
        let {getByLabelText, unmount} = render(<DatePicker label="Date" value={value} onChange={onChange} {...options.props} />);
        let segment = getByLabelText(label);
        let textContent = segment.textContent;
        act(() => {segment.focus();});

        fireEvent.keyDown(segment, {key: options.upKey || 'ArrowUp'});
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(incremented);
        expect(segment.textContent).toBe(textContent);

        fireEvent.keyDown(segment, {key: options.downKey || 'ArrowDown'});
        expect(onChange).toHaveBeenCalledTimes(2);
        expect(onChange).toHaveBeenCalledWith(decremented);
        expect(segment.textContent).toBe(textContent);
        unmount();

        // Test uncontrolled mode (increment)
        onChange = jest.fn();
        ({getByLabelText, unmount} = render(<DatePicker label="Date" defaultValue={value} onChange={onChange} {...options.props} />));
        segment = getByLabelText(label);
        textContent = segment.textContent;
        act(() => {segment.focus();});

        fireEvent.keyDown(segment, {key: options.upKey || 'ArrowUp'});
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(incremented);
        expect(segment.textContent).not.toBe(textContent);
        unmount();

        // Test uncontrolled mode (decrement)
        onChange = jest.fn();
        ({getByLabelText, unmount} = render(<DatePicker label="Date" defaultValue={value} onChange={onChange} {...options.props} />));
        segment = getByLabelText(label);
        textContent = segment.textContent;
        act(() => {segment.focus();});

        fireEvent.keyDown(segment, {key: options.downKey || 'ArrowDown'});
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(decremented);
        expect(segment.textContent).not.toBe(textContent);
        unmount();

        // Test read only mode (increment)
        onChange = jest.fn();
        ({getByLabelText, unmount} = render(<DatePicker label="Date" defaultValue={value} isReadOnly onChange={onChange} {...options.props} />));
        segment = getByLabelText(label);
        textContent = segment.textContent;
        act(() => {segment.focus();});

        fireEvent.keyDown(segment, {key: options.upKey || 'ArrowUp'});
        expect(onChange).not.toHaveBeenCalled();
        expect(segment.textContent).toBe(textContent);
        unmount();

        // Test read only mode (decrement)
        onChange = jest.fn();
        ({getByLabelText, unmount} = render(<DatePicker label="Date" defaultValue={value} isReadOnly onChange={onChange} {...options.props} />));
        segment = getByLabelText(label);
        textContent = segment.textContent;
        act(() => {segment.focus();});

        fireEvent.keyDown(segment, {key: options.downKey || 'ArrowDown'});
        expect(onChange).not.toHaveBeenCalled();
        expect(segment.textContent).toBe(textContent);
        unmount();
      }

      describe('month', function () {
        it('should support using the arrow keys to increment and decrement the month', function () {
          testArrows('month', new CalendarDate(2019, 2, 3), new CalendarDate(2019, 3, 3), new CalendarDate(2019, 1, 3));
        });

        it('should wrap around when incrementing and decrementing the month', function () {
          testArrows('month', new CalendarDate(2019, 12, 3), new CalendarDate(2019, 1, 3), new CalendarDate(2019, 11, 3));
          testArrows('month', new CalendarDate(2019, 1, 3), new CalendarDate(2019, 2, 3), new CalendarDate(2019, 12, 3));
        });

        it('should support using the page up and down keys to increment and decrement the month by 2', function () {
          testArrows('month', new CalendarDate(2019, 1, 3), new CalendarDate(2019, 3, 3), new CalendarDate(2019, 11, 3), {upKey: 'PageUp', downKey: 'PageDown'});
          testArrows('month', new CalendarDate(2019, 2, 3), new CalendarDate(2019, 4, 3), new CalendarDate(2019, 12, 3), {upKey: 'PageUp', downKey: 'PageDown'});
        });

        it('should support using the home and end keys to jump to the min and max month', function () {
          testArrows('month', new CalendarDate(2019, 6, 3), new CalendarDate(2019, 12, 3), new CalendarDate(2019, 1, 3), {upKey: 'End', downKey: 'Home'});
        });
      });

      describe('day', function () {
        it('should support using the arrow keys to increment and decrement the day', function () {
          testArrows('day', new CalendarDate(2019, 2, 3), new CalendarDate(2019, 2, 4), new CalendarDate(2019, 2, 2));
        });

        it('should wrap around when incrementing and decrementing the day', function () {
          testArrows('day', new CalendarDate(2019, 2, 28), new CalendarDate(2019, 2, 1), new CalendarDate(2019, 2, 27));
          testArrows('day', new CalendarDate(2019, 2, 1), new CalendarDate(2019, 2, 2), new CalendarDate(2019, 2, 28));
        });

        it('should support using the page up and down keys to increment and decrement the day by 7', function () {
          testArrows('day', new CalendarDate(2019, 2, 3), new CalendarDate(2019, 2, 10), new CalendarDate(2019, 2, 24), {upKey: 'PageUp', downKey: 'PageDown'});
        });

        it('should support using the home and end keys to jump to the min and max day', function () {
          testArrows('day', new CalendarDate(2019, 2, 5), new CalendarDate(2019, 2, 28), new CalendarDate(2019, 2, 1), {upKey: 'End', downKey: 'Home'});
        });
      });

      describe('year', function () {
        it('should support using the arrow keys to increment and decrement the year', function () {
          testArrows('year', new CalendarDate(2019, 2, 3), new CalendarDate(2020, 2, 3), new CalendarDate(2018, 2, 3));
        });

        it('should support using the page up and down keys to increment and decrement the year to the nearest 5', function () {
          testArrows('year', new CalendarDate(2019, 2, 3), new CalendarDate(2020, 2, 3), new CalendarDate(2015, 2, 3), {upKey: 'PageUp', downKey: 'PageDown'});
        });
      });

      describe('hour', function () {
        it('should support using the arrow keys to increment and decrement the hour', function () {
          testArrows('hour', new CalendarDateTime(2019, 2, 3, 8), new CalendarDateTime(2019, 2, 3, 9), new CalendarDateTime(2019, 2, 3, 7));
        });

        it('should wrap around when incrementing and decrementing the hour in 12 hour time', function () {
          // AM
          testArrows('hour', new CalendarDateTime(2019, 2, 3, 11), new CalendarDateTime(2019, 2, 3, 0), new CalendarDateTime(2019, 2, 3, 10));
          testArrows('hour', new CalendarDateTime(2019, 2, 3, 0), new CalendarDateTime(2019, 2, 3, 1), new CalendarDateTime(2019, 2, 3, 11));

          // PM
          testArrows('hour', new CalendarDateTime(2019, 2, 3, 23), new CalendarDateTime(2019, 2, 3, 12), new CalendarDateTime(2019, 2, 3, 22));
          testArrows('hour', new CalendarDateTime(2019, 2, 3, 12), new CalendarDateTime(2019, 2, 3, 13), new CalendarDateTime(2019, 2, 3, 23));
        });

        it('should wrap around when incrementing and decrementing the hour in 24 hour time', function () {
          testArrows('hour', new CalendarDateTime(2019, 2, 3, 23), new CalendarDateTime(2019, 2, 3, 0), new CalendarDateTime(2019, 2, 3, 22), {props: {hourCycle: 24}});
          testArrows('hour', new CalendarDateTime(2019, 2, 3, 0), new CalendarDateTime(2019, 2, 3, 1), new CalendarDateTime(2019, 2, 3, 23), {props: {hourCycle: 24}});
        });

        it('should support using the page up and down keys to increment and decrement the hour by 2', function () {
          testArrows('hour', new CalendarDateTime(2019, 2, 3, 8), new CalendarDateTime(2019, 2, 3, 10), new CalendarDateTime(2019, 2, 3, 6), {upKey: 'PageUp', downKey: 'PageDown'});
        });

        it('should support using the home and end keys to jump to the min and max hour in 12 hour time', function () {
          // AM
          testArrows('hour', new CalendarDateTime(2019, 2, 3, 8), new CalendarDateTime(2019, 2, 3, 11), new CalendarDateTime(2019, 2, 3, 0), {upKey: 'End', downKey: 'Home'});

          // PM
          testArrows('hour', new CalendarDateTime(2019, 2, 3, 16), new CalendarDateTime(2019, 2, 3, 23), new CalendarDateTime(2019, 2, 3, 12), {upKey: 'End', downKey: 'Home'});
        });

        it('should support using the home and end keys to jump to the min and max hour in 24 hour time', function () {
          testArrows('hour', new CalendarDateTime(2019, 2, 3, 8), new CalendarDateTime(2019, 2, 3, 23), new CalendarDateTime(2019, 2, 3, 0), {upKey: 'End', downKey: 'Home', props: {hourCycle: 24}});
        });
      });

      describe('minute', function () {
        it('should support using the arrow keys to increment and decrement the minute', function () {
          testArrows('minute', new CalendarDateTime(2019, 2, 3, 8, 5), new CalendarDateTime(2019, 2, 3, 8, 6), new CalendarDateTime(2019, 2, 3, 8, 4));
        });

        it('should wrap around when incrementing and decrementing the minute', function () {
          testArrows('minute', new CalendarDateTime(2019, 2, 3, 8, 59), new CalendarDateTime(2019, 2, 3, 8, 0), new CalendarDateTime(2019, 2, 3, 8, 58));
          testArrows('minute', new CalendarDateTime(2019, 2, 3, 8, 0), new CalendarDateTime(2019, 2, 3, 8, 1), new CalendarDateTime(2019, 2, 3, 8, 59));
        });

        it('should support using the page up and down keys to increment and decrement the minute to the nearest 15', function () {
          testArrows('minute', new CalendarDateTime(2019, 2, 3, 8, 22), new CalendarDateTime(2019, 2, 3, 8, 30), new CalendarDateTime(2019, 2, 3, 8, 15), {upKey: 'PageUp', downKey: 'PageDown'});
        });

        it('should support using the home and end keys to jump to the min and max minute', function () {
          testArrows('minute', new CalendarDateTime(2019, 2, 3, 8, 22), new CalendarDateTime(2019, 2, 3, 8, 59), new CalendarDateTime(2019, 2, 3, 8, 0), {upKey: 'End', downKey: 'Home', props: {hourCycle: 24}});
        });
      });

      describe('second', function () {
        it('should support using the arrow keys to increment and decrement the second', function () {
          testArrows('second', new CalendarDateTime(2019, 2, 3, 8, 5, 10), new CalendarDateTime(2019, 2, 3, 8, 5, 11), new CalendarDateTime(2019, 2, 3, 8, 5, 9), {props: {granularity: 'second'}});
        });

        it('should wrap around when incrementing and decrementing the second', function () {
          testArrows('second', new CalendarDateTime(2019, 2, 3, 8, 5, 59), new CalendarDateTime(2019, 2, 3, 8, 5, 0), new CalendarDateTime(2019, 2, 3, 8, 5, 58), {props: {granularity: 'second'}});
          testArrows('second', new CalendarDateTime(2019, 2, 3, 8, 5, 0), new CalendarDateTime(2019, 2, 3, 8, 5, 1), new CalendarDateTime(2019, 2, 3, 8, 5, 59), {props: {granularity: 'second'}});
        });

        it('should support using the page up and down keys to increment and decrement the second to the nearest 15', function () {
          testArrows('second', new CalendarDateTime(2019, 2, 3, 8, 5, 22), new CalendarDateTime(2019, 2, 3, 8, 5, 30), new CalendarDateTime(2019, 2, 3, 8, 5, 15), {upKey: 'PageUp', downKey: 'PageDown', props: {granularity: 'second'}});
        });

        it('should support using the home and end keys to jump to the min and max second', function () {
          testArrows('second', new CalendarDateTime(2019, 2, 3, 8, 5, 22), new CalendarDateTime(2019, 2, 3, 8, 5, 59), new CalendarDateTime(2019, 2, 3, 8, 5, 0), {upKey: 'End', downKey: 'Home', props: {granularity: 'second', hourCycle: 24}});
        });
      });

      describe('day period', function () {
        it('should support using the arrow keys to increment and decrement the day period', function () {
          testArrows('AM/PM', new CalendarDateTime(2019, 2, 3, 8), new CalendarDateTime(2019, 2, 3, 20), new CalendarDateTime(2019, 2, 3, 20));
          testArrows('AM/PM', new CalendarDateTime(2019, 2, 3, 20), new CalendarDateTime(2019, 2, 3, 8), new CalendarDateTime(2019, 2, 3, 8));
        });
      });
    });

    describe('text input', function () {
      function testInput(label, value, keys, newValue, moved, props) {
        let onChange = jest.fn();
        // Test controlled mode
        let {getByLabelText, getAllByRole, unmount} = render(<DatePicker label="Date" value={value} onChange={onChange} {...props} />);
        let segment = getByLabelText(label);
        let textContent = segment.textContent;
        act(() => {segment.focus();});

        let allowsZero = (label === 'hour' && props?.hourCycle === 24) || label === 'minute' || label === 'second';
        let count = 0;
        for (let [i, key] of [...keys].entries()) {
          beforeInput(segment, key);

          if (key !== '0' || (moved && i === keys.length - 1) || allowsZero) {
            expect(onChange).toHaveBeenCalledTimes(++count);
          }
          expect(segment.textContent).toBe(textContent);

          if (i < keys.length - 1) {
            expect(segment).toHaveFocus();
          }
        }

        expect(onChange).toHaveBeenCalledWith(newValue);

        if (moved) {
          let segments = getAllByRole('spinbutton');
          let nextSegment = segments[segments.indexOf(segment) + 1];
          expect(nextSegment).toHaveFocus();
        } else {
          expect(segment).toHaveFocus();
        }

        unmount();

        // Test uncontrolled mode
        onChange = jest.fn();
        ({getByLabelText, getAllByRole, unmount} = render(<DatePicker label="Date" defaultValue={value} onChange={onChange} {...props} />));
        segment = getByLabelText(label);
        textContent = segment.textContent;
        act(() => {segment.focus();});

        count = 0;
        for (let [i, key] of [...keys].entries()) {
          beforeInput(segment, key);

          if (key !== '0' || (moved && i === keys.length - 1) || allowsZero) {
            expect(onChange).toHaveBeenCalledTimes(++count);
            expect(segment.textContent).not.toBe(textContent);
          }

          if (i < keys.length - 1) {
            expect(segment).toHaveFocus();
          }
        }

        expect(onChange).toHaveBeenCalledWith(newValue);

        if (moved) {
          let segments = getAllByRole('spinbutton');
          let nextSegment = segments[segments.indexOf(segment) + 1];
          expect(nextSegment).toHaveFocus();
        } else {
          expect(segment).toHaveFocus();
        }

        unmount();

        // Test read only mode
        onChange = jest.fn();
        ({getByLabelText, getAllByRole, unmount} = render(<DatePicker label="Date" defaultValue={value} isReadOnly onChange={onChange} {...props} />));
        segment = getByLabelText(label);
        textContent = segment.textContent;
        act(() => {segment.focus();});

        for (let key of keys) {
          beforeInput(segment, key);

          expect(onChange).not.toHaveBeenCalled();
          expect(segment.textContent).toBe(textContent);
          expect(segment).toHaveFocus();
        }

        expect(onChange).not.toHaveBeenCalled();
        expect(segment).toHaveFocus();
        unmount();
      }

      function testIgnored(label, value, keys, props) {
        let onChange = jest.fn();
        let {getByLabelText, unmount} = render(<DatePicker label="Date" defaultValue={value} onChange={onChange} {...props} />);

        let segment = getByLabelText(label);
        let textContent = segment.textContent;
        act(() => {segment.focus();});

        for (let key of keys) {
          beforeInput(segment, key);
        }

        expect(onChange).not.toHaveBeenCalled();
        expect(segment.textContent).toBe(textContent);
        expect(segment).toHaveFocus();
        unmount();
      }

      it('should support typing into the month segment', function () {
        testInput('month', new CalendarDate(2019, 2, 3), '1', new CalendarDate(2019, 1, 3), false);
        testInput('month', new CalendarDate(2019, 2, 3), '01', new CalendarDate(2019, 1, 3), true);
        testInput('month', new CalendarDate(2019, 2, 3), '12', new CalendarDate(2019, 12, 3), true);
        testInput('month', new CalendarDate(2019, 2, 3), '4', new CalendarDate(2019, 4, 3), true);
        testIgnored('month', new CalendarDate(2019, 2, 3), '0');
        testIgnored('month', new CalendarDate(2019, 2, 3), '00');
      });

      it('should support typing into the day segment', function () {
        testInput('day', new CalendarDate(2019, 2, 3), '1', new CalendarDate(2019, 2, 1), false);
        testInput('day', new CalendarDate(2019, 2, 3), '01', new CalendarDate(2019, 2, 1), true);
        testInput('day', new CalendarDate(2019, 2, 3), '12', new CalendarDate(2019, 2, 12), true);
        testInput('day', new CalendarDate(2019, 2, 3), '4', new CalendarDate(2019, 2, 4), true);
        testIgnored('day', new CalendarDate(2019, 2, 3), '0');
        testIgnored('day', new CalendarDate(2019, 2, 3), '00');
      });

      it('should support typing into the year segment', function () {
        testInput('year', new CalendarDate(2019, 2, 3), '1993', new CalendarDate(1993, 2, 3), false);
        testInput('year', new CalendarDateTime(2019, 2, 3, 8), '1993', new CalendarDateTime(1993, 2, 3, 8), true);
        testIgnored('year', new CalendarDate(2019, 2, 3), '0');
      });

      it('should support typing into the hour segment in 12 hour time', function () {
        // AM
        testInput('hour', new CalendarDateTime(2019, 2, 3, 8), '1', new CalendarDateTime(2019, 2, 3, 1), false);
        testInput('hour', new CalendarDateTime(2019, 2, 3, 8), '01', new CalendarDateTime(2019, 2, 3, 1), true);
        testInput('hour', new CalendarDateTime(2019, 2, 3, 8), '11', new CalendarDateTime(2019, 2, 3, 11), true);
        testInput('hour', new CalendarDateTime(2019, 2, 3, 8), '12', new CalendarDateTime(2019, 2, 3, 0), true);
        testInput('hour', new CalendarDateTime(2019, 2, 3, 8), '4', new CalendarDateTime(2019, 2, 3, 4), true);
        testIgnored('hour', new CalendarDateTime(2019, 2, 3, 8), '0');

        // PM
        testInput('hour', new CalendarDateTime(2019, 2, 3, 20), '1', new CalendarDateTime(2019, 2, 3, 13), false);
        testInput('hour', new CalendarDateTime(2019, 2, 3, 20), '01', new CalendarDateTime(2019, 2, 3, 13), true);
        testInput('hour', new CalendarDateTime(2019, 2, 3, 20), '11', new CalendarDateTime(2019, 2, 3, 23), true);
        testInput('hour', new CalendarDateTime(2019, 2, 3, 20), '12', new CalendarDateTime(2019, 2, 3, 12), true);
        testInput('hour', new CalendarDateTime(2019, 2, 3, 20), '4', new CalendarDateTime(2019, 2, 3, 16), true);
        testIgnored('hour', new CalendarDateTime(2019, 2, 3, 20), '0');
      });

      it('should support typing into the hour segment in 24 hour time', function () {
        testInput('hour', new CalendarDateTime(2019, 2, 3, 8), '0', new CalendarDateTime(2019, 2, 3, 0), false, {hourCycle: 24});
        testInput('hour', new CalendarDateTime(2019, 2, 3, 8), '00', new CalendarDateTime(2019, 2, 3, 0), true, {hourCycle: 24});
        testInput('hour', new CalendarDateTime(2019, 2, 3, 8), '1', new CalendarDateTime(2019, 2, 3, 1), false, {hourCycle: 24});
        testInput('hour', new CalendarDateTime(2019, 2, 3, 8), '01', new CalendarDateTime(2019, 2, 3, 1), true, {hourCycle: 24});
        testInput('hour', new CalendarDateTime(2019, 2, 3, 8), '11', new CalendarDateTime(2019, 2, 3, 11), true, {hourCycle: 24});
        testInput('hour', new CalendarDateTime(2019, 2, 3, 8), '23', new CalendarDateTime(2019, 2, 3, 23), true, {hourCycle: 24});
      });

      it('should support typing into the minute segment', function () {
        testInput('minute', new CalendarDateTime(2019, 2, 3, 8, 8), '0', new CalendarDateTime(2019, 2, 3, 8, 0), false);
        testInput('minute', new CalendarDateTime(2019, 2, 3, 8, 8), '00', new CalendarDateTime(2019, 2, 3, 8, 0), true);
        testInput('minute', new CalendarDateTime(2019, 2, 3, 8, 8), '1', new CalendarDateTime(2019, 2, 3, 8, 1), false);
        testInput('minute', new CalendarDateTime(2019, 2, 3, 8, 8), '01', new CalendarDateTime(2019, 2, 3, 8, 1), true);
        testInput('minute', new CalendarDateTime(2019, 2, 3, 8, 8), '2', new CalendarDateTime(2019, 2, 3, 8, 2), false);
        testInput('minute', new CalendarDateTime(2019, 2, 3, 8, 8), '02', new CalendarDateTime(2019, 2, 3, 8, 2), true);
        testInput('minute', new CalendarDateTime(2019, 2, 3, 8, 8), '5', new CalendarDateTime(2019, 2, 3, 8, 5), false);
        testInput('minute', new CalendarDateTime(2019, 2, 3, 8, 8), '6', new CalendarDateTime(2019, 2, 3, 8, 6), true);
        testInput('minute', new CalendarDateTime(2019, 2, 3, 8, 8), '59', new CalendarDateTime(2019, 2, 3, 8, 59), true);
      });

      it('should support typing into the second segment', function () {
        testInput('second', new CalendarDateTime(2019, 2, 3, 8, 5, 8), '0', new CalendarDateTime(2019, 2, 3, 8, 5, 0), false, {granularity: 'second'});
        testInput('second', new CalendarDateTime(2019, 2, 3, 8, 5, 8), '00', new CalendarDateTime(2019, 2, 3, 8, 5, 0), true, {granularity: 'second'});
        testInput('second', new CalendarDateTime(2019, 2, 3, 8, 5, 8), '1', new CalendarDateTime(2019, 2, 3, 8, 5, 1), false, {granularity: 'second'});
        testInput('second', new CalendarDateTime(2019, 2, 3, 8, 5, 8), '01', new CalendarDateTime(2019, 2, 3, 8, 5, 1), true, {granularity: 'second'});
        testInput('second', new CalendarDateTime(2019, 2, 3, 8, 5, 8), '2', new CalendarDateTime(2019, 2, 3, 8, 5, 2), false, {granularity: 'second'});
        testInput('second', new CalendarDateTime(2019, 2, 3, 8, 5, 8), '5', new CalendarDateTime(2019, 2, 3, 8, 5, 5), false, {granularity: 'second'});
        testInput('second', new CalendarDateTime(2019, 2, 3, 8, 5, 8), '6', new CalendarDateTime(2019, 2, 3, 8, 5, 6), true, {granularity: 'second'});
        testInput('second', new CalendarDateTime(2019, 2, 3, 8, 5, 8), '59', new CalendarDateTime(2019, 2, 3, 8, 5, 59), true, {granularity: 'second'});
      });

      it('should support typing into the day period segment', function () {
        testInput('AM/PM', new CalendarDateTime(2019, 2, 3, 8), 'p', new CalendarDateTime(2019, 2, 3, 20), false);
        testInput('AM/PM', new CalendarDateTime(2019, 2, 3, 20), 'a', new CalendarDateTime(2019, 2, 3, 8), false);
      });

      it('should support entering arabic digits', function () {
        testInput('year', new CalendarDate(2019, 2, 3), '٢٠٢٤', new CalendarDate(2024, 2, 3), false);
      });
    });

    describe('backspace', function () {
      function testBackspace(label, value, newValue, options) {
        let onChange = jest.fn();

        // Test controlled mode
        let {getByLabelText, unmount} = render(<DatePicker label="Date" value={value} onChange={onChange} {...options} />);
        let segment = getByLabelText(label);
        let textContent = segment.textContent;
        act(() => {segment.focus();});

        fireEvent.keyDown(segment, {key: 'Backspace'});
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(newValue);
        expect(segment.textContent).toBe(textContent);
        unmount();

        // Test uncontrolled mode
        onChange = jest.fn();
        ({getByLabelText, unmount} = render(<DatePicker label="Date" defaultValue={value} onChange={onChange} {...options} />));
        segment = getByLabelText(label);
        textContent = segment.textContent;
        act(() => {segment.focus();});

        fireEvent.keyDown(segment, {key: 'Backspace'});
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(newValue);
        expect(segment.textContent).not.toBe(textContent);
        unmount();
      }

      it('should support backspace in the month segment', function () {
        testBackspace('month', new CalendarDate(2019, 2, 3), null);
        testBackspace('month', new CalendarDate(2019, 6, 3), null);
        testBackspace('month', new CalendarDate(2019, 12, 3), new CalendarDate(2019, 1, 3));
      });

      it('should support backspace in the day segment', function () {
        testBackspace('day', new CalendarDate(2019, 2, 3), null);
        testBackspace('day', new CalendarDate(2019, 2, 20), new CalendarDate(2019, 2, 2));
      });

      it('should support backspace in the year segment', function () {
        testBackspace('year', new CalendarDate(2019, 2, 3), new CalendarDate(201, 2, 3));
        testBackspace('year', new CalendarDate(2, 2, 3), null);
      });

      it('should support backspace in the hour segment in 12 hour time', function () {
        // AM
        testBackspace('hour', new CalendarDateTime(2019, 2, 3, 8), null);
        testBackspace('hour', new CalendarDateTime(2019, 2, 3, 11), new CalendarDateTime(2019, 2, 3, 1));

        // PM
        testBackspace('hour', new CalendarDateTime(2019, 2, 3, 16), null);
        testBackspace('hour', new CalendarDateTime(2019, 2, 3, 23), new CalendarDateTime(2019, 2, 3, 13));
      });

      it('should support backspace in the hour segment in 24 hour time', function () {
        testBackspace('hour', new CalendarDateTime(2019, 2, 3, 8), null, {hourCycle: 24});
        testBackspace('hour', new CalendarDateTime(2019, 2, 3, 11), new CalendarDateTime(2019, 2, 3, 1), {hourCycle: 24});
        testBackspace('hour', new CalendarDateTime(2019, 2, 3, 16), new CalendarDateTime(2019, 2, 3, 1), {hourCycle: 24});
        testBackspace('hour', new CalendarDateTime(2019, 2, 3, 23), new CalendarDateTime(2019, 2, 3, 2), {hourCycle: 24});
      });

      it('should support backspace in the am/pm field', function () {
        testBackspace('AM/PM', new CalendarDateTime(2019, 2, 3, 8), null);
        testBackspace('AM/PM', new CalendarDateTime(2019, 2, 3, 16), null);
      });

      it('should support backspace in the minute segment', function () {
        testBackspace('minute', new CalendarDateTime(2019, 2, 3, 5, 8), null);
        testBackspace('minute', new CalendarDateTime(2019, 2, 3, 5, 25), new CalendarDateTime(2019, 2, 3, 5, 2));
        testBackspace('minute', new CalendarDateTime(2019, 2, 3, 5, 59), new CalendarDateTime(2019, 2, 3, 5, 5));
      });

      it('should support second in the minute segment', function () {
        testBackspace('second', new CalendarDateTime(2019, 2, 3, 5, 5, 8), null, {granularity: 'second'});
        testBackspace('second', new CalendarDateTime(2019, 2, 3, 5, 5, 25), new CalendarDateTime(2019, 2, 3, 5, 5, 2), {granularity: 'second'});
        testBackspace('second', new CalendarDateTime(2019, 2, 3, 5, 5, 59), new CalendarDateTime(2019, 2, 3, 5, 5, 5), {granularity: 'second'});
      });

      it('should support backspace with arabic digits', function () {
        let onChange = jest.fn();
        let {getByLabelText} = render(
          <Provider theme={theme} locale="ar-EG">
            <DatePicker label="Date" defaultValue={new CalendarDate(2019, 2, 3)} onChange={onChange} />
          </Provider>
        );
        let segment = getByLabelText('السنة');
        expect(segment).toHaveTextContent('٢٠١٩');
        act(() => {segment.focus();});

        fireEvent.keyDown(segment, {key: 'Backspace'});
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(new CalendarDate(201, 2, 3));
        expect(segment).toHaveTextContent('٢٠١');
      });
    });
  });

  describe('validation', function () {
    it('should display an error icon when date is less than the minimum (controlled)', function () {
      let {getByTestId} = render(<DatePicker label="Date" value={new CalendarDate(1980, 1, 1)} minValue={new CalendarDate(1985, 1, 1)} />);
      expect(getByTestId('invalid-icon')).toBeVisible();
    });

    it('should display an error icon when date is less than the minimum (uncontrolled)', function () {
      let {getByTestId, getByLabelText, queryByTestId} = render(<DatePicker label="Date" defaultValue={new CalendarDate(1985, 1, 1)} minValue={new CalendarDate(1985, 1, 1)} />);
      expect(queryByTestId('invalid-icon')).toBeNull();

      let year = getByLabelText('year');
      fireEvent.keyDown(year, {key: 'ArrowDown'});

      expect(getByTestId('invalid-icon')).toBeVisible();

      fireEvent.keyDown(year, {key: 'ArrowUp'});
      expect(queryByTestId('invalid-icon')).toBeNull();
    });

    it('should display an error icon when date is greater than the maximum (controlled)', function () {
      let {getByTestId} = render(<DatePicker label="Date" value={new CalendarDate(1990, 1, 1)} maxValue={new CalendarDate(1985, 1, 1)} />);
      expect(getByTestId('invalid-icon')).toBeVisible();
    });

    it('should display an error icon when date is greater than the maximum (uncontrolled)', function () {
      let {getByTestId, getByLabelText, queryByTestId} = render(<DatePicker label="Date" defaultValue={new CalendarDate(1985, 1, 1)} maxValue={new CalendarDate(1985, 1, 1)} />);
      expect(queryByTestId('invalid-icon')).toBeNull();

      let year = getByLabelText('year');
      fireEvent.keyDown(year, {key: 'ArrowUp'});

      expect(getByTestId('invalid-icon')).toBeVisible();

      fireEvent.keyDown(year, {key: 'ArrowDown'});
      expect(queryByTestId('invalid-icon')).toBeNull();
    });
  });

  describe('placeholder', function () {
    it('should display a placeholder date if no value is provided', function () {
      let onChange = jest.fn();
      let {getAllByRole} = render(<DatePicker label="Date" onChange={onChange} />);

      let combobox = getAllByRole('group')[0];
      let today = new Intl.DateTimeFormat('en-US').format(new Date());
      expectPlaceholder(combobox, today);
    });

    it('should display a placeholder date if the value prop is null', function () {
      let onChange = jest.fn();
      let {getAllByRole} = render(<DatePicker label="Date" onChange={onChange} value={null} />);

      let combobox = getAllByRole('group')[0];
      let today = new Intl.DateTimeFormat('en-US').format(new Date());
      expectPlaceholder(combobox, today);
    });

    it('should use the placeholderValue prop if provided', function () {
      let onChange = jest.fn();
      let {getAllByRole} = render(<DatePicker label="Date" onChange={onChange} placeholderValue={new CalendarDate(1980, 1, 1)} />);

      let combobox = getAllByRole('group')[0];
      expectPlaceholder(combobox, '1/1/1980');
    });

    it('should confirm placeholder value with the enter key', function () {
      let onChange = jest.fn();
      let {getAllByRole} = render(<DatePicker label="Date" onChange={onChange} />);

      let combobox = getAllByRole('group')[0];
      let todayStr = new Intl.DateTimeFormat('en-US').format(new Date());
      expectPlaceholder(combobox, todayStr);

      let segments = getAllByRole('spinbutton');
      act(() => {segments[0].focus();});

      fireEvent.keyDown(document.activeElement, {key: 'Enter'});
      expect(segments[1]).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();

      fireEvent.keyDown(document.activeElement, {key: 'Enter'});
      expect(segments[2]).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();

      fireEvent.keyDown(document.activeElement, {key: 'Enter'});
      expect(segments[2]).toHaveFocus();
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(today(getLocalTimeZone()));
      expectPlaceholder(combobox, todayStr);
    });

    it('should use arrow keys to modify placeholder (uncontrolled)', function () {
      let onChange = jest.fn();
      let {getAllByRole} = render(<DatePicker label="Date" onChange={onChange} />);

      let combobox = getAllByRole('group')[0];
      let formatter = new Intl.DateTimeFormat('en-US');
      expectPlaceholder(combobox, formatter.format(new Date()));

      let segments = getAllByRole('spinbutton');
      act(() => {segments[0].focus();});

      fireEvent.keyDown(document.activeElement, {key: 'ArrowUp'});
      fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
      expect(segments[1]).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();
      let value = today(getLocalTimeZone()).cycle('month', 1);
      expectPlaceholder(combobox, formatter.format(value.toDate(getLocalTimeZone())));

      fireEvent.keyDown(document.activeElement, {key: 'ArrowUp'});
      fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
      expect(segments[2]).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();
      value = value.cycle('day', 1);
      expectPlaceholder(combobox, formatter.format(value.toDate(getLocalTimeZone())));

      fireEvent.keyDown(document.activeElement, {key: 'ArrowUp'});
      expect(onChange).toHaveBeenCalledTimes(1);
      value = value.cycle('year', 1);
      expect(onChange).toHaveBeenCalledWith(value);
      expectPlaceholder(combobox, formatter.format(value.toDate(getLocalTimeZone())));
    });

    it('should use arrow keys to modify placeholder (controlled)', function () {
      let onChange = jest.fn();
      let {getAllByRole, rerender} = render(<DatePicker label="Date" onChange={onChange} value={null} />);

      let combobox = getAllByRole('group')[0];
      let formatter = new Intl.DateTimeFormat('en-US');
      expectPlaceholder(combobox, formatter.format(new Date()));

      let segments = getAllByRole('spinbutton');
      act(() => {segments[0].focus();});

      fireEvent.keyDown(document.activeElement, {key: 'ArrowUp'});
      fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
      expect(segments[1]).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();
      let value = today(getLocalTimeZone()).cycle('month', 1);
      expectPlaceholder(combobox, formatter.format(value.toDate(getLocalTimeZone())));

      fireEvent.keyDown(document.activeElement, {key: 'ArrowUp'});
      fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
      expect(segments[2]).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();
      value = value.cycle('day', 1);
      expectPlaceholder(combobox, formatter.format(value.toDate(getLocalTimeZone())));

      fireEvent.keyDown(document.activeElement, {key: 'ArrowUp'});
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(value.cycle('year', 1));
      expectPlaceholder(combobox, formatter.format(new Date())); // controlled

      value = value.cycle('year', 1);
      rerender(<DatePicker label="Date" onChange={onChange} value={value} />);
      expectPlaceholder(combobox, formatter.format(value.toDate(getLocalTimeZone())));
    });

    it('should enter a date to modify placeholder (uncontrolled)', function () {
      let onChange = jest.fn();
      let {getAllByRole} = render(<DatePicker label="Date" onChange={onChange} />);

      let combobox = getAllByRole('group')[0];
      let formatter = new Intl.DateTimeFormat('en-US');
      expectPlaceholder(combobox, formatter.format(new Date()));

      let segments = getAllByRole('spinbutton');
      act(() => {segments[0].focus();});

      beforeInput(document.activeElement, '4');
      expect(segments[1]).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();
      let value = today(getLocalTimeZone()).set({month: 4});
      expectPlaceholder(combobox, formatter.format(value.toDate(getLocalTimeZone())));

      beforeInput(document.activeElement, '5');
      expect(segments[2]).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();
      value = today(getLocalTimeZone()).set({month: 4, day: 5});
      expectPlaceholder(combobox, formatter.format(value.toDate(getLocalTimeZone())));

      beforeInput(document.activeElement, '2');
      expect(onChange).toHaveBeenCalledTimes(1);
      beforeInput(document.activeElement, '0');
      expect(onChange).toHaveBeenCalledTimes(2);
      beforeInput(document.activeElement, '2');
      expect(onChange).toHaveBeenCalledTimes(3);
      beforeInput(document.activeElement, '0');
      expect(segments[2]).toHaveFocus();
      expect(onChange).toHaveBeenCalledTimes(4);
      value = new CalendarDate(2020, 4, 5);
      expect(onChange).toHaveBeenCalledWith(value);
      expectPlaceholder(combobox, formatter.format(value.toDate(getLocalTimeZone())));
    });

    it('should enter a date to modify placeholder (controlled)', function () {
      let onChange = jest.fn();
      let {getAllByRole, rerender} = render(<DatePicker label="Date" onChange={onChange} value={null} />);

      let combobox = getAllByRole('group')[0];
      let formatter = new Intl.DateTimeFormat('en-US');
      expectPlaceholder(combobox, formatter.format(new Date()));

      let segments = getAllByRole('spinbutton');
      act(() => {segments[0].focus();});

      beforeInput(document.activeElement, '4');
      expect(segments[1]).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();
      let value = today(getLocalTimeZone()).set({month: 4});
      expectPlaceholder(combobox, formatter.format(value.toDate(getLocalTimeZone())));

      beforeInput(document.activeElement, '5');
      expect(segments[2]).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();
      value = today(getLocalTimeZone()).set({month: 4, day: 5});
      expectPlaceholder(combobox, formatter.format(value.toDate(getLocalTimeZone())));

      beforeInput(document.activeElement, '2');
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(new CalendarDate(2, 4, 5));
      expect(segments[2]).toHaveFocus();
      expectPlaceholder(combobox, formatter.format(new Date())); // controlled

      value = new CalendarDate(2020, 4, 5);
      rerender(<DatePicker label="Date" onChange={onChange} value={value} />);
      expectPlaceholder(combobox, formatter.format(value.toDate(getLocalTimeZone())));
    });

    it('should confirm the placeholder on blur', function () {
      let onChange = jest.fn();
      let {getAllByRole} = render(<DatePicker label="Date" onChange={onChange} />);

      let combobox = getAllByRole('group')[0];
      let todayStr = new Intl.DateTimeFormat('en-US').format(new Date());
      expectPlaceholder(combobox, todayStr);

      let segments = getAllByRole('spinbutton');
      act(() => {segments[0].focus();});

      // Should not emit onChange if no segments are set
      act(() => {segments[0].blur();});
      expect(onChange).not.toHaveBeenCalled();

      act(() => {segments[0].focus();});
      beforeInput(document.activeElement, '4');
      expect(onChange).not.toHaveBeenCalled();

      expect(segments[1]).toHaveFocus();
      act(() => {segments[1].blur();});
      expect(onChange).toHaveBeenCalledWith(today(getLocalTimeZone()).set({month: 4}));
    });
  });
});
