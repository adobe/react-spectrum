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

import {createRoot} from 'react-dom/client';
import {DatePicker} from '../src/DatePicker';
import {DateRangePicker} from '../src/DateRangePicker';
import {expect, it} from 'vitest';
import {Form} from '../src/Form';
import {parseDateTime} from '@internationalized/date';
import {Provider} from '../src/Provider';
import React, {ReactElement} from 'react';
import {userEvent} from 'vitest/browser';

// Opens the picker's calendar and measures the time fields in the popup.
async function popupTimeFieldWidths(picker: ReactElement, inForm: boolean): Promise<number[]> {
  let container = document.createElement('div');
  document.body.appendChild(container);
  let root = createRoot(container);
  root.render(
    <Provider locale="en-US" colorScheme="light">
      {inForm ? <Form>{picker}</Form> : <div>{picker}</div>}
    </Provider>
  );

  await expect.poll(() => container.querySelector('button[aria-label="Calendar"]')).not.toBeNull();
  await userEvent.click(
    container.querySelector('button[aria-label="Calendar"]') as HTMLButtonElement
  );
  await expect.poll(() => document.querySelector('[role="dialog"] [role="group"]')).not.toBeNull();

  // The segments keep their width when the field collapses, so measure the field box around them.
  let widths = Array.from(
    document.querySelectorAll('[role="dialog"] [role="group"]'),
    group => group.parentElement!.getBoundingClientRect().width
  );

  root.unmount();
  container.remove();
  return widths;
}

it.each([
  ['DatePicker', <DatePicker label="Date" defaultValue={parseDateTime('2024-01-10T10:30')} />],
  [
    'DateRangePicker',
    <DateRangePicker
      label="Dates"
      defaultValue={{
        start: parseDateTime('2024-01-10T10:30'),
        end: parseDateTime('2024-01-15T14:45')
      }}
    />
  ]
])('%s popup time fields are as wide inside a Form as outside one', async (_, picker) => {
  let outside = await popupTimeFieldWidths(picker, false);
  let inside = await popupTimeFieldWidths(picker, true);

  expect(outside.length).toBeGreaterThan(0);
  expect(inside).toEqual(outside);
});
