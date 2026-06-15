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

import {CalendarDate} from '@internationalized/date';
import {DateField, DateInput, DateSegment} from '../src/DateField';
import {expect, it, vi} from 'vitest';
import {FieldError} from '../src/FieldError';
import {Label} from '../src/Label';
import React from 'react';
import {render} from 'vitest-browser-react';
import {userEvent} from 'vitest/browser';

let getDescription = (group: Element) =>
  (group.getAttribute('aria-describedby') || '')
    .split(' ')
    .map(d => document.getElementById(d)?.textContent || '')
    .join(' ');

// Bug #9958, real browser: clearing a segment makes the value partial. After blur the error
// shows and native submission is blocked; refilling clears it. Exercises real focus/blur and
// native validity, which jsdom can only fake.
it('native: clearing a segment blocks submission and shows the error; refilling clears it', async () => {
  let onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
  let {container} = await render(
    <form data-testid="form" onSubmit={onSubmit}>
      <DateField
        name="date"
        defaultValue={new CalendarDate(2026, 4, 28)}
        validationBehavior="native">
        <Label>Date</Label>
        <DateInput>{segment => <DateSegment segment={segment} />}</DateInput>
        <FieldError />
      </DateField>
      <button type="submit">Submit</button>
    </form>
  );

  let field = container.querySelector('.react-aria-DateField')!;
  let group = container.querySelector('[role=group]')!;
  let segments = group.querySelectorAll('[role=spinbutton]'); // [month, day, year]
  let input = document.querySelector('input[name=date]') as HTMLInputElement;
  let submit = container.querySelector('button[type=submit]') as HTMLButtonElement;

  await userEvent.click(segments[0]);
  await userEvent.keyboard('{Backspace}');

  // Hidden input is empty and natively missing right away, but no error shows until blur.
  expect(input.value).toBe('');
  expect(input.validity.valueMissing).toBe(true);
  expect(getDescription(group)).not.toContain('Please enter a value.');

  // Tab out (month → day → year → submit) to blur and commit the error.
  await userEvent.tab();
  await userEvent.tab();
  await userEvent.tab();
  expect(field.hasAttribute('data-invalid')).toBe(true);
  expect(getDescription(group)).toContain('Please enter a value.');

  // Native submission stays blocked while partial.
  await userEvent.click(submit);
  expect(onSubmit).not.toHaveBeenCalled();

  // Refilling completes the value and clears the error in realtime.
  await userEvent.click(segments[0]);
  await userEvent.keyboard('4');
  expect(field.hasAttribute('data-invalid')).toBe(false);
  expect(getDescription(group)).not.toContain('Please enter a value.');

  await userEvent.click(submit);
  expect(onSubmit).toHaveBeenCalledTimes(1);
});

// LFDanLu's report: with validationBehavior="aria" the error must not flash mid-typing, only
// after blur with the value still incomplete.
it('aria: no error flashes while typing; it appears only after blur', async () => {
  let {container} = await render(
    <DateField name="date" validationBehavior="aria">
      <Label>Date</Label>
      <DateInput>{segment => <DateSegment segment={segment} />}</DateInput>
      <FieldError />
    </DateField>
  );

  let field = container.querySelector('.react-aria-DateField')!;
  let group = container.querySelector('[role=group]')!;
  let segments = group.querySelectorAll('[role=spinbutton]');

  await userEvent.click(segments[0]);
  await userEvent.keyboard('4');
  expect(field.hasAttribute('data-invalid')).toBe(false);
  await userEvent.keyboard('28');
  expect(field.hasAttribute('data-invalid')).toBe(false);

  // Tab out with the year still missing → error appears.
  await userEvent.tab();
  await userEvent.tab();
  expect(field.hasAttribute('data-invalid')).toBe(true);
  expect(getDescription(group)).toContain('Please enter a value.');

  // Completing the value clears it in realtime.
  await userEvent.click(segments[2]);
  await userEvent.keyboard('2026');
  expect(field.hasAttribute('data-invalid')).toBe(false);
});
