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

import {DateInput, DateSegment, TimeField} from '../src/DateField';
import {expect, it} from 'vitest';
import {FieldError} from '../src/FieldError';
import {Label} from '../src/Label';
import React from 'react';
import {render} from 'vitest-browser-react';
import {Time} from '@internationalized/date';
import {userEvent} from 'vitest/browser';

let getDescription = (group: Element) =>
  (group.getAttribute('aria-describedby') || '')
    .split(' ')
    .map(d => document.getElementById(d)?.textContent || '')
    .join(' ');

// Bug #9801, real browser: clearing the hour makes the value partial. After blur the error
// shows; refilling clears it.
it('native: clearing the hour blocks submission and shows the error; refilling clears it', async () => {
  let {container} = await render(
    <form>
      <TimeField name="time" defaultValue={new Time(13, 30)} validationBehavior="native">
        <Label>Time</Label>
        <DateInput>{segment => <DateSegment segment={segment} />}</DateInput>
        <FieldError />
      </TimeField>
    </form>
  );

  let field = container.querySelector('.react-aria-TimeField')!;
  let group = container.querySelector('[role=group]')!;
  let segments = group.querySelectorAll('[role=spinbutton]'); // [hour, minute, dayPeriod]
  let input = document.querySelector('input[name=time]') as HTMLInputElement;

  await userEvent.click(segments[0]);
  await userEvent.keyboard('{Backspace}');
  expect(input.value).toBe('');
  expect(getDescription(group)).not.toContain('Please enter a value.');

  // Tab out (hour → minute → dayPeriod → out) to blur and surface the error.
  await userEvent.tab();
  await userEvent.tab();
  await userEvent.tab();
  expect(field.hasAttribute('data-invalid')).toBe(true);
  expect(getDescription(group)).toContain('Please enter a value.');

  await userEvent.click(segments[0]);
  await userEvent.keyboard('1');
  expect(field.hasAttribute('data-invalid')).toBe(false);
  expect(getDescription(group)).not.toContain('Please enter a value.');
});

// Description fix, real browser: clearing only the AM/PM segment must not announce a fabricated
// "1:30 AM" — while partial no selected-value description is announced; refilling restores it.
it('does not announce a fabricated selected time while AM/PM is cleared', async () => {
  let {container} = await render(
    <TimeField defaultValue={new Time(13, 30)}>
      <Label>Time</Label>
      <DateInput>{segment => <DateSegment segment={segment} />}</DateInput>
    </TimeField>
  );

  let group = container.querySelector('[role=group]')!;
  let segments = group.querySelectorAll('[role=spinbutton]'); // [hour, minute, dayPeriod]
  // The interpolated value ("1:30 PM") isn't asserted: under the vitest browser bundle the ICU
  // formatter emits a raw "{time}" placeholder. This verifies suppression/restoration of the
  // selected-value description, which is harness-independent.
  expect(getDescription(group)).toContain('Selected Time');

  await userEvent.click(segments[2]);
  await userEvent.keyboard('{Backspace}');
  expect(getDescription(group)).not.toContain('Selected Time');

  await userEvent.click(segments[2]);
  await userEvent.keyboard('p');
  expect(getDescription(group)).toContain('Selected Time');
});
