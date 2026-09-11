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

// These tests exercise real component interactions inside a shadow root in a real browser,
// which jsdom cannot reproduce (focus events retarget to the shadow host). ComboBox and
// NumberField both use preventFocusOnPress on their trigger/stepper buttons, so pressing
// those controls relies on preventFocus() correctly handling shadow-DOM focus events.

import {Button} from '../src/Button';
import {ComboBox} from '../src/ComboBox';
import {createRoot} from 'react-dom/client';
import {enableShadowDOM} from 'react-stately/private/flags/flags';
import {expect, it, vi} from 'vitest';
import {Group} from '../src/Group';
import {Input} from '../src/Input';
import {Label} from '../src/Label';
import {ListBox, ListBoxItem} from '../src/ListBox';
import {Menu, MenuItem, MenuTrigger} from '../src/Menu';
import {NumberField} from '../src/NumberField';
import {Popover} from '../src/Popover';
import React from 'react';
import {UNSAFE_PortalProvider} from 'react-aria/PortalProvider';
import {User} from '@react-aria/test-utils';
import {userEvent} from 'vitest/browser';

enableShadowDOM();

// Firefox has a bug that leaks a focus event and causes another test to fail.
let isFirefox = /firefox/i.test(navigator.userAgent);

function mountInShadow(ui: React.ReactElement) {
  let host = document.createElement('div');
  document.body.appendChild(host);
  let shadowRoot = host.attachShadow({mode: 'open'});
  let mountPoint = document.createElement('div');
  shadowRoot.appendChild(mountPoint);
  let root = createRoot(mountPoint);
  root.render(ui);
  return {
    host,
    shadowRoot,
    mountPoint,
    cleanup: () => {
      root.unmount();
      document.body.removeChild(host);
    }
  };
}

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

function TestNumberField() {
  return (
    <NumberField aria-label="Width" defaultValue={0}>
      <Label>Width</Label>
      <Group>
        <Button slot="decrement">-</Button>
        <Input />
        <Button slot="increment">+</Button>
      </Group>
    </NumberField>
  );
}

it.skipIf(isFirefox)(
  'ComboBox opens by clicking its trigger, keeps focus in the input, and selects an option inside a shadow root',
  async () => {
    let testUtilUser = new User();
    let {shadowRoot, mountPoint, cleanup} = mountInShadow(<TestComboBox />);
    await expect.poll(() => mountPoint.querySelector('input')).not.toBeNull();

    // Use the tester only to locate elements; drive interactions with real browser events so the
    // native focus behavior (and shadow-DOM retargeting) is reproduced. (@react-aria/test-utils'
    // user-event and vitest's browser userEvent differ for focus events.)
    let comboboxTester = testUtilUser.createTester('ComboBox', {root: mountPoint});
    let input = comboboxTester.getCombobox() as HTMLInputElement;
    let trigger = comboboxTester.getTrigger();

    await userEvent.click(input);
    await expect.poll(() => shadowRoot.activeElement).toBe(input);

    // Opening via the chevron should keep focus in the input, not move it to the button, and it
    // should still work in shadow DOM.
    await userEvent.click(trigger);
    await expect.poll(() => comboboxTester.getListbox()).not.toBeNull();
    await expect.poll(() => shadowRoot.activeElement).toBe(input);

    // The listbox portals to the light DOM.
    let dog = comboboxTester.getOptions().find(o => o.textContent === 'Dog')!;
    await userEvent.click(dog);

    await expect.poll(() => comboboxTester.getListbox()).toBeNull();
    await expect.poll(() => input.value).toBe('Dog');

    cleanup();
  }
);

it.skipIf(isFirefox)(
  'NumberField keeps focus in the input while clicking the stepper inside a shadow root',
  async () => {
    let {shadowRoot, mountPoint, cleanup} = mountInShadow(<TestNumberField />);
    await expect.poll(() => mountPoint.querySelector('input')).not.toBeNull();

    let input = shadowRoot.querySelector('input') as HTMLInputElement;
    let incrementButton = shadowRoot.querySelector('[slot="increment"]') as HTMLButtonElement;

    expect(input.value).toBe('0');

    await userEvent.click(input);
    await expect.poll(() => shadowRoot.activeElement).toBe(input);

    // Clicking the stepper must increment the value while keeping focus in the input so the user
    // can keep editing (the stepper uses preventFocusOnPress).
    await userEvent.click(incrementButton);
    await expect.poll(() => input.value).toBe('1');
    await expect.poll(() => shadowRoot.activeElement).toBe(input);

    await userEvent.click(incrementButton);
    await expect.poll(() => input.value).toBe('2');
    await expect.poll(() => shadowRoot.activeElement).toBe(input);

    cleanup();
  }
);

it.skipIf(isFirefox)(
  'Menu opens from its trigger and fires onAction with the overlay portaled into the same shadow root',
  async () => {
    let host = document.createElement('div');
    document.body.appendChild(host);
    let shadowRoot = host.attachShadow({mode: 'open'});
    let appContainer = document.createElement('div');
    shadowRoot.appendChild(appContainer);
    // The overlay portals into a container inside the same shadow root via UNSAFE_PortalProvider.
    let portal = document.createElement('div');
    shadowRoot.appendChild(portal);

    let onAction = vi.fn();
    function App() {
      return (
        <UNSAFE_PortalProvider getContainer={() => portal}>
          <MenuTrigger>
            <Button>Open</Button>
            <Popover>
              <Menu onAction={onAction}>
                <MenuItem id="new">New…</MenuItem>
                <MenuItem id="open">Open…</MenuItem>
                <MenuItem id="save">Save</MenuItem>
              </Menu>
            </Popover>
          </MenuTrigger>
        </UNSAFE_PortalProvider>
      );
    }
    let root = createRoot(appContainer);
    root.render(<App />);
    await expect.poll(() => appContainer.querySelector('button')).not.toBeNull();

    // Opening via the trigger (preventFocusOnPress) must open the menu and keep it open so its
    // items stay interactable inside the shadow root.
    let button = appContainer.querySelector('button') as HTMLButtonElement;
    await userEvent.click(button);
    await expect.poll(() => shadowRoot.querySelector('[role="menu"]')).not.toBeNull();

    let openItem = Array.from(shadowRoot.querySelectorAll('[role="menuitem"]')).find(
      item => item.textContent?.trim() === 'Open…'
    ) as HTMLElement;
    await userEvent.click(openItem);
    await expect(onAction).toHaveBeenCalledTimes(1);

    root.unmount();
    document.body.removeChild(host);
  }
);
