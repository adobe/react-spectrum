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

import {act, fireEvent, getAllByRole as getAllByRoleInContainer, render} from '@testing-library/react';
import {CalendarDate, CalendarDateTime, getLocalTimeZone, today} from '@internationalized/date';
import {DateRangePicker} from '../';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {theme} from '@react-spectrum/theme-default';
import {triggerPress} from '@react-spectrum/test-utils';

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
  let e = new InputEvent('beforeinput', {cancelable: true, data: key});
  e.inputType = 'insertText';
  fireEvent(target, e);
}

describe('DateRangePicker', function () {
  // there are live announcers, we need to be able to get rid of them after each test or get a warning in the console about act()
  beforeAll(() => jest.useFakeTimers());
  afterAll(() => jest.useRealTimers());
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

      expect(segments[0].textContent).toBe('2');
      expect(segments[0].getAttribute('aria-label')).toBe('Month');
      expect(segments[0].getAttribute('aria-valuenow')).toBe('2');
      expect(segments[0].getAttribute('aria-valuetext')).toBe('2 − February');
      expect(segments[0].getAttribute('aria-valuemin')).toBe('1');
      expect(segments[0].getAttribute('aria-valuemax')).toBe('12');

      expect(segments[1].textContent).toBe('3');
      expect(segments[1].getAttribute('aria-label')).toBe('Day');
      expect(segments[1].getAttribute('aria-valuenow')).toBe('3');
      expect(segments[1].getAttribute('aria-valuetext')).toBe('3');
      expect(segments[1].getAttribute('aria-valuemin')).toBe('1');
      expect(segments[1].getAttribute('aria-valuemax')).toBe('28');

      expect(segments[2].textContent).toBe('2019');
      expect(segments[2].getAttribute('aria-label')).toBe('Year');
      expect(segments[2].getAttribute('aria-valuenow')).toBe('2019');
      expect(segments[2].getAttribute('aria-valuetext')).toBe('2019');
      expect(segments[2].getAttribute('aria-valuemin')).toBe('1');
      expect(segments[2].getAttribute('aria-valuemax')).toBe('9999');

      expect(segments[3].textContent).toBe('5');
      expect(segments[3].getAttribute('aria-label')).toBe('Month');
      expect(segments[3].getAttribute('aria-valuenow')).toBe('5');
      expect(segments[3].getAttribute('aria-valuetext')).toBe('5 − May');
      expect(segments[3].getAttribute('aria-valuemin')).toBe('1');
      expect(segments[3].getAttribute('aria-valuemax')).toBe('12');

      expect(segments[4].textContent).toBe('6');
      expect(segments[4].getAttribute('aria-label')).toBe('Day');
      expect(segments[4].getAttribute('aria-valuenow')).toBe('6');
      expect(segments[4].getAttribute('aria-valuetext')).toBe('6');
      expect(segments[4].getAttribute('aria-valuemin')).toBe('1');
      expect(segments[4].getAttribute('aria-valuemax')).toBe('31');

      expect(segments[5].textContent).toBe('2019');
      expect(segments[5].getAttribute('aria-label')).toBe('Year');
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

      expect(segments[0].textContent).toBe('2');
      expect(segments[0].getAttribute('aria-label')).toBe('Month');
      expect(segments[0].getAttribute('aria-valuenow')).toBe('2');
      expect(segments[0].getAttribute('aria-valuetext')).toBe('2 − February');
      expect(segments[0].getAttribute('aria-valuemin')).toBe('1');
      expect(segments[0].getAttribute('aria-valuemax')).toBe('12');

      expect(segments[1].textContent).toBe('3');
      expect(segments[1].getAttribute('aria-label')).toBe('Day');
      expect(segments[1].getAttribute('aria-valuenow')).toBe('3');
      expect(segments[1].getAttribute('aria-valuetext')).toBe('3');
      expect(segments[1].getAttribute('aria-valuemin')).toBe('1');
      expect(segments[1].getAttribute('aria-valuemax')).toBe('28');

      expect(segments[2].textContent).toBe('2019');
      expect(segments[2].getAttribute('aria-label')).toBe('Year');
      expect(segments[2].getAttribute('aria-valuenow')).toBe('2019');
      expect(segments[2].getAttribute('aria-valuetext')).toBe('2019');
      expect(segments[2].getAttribute('aria-valuemin')).toBe('1');
      expect(segments[2].getAttribute('aria-valuemax')).toBe('9999');

      expect(segments[3].textContent).toBe('12');
      expect(segments[3].getAttribute('aria-label')).toBe('Hour');
      expect(segments[3].getAttribute('aria-valuenow')).toBe('0');
      expect(segments[3].getAttribute('aria-valuetext')).toBe('12 AM');
      expect(segments[3].getAttribute('aria-valuemin')).toBe('0');
      expect(segments[3].getAttribute('aria-valuemax')).toBe('11');

      expect(segments[4].textContent).toBe('00');
      expect(segments[4].getAttribute('aria-label')).toBe('Minute');
      expect(segments[4].getAttribute('aria-valuenow')).toBe('0');
      expect(segments[4].getAttribute('aria-valuetext')).toBe('00');
      expect(segments[4].getAttribute('aria-valuemin')).toBe('0');
      expect(segments[4].getAttribute('aria-valuemax')).toBe('59');

      expect(segments[5].textContent).toBe('00');
      expect(segments[5].getAttribute('aria-label')).toBe('Second');
      expect(segments[5].getAttribute('aria-valuenow')).toBe('0');
      expect(segments[5].getAttribute('aria-valuetext')).toBe('00');
      expect(segments[5].getAttribute('aria-valuemin')).toBe('0');
      expect(segments[5].getAttribute('aria-valuemax')).toBe('59');

      expect(segments[6].textContent).toBe('AM');
      expect(segments[6].getAttribute('aria-label')).toBe('Day Period');
      expect(segments[6].getAttribute('aria-valuetext')).toBe('12 AM');

      expect(segments[7].textContent).toBe('5');
      expect(segments[7].getAttribute('aria-label')).toBe('Month');
      expect(segments[7].getAttribute('aria-valuenow')).toBe('5');
      expect(segments[7].getAttribute('aria-valuetext')).toBe('5 − May');
      expect(segments[7].getAttribute('aria-valuemin')).toBe('1');
      expect(segments[7].getAttribute('aria-valuemax')).toBe('12');

      expect(segments[8].textContent).toBe('6');
      expect(segments[8].getAttribute('aria-label')).toBe('Day');
      expect(segments[8].getAttribute('aria-valuenow')).toBe('6');
      expect(segments[8].getAttribute('aria-valuetext')).toBe('6');
      expect(segments[8].getAttribute('aria-valuemin')).toBe('1');
      expect(segments[8].getAttribute('aria-valuemax')).toBe('31');

      expect(segments[9].textContent).toBe('2019');
      expect(segments[9].getAttribute('aria-label')).toBe('Year');
      expect(segments[9].getAttribute('aria-valuenow')).toBe('2019');
      expect(segments[9].getAttribute('aria-valuetext')).toBe('2019');
      expect(segments[9].getAttribute('aria-valuemin')).toBe('1');
      expect(segments[9].getAttribute('aria-valuemax')).toBe('9999');

      expect(segments[10].textContent).toBe('12');
      expect(segments[10].getAttribute('aria-label')).toBe('Hour');
      expect(segments[10].getAttribute('aria-valuenow')).toBe('0');
      expect(segments[10].getAttribute('aria-valuetext')).toBe('12 AM');
      expect(segments[10].getAttribute('aria-valuemin')).toBe('0');
      expect(segments[10].getAttribute('aria-valuemax')).toBe('11');

      expect(segments[11].textContent).toBe('00');
      expect(segments[11].getAttribute('aria-label')).toBe('Minute');
      expect(segments[11].getAttribute('aria-valuenow')).toBe('0');
      expect(segments[11].getAttribute('aria-valuetext')).toBe('00');
      expect(segments[11].getAttribute('aria-valuemin')).toBe('0');
      expect(segments[11].getAttribute('aria-valuemax')).toBe('59');

      expect(segments[12].textContent).toBe('00');
      expect(segments[12].getAttribute('aria-label')).toBe('Second');
      expect(segments[12].getAttribute('aria-valuenow')).toBe('0');
      expect(segments[12].getAttribute('aria-valuetext')).toBe('00');
      expect(segments[12].getAttribute('aria-valuemin')).toBe('0');
      expect(segments[12].getAttribute('aria-valuemax')).toBe('59');

      expect(segments[13].textContent).toBe('AM');
      expect(segments[13].getAttribute('aria-label')).toBe('Day Period');
      expect(segments[13].getAttribute('aria-valuetext')).toBe('12 AM');
    });
  });

  describe('calendar popover', function () {
    it('should emit onChange when selecting a date range in the calendar in uncontrolled mode', function () {
      let onChange = jest.fn();
      let {getByRole, getAllByRole, getByLabelText} = render(
        <Provider theme={theme}>
          <DateRangePicker label="Date range" defaultValue={{start: new CalendarDate(2019, 2, 3), end: new CalendarDate(2019, 5, 6)}} onChange={onChange} />
        </Provider>
      );

      let startDate = getByLabelText('Start Date');
      let endDate = getByLabelText('End Date');
      expect(startDate).toHaveTextContent('2/3/2019');
      expect(endDate).toHaveTextContent('5/6/2019');

      let button = getByRole('button');
      triggerPress(button);

      let dialog = getByRole('dialog');
      expect(dialog).toBeVisible();

      let cells = getAllByRole('gridcell');
      let selected = cells.filter(cell => cell.getAttribute('aria-selected') === 'true');
      expect(selected[0].children[0]).toHaveAttribute('aria-label', 'Sunday, February 3, 2019 selected (Click to start selecting date range)');

      triggerPress(getByLabelText('Sunday, February 10, 2019 selected'));
      triggerPress(getByLabelText('Sunday, February 17, 2019'));

      expect(dialog).not.toBeInTheDocument();
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({start: new CalendarDate(2019, 2, 10), end: new CalendarDate(2019, 2, 17)});
      expect(startDate).toHaveTextContent('2/10/2019'); // uncontrolled
      expect(endDate).toHaveTextContent('2/17/2019');
    });
  });

  describe('labeling', function () {
    it('should support labeling', function () {
      let {getAllByRole, getByLabelText, getByText} = render(<DateRangePicker label="Date range" />);

      let label = getByText('Date range');

      let combobox = getAllByRole('group')[0];
      expect(combobox).toHaveAttribute('aria-labelledby', label.id);

      let startDate = getByLabelText('Start Date');
      expect(startDate).toHaveAttribute('aria-labelledby', `${label.id} ${startDate.id}`);

      let endDate = getByLabelText('End Date');
      expect(endDate).toHaveAttribute('aria-labelledby', `${label.id} ${endDate.id}`);

      let button = getAllByRole('button')[0];
      expect(button).toHaveAttribute('aria-label', 'Calendar');
      expect(button).toHaveAttribute('id');
      expect(button).toHaveAttribute('aria-labelledby', `${label.id} ${button.id}`);

      let startSegments = getAllByRoleInContainer(startDate, 'spinbutton');
      for (let segment of startSegments) {
        expect(segment).toHaveAttribute('id');
        expect(segment).toHaveAttribute('aria-labelledby', `${label.id} ${startDate.id} ${segment.id}`);
      }

      let endSegments = getAllByRoleInContainer(endDate, 'spinbutton');
      for (let segment of endSegments) {
        expect(segment).toHaveAttribute('id');
        expect(segment).toHaveAttribute('aria-labelledby', `${label.id} ${endDate.id} ${segment.id}`);
      }
    });

    it('should support labeling with aria-label', function () {
      let {getAllByRole, getByLabelText} = render(<DateRangePicker aria-label="Birth date" />);

      let field = getAllByRole('group')[0];
      expect(field).toHaveAttribute('aria-label', 'Birth date');
      expect(field).toHaveAttribute('id');

      let startDate = getByLabelText('Start Date');
      expect(startDate).toHaveAttribute('aria-labelledby', `${field.id} ${startDate.id}`);

      let endDate = getByLabelText('End Date');
      expect(endDate).toHaveAttribute('aria-labelledby', `${field.id} ${endDate.id}`);

      let button = getAllByRole('button')[0];
      expect(button).toHaveAttribute('aria-label', 'Calendar');
      expect(button).toHaveAttribute('id');
      expect(button).toHaveAttribute('aria-labelledby', `${field.id} ${button.id}`);

      let startSegments = getAllByRoleInContainer(startDate, 'spinbutton');
      for (let segment of startSegments) {
        expect(segment).toHaveAttribute('id');
        expect(segment).toHaveAttribute('aria-labelledby', `${field.id} ${startDate.id} ${segment.id}`);
      }

      let endSegments = getAllByRoleInContainer(endDate, 'spinbutton');
      for (let segment of endSegments) {
        expect(segment).toHaveAttribute('id');
        expect(segment).toHaveAttribute('aria-labelledby', `${field.id} ${endDate.id} ${segment.id}`);
      }
    });

    it('should support labeling with aria-labelledby', function () {
      let {getAllByRole, getByLabelText} = render(<DateRangePicker aria-labelledby="foo" />);

      let field = getAllByRole('group')[0];
      expect(field).toHaveAttribute('aria-labelledby', 'foo');

      let startDate = getByLabelText('Start Date');
      expect(startDate).toHaveAttribute('aria-labelledby', `foo ${startDate.id}`);

      let endDate = getByLabelText('End Date');
      expect(endDate).toHaveAttribute('aria-labelledby', `foo ${endDate.id}`);

      let button = getAllByRole('button')[0];
      expect(button).toHaveAttribute('aria-label', 'Calendar');
      expect(button).toHaveAttribute('id');
      expect(button).toHaveAttribute('aria-labelledby', `foo ${button.id}`);

      let startSegments = getAllByRoleInContainer(startDate, 'spinbutton');
      for (let segment of startSegments) {
        expect(segment).toHaveAttribute('id');
        expect(segment).toHaveAttribute('aria-labelledby', `foo ${startDate.id} ${segment.id}`);
      }

      let endSegments = getAllByRoleInContainer(endDate, 'spinbutton');
      for (let segment of endSegments) {
        expect(segment).toHaveAttribute('id');
        expect(segment).toHaveAttribute('aria-labelledby', `foo ${endDate.id} ${segment.id}`);
      }
    });
  });

  describe('focus management', function () {
    it('should focus the first segment of each field on mouse down', function () {
      let {getByLabelText} = render(<DateRangePicker label="Date range" />);
      let startDate = getByLabelText('Start Date');
      let endDate = getByLabelText('End Date');
      let startSegments = getAllByRoleInContainer(startDate, 'spinbutton');
      let endSegments = getAllByRoleInContainer(endDate, 'spinbutton');

      triggerPress(startDate);
      expect(startSegments[startSegments.length - 1]).toHaveFocus();

      act(() => document.activeElement.blur());

      triggerPress(endDate);
      expect(endSegments[endSegments.length - 1]).toHaveFocus();
    });

    it('should focus the first segment of the end date on mouse down on the dash', function () {
      let {getByTestId, getByLabelText} = render(<DateRangePicker label="Date range" />);
      let rangeDash = getByTestId('date-range-dash');
      let endDate = getByLabelText('End Date');
      let endSegments = getAllByRoleInContainer(endDate, 'spinbutton');

      fireEvent(rangeDash, pointerEvent('pointerdown', {pointerId: 1, pointerType: 'mouse'}));
      triggerPress(rangeDash);
      expect(endSegments[0]).toHaveFocus();
    });
  });

  describe('editing', function () {
    // Testing of individual segments is in the DatePicker tests.
    // The following are some simple tests to ensure range editing specifically works.

    it('should edit a date range with the arrow keys (uncontrolled)', function () {
      let onChange = jest.fn();
      let {getAllByLabelText} = render(
        <DateRangePicker
          label="Date range"
          defaultValue={{start: new CalendarDate(2019, 2, 3), end: new CalendarDate(2019, 5, 6)}}
          onChange={onChange} />
      );

      let startMonth = getAllByLabelText('Month')[0];
      expect(startMonth).toHaveTextContent('2');
      act(() => {startMonth.focus();});
      fireEvent.keyDown(startMonth, {key: 'ArrowDown'});

      expect(startMonth).toHaveTextContent('1'); // uncontrolled
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({start: new CalendarDate(2019, 1, 3), end: new CalendarDate(2019, 5, 6)});

      let endYear = getAllByLabelText('Year')[1];
      expect(endYear).toHaveTextContent('2019');
      act(() => {endYear.focus();});
      fireEvent.keyDown(endYear, {key: 'ArrowUp'});

      expect(endYear).toHaveTextContent('2020'); // uncontrolled
      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange).toHaveBeenCalledWith({start: new CalendarDate(2019, 1, 3), end: new CalendarDate(2020, 5, 6)});
    });

    it('should edit a date range with the arrow keys (controlled)', function () {
      let onChange = jest.fn();
      let {getAllByLabelText} = render(
        <DateRangePicker
          label="Date range"
          value={{start: new CalendarDate(2019, 2, 3), end: new CalendarDate(2019, 5, 6)}}
          onChange={onChange} />
      );

      let startMonth = getAllByLabelText('Month')[0];
      expect(startMonth).toHaveTextContent('2');
      act(() => {startMonth.focus();});
      fireEvent.keyDown(startMonth, {key: 'ArrowDown'});

      expect(startMonth).toHaveTextContent('2'); // controlled
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({start: new CalendarDate(2019, 1, 3), end: new CalendarDate(2019, 5, 6)});

      let endYear = getAllByLabelText('Year')[1];
      expect(endYear).toHaveTextContent('2019');
      act(() => {endYear.focus();});
      fireEvent.keyDown(endYear, {key: 'ArrowUp'});

      expect(endYear).toHaveTextContent('2019'); // controlled
      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange).toHaveBeenCalledWith({start: new CalendarDate(2019, 2, 3), end: new CalendarDate(2020, 5, 6)});
    });

    it('should edit a date range by entering text (uncontrolled)', function () {
      let onChange = jest.fn();
      let {getAllByLabelText} = render(
        <DateRangePicker
          label="Date range"
          defaultValue={{start: new CalendarDate(2019, 2, 3), end: new CalendarDate(2019, 5, 6)}}
          onChange={onChange} />
      );

      let startMonth = getAllByLabelText('Month')[0];
      act(() => {startMonth.focus();});
      beforeInput(startMonth, '8');

      expect(startMonth).toHaveTextContent('8'); // uncontrolled
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({start: new CalendarDate(2019, 8, 3), end: new CalendarDate(2019, 5, 6)});

      expect(getAllByLabelText('Day')[0]).toHaveFocus();

      let endYear = getAllByLabelText('Year')[1];
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
      let {getAllByLabelText} = render(
        <DateRangePicker
          label="Date range"
          value={{start: new CalendarDate(2019, 2, 3), end: new CalendarDate(2019, 5, 6)}}
          onChange={onChange} />
      );

      let startMonth = getAllByLabelText('Month')[0];
      act(() => {startMonth.focus();});
      beforeInput(startMonth, '8');

      expect(startMonth).toHaveTextContent('2'); // controlled
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({start: new CalendarDate(2019, 8, 3), end: new CalendarDate(2019, 5, 6)});

      expect(getAllByLabelText('Day')[0]).toHaveFocus();

      let endDay = getAllByLabelText('Day')[1];
      expect(endDay).toHaveTextContent('6');
      act(() => {endDay.focus();});
      beforeInput(endDay, '4');

      expect(endDay).toHaveTextContent('6'); // controlled
      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange).toHaveBeenCalledWith({start: new CalendarDate(2019, 2, 3), end: new CalendarDate(2019, 5, 4)});
    });

    it('should support backspace (uncontrolled)', function () {
      let onChange = jest.fn();
      let {getAllByLabelText} = render(
        <DateRangePicker
          label="Date range"
          defaultValue={{start: new CalendarDate(2019, 2, 3), end: new CalendarDate(2019, 5, 6)}}
          onChange={onChange} />
      );

      let endYear = getAllByLabelText('Year')[1];
      expect(endYear).toHaveTextContent('2019');
      act(() => {endYear.focus();});
      fireEvent.keyDown(endYear, {key: 'Backspace'});

      expect(endYear).toHaveTextContent('201'); // uncontrolled
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({start: new CalendarDate(2019, 2, 3), end: new CalendarDate(201, 5, 6)});
    });

    it('should support backspace (controlled)', function () {
      let onChange = jest.fn();
      let {getAllByLabelText} = render(
        <DateRangePicker
          label="Date range"
          value={{start: new CalendarDate(2019, 2, 3), end: new CalendarDate(2019, 5, 6)}}
          onChange={onChange} />
      );

      let endYear = getAllByLabelText('Year')[1];
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
      let {getByTestId, getAllByLabelText} = render(
        <DateRangePicker
          label="Date range"
          defaultValue={{start: new CalendarDate(1985, 1, 1), end: new CalendarDate(1999, 2, 3)}}
          minValue={new CalendarDate(1985, 1, 1)} />
      );
      expect(() => getByTestId('invalid-icon')).toThrow();

      let year = getAllByLabelText('Year')[0];
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
      let {getByTestId, getAllByLabelText} = render(
        <DateRangePicker
          label="Date range"
          defaultValue={{start: new CalendarDate(1984, 2, 1), end: new CalendarDate(1984, 2, 3)}}
          maxValue={new CalendarDate(1985, 1, 1)} />
      );
      expect(() => getByTestId('invalid-icon')).toThrow();

      let year = getAllByLabelText('Year')[0];
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
      let {getByTestId, getAllByLabelText} = render(
        <DateRangePicker
          label="Date range"
          defaultValue={{start: new CalendarDate(1980, 2, 1), end: new CalendarDate(1984, 2, 3)}}
          maxValue={new CalendarDate(1985, 1, 1)} />
      );
      expect(() => getByTestId('invalid-icon')).toThrow();

      let year = getAllByLabelText('Year')[1];
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
      let {getByTestId, getAllByLabelText} = render(
        <DateRangePicker
          label="Date range"
          defaultValue={{start: new CalendarDate(1980, 2, 1), end: new CalendarDate(1980, 2, 3)}} />
      );
      expect(() => getByTestId('invalid-icon')).toThrow();

      let year = getAllByLabelText('Year')[1];
      fireEvent.keyDown(year, {key: 'ArrowDown'});

      expect(getByTestId('invalid-icon')).toBeVisible();

      fireEvent.keyDown(year, {key: 'ArrowUp'});
      expect(() => getByTestId('invalid-icon')).toThrow();
    });
  });

  describe('placeholder', function () {
    it('should display a placeholder date if no value is provided', function () {
      let onChange = jest.fn();
      let {getByLabelText} = render(<DateRangePicker label="Date range" onChange={onChange} />);

      let startDate = getByLabelText('Start Date');
      let endDate = getByLabelText('End Date');
      let today = new Intl.DateTimeFormat('en-US').format(new Date());
      expect(startDate).toHaveTextContent(today);
      expect(endDate).toHaveTextContent(today);
    });

    it('should display a placeholder date if the value prop is null', function () {
      let onChange = jest.fn();
      let {getByLabelText} = render(<DateRangePicker label="Date range" onChange={onChange} value={null} />);

      let startDate = getByLabelText('Start Date');
      let endDate = getByLabelText('End Date');
      let today = new Intl.DateTimeFormat('en-US').format(new Date());
      expect(startDate).toHaveTextContent(today);
      expect(endDate).toHaveTextContent(today);
    });

    it('should use the placeholderValue prop if provided', function () {
      let onChange = jest.fn();
      let {getByLabelText} = render(<DateRangePicker label="Date range" onChange={onChange} placeholderValue={new CalendarDate(1980, 1, 1)} />);

      let startDate = getByLabelText('Start Date');
      let endDate = getByLabelText('End Date');
      expect(startDate).toHaveTextContent('1/1/1980');
      expect(endDate).toHaveTextContent('1/1/1980');
    });

    it('should not fire onChange until both start and end dates have been entered', function () {
      let onChange = jest.fn();
      let {getByLabelText, getAllByRole} = render(<DateRangePicker label="Date range" onChange={onChange} />);

      let startDate = getByLabelText('Start Date');
      let endDate = getByLabelText('End Date');

      let formatter = new Intl.DateTimeFormat('en-US');
      expect(startDate).toHaveTextContent(formatter.format(new Date()));
      expect(endDate).toHaveTextContent(formatter.format(new Date()));

      let segments = getAllByRole('spinbutton');
      act(() => {segments[0].focus();});

      beforeInput(document.activeElement, '2');
      let value = today(getLocalTimeZone()).set({month: 2});
      expect(startDate).toHaveTextContent(formatter.format(value.toDate(getLocalTimeZone())));
      expect(segments[1]).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();

      beforeInput(document.activeElement, '3');
      value = today(getLocalTimeZone()).set({month: 2, day: 3});
      expect(startDate).toHaveTextContent(formatter.format(value.toDate(getLocalTimeZone())));
      expect(segments[2]).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();

      beforeInput(document.activeElement, '2');
      beforeInput(document.activeElement, '0');
      beforeInput(document.activeElement, '2');
      beforeInput(document.activeElement, '0');
      expect(startDate).toHaveTextContent('2/3/2020');
      expect(segments[3]).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();

      beforeInput(document.activeElement, '4');
      value = today(getLocalTimeZone()).set({month: 4});
      expect(endDate).toHaveTextContent(formatter.format(value.toDate(getLocalTimeZone())));
      expect(segments[4]).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();

      beforeInput(document.activeElement, '8');
      value = today(getLocalTimeZone()).set({month: 4, day: 8});
      expect(endDate).toHaveTextContent(formatter.format(value.toDate(getLocalTimeZone())));
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
  });
});
