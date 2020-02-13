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
import {cleanup, fireEvent, getAllByRole as getAllByRoleInContainer, render} from '@testing-library/react';
import {DateRangePicker} from '../';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light-unique.css';
import {triggerPress} from '@react-spectrum/test-utils';

let theme = {
  light: themeLight,
  medium: scaleMedium
};

describe('DateRangePicker', function () {
  afterEach(cleanup);

  describe('basics', function () {
    it('should render a DateRangePicker with a specified date range', function () {
      let {getByRole, getAllByRole} = render(<DateRangePicker value={{start: new Date(2019, 1, 3), end: new Date(2019, 4, 6)}} />);

      let combobox = getByRole('combobox');
      expect(combobox).toBeVisible();
      expect(combobox).not.toHaveAttribute('aria-disabled');
      expect(combobox).not.toHaveAttribute('aria-invalid');

      let segments = getAllByRole('spinbutton');
      expect(segments.length).toBe(6);

      expect(segments[0].textContent).toBe('2');
      expect(segments[0].getAttribute('aria-label')).toBe('Month');
      expect(segments[0].getAttribute('aria-valuenow')).toBe('2');
      expect(segments[0].getAttribute('aria-valuetext')).toBe('February');
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
      expect(segments[3].getAttribute('aria-valuetext')).toBe('May');
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

    it('should render a DateRangePicker with a custom date format', function () {
      let format = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      };
      let {getByRole, getAllByRole} = render(<DateRangePicker value={{start: new Date(2019, 1, 3), end: new Date(2019, 4, 6)}} formatOptions={format} />);

      let combobox = getByRole('combobox');
      expect(combobox).toBeVisible();
      expect(combobox).not.toHaveAttribute('aria-disabled');
      expect(combobox).not.toHaveAttribute('aria-invalid');

      let segments = getAllByRole('spinbutton');
      expect(segments.length).toBe(14);

      expect(segments[0].textContent).toBe('February');
      expect(segments[0].getAttribute('aria-label')).toBe('Month');
      expect(segments[0].getAttribute('aria-valuenow')).toBe('2');
      expect(segments[0].getAttribute('aria-valuetext')).toBe('February');
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

      expect(segments[7].textContent).toBe('May');
      expect(segments[7].getAttribute('aria-label')).toBe('Month');
      expect(segments[7].getAttribute('aria-valuenow')).toBe('5');
      expect(segments[7].getAttribute('aria-valuetext')).toBe('May');
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
          <DateRangePicker defaultValue={{start: new Date(2019, 1, 3), end: new Date(2019, 4, 6)}} onChange={onChange} />
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
      expect(selected[0]).toHaveAttribute('aria-label', 'Sunday, February 3, 2019 selected (Click to start selecting date range)');

      triggerPress(getByLabelText('Sunday, February 10, 2019 selected'));
      triggerPress(getByLabelText('Sunday, February 17, 2019'));

      expect(dialog).not.toBeInTheDocument();
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({start: new Date(2019, 1, 10), end: new Date(2019, 1, 17)});
      expect(startDate).toHaveTextContent('2/10/2019'); // uncontrolled
      expect(endDate).toHaveTextContent('2/17/2019');
    });
  });

  describe('labeling', function () {
    it('should support labeling with a default label', function () {
      let {getByRole, getByLabelText} = render(<DateRangePicker />);

      let combobox = getByRole('combobox');
      expect(combobox).toHaveAttribute('aria-label', 'Date Range');
      expect(combobox).toHaveAttribute('id');

      let startDate = getByLabelText('Start Date');
      expect(startDate).toHaveAttribute('aria-labelledby', `${combobox.id} ${startDate.id}`);

      let endDate = getByLabelText('End Date');
      expect(endDate).toHaveAttribute('aria-labelledby', `${combobox.id} ${endDate.id}`);

      let button = getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Calendar');
      expect(button).toHaveAttribute('id');
      expect(button).toHaveAttribute('aria-labelledby', `${combobox.id} ${button.id}`);

      let startSegments = getAllByRoleInContainer(startDate, 'spinbutton');
      for (let segment of startSegments) {
        expect(segment).toHaveAttribute('id');
        expect(segment).toHaveAttribute('aria-labelledby', `${combobox.id} ${startDate.id} ${segment.id}`);
      }

      let endSegments = getAllByRoleInContainer(endDate, 'spinbutton');
      for (let segment of endSegments) {
        expect(segment).toHaveAttribute('id');
        expect(segment).toHaveAttribute('aria-labelledby', `${combobox.id} ${endDate.id} ${segment.id}`);
      }
    });

    it('should support labeling with aria-label', function () {
      let {getByRole, getByLabelText} = render(<DateRangePicker aria-label="Birth date" />);

      let combobox = getByRole('combobox');
      expect(combobox).toHaveAttribute('aria-label', 'Birth date');
      expect(combobox).toHaveAttribute('id');

      let startDate = getByLabelText('Start Date');
      expect(startDate).toHaveAttribute('aria-labelledby', `${combobox.id} ${startDate.id}`);

      let endDate = getByLabelText('End Date');
      expect(endDate).toHaveAttribute('aria-labelledby', `${combobox.id} ${endDate.id}`);

      let button = getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Calendar');
      expect(button).toHaveAttribute('id');
      expect(button).toHaveAttribute('aria-labelledby', `${combobox.id} ${button.id}`);

      let startSegments = getAllByRoleInContainer(startDate, 'spinbutton');
      for (let segment of startSegments) {
        expect(segment).toHaveAttribute('id');
        expect(segment).toHaveAttribute('aria-labelledby', `${combobox.id} ${startDate.id} ${segment.id}`);
      }

      let endSegments = getAllByRoleInContainer(endDate, 'spinbutton');
      for (let segment of endSegments) {
        expect(segment).toHaveAttribute('id');
        expect(segment).toHaveAttribute('aria-labelledby', `${combobox.id} ${endDate.id} ${segment.id}`);
      }
    });

    it('should support labeling with aria-labelledby', function () {
      let {getByRole, getByLabelText} = render(<DateRangePicker aria-labelledby="foo" />);

      let combobox = getByRole('combobox');
      expect(combobox).not.toHaveAttribute('aria-label');
      expect(combobox).toHaveAttribute('aria-labelledby', 'foo');

      let startDate = getByLabelText('Start Date');
      expect(startDate).toHaveAttribute('aria-labelledby', `foo ${startDate.id}`);

      let endDate = getByLabelText('End Date');
      expect(endDate).toHaveAttribute('aria-labelledby', `foo ${endDate.id}`);

      let button = getByRole('button');
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
    it('should focus the last segment of each field on mouse down', function () {
      let {getByLabelText} = render(<DateRangePicker />);
      let startDate = getByLabelText('Start Date');
      let endDate = getByLabelText('End Date');
      let startSegments = getAllByRoleInContainer(startDate, 'spinbutton');
      let endSegments = getAllByRoleInContainer(endDate, 'spinbutton');

      fireEvent.mouseDown(startDate);
      expect(startSegments[startSegments.length - 1]).toHaveFocus();

      fireEvent.mouseDown(endDate);
      expect(endSegments[endSegments.length - 1]).toHaveFocus();
    });

    it('should focus the first segment of the end date on mouse down on the dash', function () {
      let {getByTestId, getByLabelText} = render(<DateRangePicker />);
      let rangeDash = getByTestId('date-range-dash');
      let endDate = getByLabelText('End Date');
      let endSegments = getAllByRoleInContainer(endDate, 'spinbutton');

      fireEvent.mouseDown(rangeDash);
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
          defaultValue={{start: new Date(2019, 1, 3), end: new Date(2019, 4, 6)}}
          onChange={onChange} />
      );

      let startMonth = getAllByLabelText('Month')[0];
      expect(startMonth).toHaveTextContent('2');
      startMonth.focus();
      fireEvent.keyDown(startMonth, {key: 'ArrowDown'});

      expect(startMonth).toHaveTextContent('1'); // uncontrolled
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({start: new Date(2019, 0, 3), end: new Date(2019, 4, 6)});

      let endYear = getAllByLabelText('Year')[1];
      expect(endYear).toHaveTextContent('2019');
      endYear.focus();
      fireEvent.keyDown(endYear, {key: 'ArrowUp'});

      expect(endYear).toHaveTextContent('2020'); // uncontrolled
      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange).toHaveBeenCalledWith({start: new Date(2019, 0, 3), end: new Date(2020, 4, 6)});
    });

    it('should edit a date range with the arrow keys (controlled)', function () {
      let onChange = jest.fn();
      let {getAllByLabelText} = render(
        <DateRangePicker
          value={{start: new Date(2019, 1, 3), end: new Date(2019, 4, 6)}}
          onChange={onChange} />
      );

      let startMonth = getAllByLabelText('Month')[0];
      expect(startMonth).toHaveTextContent('2');
      startMonth.focus();
      fireEvent.keyDown(startMonth, {key: 'ArrowDown'});

      expect(startMonth).toHaveTextContent('2'); // controlled
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({start: new Date(2019, 0, 3), end: new Date(2019, 4, 6)});

      let endYear = getAllByLabelText('Year')[1];
      expect(endYear).toHaveTextContent('2019');
      endYear.focus();
      fireEvent.keyDown(endYear, {key: 'ArrowUp'});

      expect(endYear).toHaveTextContent('2019'); // controlled
      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange).toHaveBeenCalledWith({start: new Date(2019, 1, 3), end: new Date(2020, 4, 6)});
    });

    it('should edit a date range by entering text (uncontrolled)', function () {
      let onChange = jest.fn();
      let {getAllByLabelText} = render(
        <DateRangePicker
          defaultValue={{start: new Date(2019, 1, 3), end: new Date(2019, 4, 6)}}
          onChange={onChange} />
      );

      let startMonth = getAllByLabelText('Month')[0];
      startMonth.focus();
      fireEvent.keyDown(startMonth, {key: '8'});

      expect(startMonth).toHaveTextContent('8'); // uncontrolled
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({start: new Date(2019, 7, 3), end: new Date(2019, 4, 6)});

      expect(getAllByLabelText('Day')[0]).toHaveFocus();

      let endYear = getAllByLabelText('Year')[1];
      expect(endYear).toHaveTextContent('2019');
      endYear.focus();
      fireEvent.keyDown(endYear, {key: '2'});
      fireEvent.keyDown(endYear, {key: '0'});
      fireEvent.keyDown(endYear, {key: '2'});
      fireEvent.keyDown(endYear, {key: '2'});

      expect(endYear).toHaveTextContent('2022'); // uncontrolled
      expect(onChange).toHaveBeenCalledTimes(5);
      expect(onChange).toHaveBeenCalledWith({start: new Date(2019, 7, 3), end: new Date(2022, 4, 6)});
    });

    it('should edit a date range by entering text (controlled)', function () {
      let onChange = jest.fn();
      let {getAllByLabelText} = render(
        <DateRangePicker
          value={{start: new Date(2019, 1, 3), end: new Date(2019, 4, 6)}}
          onChange={onChange} />
      );

      let startMonth = getAllByLabelText('Month')[0];
      startMonth.focus();
      fireEvent.keyDown(startMonth, {key: '8'});

      expect(startMonth).toHaveTextContent('2'); // controlled
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({start: new Date(2019, 7, 3), end: new Date(2019, 4, 6)});

      expect(getAllByLabelText('Day')[0]).toHaveFocus();

      let endDay = getAllByLabelText('Day')[1];
      expect(endDay).toHaveTextContent('6');
      endDay.focus();
      fireEvent.keyDown(endDay, {key: '4'});

      expect(endDay).toHaveTextContent('6'); // controlled
      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange).toHaveBeenCalledWith({start: new Date(2019, 1, 3), end: new Date(2019, 4, 4)});
    });

    it('should support backspace (uncontrolled)', function () {
      let onChange = jest.fn();
      let {getAllByLabelText} = render(
        <DateRangePicker
          defaultValue={{start: new Date(2019, 1, 3), end: new Date(2019, 4, 6)}}
          onChange={onChange} />
      );

      let endYear = getAllByLabelText('Year')[1];
      expect(endYear).toHaveTextContent('2019');
      endYear.focus();
      fireEvent.keyDown(endYear, {key: 'Backspace'});

      expect(endYear).toHaveTextContent('201'); // uncontrolled
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({start: new Date(2019, 1, 3), end: new Date(201, 4, 6)});
    });

    it('should support backspace (controlled)', function () {
      let onChange = jest.fn();
      let {getAllByLabelText} = render(
        <DateRangePicker
          value={{start: new Date(2019, 1, 3), end: new Date(2019, 4, 6)}}
          onChange={onChange} />
      );

      let endYear = getAllByLabelText('Year')[1];
      expect(endYear).toHaveTextContent('2019');
      endYear.focus();
      fireEvent.keyDown(endYear, {key: 'Backspace'});

      expect(endYear).toHaveTextContent('2019'); // controlled
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({start: new Date(2019, 1, 3), end: new Date(201, 4, 6)});
    });
  });

  describe('validation', function () {
    it('should display an error icon when the start date is less than the minimum (controlled)', function () {
      let {getByTestId} = render(
        <DateRangePicker
          value={{start: new Date(1980, 0, 1), end: new Date(1999, 1, 3)}}
          minValue={new Date(1985, 0, 1)} />
      );
      expect(getByTestId('invalid-icon')).toBeVisible();
    });

    it('should display an error icon when the start date is less than the minimum (uncontrolled)', function () {
      let {getByTestId, getAllByLabelText} = render(
        <DateRangePicker
          defaultValue={{start: new Date(1985, 0, 1), end: new Date(1999, 1, 3)}}
          minValue={new Date(1985, 0, 1)} />
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
          value={{start: new Date(1990, 0, 1), end: new Date(1999, 1, 3)}}
          maxValue={new Date(1985, 0, 1)} />
      );
      expect(getByTestId('invalid-icon')).toBeVisible();
    });

    it('should display an error icon when the start date is greater than the maximum (uncontrolled)', function () {
      let {getByTestId, getAllByLabelText} = render(
        <DateRangePicker
          defaultValue={{start: new Date(1984, 1, 1), end: new Date(1984, 1, 3)}}
          maxValue={new Date(1985, 0, 1)} />
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
          value={{start: new Date(1980, 0, 1), end: new Date(1999, 1, 3)}}
          maxValue={new Date(1985, 0, 1)} />
      );
      expect(getByTestId('invalid-icon')).toBeVisible();
    });

    it('should display an error icon when the end date is greater than the maximum (uncontrolled)', function () {
      let {getByTestId, getAllByLabelText} = render(
        <DateRangePicker
          defaultValue={{start: new Date(1980, 1, 1), end: new Date(1984, 1, 3)}}
          maxValue={new Date(1985, 0, 1)} />
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
          value={{start: new Date(1990, 0, 1), end: new Date(1980, 1, 3)}} />
      );
      expect(getByTestId('invalid-icon')).toBeVisible();
    });

    it('should display an error icon when the end date is less than the start date (uncontrolled)', function () {
      let {getByTestId, getAllByLabelText} = render(
        <DateRangePicker
          defaultValue={{start: new Date(1980, 1, 1), end: new Date(1980, 1, 3)}} />
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
      let {getByLabelText} = render(<DateRangePicker onChange={onChange} />);

      let startDate = getByLabelText('Start Date');
      let endDate = getByLabelText('End Date');
      expect(startDate).toHaveTextContent(`1/1/${new Date().getFullYear()}`);
      expect(endDate).toHaveTextContent(`1/1/${new Date().getFullYear()}`);
    });

    it('should display a placeholder date if the value prop is null', function () {
      let onChange = jest.fn();
      let {getByLabelText} = render(<DateRangePicker onChange={onChange} value={null} />);

      let startDate = getByLabelText('Start Date');
      let endDate = getByLabelText('End Date');
      expect(startDate).toHaveTextContent(`1/1/${new Date().getFullYear()}`);
      expect(endDate).toHaveTextContent(`1/1/${new Date().getFullYear()}`);
    });

    it('should use the placeholderDate prop if provided', function () {
      let onChange = jest.fn();
      let {getByLabelText} = render(<DateRangePicker onChange={onChange} placeholderDate={new Date(1980, 0, 1)} />);

      let startDate = getByLabelText('Start Date');
      let endDate = getByLabelText('End Date');
      expect(startDate).toHaveTextContent('1/1/1980');
      expect(endDate).toHaveTextContent('1/1/1980');
    });

    it('should not fire onChange until both start and end dates have been entered', function () {
      let onChange = jest.fn();
      let {getByLabelText, getAllByRole} = render(<DateRangePicker onChange={onChange} />);

      let startDate = getByLabelText('Start Date');
      let endDate = getByLabelText('End Date');

      expect(startDate).toHaveTextContent(`1/1/${new Date().getFullYear()}`);
      expect(endDate).toHaveTextContent(`1/1/${new Date().getFullYear()}`);

      let segments = getAllByRole('spinbutton');
      segments[0].focus();

      fireEvent.keyDown(document.activeElement, {key: '2'});
      expect(startDate).toHaveTextContent(`2/1/${new Date().getFullYear()}`);
      expect(segments[1]).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();

      fireEvent.keyDown(document.activeElement, {key: '3'});
      expect(startDate).toHaveTextContent(`2/3/${new Date().getFullYear()}`);
      expect(segments[2]).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();

      fireEvent.keyDown(document.activeElement, {key: '2'});
      fireEvent.keyDown(document.activeElement, {key: '0'});
      fireEvent.keyDown(document.activeElement, {key: '2'});
      fireEvent.keyDown(document.activeElement, {key: '0'});
      expect(startDate).toHaveTextContent('2/3/2020');
      expect(segments[3]).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();

      fireEvent.keyDown(document.activeElement, {key: '4'});
      expect(endDate).toHaveTextContent(`4/1/${new Date().getFullYear()}`);
      expect(segments[4]).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();

      fireEvent.keyDown(document.activeElement, {key: '8'});
      expect(endDate).toHaveTextContent(`4/8/${new Date().getFullYear()}`);
      expect(segments[5]).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();

      fireEvent.keyDown(document.activeElement, {key: '2'});
      expect(onChange).toHaveBeenCalledTimes(1);
      fireEvent.keyDown(document.activeElement, {key: '0'});
      expect(onChange).toHaveBeenCalledTimes(2);
      fireEvent.keyDown(document.activeElement, {key: '2'});
      expect(onChange).toHaveBeenCalledTimes(3);
      fireEvent.keyDown(document.activeElement, {key: '2'});
      expect(onChange).toHaveBeenCalledTimes(4);

      expect(onChange).toHaveBeenCalledWith({start: new Date(2020, 1, 3), end: new Date(2022, 3, 8)});
    });
  });
});
