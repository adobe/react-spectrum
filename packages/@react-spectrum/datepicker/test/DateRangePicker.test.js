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

import {act, fireEvent, getAllByRole as getAllByRoleInContainer, render as render_, triggerPress, waitFor, within} from '@react-spectrum/test-utils';
import {CalendarDate, CalendarDateTime, getLocalTimeZone, toCalendarDateTime, today} from '@internationalized/date';
import {DateRangePicker} from '../';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {theme} from '@react-spectrum/theme-default';
import userEvent from '@testing-library/user-event';

function pointerEvent(type, opts) {
  let evt = new Event(type, {bubbles: true, cancelable: true});
  Object.assign(evt, {
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    button: opts.button || 0
  }, opts);
  return evt;
}

function beforeInput(target, key) {
  // JSDOM doesn't support the beforeinput event
  let e = new InputEvent('beforeinput', {cancelable: true, data: key, inputType: 'insertText'});
  fireEvent(target, e);
}

function getTextValue(el) {
  if (el.className?.includes?.('DatePicker-placeholder') && !el.parentElement.className.includes('is-placeholder')) {
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

describe('DateRangePicker', function () {
  // there are live announcers, we need to be able to get rid of them after each test or get a warning in the console about act()
  beforeAll(() => jest.useFakeTimers());
  afterEach(() => {
    act(() => {
      jest.runAllTimers();
    });
  });
  describe('basics', function () {
    it('should render a DateRangePicker with a specified date range', function () {
      let {getAllByRole} = render(<DateRangePicker label="Date range" value={{start: new CalendarDate(2019, 2, 3), end: new CalendarDate(2019, 5, 6)}} />);

      let combobox = getAllByRole('group')[0];
      expect(combobox).toBeVisible();
      expect(combobox).not.toHaveAttribute('aria-disabled');
      expect(combobox).not.toHaveAttribute('aria-invalid');

      let segments = getAllByRole('spinbutton');
      expect(segments.length).toBe(6);

      expect(getTextValue(segments[0])).toBe('2');
      expect(segments[0].getAttribute('aria-label')).toBe('Start Date month');
      expect(segments[0].getAttribute('aria-valuenow')).toBe('2');
      expect(segments[0].getAttribute('aria-valuetext')).toBe('2 – February');
      expect(segments[0].getAttribute('aria-valuemin')).toBe('1');
      expect(segments[0].getAttribute('aria-valuemax')).toBe('12');

      expect(getTextValue(segments[1])).toBe('3');
      expect(segments[1].getAttribute('aria-label')).toBe('Start Date day');
      expect(segments[1].getAttribute('aria-valuenow')).toBe('3');
      expect(segments[1].getAttribute('aria-valuetext')).toBe('3');
      expect(segments[1].getAttribute('aria-valuemin')).toBe('1');
      expect(segments[1].getAttribute('aria-valuemax')).toBe('28');

      expect(getTextValue(segments[2])).toBe('2019');
      expect(segments[2].getAttribute('aria-label')).toBe('Start Date year');
      expect(segments[2].getAttribute('aria-valuenow')).toBe('2019');
      expect(segments[2].getAttribute('aria-valuetext')).toBe('2019');
      expect(segments[2].getAttribute('aria-valuemin')).toBe('1');
      expect(segments[2].getAttribute('aria-valuemax')).toBe('9999');

      expect(getTextValue(segments[3])).toBe('5');
      expect(segments[3].getAttribute('aria-label')).toBe('End Date month');
      expect(segments[3].getAttribute('aria-valuenow')).toBe('5');
      expect(segments[3].getAttribute('aria-valuetext')).toBe('5 – May');
      expect(segments[3].getAttribute('aria-valuemin')).toBe('1');
      expect(segments[3].getAttribute('aria-valuemax')).toBe('12');

      expect(getTextValue(segments[4])).toBe('6');
      expect(segments[4].getAttribute('aria-label')).toBe('End Date day');
      expect(segments[4].getAttribute('aria-valuenow')).toBe('6');
      expect(segments[4].getAttribute('aria-valuetext')).toBe('6');
      expect(segments[4].getAttribute('aria-valuemin')).toBe('1');
      expect(segments[4].getAttribute('aria-valuemax')).toBe('31');

      expect(getTextValue(segments[5])).toBe('2019');
      expect(segments[5].getAttribute('aria-label')).toBe('End Date year');
      expect(segments[5].getAttribute('aria-valuenow')).toBe('2019');
      expect(segments[5].getAttribute('aria-valuetext')).toBe('2019');
      expect(segments[5].getAttribute('aria-valuemin')).toBe('1');
      expect(segments[5].getAttribute('aria-valuemax')).toBe('9999');
    });

    it('should render a DateRangePicker granularity="second"', function () {
      let {getAllByRole} = render(<DateRangePicker label="Date range" value={{start: new CalendarDateTime(2019, 2, 3), end: new CalendarDateTime(2019, 5, 6)}} granularity="second" />);

      let combobox = getAllByRole('group')[0];
      expect(combobox).toBeVisible();
      expect(combobox).not.toHaveAttribute('aria-disabled');
      expect(combobox).not.toHaveAttribute('aria-invalid');

      let segments = getAllByRole('spinbutton');
      expect(segments.length).toBe(14);

      expect(getTextValue(segments[0])).toBe('2');
      expect(segments[0].getAttribute('aria-label')).toBe('Start Date month');
      expect(segments[0].getAttribute('aria-valuenow')).toBe('2');
      expect(segments[0].getAttribute('aria-valuetext')).toBe('2 – February');
      expect(segments[0].getAttribute('aria-valuemin')).toBe('1');
      expect(segments[0].getAttribute('aria-valuemax')).toBe('12');

      expect(getTextValue(segments[1])).toBe('3');
      expect(segments[1].getAttribute('aria-label')).toBe('Start Date day');
      expect(segments[1].getAttribute('aria-valuenow')).toBe('3');
      expect(segments[1].getAttribute('aria-valuetext')).toBe('3');
      expect(segments[1].getAttribute('aria-valuemin')).toBe('1');
      expect(segments[1].getAttribute('aria-valuemax')).toBe('28');

      expect(getTextValue(segments[2])).toBe('2019');
      expect(segments[2].getAttribute('aria-label')).toBe('Start Date year');
      expect(segments[2].getAttribute('aria-valuenow')).toBe('2019');
      expect(segments[2].getAttribute('aria-valuetext')).toBe('2019');
      expect(segments[2].getAttribute('aria-valuemin')).toBe('1');
      expect(segments[2].getAttribute('aria-valuemax')).toBe('9999');

      expect(getTextValue(segments[3])).toBe('12');
      expect(segments[3].getAttribute('aria-label')).toBe('Start Date hour');
      expect(segments[3].getAttribute('aria-valuenow')).toBe('0');
      expect(segments[3].getAttribute('aria-valuetext')).toBe('12 AM');
      expect(segments[3].getAttribute('aria-valuemin')).toBe('0');
      expect(segments[3].getAttribute('aria-valuemax')).toBe('11');

      expect(getTextValue(segments[4])).toBe('00');
      expect(segments[4].getAttribute('aria-label')).toBe('Start Date minute');
      expect(segments[4].getAttribute('aria-valuenow')).toBe('0');
      expect(segments[4].getAttribute('aria-valuetext')).toBe('00');
      expect(segments[4].getAttribute('aria-valuemin')).toBe('0');
      expect(segments[4].getAttribute('aria-valuemax')).toBe('59');

      expect(getTextValue(segments[5])).toBe('00');
      expect(segments[5].getAttribute('aria-label')).toBe('Start Date second');
      expect(segments[5].getAttribute('aria-valuenow')).toBe('0');
      expect(segments[5].getAttribute('aria-valuetext')).toBe('00');
      expect(segments[5].getAttribute('aria-valuemin')).toBe('0');
      expect(segments[5].getAttribute('aria-valuemax')).toBe('59');

      expect(getTextValue(segments[6])).toBe('AM');
      expect(segments[6].getAttribute('aria-label')).toBe('Start Date AM/PM');
      expect(segments[6].getAttribute('aria-valuetext')).toBe('AM');

      expect(getTextValue(segments[7])).toBe('5');
      expect(segments[7].getAttribute('aria-label')).toBe('End Date month');
      expect(segments[7].getAttribute('aria-valuenow')).toBe('5');
      expect(segments[7].getAttribute('aria-valuetext')).toBe('5 – May');
      expect(segments[7].getAttribute('aria-valuemin')).toBe('1');
      expect(segments[7].getAttribute('aria-valuemax')).toBe('12');

      expect(getTextValue(segments[8])).toBe('6');
      expect(segments[8].getAttribute('aria-label')).toBe('End Date day');
      expect(segments[8].getAttribute('aria-valuenow')).toBe('6');
      expect(segments[8].getAttribute('aria-valuetext')).toBe('6');
      expect(segments[8].getAttribute('aria-valuemin')).toBe('1');
      expect(segments[8].getAttribute('aria-valuemax')).toBe('31');

      expect(getTextValue(segments[9])).toBe('2019');
      expect(segments[9].getAttribute('aria-label')).toBe('End Date year');
      expect(segments[9].getAttribute('aria-valuenow')).toBe('2019');
      expect(segments[9].getAttribute('aria-valuetext')).toBe('2019');
      expect(segments[9].getAttribute('aria-valuemin')).toBe('1');
      expect(segments[9].getAttribute('aria-valuemax')).toBe('9999');

      expect(getTextValue(segments[10])).toBe('12');
      expect(segments[10].getAttribute('aria-label')).toBe('End Date hour');
      expect(segments[10].getAttribute('aria-valuenow')).toBe('0');
      expect(segments[10].getAttribute('aria-valuetext')).toBe('12 AM');
      expect(segments[10].getAttribute('aria-valuemin')).toBe('0');
      expect(segments[10].getAttribute('aria-valuemax')).toBe('11');

      expect(getTextValue(segments[11])).toBe('00');
      expect(segments[11].getAttribute('aria-label')).toBe('End Date minute');
      expect(segments[11].getAttribute('aria-valuenow')).toBe('0');
      expect(segments[11].getAttribute('aria-valuetext')).toBe('00');
      expect(segments[11].getAttribute('aria-valuemin')).toBe('0');
      expect(segments[11].getAttribute('aria-valuemax')).toBe('59');

      expect(getTextValue(segments[12])).toBe('00');
      expect(segments[12].getAttribute('aria-label')).toBe('End Date second');
      expect(segments[12].getAttribute('aria-valuenow')).toBe('0');
      expect(segments[12].getAttribute('aria-valuetext')).toBe('00');
      expect(segments[12].getAttribute('aria-valuemin')).toBe('0');
      expect(segments[12].getAttribute('aria-valuemax')).toBe('59');

      expect(getTextValue(segments[13])).toBe('AM');
      expect(segments[13].getAttribute('aria-label')).toBe('End Date AM/PM');
      expect(segments[13].getAttribute('aria-valuetext')).toBe('AM');
    });

    it('should support focusing via a ref', function () {
      let ref = React.createRef();
      let {getAllByRole} = render(<DateRangePicker label="Date" ref={ref} />);
      expect(ref.current).toHaveProperty('focus');

      act(() => ref.current.focus());
      expect(document.activeElement).toBe(getAllByRole('spinbutton')[0]);
    });

    it('should support autoFocus', function () {
      let {getAllByRole} = render(<DateRangePicker label="Date" autoFocus />);
      expect(document.activeElement).toBe(getAllByRole('spinbutton')[0]);
    });

    it('should pass through data attributes', function () {
      let {getByTestId} = render(<DateRangePicker label="Date" data-testid="foo" />);
      expect(getByTestId('foo')).toHaveAttribute('role', 'group');
    });

    it('should return the outer most DOM element from the ref', function () {
      let ref = React.createRef();
      render(<DateRangePicker label="Date" ref={ref} />);
      expect(ref.current).toHaveProperty('UNSAFE_getDOMNode');

      let wrapper = ref.current.UNSAFE_getDOMNode();
      expect(wrapper).toBeInTheDocument();
      expect(within(wrapper).getByText('Date')).toBeInTheDocument();
      expect(within(wrapper).getAllByRole('spinbutton')[0]).toBeInTheDocument();
    });
  });

  describe('events', function () {
    let onBlurSpy = jest.fn();
    let onFocusChangeSpy = jest.fn();
    let onFocusSpy = jest.fn();
    let onKeyDownSpy = jest.fn();
    let onKeyUpSpy = jest.fn();

    afterEach(() => {
      onBlurSpy.mockClear();
      onFocusChangeSpy.mockClear();
      onFocusSpy.mockClear();
      onKeyDownSpy.mockClear();
      onKeyUpSpy.mockClear();
    });

    it('should focus field, move a segment, and open popover and does not blur', function () {
      let {getByRole, getAllByRole} = render(<DateRangePicker label="Date" onBlur={onBlurSpy} onFocus={onFocusSpy} onFocusChange={onFocusChangeSpy} />);
      let segments = getAllByRole('spinbutton');
      let button = getByRole('button');

      expect(onBlurSpy).not.toHaveBeenCalled();
      expect(onFocusChangeSpy).not.toHaveBeenCalled();
      expect(onFocusSpy).not.toHaveBeenCalled();

      userEvent.tab();
      expect(segments[0]).toHaveFocus();
      expect(onBlurSpy).not.toHaveBeenCalled();
      expect(onFocusChangeSpy).toHaveBeenCalledTimes(1);
      expect(onFocusSpy).toHaveBeenCalledTimes(1);

      userEvent.tab();
      expect(segments[1]).toHaveFocus();
      expect(onBlurSpy).not.toHaveBeenCalled();
      expect(onFocusChangeSpy).toHaveBeenCalledTimes(1);
      expect(onFocusSpy).toHaveBeenCalledTimes(1);

      triggerPress(button);
      act(() => jest.runAllTimers());

      let dialog = getByRole('dialog');
      expect(dialog).toBeVisible();
      expect(onBlurSpy).not.toHaveBeenCalled();
      expect(onFocusChangeSpy).toHaveBeenCalledTimes(1);
      expect(onFocusSpy).toHaveBeenCalledTimes(1);
    });

    it('should focus field and leave to blur', function () {
      let {getAllByRole} = render(<DateRangePicker label="Date" onBlur={onBlurSpy} onFocus={onFocusSpy} onFocusChange={onFocusChangeSpy} />);
      let segments = getAllByRole('spinbutton');

      expect(onBlurSpy).not.toHaveBeenCalled();
      expect(onFocusChangeSpy).not.toHaveBeenCalled();
      expect(onFocusSpy).not.toHaveBeenCalled();

      userEvent.tab();
      expect(segments[0]).toHaveFocus();
      expect(onBlurSpy).not.toHaveBeenCalled();
      expect(onFocusChangeSpy).toHaveBeenCalledTimes(1);
      expect(onFocusSpy).toHaveBeenCalledTimes(1);

      userEvent.click(document.body);
      expect(document.body).toHaveFocus();
      expect(onBlurSpy).toHaveBeenCalledTimes(1);
      expect(onFocusChangeSpy).toHaveBeenCalledTimes(2);
      expect(onFocusSpy).toHaveBeenCalledTimes(1);
    });

    it('should open popover and call picker onFocus', function () {
      let {getByRole} = render(<DateRangePicker label="Date" onBlur={onBlurSpy} onFocus={onFocusSpy} onFocusChange={onFocusChangeSpy} />);
      let button = getByRole('button');

      expect(onBlurSpy).not.toHaveBeenCalled();
      expect(onFocusChangeSpy).not.toHaveBeenCalled();
      expect(onFocusSpy).not.toHaveBeenCalled();

      triggerPress(button);
      act(() => jest.runAllTimers());

      let dialog = getByRole('dialog');
      expect(dialog).toBeVisible();
      expect(onBlurSpy).not.toHaveBeenCalled();
      expect(onFocusChangeSpy).toHaveBeenCalledTimes(1);
      expect(onFocusSpy).toHaveBeenCalledTimes(1);
    });

    it('should open and close popover and only call blur when focus leaves picker', async function () {
      let {getByRole} = render(<DateRangePicker label="Date" onBlur={onBlurSpy} onFocus={onFocusSpy} onFocusChange={onFocusChangeSpy} />);
      let button = getByRole('button');

      expect(onBlurSpy).not.toHaveBeenCalled();
      expect(onFocusChangeSpy).not.toHaveBeenCalled();
      expect(onFocusSpy).not.toHaveBeenCalled();

      triggerPress(button);
      act(() => jest.runAllTimers());

      let dialog = getByRole('dialog');
      expect(dialog).toBeVisible();
      expect(onBlurSpy).not.toHaveBeenCalled();
      expect(onFocusChangeSpy).toHaveBeenCalledTimes(1);
      expect(onFocusSpy).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(document.activeElement, {key: 'Escape'});
      fireEvent.keyUp(document.activeElement, {key: 'Escape'});
      act(() => jest.runAllTimers());

      await waitFor(() => {
        expect(dialog).not.toBeInTheDocument();
      }); // wait for animation

      // now that it's been unmounted, run the raf callback
      act(() => {
        jest.runAllTimers();
      });

      expect(dialog).not.toBeInTheDocument();
      expect(document.activeElement).toBe(button);
      expect(button).toHaveFocus();
      expect(onBlurSpy).not.toHaveBeenCalled();
      expect(onFocusChangeSpy).toHaveBeenCalledTimes(1);
      expect(onFocusSpy).toHaveBeenCalledTimes(1);

      userEvent.tab();
      expect(document.body).toHaveFocus();
      expect(onBlurSpy).toHaveBeenCalledTimes(1);
      expect(onFocusChangeSpy).toHaveBeenCalledTimes(2);
      expect(onFocusSpy).toHaveBeenCalledTimes(1);
    });

    it('should trigger right arrow key event for segment navigation', function () {
      let {getAllByRole} = render(<DateRangePicker label="Date" onKeyDown={onKeyDownSpy} onKeyUp={onKeyUpSpy} />);
      let segments = getAllByRole('spinbutton');

      expect(onKeyDownSpy).not.toHaveBeenCalled();
      expect(onKeyUpSpy).not.toHaveBeenCalled();

      userEvent.tab();
      expect(segments[0]).toHaveFocus();
      expect(onKeyDownSpy).not.toHaveBeenCalled();
      expect(onKeyUpSpy).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
      fireEvent.keyUp(document.activeElement, {key: 'ArrowRight'});
      expect(segments[1]).toHaveFocus();
      expect(onKeyDownSpy).toHaveBeenCalledTimes(1);
      expect(onKeyUpSpy).toHaveBeenCalledTimes(2);
    });

    it('should trigger key event in popover and focus/blur/key events are not called', function () {
      let {getByRole} = render(<DateRangePicker label="Date" onBlur={onBlurSpy} onFocus={onFocusSpy} onFocusChange={onFocusChangeSpy} onKeyDown={onKeyDownSpy} onKeyUp={onKeyUpSpy} />);
      let button = getByRole('button');

      expect(onKeyDownSpy).not.toHaveBeenCalled();
      expect(onKeyUpSpy).not.toHaveBeenCalled();
      expect(onBlurSpy).not.toHaveBeenCalled();
      expect(onFocusChangeSpy).not.toHaveBeenCalled();
      expect(onFocusSpy).not.toHaveBeenCalled();

      triggerPress(button);

      let dialog = getByRole('dialog');
      expect(dialog).toBeVisible();
      expect(onBlurSpy).not.toHaveBeenCalled();
      expect(onFocusChangeSpy).toHaveBeenCalledTimes(1);
      expect(onFocusSpy).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
      fireEvent.keyUp(document.activeElement, {key: 'ArrowRight'});
      expect(onKeyDownSpy).toHaveBeenCalledTimes(0);
      expect(onKeyUpSpy).toHaveBeenCalledTimes(0);
      expect(onBlurSpy).not.toHaveBeenCalled();
      expect(onFocusChangeSpy).toHaveBeenCalledTimes(1);
      expect(onFocusSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('calendar popover', function () {
    it('should emit onChange when selecting a date range in the calendar in uncontrolled mode', function () {
      let onChange = jest.fn();
      let {getByRole, getByTestId, getAllByRole, getByLabelText} = render(
        <Provider theme={theme}>
          <DateRangePicker label="Date range" defaultValue={{start: new CalendarDate(2019, 2, 3), end: new CalendarDate(2019, 5, 6)}} onChange={onChange} />
        </Provider>
      );

      let startDate = getByTestId('start-date');
      let endDate = getByTestId('end-date');
      expect(getTextValue(startDate)).toBe('2/3/2019');
      expect(getTextValue(endDate)).toBe('5/6/2019');

      let button = getByRole('button');
      triggerPress(button);

      let dialog = getByRole('dialog');
      expect(dialog).toBeVisible();

      let cells = getAllByRole('gridcell');
      let selected = cells.filter(cell => cell.getAttribute('aria-selected') === 'true');
      expect(selected[0].children[0]).toHaveAttribute('aria-label', 'Selected Range: Sunday, February 3 to Monday, May 6, 2019, Sunday, February 3, 2019 selected');

      triggerPress(getByLabelText('Sunday, February 10, 2019 selected'));
      triggerPress(getByLabelText('Sunday, February 17, 2019'));

      expect(dialog).not.toBeInTheDocument();
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({start: new CalendarDate(2019, 2, 10), end: new CalendarDate(2019, 2, 17)});
      expect(getTextValue(startDate)).toBe('2/10/2019'); // uncontrolled
      expect(getTextValue(endDate)).toBe('2/17/2019');
    });

    it('should display time fields when a CalendarDateTime value is used', function () {
      let onChange = jest.fn();
      let {getByRole, getByTestId, getAllByRole, getByLabelText, getAllByLabelText} = render(
        <Provider theme={theme}>
          <DateRangePicker label="Date" defaultValue={{start: new CalendarDateTime(2019, 2, 3, 8, 45), end: new CalendarDateTime(2019, 5, 6, 10, 45)}} onChange={onChange} />
        </Provider>
      );

      let startDate = getByTestId('start-date');
      let endDate = getByTestId('end-date');
      expect(getTextValue(startDate)).toBe('2/3/2019, 8:45 AM');
      expect(getTextValue(endDate)).toBe('5/6/2019, 10:45 AM');

      let button = getByRole('button');
      triggerPress(button);

      let dialog = getByRole('dialog');
      expect(dialog).toBeVisible();

      let cells = getAllByRole('gridcell');
      let selected = cells.find(cell => cell.getAttribute('aria-selected') === 'true');
      expect(selected.children[0]).toHaveAttribute('aria-label', 'Selected Range: Sunday, February 3 to Monday, May 6, 2019, Sunday, February 3, 2019 selected');

      let startTimeField = getAllByLabelText('Start time')[0];
      expect(getTextValue(startTimeField)).toBe('8:45 AM');

      let endTimeField = getAllByLabelText('End time')[0];
      expect(getTextValue(endTimeField)).toBe('10:45 AM');

      // selecting a date should not close the popover
      triggerPress(getByLabelText('Sunday, February 10, 2019 selected'));
      triggerPress(getByLabelText('Sunday, February 17, 2019'));

      expect(dialog).toBeVisible();
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({start: new CalendarDateTime(2019, 2, 10, 8, 45), end: new CalendarDateTime(2019, 2, 17, 10, 45)});
      expect(getTextValue(startDate)).toBe('2/10/2019, 8:45 AM');
      expect(getTextValue(endDate)).toBe('2/17/2019, 10:45 AM');

      let hour = within(startTimeField).getByLabelText('hour');
      expect(hour).toHaveAttribute('role', 'spinbutton');
      expect(hour).toHaveAttribute('aria-valuetext', '8 AM');

      act(() => hour.focus());
      fireEvent.keyDown(hour, {key: 'ArrowUp'});
      fireEvent.keyUp(hour, {key: 'ArrowUp'});

      expect(hour).toHaveAttribute('aria-valuetext', '9 AM');

      expect(dialog).toBeVisible();
      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange).toHaveBeenCalledWith({start: new CalendarDateTime(2019, 2, 10, 9, 45), end: new CalendarDateTime(2019, 2, 17, 10, 45)});
      expect(getTextValue(startDate)).toBe('2/10/2019, 9:45 AM');
      expect(getTextValue(endDate)).toBe('2/17/2019, 10:45 AM');

      hour = within(endTimeField).getByLabelText('hour');
      expect(hour).toHaveAttribute('role', 'spinbutton');
      expect(hour).toHaveAttribute('aria-valuetext', '10 AM');

      act(() => hour.focus());
      fireEvent.keyDown(hour, {key: 'ArrowUp'});
      fireEvent.keyUp(hour, {key: 'ArrowUp'});

      expect(hour).toHaveAttribute('aria-valuetext', '11 AM');

      expect(dialog).toBeVisible();
      expect(onChange).toHaveBeenCalledTimes(3);
      expect(onChange).toHaveBeenCalledWith({start: new CalendarDateTime(2019, 2, 10, 9, 45), end: new CalendarDateTime(2019, 2, 17, 11, 45)});
      expect(getTextValue(startDate)).toBe('2/10/2019, 9:45 AM');
      expect(getTextValue(endDate)).toBe('2/17/2019, 11:45 AM');
    });

    it('should not fire onChange until both date range and time range are selected', function () {
      let onChange = jest.fn();
      let {getByRole, getAllByRole, getByTestId, getAllByLabelText} = render(
        <Provider theme={theme}>
          <DateRangePicker label="Date" granularity="minute" onChange={onChange} />
        </Provider>
      );

      let formatter = new Intl.DateTimeFormat('en-US', {year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric'});
      let startDate = getByTestId('start-date');
      let endDate = getByTestId('end-date');
      expectPlaceholder(startDate, 'mm/dd/yyyy, ––:–– AM');
      expectPlaceholder(endDate, 'mm/dd/yyyy, ––:–– AM');

      let button = getByRole('button');
      triggerPress(button);

      let dialog = getByRole('dialog');
      expect(dialog).toBeVisible();

      let cells = getAllByRole('gridcell');
      let selected = cells.find(cell => cell.getAttribute('aria-selected') === 'true');
      expect(selected).toBeUndefined();

      let startTimeField = getAllByLabelText('Start time')[0];
      expectPlaceholder(startTimeField, '––:–– AM');

      let endTimeField = getAllByLabelText('End time')[0];
      expectPlaceholder(endTimeField, '––:–– AM');

      // selecting a date should not close the popover
      let enabledCells = cells.filter(cell => !cell.hasAttribute('aria-disabled'));
      triggerPress(enabledCells[0].firstChild);
      triggerPress(enabledCells[1].firstChild);

      expect(dialog).toBeVisible();
      expect(onChange).not.toHaveBeenCalled();
      expectPlaceholder(startDate, 'mm/dd/yyyy, ––:–– AM');
      expectPlaceholder(endDate, 'mm/dd/yyyy, ––:–– AM');

      for (let timeField of [startTimeField, endTimeField]) {
        let hour = within(timeField).getByLabelText('hour');
        expect(hour).toHaveAttribute('role', 'spinbutton');
        expect(hour).toHaveAttribute('aria-valuetext', 'Empty');

        act(() => hour.focus());
        fireEvent.keyDown(hour, {key: 'ArrowUp'});
        fireEvent.keyUp(hour, {key: 'ArrowUp'});

        expect(hour).toHaveAttribute('aria-valuetext', '12 AM');

        expect(onChange).not.toHaveBeenCalled();
        expectPlaceholder(startDate, 'mm/dd/yyyy, ––:–– AM');
        expectPlaceholder(endDate, 'mm/dd/yyyy, ––:–– AM');

        fireEvent.keyDown(hour, {key: 'ArrowRight'});
        fireEvent.keyUp(hour, {key: 'ArrowRight'});

        expect(document.activeElement).toHaveAttribute('aria-label', 'minute');
        expect(document.activeElement).toHaveAttribute('aria-valuetext', 'Empty');
        fireEvent.keyDown(document.activeElement, {key: 'ArrowUp'});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowUp'});

        expect(document.activeElement).toHaveAttribute('aria-valuetext', '00');

        expect(onChange).not.toHaveBeenCalled();
        expectPlaceholder(startDate, 'mm/dd/yyyy, ––:–– AM');
        expectPlaceholder(endDate, 'mm/dd/yyyy, ––:–– AM');

        fireEvent.keyDown(hour, {key: 'ArrowRight'});
        fireEvent.keyUp(hour, {key: 'ArrowRight'});

        expect(document.activeElement).toHaveAttribute('aria-label', 'AM/PM');
        expect(document.activeElement).toHaveAttribute('aria-valuetext', 'Empty');

        fireEvent.keyDown(document.activeElement, {key: 'ArrowUp'});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowUp'});
      }

      expect(dialog).toBeVisible();
      expect(onChange).toHaveBeenCalledTimes(1);
      let startValue = toCalendarDateTime(today(getLocalTimeZone())).set({day: 1});
      let endValue = toCalendarDateTime(today(getLocalTimeZone())).set({day: 2});
      expect(onChange).toHaveBeenCalledWith({start: startValue, end: endValue});
      expect(getTextValue(startDate)).toBe(formatter.format(startValue.toDate(getLocalTimeZone())));
      expect(getTextValue(endDate)).toBe(formatter.format(endValue.toDate(getLocalTimeZone())));
    });

    it('should confirm time placeholders on blur if date range is selected', function () {
      let onChange = jest.fn();
      let {getByRole, getAllByRole, getByTestId} = render(
        <Provider theme={theme}>
          <DateRangePicker label="Date" granularity="minute" onChange={onChange} />
        </Provider>
      );

      let formatter = new Intl.DateTimeFormat('en-US', {year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric'});
      let startDate = getByTestId('start-date');
      let endDate = getByTestId('end-date');
      expectPlaceholder(startDate, 'mm/dd/yyyy, ––:–– AM');
      expectPlaceholder(endDate, 'mm/dd/yyyy, ––:–– AM');

      let button = getByRole('button');
      triggerPress(button);
      act(() => jest.runAllTimers());

      let dialog = getByRole('dialog');
      expect(dialog).toBeVisible();

      let cells = getAllByRole('gridcell');
      let enabledCells = cells.filter(cell => !cell.hasAttribute('aria-disabled'));
      triggerPress(enabledCells[0].firstChild);
      triggerPress(enabledCells[1].firstChild);
      expect(onChange).not.toHaveBeenCalled();

      userEvent.click(document.body);
      act(() => jest.runAllTimers());

      expect(dialog).not.toBeInTheDocument();

      expect(onChange).toHaveBeenCalledTimes(1);
      let startValue = toCalendarDateTime(today(getLocalTimeZone())).set({day: 1});
      let endValue = toCalendarDateTime(today(getLocalTimeZone())).set({day: 2});
      expect(onChange).toHaveBeenCalledWith({start: startValue, end: endValue});
      expect(getTextValue(startDate)).toBe(formatter.format(startValue.toDate(getLocalTimeZone())));
      expect(getTextValue(endDate)).toBe(formatter.format(endValue.toDate(getLocalTimeZone())));
    });

    it('should not confirm on blur if date range is not selected', function () {
      let onChange = jest.fn();
      let {getByRole, getAllByLabelText, getByTestId} = render(
        <Provider theme={theme}>
          <DateRangePicker label="Date" granularity="minute" onChange={onChange} />
        </Provider>
      );

      let startDate = getByTestId('start-date');
      let endDate = getByTestId('end-date');
      expectPlaceholder(startDate, 'mm/dd/yyyy, ––:–– AM');
      expectPlaceholder(endDate, 'mm/dd/yyyy, ––:–– AM');

      let button = getByRole('button');
      triggerPress(button);
      act(() => jest.runAllTimers());

      let dialog = getByRole('dialog');
      expect(dialog).toBeVisible();

      let timeField = getAllByLabelText('Start time')[0];
      expectPlaceholder(timeField, '––:–– AM');

      let hour = within(timeField).getByLabelText('hour');
      expect(hour).toHaveAttribute('role', 'spinbutton');
      expect(hour).toHaveAttribute('aria-valuetext', 'Empty');

      act(() => hour.focus());
      fireEvent.keyDown(hour, {key: 'ArrowUp'});
      fireEvent.keyUp(hour, {key: 'ArrowUp'});

      expect(hour).toHaveAttribute('aria-valuetext', '12 AM');

      userEvent.click(document.body);
      act(() => jest.runAllTimers());

      expect(dialog).not.toBeInTheDocument();
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should clear date and time when controlled value is set to null', function () {
      function ControlledDateRangePicker() {
        let [value, setValue] = React.useState(null);
        return (<>
          <DateRangePicker label="Date" granularity="minute" value={value} onChange={setValue} />
          <button onClick={() => setValue(null)}>Clear</button>
        </>);
      }

      let {getAllByRole, getAllByLabelText, getByTestId} = render(
        <Provider theme={theme}>
          <ControlledDateRangePicker />
        </Provider>
      );

      let formatter = new Intl.DateTimeFormat('en-US', {year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric'});
      let startDate = getByTestId('start-date');
      let endDate = getByTestId('end-date');
      expectPlaceholder(startDate, 'mm/dd/yyyy, ––:–– AM');
      expectPlaceholder(endDate, 'mm/dd/yyyy, ––:–– AM');

      let button = getAllByRole('button')[0];
      triggerPress(button);

      let cells = getAllByRole('gridcell');
      let startTimeField = getAllByLabelText('Start time')[0];
      let endTimeField = getAllByLabelText('End time')[0];

      let enabledCells = cells.filter(cell => !cell.hasAttribute('aria-disabled'));
      triggerPress(enabledCells[0].firstChild);
      triggerPress(enabledCells[1].firstChild);

      for (let timeField of [startTimeField, endTimeField]) {
        let hour = within(timeField).getByLabelText('hour');
        act(() => hour.focus());
        fireEvent.keyDown(hour, {key: 'ArrowUp'});
        fireEvent.keyUp(hour, {key: 'ArrowUp'});
        expect(hour).toHaveAttribute('aria-valuetext', '12 AM');

        fireEvent.keyDown(hour, {key: 'ArrowRight'});
        fireEvent.keyUp(hour, {key: 'ArrowRight'});
        expect(document.activeElement).toHaveAttribute('aria-label', 'minute');
        fireEvent.keyDown(document.activeElement, {key: 'ArrowUp'});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowUp'});
        expect(document.activeElement).toHaveAttribute('aria-valuetext', '00');

        fireEvent.keyDown(hour, {key: 'ArrowRight'});
        fireEvent.keyUp(hour, {key: 'ArrowRight'});
        expect(document.activeElement).toHaveAttribute('aria-label', 'AM/PM');
        fireEvent.keyDown(document.activeElement, {key: 'ArrowUp'});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowUp'});
      }

      userEvent.click(document.body);
      act(() => jest.runAllTimers());

      let startValue = toCalendarDateTime(today(getLocalTimeZone())).set({day: 1});
      let endValue = toCalendarDateTime(today(getLocalTimeZone())).set({day: 2});
      expect(getTextValue(startDate)).toBe(formatter.format(startValue.toDate(getLocalTimeZone())));
      expect(getTextValue(endDate)).toBe(formatter.format(endValue.toDate(getLocalTimeZone())));

      let clear = getAllByRole('button')[1];
      triggerPress(clear);
      expectPlaceholder(startDate, 'mm/dd/yyyy, ––:–– AM');
      expectPlaceholder(endDate, 'mm/dd/yyyy, ––:–– AM');

      triggerPress(button);
      cells = getAllByRole('gridcell');
      let selected = cells.find(cell => cell.getAttribute('aria-selected') === 'true');
      expect(selected).toBeUndefined();

      startTimeField = getAllByLabelText('Start time')[0];
      endTimeField = getAllByLabelText('End time')[0];
      expectPlaceholder(startTimeField, '––:–– AM');
      expectPlaceholder(endTimeField, '––:–– AM');
    });
  });

  describe('labeling', function () {
    it('should support labeling', function () {
      let {getAllByRole, getByTestId, getByText} = render(<DateRangePicker label="Date range" />);

      let label = getByText('Date range');

      let combobox = getAllByRole('group')[0];
      expect(combobox).toHaveAttribute('aria-labelledby', label.id);

      let startDate = getByTestId('start-date');
      expect(startDate).toHaveAttribute('role', 'presentation');
      expect(startDate).not.toHaveAttribute('aria-labelledby');

      let endDate = getByTestId('end-date');
      expect(endDate).toHaveAttribute('role', 'presentation');
      expect(endDate).not.toHaveAttribute('aria-labelledby');

      let button = getAllByRole('button')[0];
      expect(button).toHaveAttribute('aria-label', 'Calendar');
      expect(button).toHaveAttribute('id');
      expect(button).toHaveAttribute('aria-labelledby', `${label.id} ${button.id}`);

      let startSegments = getAllByRoleInContainer(startDate, 'spinbutton');
      for (let segment of startSegments) {
        expect(segment).toHaveAttribute('id');
        expect(segment.getAttribute('aria-label').startsWith('Start Date ')).toBe(true);
        expect(segment).toHaveAttribute('aria-labelledby', `${label.id} ${segment.id}`);
      }

      let endSegments = getAllByRoleInContainer(endDate, 'spinbutton');
      for (let segment of endSegments) {
        expect(segment).toHaveAttribute('id');
        expect(segment.getAttribute('aria-label').startsWith('End Date ')).toBe(true);
        expect(segment).toHaveAttribute('aria-labelledby', `${label.id} ${segment.id}`);
      }
    });

    it('should support labeling with aria-label', function () {
      let {getAllByRole, getByTestId} = render(<DateRangePicker aria-label="Birth date" />);

      let field = getAllByRole('group')[0];
      expect(field).toHaveAttribute('aria-label', 'Birth date');
      expect(field).toHaveAttribute('id');

      let startDate = getByTestId('start-date');
      expect(startDate).toHaveAttribute('role', 'presentation');
      expect(startDate).not.toHaveAttribute('aria-labelledby');

      let endDate = getByTestId('end-date');
      expect(endDate).toHaveAttribute('role', 'presentation');
      expect(endDate).not.toHaveAttribute('aria-labelledby');

      let button = getAllByRole('button')[0];
      expect(button).toHaveAttribute('aria-label', 'Calendar');
      expect(button).toHaveAttribute('id');
      expect(button).toHaveAttribute('aria-labelledby', `${field.id} ${button.id}`);

      let startSegments = getAllByRoleInContainer(startDate, 'spinbutton');
      for (let segment of startSegments) {
        expect(segment).toHaveAttribute('id');
        expect(segment.getAttribute('aria-label').startsWith('Start Date ')).toBe(true);
        expect(segment).toHaveAttribute('aria-labelledby', `${field.id} ${segment.id}`);
      }

      let endSegments = getAllByRoleInContainer(endDate, 'spinbutton');
      for (let segment of endSegments) {
        expect(segment).toHaveAttribute('id');
        expect(segment.getAttribute('aria-label').startsWith('End Date ')).toBe(true);
        expect(segment).toHaveAttribute('aria-labelledby', `${field.id} ${segment.id}`);
      }
    });

    it('should support labeling with aria-labelledby', function () {
      let {getAllByRole, getByTestId} = render(<DateRangePicker aria-labelledby="foo" />);

      let field = getAllByRole('group')[0];
      expect(field).toHaveAttribute('aria-labelledby', 'foo');

      let startDate = getByTestId('start-date');
      expect(startDate).toHaveAttribute('role', 'presentation');
      expect(startDate).not.toHaveAttribute('aria-labelledby');

      let endDate = getByTestId('end-date');
      expect(endDate).toHaveAttribute('role', 'presentation');
      expect(endDate).not.toHaveAttribute('aria-labelledby');

      let button = getAllByRole('button')[0];
      expect(button).toHaveAttribute('aria-label', 'Calendar');
      expect(button).toHaveAttribute('id');
      expect(button).toHaveAttribute('aria-labelledby', `foo ${button.id}`);

      let startSegments = getAllByRoleInContainer(startDate, 'spinbutton');
      for (let segment of startSegments) {
        expect(segment).toHaveAttribute('id');
        expect(segment.getAttribute('aria-label').startsWith('Start Date ')).toBe(true);
        expect(segment).toHaveAttribute('aria-labelledby', `foo ${segment.id}`);
      }

      let endSegments = getAllByRoleInContainer(endDate, 'spinbutton');
      for (let segment of endSegments) {
        expect(segment).toHaveAttribute('id');
        expect(segment.getAttribute('aria-label').startsWith('End Date ')).toBe(true);
        expect(segment).toHaveAttribute('aria-labelledby', `foo ${segment.id}`);
      }
    });

    it('should support help text description', function () {
      let {getByRole, getByTestId} = render(<DateRangePicker label="Date" description="Help text" />);

      let group = getByRole('group');
      let startField = getByTestId('start-date');
      let endField = getByTestId('end-date');
      expect(group).toHaveAttribute('aria-describedby');

      let description = document.getElementById(group.getAttribute('aria-describedby'));
      expect(description).toHaveTextContent('Help text');

      let segments = within(startField).getAllByRole('spinbutton');
      expect(segments[0]).toHaveAttribute('aria-describedby', group.getAttribute('aria-describedby'));

      for (let segment of segments.slice(1)) {
        expect(segment).not.toHaveAttribute('aria-describedby');
      }

      segments = within(endField).getAllByRole('spinbutton');
      expect(segments[0]).toHaveAttribute('aria-describedby', group.getAttribute('aria-describedby'));

      for (let segment of segments.slice(1)) {
        expect(segment).not.toHaveAttribute('aria-describedby');
      }
    });

    it('should support error message', function () {
      let {getByRole, getAllByRole} = render(<DateRangePicker label="Date" errorMessage="Error message" validationState="invalid" />);

      let group = getByRole('group');
      expect(group).toHaveAttribute('aria-describedby');

      let description = document.getElementById(group.getAttribute('aria-describedby'));
      expect(description).toHaveTextContent('Error message');

      let segments = getAllByRole('spinbutton');
      for (let segment of segments) {
        expect(segment).toHaveAttribute('aria-describedby', group.getAttribute('aria-describedby'));
      }
    });

    it('should not display error message if not invalid', function () {
      let {getByRole, getAllByRole, getByTestId} = render(<DateRangePicker label="Date" errorMessage="Error message" />);

      let group = getByRole('group');
      let startField = getByTestId('start-date');
      let endField = getByTestId('end-date');
      expect(group).not.toHaveAttribute('aria-describedby');
      expect(startField).not.toHaveAttribute('aria-describedby');
      expect(endField).not.toHaveAttribute('aria-describedby');

      let segments = getAllByRole('spinbutton');
      for (let segment of segments) {
        expect(segment).not.toHaveAttribute('aria-describedby');
      }
    });

    it('should support help text with a value', function () {
      let {getByRole, getByTestId} = render(<DateRangePicker label="Date" description="Help text" value={{start: new CalendarDate(2020, 2, 3), end: new CalendarDate(2020, 2, 10)}} />);

      let group = getByRole('group');
      let startField = getByTestId('start-date');
      let endField = getByTestId('end-date');
      expect(group).toHaveAttribute('aria-describedby');
      expect(startField).not.toHaveAttribute('aria-describedby');
      expect(endField).not.toHaveAttribute('aria-describedby');

      let description = group.getAttribute('aria-describedby').split(' ').map(d => document.getElementById(d).textContent).join(' ');
      expect(description).toBe('Selected Range: February 3 to 10, 2020 Help text');

      let segments = within(startField).getAllByRole('spinbutton');
      description = segments[0].getAttribute('aria-describedby').split(' ').map(d => document.getElementById(d).textContent).join(' ');
      expect(description).toBe('Selected Range: February 3 to 10, 2020 Help text');

      for (let segment of segments.slice(1)) {
        expect(segment).not.toHaveAttribute('aria-describedby');
      }

      segments = within(endField).getAllByRole('spinbutton');
      description = segments[0].getAttribute('aria-describedby').split(' ').map(d => document.getElementById(d).textContent).join(' ');
      expect(description).toBe('Selected Range: February 3 to 10, 2020 Help text');

      for (let segment of segments.slice(1)) {
        expect(segment).not.toHaveAttribute('aria-describedby');
      }
    });

    it('should support error message with a value', function () {
      let {getByRole, getByTestId} = render(<DateRangePicker label="Date" errorMessage="Error message" validationState="invalid" value={{start: new CalendarDate(2020, 2, 3), end: new CalendarDate(2020, 2, 10)}} />);

      let group = getByRole('group');
      let startField = getByTestId('start-date');
      let endField = getByTestId('end-date');
      expect(group).toHaveAttribute('aria-describedby');
      expect(startField).not.toHaveAttribute('aria-describedby');
      expect(endField).not.toHaveAttribute('aria-describedby');

      let description = group.getAttribute('aria-describedby').split(' ').map(d => document.getElementById(d).textContent).join(' ');
      expect(description).toBe('Selected Range: February 3 to 10, 2020 Error message');

      let segments = within(startField).getAllByRole('spinbutton');
      for (let segment of segments) {
        description = segment.getAttribute('aria-describedby').split(' ').map(d => document.getElementById(d).textContent).join(' ');
        expect(description).toBe('Selected Range: February 3 to 10, 2020 Error message');
      }

      segments = within(endField).getAllByRole('spinbutton');
      for (let segment of segments) {
        description = segment.getAttribute('aria-describedby').split(' ').map(d => document.getElementById(d).textContent).join(' ');
        expect(description).toBe('Selected Range: February 3 to 10, 2020 Error message');
      }
    });

    it('should have selected range description with a time', function () {
      let {getByRole, getByTestId} = render(<DateRangePicker label="Date" value={{start: new CalendarDateTime(2020, 2, 3, 8), end: new CalendarDateTime(2020, 2, 10, 10)}} />);

      let group = getByRole('group');
      let startField = getByTestId('start-date');
      let endField = getByTestId('end-date');
      expect(group).toHaveAttribute('aria-describedby');
      expect(startField).not.toHaveAttribute('aria-describedby');
      expect(endField).not.toHaveAttribute('aria-describedby');

      let description = group.getAttribute('aria-describedby').split(' ').map(d => document.getElementById(d).textContent).join(' ');
      expect(description).toBe('Selected Range: February 3, 2020 at 8:00 AM to February 10, 2020 at 10:00 AM');
    });

    it('should handle selected range description when start and end dates are the same', function () {
      let {getByRole, getByTestId} = render(<DateRangePicker label="Date" value={{start: new CalendarDateTime(2020, 2, 3, 8), end: new CalendarDateTime(2020, 2, 3, 8)}} />);

      let group = getByRole('group');
      let startField = getByTestId('start-date');
      let endField = getByTestId('end-date');
      expect(group).toHaveAttribute('aria-describedby');
      expect(startField).not.toHaveAttribute('aria-describedby');
      expect(endField).not.toHaveAttribute('aria-describedby');

      let description = group.getAttribute('aria-describedby').split(' ').map(d => document.getElementById(d).textContent).join(' ');
      expect(description).toBe('Selected Range: February 3, 2020 at 8:00 AM to February 3, 2020 at 8:00 AM');
    });

    it('should support format help text', function () {
      let {getAllByRole, getByText, getByRole, getByTestId} = render(<DateRangePicker label="Date" showFormatHelpText />);

      // Not needed in aria-described by because each segment has a label already, so this would be duplicative.
      let group = getByRole('group');
      let startField = getByTestId('start-date');
      let endField = getByTestId('end-date');
      expect(group).not.toHaveAttribute('aria-describedby');
      expect(startField).not.toHaveAttribute('aria-describedby');
      expect(endField).not.toHaveAttribute('aria-describedby');

      expect(getByText('month / day / year')).toBeVisible();

      let segments = getAllByRole('spinbutton');
      for (let segment of segments) {
        expect(segment).not.toHaveAttribute('aria-describedby');
      }
    });

    it('should include era for BC dates', function () {
      let {getAllByRole} = render(<DateRangePicker label="Date" value={{start: new CalendarDate('BC', 1, 12, 3), end: new CalendarDate(1, 1, 10)}} />);
      let group = getAllByRole('group')[0];
      expect(group).toHaveAttribute('aria-describedby');

      let description = group.getAttribute('aria-describedby').split(' ').map(d => document.getElementById(d).textContent).join(' ');
      expect(description).toBe('Selected Range: December 3, 1 BC to January 10, 1 AD');

      let segments = getAllByRole('spinbutton');
      expect(segments[3]).toHaveTextContent('BC');
    });
  });

  describe('focus management', function () {
    it('should focus the first segment of each field on mouse down', function () {
      let {getByTestId} = render(<DateRangePicker label="Date range" />);
      let startDate = getByTestId('start-date');
      let endDate = getByTestId('end-date');
      let startSegments = getAllByRoleInContainer(startDate, 'spinbutton');
      let endSegments = getAllByRoleInContainer(endDate, 'spinbutton');

      triggerPress(startDate);
      expect(startSegments[0]).toHaveFocus();

      act(() => document.activeElement.blur());

      triggerPress(endDate);
      expect(endSegments[0]).toHaveFocus();
    });

    it('should focus the first segment of the end date on mouse down on the dash', function () {
      let {getByTestId} = render(<DateRangePicker label="Date range" />);
      let rangeDash = getByTestId('date-range-dash');
      let startDate = getByTestId('start-date');
      let startSegments = getAllByRoleInContainer(startDate, 'spinbutton');

      fireEvent(rangeDash, pointerEvent('pointerdown', {pointerId: 1, pointerType: 'mouse'}));
      triggerPress(rangeDash);
      expect(startSegments[0]).toHaveFocus();
    });
  });

  describe('editing', function () {
    // Testing of individual segments is in the DatePicker tests.
    // The following are some simple tests to ensure range editing specifically works.

    it('should edit a date range with the arrow keys (uncontrolled)', function () {
      let onChange = jest.fn();
      let {getByLabelText} = render(
        <DateRangePicker
          label="Date range"
          defaultValue={{start: new CalendarDate(2019, 2, 3), end: new CalendarDate(2019, 5, 6)}}
          onChange={onChange} />
      );

      let startMonth = getByLabelText('Start Date month');
      expect(startMonth).toHaveTextContent('2');
      act(() => {startMonth.focus();});
      fireEvent.keyDown(startMonth, {key: 'ArrowDown'});

      expect(startMonth).toHaveTextContent('1'); // uncontrolled
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({start: new CalendarDate(2019, 1, 3), end: new CalendarDate(2019, 5, 6)});

      let endYear = getByLabelText('End Date year');
      expect(endYear).toHaveTextContent('2019');
      act(() => {endYear.focus();});
      fireEvent.keyDown(endYear, {key: 'ArrowUp'});

      expect(endYear).toHaveTextContent('2020'); // uncontrolled
      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange).toHaveBeenCalledWith({start: new CalendarDate(2019, 1, 3), end: new CalendarDate(2020, 5, 6)});
    });

    it('should edit a date range with the arrow keys (controlled)', function () {
      let onChange = jest.fn();
      let {getByLabelText} = render(
        <DateRangePicker
          label="Date range"
          value={{start: new CalendarDate(2019, 2, 3), end: new CalendarDate(2019, 5, 6)}}
          onChange={onChange} />
      );

      let startMonth = getByLabelText('Start Date month');
      expect(startMonth).toHaveTextContent('2');
      act(() => {startMonth.focus();});
      fireEvent.keyDown(startMonth, {key: 'ArrowDown'});

      expect(startMonth).toHaveTextContent('2'); // controlled
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({start: new CalendarDate(2019, 1, 3), end: new CalendarDate(2019, 5, 6)});

      let endYear = getByLabelText('End Date year');
      expect(endYear).toHaveTextContent('2019');
      act(() => {endYear.focus();});
      fireEvent.keyDown(endYear, {key: 'ArrowUp'});

      expect(endYear).toHaveTextContent('2019'); // controlled
      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange).toHaveBeenCalledWith({start: new CalendarDate(2019, 2, 3), end: new CalendarDate(2020, 5, 6)});
    });

    it('should edit a date range by entering text (uncontrolled)', function () {
      let onChange = jest.fn();
      let {getByLabelText} = render(
        <DateRangePicker
          label="Date range"
          defaultValue={{start: new CalendarDate(2019, 2, 3), end: new CalendarDate(2019, 5, 6)}}
          onChange={onChange} />
      );

      let startMonth = getByLabelText('Start Date month');
      act(() => {startMonth.focus();});
      beforeInput(startMonth, '8');

      expect(startMonth).toHaveTextContent('8'); // uncontrolled
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({start: new CalendarDate(2019, 8, 3), end: new CalendarDate(2019, 5, 6)});

      expect(getByLabelText('Start Date day')).toHaveFocus();

      let endYear = getByLabelText('End Date year');
      expect(endYear).toHaveTextContent('2019');
      act(() => {endYear.focus();});
      beforeInput(endYear, '2');
      beforeInput(endYear, '0');
      beforeInput(endYear, '2');
      beforeInput(endYear, '2');

      expect(endYear).toHaveTextContent('2022'); // uncontrolled
      expect(onChange).toHaveBeenCalledTimes(5);
      expect(onChange).toHaveBeenCalledWith({start: new CalendarDate(2019, 8, 3), end: new CalendarDate(2022, 5, 6)});
    });

    it('should edit a date range by entering text (controlled)', function () {
      let onChange = jest.fn();
      let {getByLabelText} = render(
        <DateRangePicker
          label="Date range"
          value={{start: new CalendarDate(2019, 2, 3), end: new CalendarDate(2019, 5, 6)}}
          onChange={onChange} />
      );

      let startMonth = getByLabelText('Start Date month');
      act(() => {startMonth.focus();});
      beforeInput(startMonth, '8');

      expect(startMonth).toHaveTextContent('2'); // controlled
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({start: new CalendarDate(2019, 8, 3), end: new CalendarDate(2019, 5, 6)});

      expect(getByLabelText('Start Date day')).toHaveFocus();

      let endDay = getByLabelText('End Date day');
      expect(endDay).toHaveTextContent('6');
      act(() => {endDay.focus();});
      beforeInput(endDay, '4');

      expect(endDay).toHaveTextContent('6'); // controlled
      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange).toHaveBeenCalledWith({start: new CalendarDate(2019, 2, 3), end: new CalendarDate(2019, 5, 4)});
    });

    it('should support backspace (uncontrolled)', function () {
      let onChange = jest.fn();
      let {getByLabelText} = render(
        <DateRangePicker
          label="Date range"
          defaultValue={{start: new CalendarDate(2019, 2, 3), end: new CalendarDate(2019, 5, 6)}}
          onChange={onChange} />
      );

      let endYear = getByLabelText('End Date year');
      expect(endYear).toHaveTextContent('2019');
      act(() => {endYear.focus();});
      fireEvent.keyDown(endYear, {key: 'Backspace'});

      expect(endYear).toHaveTextContent('201'); // uncontrolled
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({start: new CalendarDate(2019, 2, 3), end: new CalendarDate(201, 5, 6)});
    });

    it('should support backspace (controlled)', function () {
      let onChange = jest.fn();
      let {getByLabelText} = render(
        <DateRangePicker
          label="Date range"
          value={{start: new CalendarDate(2019, 2, 3), end: new CalendarDate(2019, 5, 6)}}
          onChange={onChange} />
      );

      let endYear = getByLabelText('End Date year');
      expect(endYear).toHaveTextContent('2019');
      act(() => {endYear.focus();});
      fireEvent.keyDown(endYear, {key: 'Backspace'});

      expect(endYear).toHaveTextContent('2019'); // controlled
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({start: new CalendarDate(2019, 2, 3), end: new CalendarDate(201, 5, 6)});
    });
  });

  describe('validation', function () {
    it('should display an error icon when the start date is less than the minimum (controlled)', function () {
      let {getByTestId} = render(
        <DateRangePicker
          label="Date range"
          value={{start: new CalendarDate(1980, 1, 1), end: new CalendarDate(1999, 2, 3)}}
          minValue={new CalendarDate(1985, 1, 1)} />
      );
      expect(getByTestId('invalid-icon')).toBeVisible();
    });

    it('should display an error icon when the start date is less than the minimum (uncontrolled)', function () {
      let {getByTestId, getByLabelText} = render(
        <DateRangePicker
          label="Date range"
          defaultValue={{start: new CalendarDate(1985, 1, 1), end: new CalendarDate(1999, 2, 3)}}
          minValue={new CalendarDate(1985, 1, 1)} />
      );
      expect(() => getByTestId('invalid-icon')).toThrow();

      let year = getByLabelText('Start Date year');
      fireEvent.keyDown(year, {key: 'ArrowDown'});

      expect(getByTestId('invalid-icon')).toBeVisible();

      fireEvent.keyDown(year, {key: 'ArrowUp'});
      expect(() => getByTestId('invalid-icon')).toThrow();
    });

    it('should display an error icon when the start date is greater than the maximum (controlled)', function () {
      let {getByTestId} = render(
        <DateRangePicker
          label="Date range"
          value={{start: new CalendarDate(1990, 1, 1), end: new CalendarDate(1999, 2, 3)}}
          maxValue={new CalendarDate(1985, 1, 1)} />
      );
      expect(getByTestId('invalid-icon')).toBeVisible();
    });

    it('should display an error icon when the start date is greater than the maximum (uncontrolled)', function () {
      let {getByTestId, getByLabelText} = render(
        <DateRangePicker
          label="Date range"
          defaultValue={{start: new CalendarDate(1984, 2, 1), end: new CalendarDate(1984, 2, 3)}}
          maxValue={new CalendarDate(1985, 1, 1)} />
      );
      expect(() => getByTestId('invalid-icon')).toThrow();

      let year = getByLabelText('Start Date year');
      fireEvent.keyDown(year, {key: 'ArrowUp'});

      expect(getByTestId('invalid-icon')).toBeVisible();

      fireEvent.keyDown(year, {key: 'ArrowDown'});
      expect(() => getByTestId('invalid-icon')).toThrow();
    });

    it('should display an error icon when the end date is greater than the maximum (controlled)', function () {
      let {getByTestId} = render(
        <DateRangePicker
          label="Date range"
          value={{start: new CalendarDate(1980, 1, 1), end: new CalendarDate(1999, 2, 3)}}
          maxValue={new CalendarDate(1985, 1, 1)} />
      );
      expect(getByTestId('invalid-icon')).toBeVisible();
    });

    it('should display an error icon when the end date is greater than the maximum (uncontrolled)', function () {
      let {getByTestId, getByLabelText} = render(
        <DateRangePicker
          label="Date range"
          defaultValue={{start: new CalendarDate(1980, 2, 1), end: new CalendarDate(1984, 2, 3)}}
          maxValue={new CalendarDate(1985, 1, 1)} />
      );
      expect(() => getByTestId('invalid-icon')).toThrow();

      let year = getByLabelText('End Date year');
      fireEvent.keyDown(year, {key: 'ArrowUp'});

      expect(getByTestId('invalid-icon')).toBeVisible();

      fireEvent.keyDown(year, {key: 'ArrowDown'});
      expect(() => getByTestId('invalid-icon')).toThrow();
    });

    it('should display an error icon when the end date is less than the start date (controlled)', function () {
      let {getByTestId} = render(
        <DateRangePicker
          label="Date range"
          value={{start: new CalendarDate(1990, 1, 1), end: new CalendarDate(1980, 2, 3)}} />
      );
      expect(getByTestId('invalid-icon')).toBeVisible();
    });

    it('should display an error icon when the end date is less than the start date (uncontrolled)', function () {
      let {getByTestId, getByLabelText} = render(
        <DateRangePicker
          label="Date range"
          defaultValue={{start: new CalendarDate(1980, 2, 1), end: new CalendarDate(1980, 2, 3)}} />
      );
      expect(() => getByTestId('invalid-icon')).toThrow();

      let year = getByLabelText('End Date year');
      fireEvent.keyDown(year, {key: 'ArrowDown'});

      expect(getByTestId('invalid-icon')).toBeVisible();

      fireEvent.keyDown(year, {key: 'ArrowUp'});
      expect(() => getByTestId('invalid-icon')).toThrow();
    });
  });

  describe('placeholder', function () {
    it('should display a placeholder if no value is provided', function () {
      let onChange = jest.fn();
      let {getByTestId} = render(<DateRangePicker label="Date range" onChange={onChange} />);

      let startDate = getByTestId('start-date');
      let endDate = getByTestId('end-date');
      expectPlaceholder(startDate, 'mm/dd/yyyy');
      expectPlaceholder(endDate, 'mm/dd/yyyy');
    });

    it('should display a placeholder if the value prop is null', function () {
      let onChange = jest.fn();
      let {getByTestId} = render(<DateRangePicker label="Date range" onChange={onChange} value={null} />);

      let startDate = getByTestId('start-date');
      let endDate = getByTestId('end-date');
      expectPlaceholder(startDate, 'mm/dd/yyyy');
      expectPlaceholder(endDate, 'mm/dd/yyyy');
    });

    it('should use the placeholderValue prop if provided', function () {
      let onChange = jest.fn();
      let {getByTestId} = render(<DateRangePicker label="Date range" onChange={onChange} placeholderValue={new CalendarDate(1980, 1, 1)} />);

      let startDate = getByTestId('start-date');
      let endDate = getByTestId('end-date');
      expectPlaceholder(startDate, 'mm/dd/yyyy');
      expectPlaceholder(endDate, 'mm/dd/yyyy');
    });

    it('should not fire onChange until both start and end dates have been entered', function () {
      let onChange = jest.fn();
      let {getByTestId, getAllByRole} = render(<DateRangePicker label="Date range" onChange={onChange} />);

      let startDate = getByTestId('start-date');
      let endDate = getByTestId('end-date');

      expectPlaceholder(startDate, 'mm/dd/yyyy');
      expectPlaceholder(endDate, 'mm/dd/yyyy');

      let segments = getAllByRole('spinbutton');
      act(() => {segments[0].focus();});

      beforeInput(document.activeElement, '2');
      expectPlaceholder(startDate, '2/dd/yyyy');
      expect(segments[1]).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();

      beforeInput(document.activeElement, '3');
      expectPlaceholder(startDate, '2/3/yyyy');
      expect(segments[2]).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();

      beforeInput(document.activeElement, '2');
      beforeInput(document.activeElement, '0');
      beforeInput(document.activeElement, '2');
      beforeInput(document.activeElement, '0');
      expectPlaceholder(startDate, '2/3/2020');
      expect(segments[3]).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();

      beforeInput(document.activeElement, '4');
      expectPlaceholder(endDate, '4/dd/yyyy');
      expect(segments[4]).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();

      beforeInput(document.activeElement, '8');
      expectPlaceholder(endDate, '4/8/yyyy');
      expect(segments[5]).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();

      beforeInput(document.activeElement, '2');
      expect(onChange).toHaveBeenCalledTimes(1);
      beforeInput(document.activeElement, '0');
      expect(onChange).toHaveBeenCalledTimes(2);
      beforeInput(document.activeElement, '2');
      expect(onChange).toHaveBeenCalledTimes(3);
      beforeInput(document.activeElement, '2');
      expect(onChange).toHaveBeenCalledTimes(4);

      expect(onChange).toHaveBeenCalledWith({start: new CalendarDate(2020, 2, 3), end: new CalendarDate(2022, 4, 8)});
    });

    it('should reset to the placeholder if controlled value is set to null', function () {
      let onChange = jest.fn();
      let {getByTestId, rerender} = render(<DateRangePicker label="Date" onChange={onChange} value={{start: new CalendarDate(2020, 2, 3), end: new CalendarDate(2022, 4, 8)}} />);

      let startDate = getByTestId('start-date');
      let endDate = getByTestId('end-date');

      let formatter = new Intl.DateTimeFormat('en-US');
      expectPlaceholder(startDate, formatter.format(new Date(2020, 1, 3)));
      expectPlaceholder(endDate, formatter.format(new Date(2022, 3, 8)));

      rerender(<DateRangePicker label="Date" onChange={onChange} value={null} />);

      expectPlaceholder(startDate, 'mm/dd/yyyy');
      expectPlaceholder(endDate, 'mm/dd/yyyy');
    });
  });
});
