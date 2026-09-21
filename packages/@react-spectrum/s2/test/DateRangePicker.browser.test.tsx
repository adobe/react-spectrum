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
import {DateRangePicker} from '../src/DateRangePicker';
import {enableShadowDOM} from 'react-stately/private/flags/flags';
import {expect, it, vi} from 'vitest';
import {parseDate} from '@internationalized/date';
import {Provider} from '../src/Provider';
import React from 'react';
import {UNSAFE_PortalProvider} from 'react-aria/PortalProvider';
import {userEvent} from 'vitest/browser';

// Must be enabled before mounting. This flag is one-way and cannot be turned off.
enableShadowDOM();

// Firefox has a bug that leaks a focus event and causes another test to fail.
let isFirefox = /firefox/i.test(navigator.userAgent);

it.skipIf(isFirefox)('DateRangePicker opens and selects a range inside a shadow root', async () => {
  let onChange = vi.fn();

  let host = document.createElement('div');
  document.body.appendChild(host);
  let shadowRoot = host.attachShadow({mode: 'open'});
  let appContainer = document.createElement('div');
  shadowRoot.appendChild(appContainer);
  // Portal the calendar overlay into the same shadow root (the real web-component scenario),
  // rather than letting it default to the light-DOM document.body.
  let portal = document.createElement('div');
  shadowRoot.appendChild(portal);

  // Match on the date portion of a day cell's aria-label so the query is robust to the weekday
  // prefix / "selected" suffix. Cells live in the shadow root because of the portal above.
  let findDay = (dateText: string) =>
    Array.from(shadowRoot.querySelectorAll('[role="button"]')).find(el =>
      el.getAttribute('aria-label')?.includes(dateText)
    ) as HTMLElement | undefined;

  let root = createRoot(appContainer);
  root.render(
    <Provider locale="en-US" colorScheme="light">
      <UNSAFE_PortalProvider getContainer={() => portal}>
        {/* A fixed defaultValue pins the visible month to January 2024 so the test is
            deterministic regardless of today's date. */}
        <DateRangePicker
          label="Reservation dates"
          defaultValue={{start: parseDate('2024-01-10'), end: parseDate('2024-01-15')}}
          onChange={onChange}
        />
      </UNSAFE_PortalProvider>
    </Provider>
  );

  // Open the calendar via its trigger button.
  await expect.poll(() => shadowRoot.querySelector('button[aria-label="Calendar"]')).not.toBeNull();
  let calendarButton = shadowRoot.querySelector(
    'button[aria-label="Calendar"]'
  ) as HTMLButtonElement;
  await userEvent.click(calendarButton);

  await expect.poll(() => shadowRoot.querySelector('[role="grid"]')).not.toBeNull();

  // Select a new range: click the start day, then the end day (both in the visible January 2024).
  await expect.poll(() => findDay('January 20, 2024')).toBeTruthy();
  await userEvent.click(findDay('January 20, 2024')!);

  await expect.poll(() => findDay('January 25, 2024')).toBeTruthy();
  await userEvent.click(findDay('January 25, 2024')!);

  // The newly selected range should be committed.
  await expect.poll(() => onChange.mock.calls.length).toBeGreaterThan(0);
  let selected = onChange.mock.calls.at(-1)![0];
  expect(selected.start.toString()).toBe('2024-01-20');
  expect(selected.end.toString()).toBe('2024-01-25');

  root.unmount();
  document.body.removeChild(host);
});
