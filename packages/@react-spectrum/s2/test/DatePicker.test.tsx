/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act, pointerMap, render} from '@react-spectrum/test-utils-internal';
import {DatePicker} from '../src/DatePicker';
import {parseDate, parseDateTime, parseZonedDateTime} from '@internationalized/date';
import userEvent from '@testing-library/user-event';

describe('DatePicker', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-11-01T12:00:00Z'));
  });

  afterEach(() => {
    act(() => jest.runAllTimers());
    jest.useRealTimers();
  });

  it.each([
    {placeholderValue: parseDate('2026-11-01'), expected: '2026-11-02'},
    {placeholderValue: parseDateTime('2026-11-01T09:30'), expected: '2026-11-02T09:30:00'},
    {
      placeholderValue: parseZonedDateTime('2026-11-01T09:30[UTC]'),
      expected: '2026-11-02T09:30:00+00:00[UTC]'
    },
    {
      placeholderValue: parseZonedDateTime('2026-11-01T09:30[America/New_York]'),
      expected: '2026-11-02T09:30:00-05:00[America/New_York]'
    }
  ])(
    'preserves the placeholder type when selecting and submitting $expected',
    async ({placeholderValue, expected}) => {
      let user = userEvent.setup({delay: null, pointerMap});
      let onChange = jest.fn();
      let {container, getByRole} = render(
        <form>
          <DatePicker
            label="Appointment"
            name="appointment"
            placeholderValue={placeholderValue}
            onChange={onChange}
          />
        </form>
      );

      expect(new FormData(container.querySelector('form')!).get('appointment')).toBe('');
      await user.click(getByRole('button', {name: /Calendar/}));
      await user.click(getByRole('button', {name: /November 2, 2026/}));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0].toString()).toBe(expected);
      expect(new FormData(container.querySelector('form')!).get('appointment')).toBe(expected);
    }
  );

  it('preserves the placeholder time zone with an explicit granularity', async () => {
    let user = userEvent.setup({delay: null, pointerMap});
    let onChange = jest.fn();
    let {getByRole} = render(
      <DatePicker
        label="Appointment"
        placeholderValue={parseZonedDateTime('2026-11-01T09:30[UTC]')}
        granularity="minute"
        onChange={onChange}
      />
    );

    await user.click(getByRole('button', {name: /Calendar/}));
    await user.click(getByRole('button', {name: /November 2, 2026/}));
    expect(onChange).toHaveBeenCalledWith(parseZonedDateTime('2026-11-02T09:30[UTC]'));
  });

  it.each(['value', 'defaultValue'] as const)(
    'uses the time zone of %s instead of the placeholder',
    async prop => {
      let user = userEvent.setup({delay: null, pointerMap});
      let onChange = jest.fn();
      let {getByRole} = render(
        <DatePicker
          label="Appointment"
          {...{[prop]: parseZonedDateTime('2026-11-01T10:45[America/New_York]')}}
          placeholderValue={parseZonedDateTime('2026-11-01T09:30[UTC]')}
          onChange={onChange}
        />
      );

      await user.click(getByRole('button', {name: /Calendar/}));
      await user.click(getByRole('button', {name: /November 2, 2026/}));
      expect(onChange).toHaveBeenCalledWith(
        parseZonedDateTime('2026-11-02T10:45[America/New_York]')
      );
    }
  );
});
