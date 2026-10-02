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
import {Dialog, DialogTrigger} from '../src/Dialog';
import {expect, it} from 'vitest';
import {ListBox, ListBoxItem} from '../src/ListBox';
import {Popover} from '../src/Popover';
import React, {useState} from 'react';
import {render} from 'vitest-browser-react';
import {Select, SelectValue} from '../src/Select';
import {userEvent} from 'vitest/browser';

function Example({type, defaultOpen = true}: {type: 'dialog' | 'select'; defaultOpen?: boolean}) {
  if (type === 'select') {
    return (
      <Select aria-label="Animal" defaultOpen={defaultOpen}>
        <Button>
          <SelectValue />
        </Button>
        <Popover>
          <ListBox>
            <ListBoxItem id="cat">Cat</ListBoxItem>
            <ListBoxItem id="dog">Dog</ListBoxItem>
          </ListBox>
        </Popover>
      </Select>
    );
  }

  return (
    <DialogTrigger defaultOpen={defaultOpen}>
      <Button>Open dialog</Button>
      <Popover>
        <Dialog aria-label="Example">
          <Button slot="close">Close</Button>
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}

it.each(['dialog', 'select'] as const)('restores a default-open %s to its trigger', async type => {
  let {container, getByRole} = await render(<Example type={type} />);
  let trigger = container.querySelector('button')!;
  let overlay = getByRole(type === 'dialog' ? 'dialog' : 'listbox');
  await expect.element(overlay).toBeVisible();
  await expect.poll(() => overlay.element().contains(document.activeElement)).toBe(true);

  await userEvent.keyboard('{Escape}');
  await expect.element(trigger).toHaveFocus();
  await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');

  await userEvent.click(trigger);
  await expect.element(overlay).toBeVisible();
  await expect.poll(() => overlay.element().contains(document.activeElement)).toBe(true);
  await userEvent.keyboard('{Escape}');
  await expect.element(trigger).toHaveFocus();
});

it.each(['dialog', 'select'] as const)(
  'preserves an existing restore target for a %s',
  async type => {
    function Test() {
      let [show, setShow] = useState(false);
      return (
        <>
          <button autoFocus onClick={() => setShow(true)}>
            Mount overlay
          </button>
          {show && <Example type={type} />}
        </>
      );
    }
    let {getByRole} = await render(<Test />);
    let opener = getByRole('button', {name: 'Mount overlay'});
    await expect.element(opener).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    let overlay = getByRole(type === 'dialog' ? 'dialog' : 'listbox');
    await expect.element(overlay).toBeVisible();
    await expect.poll(() => overlay.element().contains(document.activeElement)).toBe(true);
    await userEvent.keyboard('{Escape}');
    await expect.element(opener).toHaveFocus();
  }
);
