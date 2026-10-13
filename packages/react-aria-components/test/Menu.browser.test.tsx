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
import {commands, page, userEvent} from 'vitest/browser';
import {expect, it, vi} from 'vitest';
import {Menu, MenuItem, MenuTrigger} from '../src/Menu';
import {Popover} from '../src/Popover';
import React from 'react';
import {render} from 'vitest-browser-react';
import {setInteractionModality} from 'react-aria';

function MenuExample({onAction}) {
  return (
    <MenuTrigger>
      <Button>Actions</Button>
      <Popover>
        <Menu aria-label="Actions" onAction={onAction}>
          <MenuItem id="open">Open</MenuItem>
          <MenuItem id="rename">Rename</MenuItem>
          <MenuItem id="delete">Delete</MenuItem>
        </Menu>
      </Popover>
    </MenuTrigger>
  );
}

it('does not highlight a menu item while pressing outside a mouse-opened menu', async () => {
  let onAction = vi.fn();
  await render(<MenuExample onAction={onAction} />);

  let restorePointerModality = () => setInteractionModality('pointer');
  document.addEventListener('click', restorePointerModality, true);

  try {
    await userEvent.click(page.getByRole('button', {name: 'Actions'}));
    let menu = page.getByRole('menu');
    await expect.element(menu).toBeInTheDocument();

    // Use a native press on the underlay so the browser moves focus out of the menu.
    // Keep the button held while FocusScope restores focus on the next animation frame.
    await commands.mouseDownOnElement('[data-testid="underlay"]', 5);
    try {
      await new Promise(resolve =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve(null)))
      );

      expect(menu.element().querySelector('[data-focused]')).toBeNull();
      expect(onAction).not.toHaveBeenCalled();
    } finally {
      await commands.mouseUp();
    }

    await expect.element(menu).not.toBeInTheDocument();
    expect(onAction).not.toHaveBeenCalled();
  } finally {
    document.removeEventListener('click', restorePointerModality, true);
  }
});

it.each([
  ['Enter', 'Open'],
  ['ArrowDown', 'Open'],
  ['ArrowUp', 'Delete']
])('focuses the appropriate item when opening with %s', async (key, item) => {
  await render(<MenuExample onAction={vi.fn()} />);

  await userEvent.tab();
  await expect.element(page.getByRole('button', {name: 'Actions'})).toHaveFocus();
  await userEvent.keyboard(`{${key}}`);
  await expect.element(page.getByRole('menuitem', {name: item})).toHaveFocus();

  await userEvent.keyboard('{Escape}');
  await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
});
