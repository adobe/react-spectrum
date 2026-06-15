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

import {Button} from '../src/Button';
import {CalendarCell, CalendarGrid, RangeCalendar} from '../src/Calendar';
import {CalendarDate} from '@internationalized/date';
import {DateInput, DateSegment} from '../src/DateField';
import {DateRangePicker} from '../src/DatePicker';
import {Dialog} from '../src/Dialog';
import {expect, it} from 'vitest';
import {FieldError} from '../src/FieldError';
import {Group} from '../src/Group';
import {Heading} from '../src/Heading';
import {Label} from '../src/Label';
import {Popover} from '../src/Popover';
import React from 'react';
import {render} from 'vitest-browser-react';
import {userEvent} from 'vitest/browser';

let getDescription = (group: Element) =>
  (group.getAttribute('aria-describedby') || '')
    .split(' ')
    .map(d => document.getElementById(d)?.textContent || '')
    .join(' ');

function TestDateRangePicker(props) {
  return (
    <DateRangePicker {...props}>
      <Label>Trip dates</Label>
      <Group>
        <DateInput slot="start">{segment => <DateSegment segment={segment} />}</DateInput>
        <span aria-hidden="true">–</span>
        <DateInput slot="end">{segment => <DateSegment segment={segment} />}</DateInput>
        <Button>▼</Button>
      </Group>
      <FieldError />
      <Popover>
        <Dialog>
          <RangeCalendar>
            <header>
              <Button slot="previous">◀</Button>
              <Heading />
              <Button slot="next">▶</Button>
            </header>
            <CalendarGrid>{date => <CalendarCell date={date} />}</CalendarGrid>
          </RangeCalendar>
        </Dialog>
      </Popover>
    </DateRangePicker>
  );
}

// Bug #9958, real browser: clearing a start segment makes the range partial. After blur the
// error shows; refilling clears it.
it('native: clearing a start segment shows the error after blur; refilling clears it', async () => {
  let {container} = await render(
    <form>
      <TestDateRangePicker
        startName="start"
        endName="end"
        defaultValue={{start: new CalendarDate(2026, 4, 28), end: new CalendarDate(2026, 5, 15)}}
        validationBehavior="native"
      />
    </form>
  );

  let field = container.querySelector('.react-aria-DateRangePicker')!;
  let group = container.querySelector('[role=group]')!;
  let segments = group.querySelectorAll('[role=spinbutton]'); // start[m,d,y], end[m,d,y]
  let startInput = document.querySelector('input[name=start]') as HTMLInputElement;

  await userEvent.click(segments[0]);
  await userEvent.keyboard('{Backspace}');
  expect(startInput.value).toBe('');
  expect(getDescription(group)).not.toContain('Please enter a value.');

  // Tab fully out (both endpoints + trigger) to blur and surface the error.
  for (let i = 0; i < 7; i++) {
    await userEvent.tab();
  }
  expect(field.hasAttribute('data-invalid')).toBe(true);
  expect(getDescription(group)).toContain('Please enter a value.');

  await userEvent.click(segments[0]);
  await userEvent.keyboard('4');
  expect(field.hasAttribute('data-invalid')).toBe(false);
  expect(getDescription(group)).not.toContain('Please enter a value.');
});

// Bug #9958, real browser: both endpoints partial is invalid; completing the whole range clears
// it. Clear the single-digit *month* of each endpoint — one Backspace fully empties it, whereas
// a two-digit segment like the day (15) only loses a digit and stays complete.
it('native: a both-partial range is invalid and clears once the range is completed', async () => {
  let {container} = await render(
    <form>
      <TestDateRangePicker
        startName="start"
        endName="end"
        defaultValue={{start: new CalendarDate(2026, 4, 28), end: new CalendarDate(2026, 5, 15)}}
        validationBehavior="native"
      />
    </form>
  );

  let field = container.querySelector('.react-aria-DateRangePicker')!;
  let group = container.querySelector('[role=group]')!;
  let segments = group.querySelectorAll('[role=spinbutton]'); // start[m,d,y], end[m,d,y]

  await userEvent.click(segments[0]);
  await userEvent.keyboard('{Backspace}');
  await userEvent.click(segments[3]);
  await userEvent.keyboard('{Backspace}');

  for (let i = 0; i < 7; i++) {
    await userEvent.tab();
  }
  expect(field.hasAttribute('data-invalid')).toBe(true);
  expect(getDescription(group)).toContain('Please enter a value.');

  await userEvent.click(segments[0]);
  await userEvent.keyboard('4');
  await userEvent.click(segments[3]);
  await userEvent.keyboard('5');
  expect(field.hasAttribute('data-invalid')).toBe(false);
  expect(getDescription(group)).not.toContain('Please enter a value.');
});

// Bug #9958, real browser: with both endpoints partial, completing only the start must not clear
// the error early — the range stays invalid until the end is whole too (matches jsdom + manual).
it('native: completing only the start of a both-partial range keeps it invalid until the end is filled', async () => {
  let {container} = await render(
    <form>
      <TestDateRangePicker
        startName="start"
        endName="end"
        defaultValue={{start: new CalendarDate(2026, 4, 28), end: new CalendarDate(2026, 5, 15)}}
        validationBehavior="native"
      />
    </form>
  );

  let field = container.querySelector('.react-aria-DateRangePicker')!;
  let group = container.querySelector('[role=group]')!;
  let segments = group.querySelectorAll('[role=spinbutton]'); // start[m,d,y], end[m,d,y]

  await userEvent.click(segments[0]);
  await userEvent.keyboard('{Backspace}');
  await userEvent.click(segments[3]);
  await userEvent.keyboard('{Backspace}');

  for (let i = 0; i < 7; i++) {
    await userEvent.tab();
  }
  expect(field.hasAttribute('data-invalid')).toBe(true);

  // Complete only the start; the end month stays empty.
  await userEvent.click(segments[0]);
  await userEvent.keyboard('4');

  // Still invalid — must not clear early while the end is partial.
  expect(field.hasAttribute('data-invalid')).toBe(true);
  expect(getDescription(group)).toContain('Please enter a value.');

  await userEvent.click(segments[3]);
  await userEvent.keyboard('5');
  expect(field.hasAttribute('data-invalid')).toBe(false);
  expect(getDescription(group)).not.toContain('Please enter a value.');
});
