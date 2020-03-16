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

import {cleanup, fireEvent, render} from '@testing-library/react';
import {DatePicker} from '../';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light-unique.css';
import {testSlotsAPI, triggerPress} from '@react-spectrum/test-utils';

let theme = {
  light: themeLight,
  medium: scaleMedium
};

describe('DatePicker', function () {
  afterEach(cleanup);

  it('uses slots api', () => {
    testSlotsAPI(DatePicker);
  });

  describe('basics', function () {
    it('should render a datepicker with a specified date', function () {
      let {getByRole, getAllByRole} = render(<DatePicker value={new Date(2019, 1, 3)} />);

      let combobox = getByRole('combobox');
      expect(combobox).toBeVisible();
      expect(combobox).not.toHaveAttribute('aria-disabled');
      expect(combobox).not.toHaveAttribute('aria-invalid');

      let segments = getAllByRole('spinbutton');
      expect(segments.length).toBe(3);

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
    });

    it('should render a datepicker with a custom date format', function () {
      let format = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      };
      let {getByRole, getAllByRole} = render(<DatePicker value={new Date(2019, 1, 3)} formatOptions={format} />);

      let combobox = getByRole('combobox');
      expect(combobox).toBeVisible();
      expect(combobox).not.toHaveAttribute('aria-disabled');
      expect(combobox).not.toHaveAttribute('aria-invalid');

      let segments = getAllByRole('spinbutton');
      expect(segments.length).toBe(7);

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
    });
  });

  describe('calendar popover', function () {
    it('should emit onChange when selecting a date in the calendar in controlled mode', function () {
      let onChange = jest.fn();
      let {getByRole, getAllByRole} = render(
        <Provider theme={theme}>
          <DatePicker value={new Date(2019, 1, 3)} onChange={onChange} />
        </Provider>
      );

      let combobox = getByRole('combobox');
      expect(combobox).toHaveTextContent('2/3/2019');

      let button = getByRole('button');
      triggerPress(button);

      let dialog = getByRole('dialog');
      expect(dialog).toBeVisible();

      let cells = getAllByRole('gridcell');
      let selected = cells.find(cell => cell.getAttribute('aria-selected') === 'true');
      expect(selected).toHaveAttribute('aria-label', 'Sunday, February 3, 2019 selected');

      triggerPress(selected.nextSibling);

      expect(dialog).not.toBeInTheDocument();
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(new Date(2019, 1, 4));
      expect(combobox).toHaveTextContent('2/3/2019'); // controlled
    });

    it('should emit onChange when selecting a date in the calendar in uncontrolled mode', function () {
      let onChange = jest.fn();
      let {getByRole, getAllByRole} = render(
        <Provider theme={theme}>
          <DatePicker defaultValue={new Date(2019, 1, 3)} onChange={onChange} />
        </Provider>
      );

      let combobox = getByRole('combobox');
      expect(combobox).toHaveTextContent('2/3/2019');

      let button = getByRole('button');
      triggerPress(button);

      let dialog = getByRole('dialog');
      expect(dialog).toBeVisible();

      let cells = getAllByRole('gridcell');
      let selected = cells.find(cell => cell.getAttribute('aria-selected') === 'true');
      expect(selected).toHaveAttribute('aria-label', 'Sunday, February 3, 2019 selected');

      triggerPress(selected.nextSibling);

      expect(dialog).not.toBeInTheDocument();
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(new Date(2019, 1, 4));
      expect(combobox).toHaveTextContent('2/4/2019'); // uncontrolled
    });
  });

  describe('labeling', function () {
    it('should support labeling with a default label', function () {
      let {getByRole, getAllByRole} = render(<DatePicker />);

      let combobox = getByRole('combobox');
      expect(combobox).toHaveAttribute('aria-label', 'Date');
      expect(combobox).toHaveAttribute('id');
      let comboboxId = combobox.getAttribute('id');

      let button = getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Calendar');
      expect(button).toHaveAttribute('id');
      let buttonId = button.getAttribute('id');
      expect(button).toHaveAttribute('aria-labelledby', `${comboboxId} ${buttonId}`);

      let segments = getAllByRole('spinbutton');
      for (let segment of segments) {
        expect(segment).toHaveAttribute('id');
        let segmentId = segment.getAttribute('id');
        expect(segment).toHaveAttribute('aria-labelledby', `${comboboxId} ${segmentId}`);
      }
    });

    it('should support labeling with aria-label', function () {
      let {getByRole, getAllByRole} = render(<DatePicker aria-label="Birth date" />);

      let combobox = getByRole('combobox');
      expect(combobox).toHaveAttribute('aria-label', 'Birth date');
      expect(combobox).toHaveAttribute('id');
      let comboboxId = combobox.getAttribute('id');

      let button = getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Calendar');
      expect(button).toHaveAttribute('id');
      let buttonId = button.getAttribute('id');
      expect(button).toHaveAttribute('aria-labelledby', `${comboboxId} ${buttonId}`);

      let segments = getAllByRole('spinbutton');
      for (let segment of segments) {
        expect(segment).toHaveAttribute('id');
        let segmentId = segment.getAttribute('id');
        expect(segment).toHaveAttribute('aria-labelledby', `${comboboxId} ${segmentId}`);
      }
    });

    it('should support labeling with aria-labelledby', function () {
      let {getByRole, getAllByRole} = render(<DatePicker aria-labelledby="foo" />);

      let combobox = getByRole('combobox');
      expect(combobox).not.toHaveAttribute('aria-label');
      expect(combobox).toHaveAttribute('aria-labelledby', 'foo');

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
  });

  describe('focus management', function () {
    it('should focus the last segment on mouse down in the field', function () {
      let {getAllByRole, getByTestId} = render(<DatePicker />);
      let field = getByTestId('date-field');
      let segments = getAllByRole('spinbutton');

      fireEvent.mouseDown(field);
      expect(segments[segments.length - 1]).toHaveFocus();
    });
  });

  describe('editing', function () {
    describe('arrow keys', function () {
      function testArrows(label, value, incremented, decremented, options = {}) {
        let onChange = jest.fn();
        let format = {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          ...options.format
        };

        // Test controlled mode
        let {getByLabelText} = render(<DatePicker value={value} onChange={onChange} formatOptions={format} />);
        let segment = getByLabelText(label);
        let textContent = segment.textContent;
        segment.focus();

        fireEvent.keyDown(segment, {key: options.upKey || 'ArrowUp'});
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(incremented);
        expect(segment.textContent).toBe(textContent);

        fireEvent.keyDown(segment, {key: options.downKey || 'ArrowDown'});
        expect(onChange).toHaveBeenCalledTimes(2);
        expect(onChange).toHaveBeenCalledWith(decremented);
        expect(segment.textContent).toBe(textContent);
        cleanup();

        // Test uncontrolled mode (increment)
        onChange = jest.fn();
        ({getByLabelText} = render(<DatePicker defaultValue={value} onChange={onChange} formatOptions={format} />));
        segment = getByLabelText(label);
        textContent = segment.textContent;
        segment.focus();

        fireEvent.keyDown(segment, {key: options.upKey || 'ArrowUp'});
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(incremented);
        expect(segment.textContent).not.toBe(textContent);
        cleanup();

        // Test uncontrolled mode (decrement)
        onChange = jest.fn();
        ({getByLabelText} = render(<DatePicker defaultValue={value} onChange={onChange} formatOptions={format} />));
        segment = getByLabelText(label);
        textContent = segment.textContent;
        segment.focus();

        fireEvent.keyDown(segment, {key: options.downKey || 'ArrowDown'});
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(decremented);
        expect(segment.textContent).not.toBe(textContent);
        cleanup();

        // Test read only mode (increment)
        onChange = jest.fn();
        ({getByLabelText} = render(<DatePicker defaultValue={value} isReadOnly onChange={onChange} formatOptions={format} />));
        segment = getByLabelText(label);
        textContent = segment.textContent;
        segment.focus();

        fireEvent.keyDown(segment, {key: options.upKey || 'ArrowUp'});
        expect(onChange).not.toHaveBeenCalled();
        expect(segment.textContent).toBe(textContent);
        cleanup();

        // Test read only mode (decrement)
        onChange = jest.fn();
        ({getByLabelText} = render(<DatePicker defaultValue={value} isReadOnly onChange={onChange} formatOptions={format} />));
        segment = getByLabelText(label);
        textContent = segment.textContent;
        segment.focus();

        fireEvent.keyDown(segment, {key: options.downKey || 'ArrowDown'});
        expect(onChange).not.toHaveBeenCalled();
        expect(segment.textContent).toBe(textContent);
        cleanup();
      }

      describe('month', function () {
        it('should support using the arrow keys to increment and decrement the month', function () {
          testArrows('Month', new Date(2019, 1, 3), new Date(2019, 2, 3), new Date(2019, 0, 3));
        });

        it('should wrap around when incrementing and decrementing the month', function () {
          testArrows('Month', new Date(2019, 11, 3), new Date(2019, 0, 3), new Date(2019, 10, 3));
          testArrows('Month', new Date(2019, 0, 3), new Date(2019, 1, 3), new Date(2019, 11, 3));
        });

        it('should support using the page up and down keys to increment and decrement the month by 2', function () {
          testArrows('Month', new Date(2019, 0, 3), new Date(2019, 2, 3), new Date(2019, 10, 3), {upKey: 'PageUp', downKey: 'PageDown'});
          testArrows('Month', new Date(2019, 1, 3), new Date(2019, 3, 3), new Date(2019, 11, 3), {upKey: 'PageUp', downKey: 'PageDown'});
        });

        it('should support using the home and end keys to jump to the min and max month', function () {
          testArrows('Month', new Date(2019, 5, 3), new Date(2019, 11, 3), new Date(2019, 0, 3), {upKey: 'End', downKey: 'Home'});
        });
      });

      describe('day', function () {
        it('should support using the arrow keys to increment and decrement the day', function () {
          testArrows('Day', new Date(2019, 1, 3), new Date(2019, 1, 4), new Date(2019, 1, 2));
        });

        it('should wrap around when incrementing and decrementing the day', function () {
          testArrows('Day', new Date(2019, 1, 28), new Date(2019, 1, 1), new Date(2019, 1, 27));
          testArrows('Day', new Date(2019, 1, 1), new Date(2019, 1, 2), new Date(2019, 1, 28));
        });

        it('should support using the page up and down keys to increment and decrement the day by 7', function () {
          testArrows('Day', new Date(2019, 1, 3), new Date(2019, 1, 10), new Date(2019, 1, 24), {upKey: 'PageUp', downKey: 'PageDown'});
        });

        it('should support using the home and end keys to jump to the min and max day', function () {
          testArrows('Day', new Date(2019, 1, 5), new Date(2019, 1, 28), new Date(2019, 1, 1), {upKey: 'End', downKey: 'Home'});
        });
      });

      describe('year', function () {
        it('should support using the arrow keys to increment and decrement the year', function () {
          testArrows('Year', new Date(2019, 1, 3), new Date(2020, 1, 3), new Date(2018, 1, 3));
        });

        it('should support using the page up and down keys to increment and decrement the year to the nearest 5', function () {
          testArrows('Year', new Date(2019, 1, 3), new Date(2020, 1, 3), new Date(2015, 1, 3), {upKey: 'PageUp', downKey: 'PageDown'});
        });
      });

      describe('hour', function () {
        it('should support using the arrow keys to increment and decrement the hour', function () {
          testArrows('Hour', new Date(2019, 1, 3, 8), new Date(2019, 1, 3, 9), new Date(2019, 1, 3, 7));
        });

        it('should wrap around when incrementing and decrementing the hour in 12 hour time', function () {
          // AM
          testArrows('Hour', new Date(2019, 1, 3, 11), new Date(2019, 1, 3, 0), new Date(2019, 1, 3, 10));
          testArrows('Hour', new Date(2019, 1, 3, 0), new Date(2019, 1, 3, 1), new Date(2019, 1, 3, 11));

          // PM
          testArrows('Hour', new Date(2019, 1, 3, 23), new Date(2019, 1, 3, 12), new Date(2019, 1, 3, 22));
          testArrows('Hour', new Date(2019, 1, 3, 12), new Date(2019, 1, 3, 13), new Date(2019, 1, 3, 23));
        });

        it('should wrap around when incrementing and decrementing the hour in 24 hour time', function () {
          testArrows('Hour', new Date(2019, 1, 3, 23), new Date(2019, 1, 3, 0), new Date(2019, 1, 3, 22), {format: {hour12: false}});
          testArrows('Hour', new Date(2019, 1, 3, 0), new Date(2019, 1, 3, 1), new Date(2019, 1, 3, 23), {format: {hour12: false}});
        });

        it('should support using the page up and down keys to increment and decrement the hour by 2', function () {
          testArrows('Hour', new Date(2019, 1, 3, 8), new Date(2019, 1, 3, 10), new Date(2019, 1, 3, 6), {upKey: 'PageUp', downKey: 'PageDown'});
        });

        it('should support using the home and end keys to jump to the min and max hour in 12 hour time', function () {
          // AM
          testArrows('Hour', new Date(2019, 1, 3, 8), new Date(2019, 1, 3, 11), new Date(2019, 1, 3, 0), {upKey: 'End', downKey: 'Home'});

          // PM
          testArrows('Hour', new Date(2019, 1, 3, 16), new Date(2019, 1, 3, 23), new Date(2019, 1, 3, 12), {upKey: 'End', downKey: 'Home'});
        });

        it('should support using the home and end keys to jump to the min and max hour in 24 hour time', function () {
          testArrows('Hour', new Date(2019, 1, 3, 8), new Date(2019, 1, 3, 23), new Date(2019, 1, 3, 0), {upKey: 'End', downKey: 'Home', format: {hour12: false}});
        });
      });

      describe('minute', function () {
        it('should support using the arrow keys to increment and decrement the minute', function () {
          testArrows('Minute', new Date(2019, 1, 3, 8, 5), new Date(2019, 1, 3, 8, 6), new Date(2019, 1, 3, 8, 4));
        });

        it('should wrap around when incrementing and decrementing the minute', function () {
          testArrows('Minute', new Date(2019, 1, 3, 8, 59), new Date(2019, 1, 3, 8, 0), new Date(2019, 1, 3, 8, 58));
          testArrows('Minute', new Date(2019, 1, 3, 8, 0), new Date(2019, 1, 3, 8, 1), new Date(2019, 1, 3, 8, 59));
        });

        it('should support using the page up and down keys to increment and decrement the minute to the nearest 15', function () {
          testArrows('Minute', new Date(2019, 1, 3, 8, 22), new Date(2019, 1, 3, 8, 30), new Date(2019, 1, 3, 8, 15), {upKey: 'PageUp', downKey: 'PageDown'});
        });

        it('should support using the home and end keys to jump to the min and max minute', function () {
          testArrows('Minute', new Date(2019, 1, 3, 8, 22), new Date(2019, 1, 3, 8, 59), new Date(2019, 1, 3, 8, 0), {upKey: 'End', downKey: 'Home', format: {hour12: false}});
        });
      });

      describe('second', function () {
        it('should support using the arrow keys to increment and decrement the second', function () {
          testArrows('Second', new Date(2019, 1, 3, 8, 5, 10), new Date(2019, 1, 3, 8, 5, 11), new Date(2019, 1, 3, 8, 5, 9));
        });

        it('should wrap around when incrementing and decrementing the second', function () {
          testArrows('Second', new Date(2019, 1, 3, 8, 5, 59), new Date(2019, 1, 3, 8, 5, 0), new Date(2019, 1, 3, 8, 5, 58));
          testArrows('Second', new Date(2019, 1, 3, 8, 5, 0), new Date(2019, 1, 3, 8, 5, 1), new Date(2019, 1, 3, 8, 5, 59));
        });

        it('should support using the page up and down keys to increment and decrement the second to the nearest 15', function () {
          testArrows('Second', new Date(2019, 1, 3, 8, 5, 22), new Date(2019, 1, 3, 8, 5, 30), new Date(2019, 1, 3, 8, 5, 15), {upKey: 'PageUp', downKey: 'PageDown'});
        });

        it('should support using the home and end keys to jump to the min and max second', function () {
          testArrows('Second', new Date(2019, 1, 3, 8, 5, 22), new Date(2019, 1, 3, 8, 5, 59), new Date(2019, 1, 3, 8, 5, 0), {upKey: 'End', downKey: 'Home', format: {hour12: false}});
        });
      });

      describe('day period', function () {
        it('should support using the arrow keys to increment and decrement the day period', function () {
          testArrows('Day Period', new Date(2019, 1, 3, 8), new Date(2019, 1, 3, 20), new Date(2019, 1, 3, 20));
          testArrows('Day Period', new Date(2019, 1, 3, 20), new Date(2019, 1, 3, 8), new Date(2019, 1, 3, 8));
        });
      });
    });

    describe('text input', function () {
      function testInput(label, value, keys, newValue, moved, options) {
        let onChange = jest.fn();
        let format = {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          ...options
        };

        // Test controlled mode
        let {getByLabelText, getAllByRole} = render(<DatePicker value={value} onChange={onChange} formatOptions={format} />);
        let segment = getByLabelText(label);
        let textContent = segment.textContent;
        segment.focus();

        let i = 0;
        for (let key of keys) {
          fireEvent.keyDown(segment, {key});
          expect(onChange).toHaveBeenCalledTimes(++i);
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

        cleanup();

        // Test uncontrolled mode
        onChange = jest.fn();
        ({getByLabelText, getAllByRole} = render(<DatePicker defaultValue={value} onChange={onChange} formatOptions={format} />));
        segment = getByLabelText(label);
        textContent = segment.textContent;
        segment.focus();

        i = 0;
        for (let key of keys) {
          fireEvent.keyDown(segment, {key});
          expect(onChange).toHaveBeenCalledTimes(++i);
          expect(segment.textContent).not.toBe(textContent);

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

        cleanup();

        // Test read only mode
        onChange = jest.fn();
        ({getByLabelText, getAllByRole} = render(<DatePicker defaultValue={value} isReadOnly onChange={onChange} formatOptions={format} />));
        segment = getByLabelText(label);
        textContent = segment.textContent;
        segment.focus();

        for (let key of keys) {
          fireEvent.keyDown(segment, {key});
          expect(onChange).not.toHaveBeenCalled();
          expect(segment.textContent).toBe(textContent);
          expect(segment).toHaveFocus();
        }

        expect(onChange).not.toHaveBeenCalled();
        expect(segment).toHaveFocus();
        cleanup();
      }

      it('should support typing into the month segment', function () {
        testInput('Month', new Date(2019, 1, 3), '1', new Date(2019, 0, 3), false);
        testInput('Month', new Date(2019, 1, 3), '12', new Date(2019, 11, 3), true);
        testInput('Month', new Date(2019, 1, 3), '4', new Date(2019, 3, 3), true);
      });

      it('should support typing into the day segment', function () {
        testInput('Day', new Date(2019, 1, 3), '1', new Date(2019, 1, 1), false);
        testInput('Day', new Date(2019, 1, 3), '12', new Date(2019, 1, 12), true);
        testInput('Day', new Date(2019, 1, 3), '4', new Date(2019, 1, 4), true);
      });

      it('should support typing into the year segment', function () {
        testInput('Year', new Date(2019, 1, 3), '1993', new Date(1993, 1, 3), true);
      });

      it('should support typing into the hour segment in 12 hour time', function () {
        // AM
        testInput('Hour', new Date(2019, 1, 3, 8), '1', new Date(2019, 1, 3, 1), false);
        testInput('Hour', new Date(2019, 1, 3, 8), '11', new Date(2019, 1, 3, 11), true);
        testInput('Hour', new Date(2019, 1, 3, 8), '12', new Date(2019, 1, 3, 0), true);
        testInput('Hour', new Date(2019, 1, 3, 8), '4', new Date(2019, 1, 3, 4), true);

        // PM
        testInput('Hour', new Date(2019, 1, 3, 20), '1', new Date(2019, 1, 3, 13), false);
        testInput('Hour', new Date(2019, 1, 3, 20), '11', new Date(2019, 1, 3, 23), true);
        testInput('Hour', new Date(2019, 1, 3, 20), '12', new Date(2019, 1, 3, 12), true);
        testInput('Hour', new Date(2019, 1, 3, 20), '4', new Date(2019, 1, 3, 16), true);
      });

      it('should support typing into the hour segment in 24 hour time', function () {
        testInput('Hour', new Date(2019, 1, 3, 8), '1', new Date(2019, 1, 3, 1), false, {hour12: false});
        testInput('Hour', new Date(2019, 1, 3, 8), '11', new Date(2019, 1, 3, 11), true, {hour12: false});
        testInput('Hour', new Date(2019, 1, 3, 8), '23', new Date(2019, 1, 3, 23), true, {hour12: false});
      });

      it('should support typing into the minute segment', function () {
        testInput('Minute', new Date(2019, 1, 3, 8, 8), '1', new Date(2019, 1, 3, 8, 1), false);
        testInput('Minute', new Date(2019, 1, 3, 8, 8), '2', new Date(2019, 1, 3, 8, 2), false);
        testInput('Minute', new Date(2019, 1, 3, 8, 8), '5', new Date(2019, 1, 3, 8, 5), false);
        testInput('Minute', new Date(2019, 1, 3, 8, 8), '6', new Date(2019, 1, 3, 8, 6), true);
        testInput('Minute', new Date(2019, 1, 3, 8, 8), '59', new Date(2019, 1, 3, 8, 59), true);
      });

      it('should support typing into the second segment', function () {
        testInput('Second', new Date(2019, 1, 3, 8, 5, 8), '1', new Date(2019, 1, 3, 8, 5, 1), false);
        testInput('Second', new Date(2019, 1, 3, 8, 5, 8), '2', new Date(2019, 1, 3, 8, 5, 2), false);
        testInput('Second', new Date(2019, 1, 3, 8, 5, 8), '5', new Date(2019, 1, 3, 8, 5, 5), false);
        testInput('Second', new Date(2019, 1, 3, 8, 5, 8), '6', new Date(2019, 1, 3, 8, 5, 6), true);
        testInput('Second', new Date(2019, 1, 3, 8, 5, 8), '59', new Date(2019, 1, 3, 8, 5, 59), true);
      });

      it('should support typing into the day period segment', function () {
        testInput('Day Period', new Date(2019, 1, 3, 8), 'p', new Date(2019, 1, 3, 20), false);
        testInput('Day Period', new Date(2019, 1, 3, 20), 'a', new Date(2019, 1, 3, 8), false);
      });

      it('should support entering arabic digits', function () {
        testInput('Year', new Date(2019, 1, 3), '٢٠٢٤', new Date(2024, 1, 3), true);
      });
    });

    describe('backspace', function () {
      function testBackspace(label, value, newValue, options) {
        let onChange = jest.fn();
        let format = {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          ...options
        };

        // Test controlled mode
        let {getByLabelText} = render(<DatePicker value={value} onChange={onChange} formatOptions={format} />);
        let segment = getByLabelText(label);
        let textContent = segment.textContent;
        segment.focus();

        fireEvent.keyDown(segment, {key: 'Backspace'});
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(newValue);
        expect(segment.textContent).toBe(textContent);
        cleanup();

        // Test uncontrolled mode
        onChange = jest.fn();
        ({getByLabelText} = render(<DatePicker defaultValue={value} onChange={onChange} formatOptions={format} />));
        segment = getByLabelText(label);
        textContent = segment.textContent;
        segment.focus();

        fireEvent.keyDown(segment, {key: 'Backspace'});
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(newValue);
        expect(segment.textContent).not.toBe(textContent);
        cleanup();
      }

      it('should support backspace in the month segment', function () {
        testBackspace('Month', new Date(2019, 1, 3), new Date(2019, 0, 3));
        testBackspace('Month', new Date(2019, 5, 3), new Date(2019, 0, 3));
        testBackspace('Month', new Date(2019, 11, 3), new Date(2019, 0, 3));
      });

      it('should support backspace in the day segment', function () {
        testBackspace('Day', new Date(2019, 1, 3), new Date(2019, 1, 1));
        testBackspace('Day', new Date(2019, 1, 20), new Date(2019, 1, 2));
      });

      it('should support backspace in the year segment', function () {
        testBackspace('Year', new Date(2019, 1, 3), new Date(201, 1, 3));
      });

      it('should support backspace in the hour segment in 12 hour time', function () {
        // AM
        testBackspace('Hour', new Date(2019, 1, 3, 8), new Date(2019, 1, 3, 0));
        testBackspace('Hour', new Date(2019, 1, 3, 11), new Date(2019, 1, 3, 1));

        // PM
        testBackspace('Hour', new Date(2019, 1, 3, 16), new Date(2019, 1, 3, 12));
        testBackspace('Hour', new Date(2019, 1, 3, 23), new Date(2019, 1, 3, 13));
      });

      it('should support backspace in the hour segment in 24 hour time', function () {
        testBackspace('Hour', new Date(2019, 1, 3, 8), new Date(2019, 1, 3, 0), {hour12: false});
        testBackspace('Hour', new Date(2019, 1, 3, 11), new Date(2019, 1, 3, 1), {hour12: false});
        testBackspace('Hour', new Date(2019, 1, 3, 16), new Date(2019, 1, 3, 1), {hour12: false});
        testBackspace('Hour', new Date(2019, 1, 3, 23), new Date(2019, 1, 3, 2), {hour12: false});
      });

      it('should support backspace in the minute segment', function () {
        testBackspace('Minute', new Date(2019, 1, 3, 5, 8), new Date(2019, 1, 3, 5, 0));
        testBackspace('Minute', new Date(2019, 1, 3, 5, 25), new Date(2019, 1, 3, 5, 2));
        testBackspace('Minute', new Date(2019, 1, 3, 5, 59), new Date(2019, 1, 3, 5, 5));
      });

      it('should support second in the minute segment', function () {
        testBackspace('Second', new Date(2019, 1, 3, 5, 5, 8), new Date(2019, 1, 3, 5, 5, 0));
        testBackspace('Second', new Date(2019, 1, 3, 5, 5, 25), new Date(2019, 1, 3, 5, 5, 2));
        testBackspace('Second', new Date(2019, 1, 3, 5, 5, 59), new Date(2019, 1, 3, 5, 5, 5));
      });

      it('should support backspace with arabic digits', function () {
        let onChange = jest.fn();
        let {getByLabelText} = render(
          <Provider theme={theme} locale="ar-EG">
            <DatePicker defaultValue={new Date(2019, 1, 3)} onChange={onChange} />
          </Provider>
        );
        let segment = getByLabelText('العام');
        expect(segment).toHaveTextContent('٢٠١٩');
        segment.focus();

        fireEvent.keyDown(segment, {key: 'Backspace'});
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(new Date(201, 1, 3));
        expect(segment).toHaveTextContent('٢٠١');
      });
    });
  });

  describe('validation', function () {
    it('should display an error icon when date is less than the minimum (controlled)', function () {
      let {getByTestId} = render(<DatePicker value={new Date(1980, 0, 1)} minValue={new Date(1985, 0, 1)} />);
      expect(getByTestId('invalid-icon')).toBeVisible();
    });

    it('should display an error icon when date is less than the minimum (uncontrolled)', function () {
      let {getByTestId, getByLabelText} = render(<DatePicker defaultValue={new Date(1985, 0, 1)} minValue={new Date(1985, 0, 1)} />);
      expect(() => getByTestId('invalid-icon')).toThrow();

      let year = getByLabelText('Year');
      fireEvent.keyDown(year, {key: 'ArrowDown'});

      expect(getByTestId('invalid-icon')).toBeVisible();

      fireEvent.keyDown(year, {key: 'ArrowUp'});
      expect(() => getByTestId('invalid-icon')).toThrow();
    });

    it('should display an error icon when date is greater than the maximum (controlled)', function () {
      let {getByTestId} = render(<DatePicker value={new Date(1990, 0, 1)} maxValue={new Date(1985, 0, 1)} />);
      expect(getByTestId('invalid-icon')).toBeVisible();
    });

    it('should display an error icon when date is greater than the maximum (uncontrolled)', function () {
      let {getByTestId, getByLabelText} = render(<DatePicker defaultValue={new Date(1985, 0, 1)} maxValue={new Date(1985, 0, 1)} />);
      expect(() => getByTestId('invalid-icon')).toThrow();

      let year = getByLabelText('Year');
      fireEvent.keyDown(year, {key: 'ArrowUp'});

      expect(getByTestId('invalid-icon')).toBeVisible();

      fireEvent.keyDown(year, {key: 'ArrowDown'});
      expect(() => getByTestId('invalid-icon')).toThrow();
    });
  });

  describe('placeholder', function () {
    it('should display a placeholder date if no value is provided', function () {
      let onChange = jest.fn();
      let {getByRole} = render(<DatePicker onChange={onChange} />);

      let combobox = getByRole('combobox');
      expect(combobox).toHaveTextContent(`1/1/${new Date().getFullYear()}`);
    });

    it('should display a placeholder date if the value prop is null', function () {
      let onChange = jest.fn();
      let {getByRole} = render(<DatePicker onChange={onChange} value={null} />);

      let combobox = getByRole('combobox');
      expect(combobox).toHaveTextContent(`1/1/${new Date().getFullYear()}`);
    });

    it('should use the placeholderDate prop if provided', function () {
      let onChange = jest.fn();
      let {getByRole} = render(<DatePicker onChange={onChange} placeholderDate={new Date(1980, 0, 1)} />);

      let combobox = getByRole('combobox');
      expect(combobox).toHaveTextContent('1/1/1980');
    });

    it('should confirm placeholder value with the enter key', function () {
      let onChange = jest.fn();
      let {getByRole, getAllByRole} = render(<DatePicker onChange={onChange} />);

      let combobox = getByRole('combobox');
      expect(combobox).toHaveTextContent(`1/1/${new Date().getFullYear()}`);

      let segments = getAllByRole('spinbutton');
      segments[0].focus();

      fireEvent.keyDown(document.activeElement, {key: 'Enter'});
      expect(segments[1]).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();

      fireEvent.keyDown(document.activeElement, {key: 'Enter'});
      expect(segments[2]).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();

      fireEvent.keyDown(document.activeElement, {key: 'Enter'});
      expect(segments[2]).toHaveFocus();
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(new Date(new Date().getFullYear(), 0, 1));
      expect(combobox).toHaveTextContent(`1/1/${new Date().getFullYear()}`);
    });

    it('should use arrow keys to modify placeholder (uncontrolled)', function () {
      let onChange = jest.fn();
      let {getByRole, getAllByRole} = render(<DatePicker onChange={onChange} />);

      let combobox = getByRole('combobox');
      expect(combobox).toHaveTextContent(`1/1/${new Date().getFullYear()}`);

      let segments = getAllByRole('spinbutton');
      segments[0].focus();

      fireEvent.keyDown(document.activeElement, {key: 'ArrowUp'});
      fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
      expect(segments[1]).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();
      expect(combobox).toHaveTextContent(`2/1/${new Date().getFullYear()}`);

      fireEvent.keyDown(document.activeElement, {key: 'ArrowUp'});
      fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
      expect(segments[2]).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();
      expect(combobox).toHaveTextContent(`2/2/${new Date().getFullYear()}`);

      fireEvent.keyDown(document.activeElement, {key: 'ArrowUp'});
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(new Date(new Date().getFullYear() + 1, 1, 2));
      expect(combobox).toHaveTextContent(`2/2/${new Date().getFullYear() + 1}`);
    });

    it('should use arrow keys to modify placeholder (controlled)', function () {
      let onChange = jest.fn();
      let {getByRole, getAllByRole, rerender} = render(<DatePicker onChange={onChange} value={null} />);

      let combobox = getByRole('combobox');
      expect(combobox).toHaveTextContent(`1/1/${new Date().getFullYear()}`);

      let segments = getAllByRole('spinbutton');
      segments[0].focus();

      fireEvent.keyDown(document.activeElement, {key: 'ArrowUp'});
      fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
      expect(segments[1]).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();
      expect(combobox).toHaveTextContent(`2/1/${new Date().getFullYear()}`);

      fireEvent.keyDown(document.activeElement, {key: 'ArrowUp'});
      fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
      expect(segments[2]).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();
      expect(combobox).toHaveTextContent(`2/2/${new Date().getFullYear()}`);

      fireEvent.keyDown(document.activeElement, {key: 'ArrowUp'});
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(new Date(new Date().getFullYear() + 1, 1, 2));
      expect(combobox).toHaveTextContent(`2/2/${new Date().getFullYear()}`); // controlled

      rerender(<DatePicker onChange={onChange} value={new Date(new Date().getFullYear() + 1, 1, 2)} />);
      expect(combobox).toHaveTextContent(`2/2/${new Date().getFullYear() + 1}`);
    });

    it('should enter a date to modify placeholder (uncontrolled)', function () {
      let onChange = jest.fn();
      let {getByRole, getAllByRole} = render(<DatePicker onChange={onChange} />);

      let combobox = getByRole('combobox');
      expect(combobox).toHaveTextContent(`1/1/${new Date().getFullYear()}`);

      let segments = getAllByRole('spinbutton');
      segments[0].focus();

      fireEvent.keyDown(document.activeElement, {key: '4'});
      expect(segments[1]).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();
      expect(combobox).toHaveTextContent(`4/1/${new Date().getFullYear()}`);

      fireEvent.keyDown(document.activeElement, {key: '5'});
      expect(segments[2]).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();
      expect(combobox).toHaveTextContent(`4/5/${new Date().getFullYear()}`);

      fireEvent.keyDown(document.activeElement, {key: '2'});
      expect(onChange).toHaveBeenCalledTimes(1);
      fireEvent.keyDown(document.activeElement, {key: '0'});
      expect(onChange).toHaveBeenCalledTimes(2);
      fireEvent.keyDown(document.activeElement, {key: '2'});
      expect(onChange).toHaveBeenCalledTimes(3);
      fireEvent.keyDown(document.activeElement, {key: '0'});
      expect(segments[2]).toHaveFocus();
      expect(onChange).toHaveBeenCalledTimes(4);
      expect(onChange).toHaveBeenCalledWith(new Date(2020, 3, 5));
      expect(combobox).toHaveTextContent('4/5/2020');
    });

    it('should enter a date to modify placeholder (controlled)', function () {
      let onChange = jest.fn();
      let {getByRole, getAllByRole, rerender} = render(<DatePicker onChange={onChange} value={null} />);

      let combobox = getByRole('combobox');
      expect(combobox).toHaveTextContent(`1/1/${new Date().getFullYear()}`);

      let segments = getAllByRole('spinbutton');
      segments[0].focus();

      fireEvent.keyDown(document.activeElement, {key: '4'});
      expect(segments[1]).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();
      expect(combobox).toHaveTextContent(`4/1/${new Date().getFullYear()}`);

      fireEvent.keyDown(document.activeElement, {key: '5'});
      expect(segments[2]).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();
      expect(combobox).toHaveTextContent(`4/5/${new Date().getFullYear()}`);

      fireEvent.keyDown(document.activeElement, {key: '2'});
      expect(onChange).toHaveBeenCalledTimes(1);
      fireEvent.keyDown(document.activeElement, {key: '0'});
      fireEvent.keyDown(document.activeElement, {key: '2'});
      fireEvent.keyDown(document.activeElement, {key: '0'});
      expect(segments[2]).toHaveFocus();
      expect(onChange).toHaveBeenCalledTimes(4);
      expect(onChange).toHaveBeenCalledWith(new Date(2020, 3, 5));
      expect(combobox).toHaveTextContent(`4/5/${new Date().getFullYear()}`); // controlled

      rerender(<DatePicker onChange={onChange} value={new Date(2020, 3, 5)} />);
      expect(combobox).toHaveTextContent('4/5/2020');
    });
  });
});
