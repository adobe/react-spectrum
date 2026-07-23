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

// Verifies that overlays close when a scrollable ancestor scrolls, both in
// light DOM and inside a shadow DOM (where scroll events have composed: false).
//
// Uses ComboBox which sets isNonModal: true so its Popover registers a
// document.addEventListener('scroll', ...) via useCloseOnScroll.

import {Button} from '../src/Button';
import {ComboBox} from '../src/ComboBox';
import {createRoot} from 'react-dom/client';
import {enableShadowDOM} from 'react-stately/private/flags/flags';
import {expect, it} from 'vitest';
import {Input} from '../src/Input';
import {Label} from '../src/Label';
import {ListBox, ListBoxItem} from '../src/ListBox';
import {Popover} from '../src/Popover';
import React from 'react';
import {User} from '@react-aria/test-utils';

function TestComboBox() {
  return (
    <ComboBox aria-label="Favorite Animal">
      <Label>Favorite Animal</Label>
      <Input />
      <Button>▼</Button>
      <Popover>
        <ListBox>
          <ListBoxItem id="cat">Cat</ListBoxItem>
          <ListBoxItem id="dog">Dog</ListBoxItem>
          <ListBoxItem id="kangaroo">Kangaroo</ListBoxItem>
        </ListBox>
      </Popover>
    </ComboBox>
  );
}

function makeScrollableContainer() {
  let scrollable = document.createElement('div');
  scrollable.style.cssText = 'height: 100px; overflow-y: auto;';
  let inner = document.createElement('div');
  inner.style.height = '500px';
  scrollable.appendChild(inner);
  let mountPoint = document.createElement('div');
  inner.appendChild(mountPoint);
  return {scrollable, mountPoint};
}

it('overlay closes when a scrollable light DOM ancestor scrolls', async () => {
  let testUtilUser = new User();
  let {scrollable, mountPoint} = makeScrollableContainer();
  document.body.appendChild(scrollable);

  let root = createRoot(mountPoint);
  root.render(<TestComboBox />);
  await new Promise<void>(resolve => setTimeout(resolve, 100));

  let comboboxTester = testUtilUser.createTester('ComboBox', {root: scrollable});
  await comboboxTester.open();

  // ComboBox listbox renders into document.body via portal.
  expect(comboboxTester.getListbox()).not.toBeNull();

  // Scroll the ancestor that contains the trigger — window capturing listener should close the overlay.
  scrollable.dispatchEvent(new Event('scroll'));
  await new Promise<void>(resolve => setTimeout(resolve, 100));

  expect(comboboxTester.getListbox()).toBeNull();

  root.unmount();
  document.body.removeChild(scrollable);
});

describe('Shadow DOM', () => {
  /**
   * EnableShadowDOM must be called before mounting.
   *
   * Cannot be turned off, so should be called after light-dom tests.
   */
  enableShadowDOM();

  it('overlay closes when a scrollable shadow DOM ancestor scrolls', async () => {
    let testUtilUser = new User();
    let outerHost = document.createElement('div');
    document.body.appendChild(outerHost);
    let shadowRoot = outerHost.attachShadow({mode: 'open'});

    let {scrollable, mountPoint} = makeScrollableContainer();
    shadowRoot.appendChild(scrollable);

    let root = createRoot(mountPoint);
    root.render(<TestComboBox />);
    await new Promise<void>(resolve => setTimeout(resolve, 100));

    let comboboxTester = testUtilUser.createTester('ComboBox', {root: scrollable});
    await comboboxTester.open();

    // Listbox renders into document.body via portal even in shadow DOM mode.
    expect(comboboxTester.getListbox()).not.toBeNull();

    // Scroll inside the shadow root.
    // Without the fix, document never sees this event (composed: false).
    // With the fix (getEventTargets + addEvent), the shadow root listener closes the overlay.
    scrollable.dispatchEvent(new Event('scroll'));
    await new Promise<void>(resolve => setTimeout(resolve, 100));

    expect(comboboxTester.getListbox()).toBeNull();

    root.unmount();
    document.body.removeChild(outerHost);
  });
});
