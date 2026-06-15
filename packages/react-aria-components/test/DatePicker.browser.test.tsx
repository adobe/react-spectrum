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
import {Calendar, CalendarCell, CalendarGrid} from '../src/Calendar';
import {CalendarDate} from '@internationalized/date';
import {DateInput, DateSegment} from '../src/DateField';
import {DatePicker} from '../src/DatePicker';
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

function TestDatePicker(props) {
  return (
    <DatePicker {...props}>
      <Label>Date</Label>
      <Group>
        <DateInput>{segment => <DateSegment segment={segment} />}</DateInput>
        <Button>▼</Button>
      </Group>
      <FieldError />
      <Popover>
        <Dialog>
          <Calendar>
            <header>
              <Button slot="previous">◀</Button>
              <Heading />
              <Button slot="next">▶</Button>
            </header>
            <CalendarGrid>{date => <CalendarCell date={date} />}</CalendarGrid>
          </Calendar>
        </Dialog>
      </Popover>
    </DatePicker>
  );
}

// Bug #9958, real browser: clear the month, blur to surface the error, then the first calendar
// selection completes the date and clears it.
it('native: error appears after blur and clears on the first calendar selection', async () => {
  let {container} = await render(
    <form>
      <TestDatePicker
        name="date"
        defaultValue={new CalendarDate(2019, 2, 3)}
        validationBehavior="native"
      />
    </form>
  );

  let field = container.querySelector('.react-aria-DatePicker')!;
  let group = container.querySelector('[role=group]')!;
  let segments = group.querySelectorAll('[role=spinbutton]'); // [month, day, year]
  let input = document.querySelector('input[name=date]') as HTMLInputElement;
  let trigger = container.querySelector('button') as HTMLButtonElement;

  await userEvent.click(segments[0]);
  await userEvent.keyboard('{Backspace}');
  expect(input.value).toBe('');
  expect(getDescription(group)).not.toContain('Please enter a value.');

  // Tab out (month → day → year → ▼ trigger) to blur and surface the error.
  await userEvent.tab();
  await userEvent.tab();
  await userEvent.tab();
  expect(field.hasAttribute('data-invalid')).toBe(true);
  expect(getDescription(group)).toContain('Please enter a value.');

  // Open the calendar and click the day after the still-highlighted selection.
  await userEvent.click(trigger);
  let cells = document.querySelectorAll('[role=gridcell]');
  let selected = Array.from(cells).find(c => c.getAttribute('aria-selected') === 'true')!;
  await userEvent.click(selected.nextElementSibling!.children[0] as HTMLElement);

  expect(field.hasAttribute('data-invalid')).toBe(false);
  expect(getDescription(group)).not.toContain('Please enter a value.');
});

// aria-flash report, real browser: the inline error must not flash while typing, only after blur.
it('aria: no error flashes while typing; it appears only after blur', async () => {
  let {container} = await render(<TestDatePicker validationBehavior="aria" />);

  let field = container.querySelector('.react-aria-DatePicker')!;
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
  await userEvent.tab();
  expect(field.hasAttribute('data-invalid')).toBe(true);
  expect(getDescription(group)).toContain('Please enter a value.');
});
