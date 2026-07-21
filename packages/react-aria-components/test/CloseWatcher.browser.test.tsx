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

import {Autocomplete} from '../src/Autocomplete';
import {Button} from '../src/Button';
import {Checkbox} from '../src/Checkbox';
import {describe, expect, it} from 'vitest';
import {Dialog, DialogTrigger} from '../src/Dialog';
import {GridList, GridListItem} from '../src/GridList';
import {Heading} from '../src/Heading';
import {Input} from '../src/Input';
import {Menu, MenuItem, MenuTrigger, SubmenuTrigger} from '../src/Menu';
import {Modal, ModalOverlay} from '../src/Modal';
import {Popover} from '../src/Popover';
import React from 'react';
import {render} from 'vitest-browser-react';
import {SearchField} from '../src/SearchField';
import {useFilter} from 'react-aria/useFilter';
import {User} from '@react-aria/test-utils';
import {userEvent} from 'vitest/browser';

async function press(key: string) {
  await userEvent.keyboard(`{${key}}`);
}

describe('CloseWatcher dismissal', () => {
  it('closes a single modal on Escape', async () => {
    let screen = await render(
      <DialogTrigger defaultOpen>
        <Button>Open</Button>
        <Modal>
          <Dialog>
            <Heading slot="title">Hello</Heading>
            <Button autoFocus>Focus</Button>
          </Dialog>
        </Modal>
      </DialogTrigger>
    );
    await expect.element(screen.getByRole('dialog')).toBeInTheDocument();
    await press('Escape');
    await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not close when isKeyboardDismissDisabled', async () => {
    let screen = await render(
      <DialogTrigger defaultOpen>
        <Button>Open</Button>
        <ModalOverlay isKeyboardDismissDisabled>
          <Modal>
            <Dialog>
              <Heading slot="title">Locked</Heading>
              <Button autoFocus>Focus</Button>
            </Dialog>
          </Modal>
        </ModalOverlay>
      </DialogTrigger>
    );
    await expect.element(screen.getByRole('dialog')).toBeInTheDocument();
    await press('Escape');
    await expect.element(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes the top-most overlay first for nested modals', async () => {
    // Outer opens on mount (the single "free" watcher). The inner modal is
    // opened by a click so it gets its own transient-user-activation watcher
    // and is NOT grouped with the outer (grouping would close both at once).
    let screen = await render(
      <DialogTrigger defaultOpen>
        <Button>Open outer</Button>
        <Modal>
          <Dialog>
            <Heading slot="title">Outer</Heading>
            <DialogTrigger>
              <Button autoFocus>Open inner</Button>
              <ModalOverlay>
                <Modal>
                  <Dialog>
                    <Heading slot="title">Inner</Heading>
                    <Button autoFocus>Inner focus</Button>
                  </Dialog>
                </Modal>
              </ModalOverlay>
            </DialogTrigger>
          </Dialog>
        </Modal>
      </DialogTrigger>
    );
    await expect.element(screen.getByRole('button', {name: 'Open inner'})).toBeInTheDocument();
    let outerDialog = screen.getByRole('dialog');
    let outerButton = screen.getByRole('button', {name: 'Open inner'});
    await userEvent.click(outerButton);
    await expect.element(screen.getByRole('button', {name: 'Inner focus'})).toBeInTheDocument();
    let innerButton = screen.getByRole('button', {name: 'Inner focus'});
    await press('Escape');
    // Inner closed, outer remains.
    await expect.element(innerButton).not.toBeInTheDocument();
    await expect.element(screen.getByRole('dialog')).toBeInTheDocument();
    await expect.poll(() => screen.getByRole('dialog').elements().length).toBe(1);
    // Focus restoration to the trigger is async (focus briefly falls to <body>
    // before FocusScope restores it). Wait for focus to return to the outer trigger
    // otherwise Escape will fire on <body> and never reach the overlay.
    await expect.poll(() => document.activeElement).toBe(outerButton.element());
    await press('Escape');
    // Outer closes on the replacement/next watcher.
    await expect.element(outerDialog).not.toBeInTheDocument();
  });

  it('closes an inner popover before the modal', async () => {
    // Modal opens on mount (free watcher); popover opened via click so its
    // watcher is independent (not grouped) and receives the first close request.
    let screen = await render(
      <DialogTrigger defaultOpen>
        <Button>Open modal</Button>
        <Modal>
          <Dialog>
            <Heading slot="title">Modal</Heading>
            <DialogTrigger>
              <Button autoFocus>Open popover</Button>
              <Popover>
                <Dialog>
                  <Button autoFocus>Popover content</Button>
                </Dialog>
              </Popover>
            </DialogTrigger>
          </Dialog>
        </Modal>
      </DialogTrigger>
    );
    let popoverTrigger = screen.getByRole('button', {name: 'Open popover'});
    await userEvent.click(popoverTrigger);
    await expect.element(screen.getByText('Popover content')).toBeInTheDocument();
    await press('Escape');
    // Popover (most-recent watcher) closes; modal stays.
    await expect.element(screen.getByText('Popover content')).not.toBeInTheDocument();
    await expect.element(screen.getByRole('dialog')).toBeInTheDocument();

    await expect.poll(() => document.activeElement).toBe(popoverTrigger.element());
    await press('Escape');
    // Modal closes on the next close request.
    await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('recreates a watcher when a controlled parent ignores onOpenChange', async () => {
    let closeCount = 0;
    function Controlled() {
      let [isOpen, setIsOpen] = React.useState(true);
      // Always open; ignore onOpenChange(false) so the modal stays open.
      return (
        <DialogTrigger
          isOpen={isOpen}
          onOpenChange={isOpen => {
            if (!isOpen && closeCount < 1) {
              closeCount++;
              return;
            }
            setIsOpen(isOpen);
          }}>
          <Button>Open</Button>
          <Modal>
            <Dialog>
              <Heading slot="title">Sticky</Heading>
              <Button autoFocus>Focus</Button>
            </Dialog>
          </Modal>
        </DialogTrigger>
      );
    }
    let screen = await render(<Controlled />);
    await expect.element(screen.getByRole('dialog')).toBeInTheDocument();

    await press('Escape');
    await expect.poll(() => closeCount).toBe(1);
    await expect.element(screen.getByRole('dialog')).toBeInTheDocument();

    // Second Escape only fires if a replacement watcher was created.
    await press('Escape');
    await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('a non-dismissable modal on top blocks Escape from closing the modal beneath it', async () => {
    // Outer (dismissable) opens on mount; inner (isKeyboardDismissDisabled) is
    // opened on top. Escape must NOT close the outer modal past the inner one.
    let screen = await render(
      <DialogTrigger defaultOpen>
        <Button>Open outer</Button>
        <Modal>
          <Dialog>
            <Heading slot="title">Outer</Heading>
            <DialogTrigger>
              <Button autoFocus>Open inner</Button>
              <ModalOverlay isKeyboardDismissDisabled>
                <Modal>
                  <Dialog>
                    <Heading slot="title">Inner</Heading>
                    <Button autoFocus>Inner focus</Button>
                  </Dialog>
                </Modal>
              </ModalOverlay>
            </DialogTrigger>
          </Dialog>
        </Modal>
      </DialogTrigger>
    );
    await userEvent.click(screen.getByRole('button', {name: 'Open inner'}));
    await expect.poll(() => screen.getByRole('dialog').elements().length).toBe(2);
    let innerContent = screen.getByRole('button', {name: 'Inner focus'});
    await expect.poll(() => document.activeElement).toBe(innerContent.element());

    // Escape does nothing: the non-dismissable inner modal absorbs/blocks the
    // close request, so neither modal closes.
    await press('Escape');
    await press('Escape');
    await expect.poll(() => screen.getByRole('dialog').elements().length).toBe(2);
  });

  it('Escape clears the autocomplete input, then closes the popover, then the dialog', async () => {
    function Example() {
      let {contains} = useFilter({sensitivity: 'base'});
      return (
        <DialogTrigger defaultOpen>
          <Button>Open dialog</Button>
          <Modal>
            <Dialog>
              <Heading slot="title">Dialog</Heading>
              <DialogTrigger>
                <Button autoFocus>Open popover</Button>
                <Popover>
                  <Autocomplete filter={(t, i) => contains(t, i)}>
                    <SearchField autoFocus aria-label="Search">
                      <Input />
                    </SearchField>
                    <Menu aria-label="options">
                      <MenuItem id="1">Foo</MenuItem>
                      <MenuItem id="2">Bar</MenuItem>
                      <MenuItem id="3">Baz</MenuItem>
                    </Menu>
                  </Autocomplete>
                </Popover>
              </DialogTrigger>
            </Dialog>
          </Modal>
        </DialogTrigger>
      );
    }
    let screen = await render(<Example />);
    let popoverTrigger = screen.getByRole('button', {name: 'Open popover'});
    await userEvent.click(popoverTrigger);
    let searchbox = screen.getByRole('searchbox');
    await expect.element(searchbox).toBeInTheDocument();
    await userEvent.type(searchbox, 'Fo');
    await expect.element(searchbox).toHaveValue('Fo');

    // Esc #1: the autocomplete/search field consumes Escape to clear its input.
    // The popover (and dialog) stay open, and the close request is suppressed.
    await press('Escape');
    await expect.element(searchbox).toHaveValue('');
    await expect.element(searchbox).toBeInTheDocument();

    // Esc #2: with an empty input, Escape closes the popover. The modal remains.
    await press('Escape');
    await expect.element(screen.getByRole('searchbox')).not.toBeInTheDocument();
    await expect.element(screen.getByRole('dialog')).toBeInTheDocument();

    // Wait for focus to return to the popover trigger (async) so the fallback
    // focus-bound Escape reaches the modal, then Esc #3 closes the dialog.
    await expect.poll(() => document.activeElement).toBe(popoverTrigger.element());
    await press('Escape');
    await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('Escape clears the GridList selection, then closes the dialog', async () => {
    let selection = new Set<string>();
    function Example() {
      return (
        <DialogTrigger defaultOpen>
          <Button>Open</Button>
          <Modal>
            <Dialog>
              <Heading slot="title">List</Heading>
              <GridList
                aria-label="Items"
                selectionMode="multiple"
                onSelectionChange={keys => {
                  selection = keys as Set<string>;
                }}>
                <GridListItem id="1" textValue="One">
                  <Checkbox slot="selection" />
                  One
                </GridListItem>
                <GridListItem id="2" textValue="Two">
                  <Checkbox slot="selection" />
                  Two
                </GridListItem>
                <GridListItem id="3" textValue="Three">
                  <Checkbox slot="selection" />
                  Three
                </GridListItem>
              </GridList>
            </Dialog>
          </Modal>
        </DialogTrigger>
      );
    }
    let testUtilUser = new User();
    let screen = await render(<Example />);
    await expect.element(screen.getByRole('grid')).toBeInTheDocument();
    let grid = screen.getByRole('grid').element() as HTMLElement;
    let tester = testUtilUser.createTester('GridList', {
      root: grid,
      layout: 'grid',
      interactionType: 'keyboard'
    });
    let rows = tester.getRows();
    await tester.toggleRowSelection({row: rows[0]});
    await tester.toggleRowSelection({row: rows[1]});
    await expect.poll(() => selection.size).toBe(2);

    // Esc #1: the GridList consumes Escape to clear its selection. Dialog stays.
    await press('Escape');
    await expect.poll(() => selection.size).toBe(0);
    await expect.element(screen.getByRole('dialog')).toBeInTheDocument();

    // Esc #2: with no selection, Escape closes the dialog.
    await press('Escape');
    await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('Escape closes one submenu level at a time (3 deep)', async () => {
    function Example() {
      return (
        <MenuTrigger>
          <Button aria-label="Menu">Menu</Button>
          <Popover>
            <Menu aria-label="L1">
              <MenuItem id="l1-foo">Foo</MenuItem>
              <SubmenuTrigger>
                <MenuItem id="l1-bar">Bar</MenuItem>
                <Popover>
                  <Menu aria-label="L2">
                    <MenuItem id="l2-foo">Sub Foo</MenuItem>
                    <SubmenuTrigger>
                      <MenuItem id="l2-baz">Sub Baz</MenuItem>
                      <Popover>
                        <Menu aria-label="L3">
                          <MenuItem id="l3-foo">Deep Foo</MenuItem>
                          <MenuItem id="l3-bar">Deep Bar</MenuItem>
                        </Menu>
                      </Popover>
                    </SubmenuTrigger>
                  </Menu>
                </Popover>
              </SubmenuTrigger>
            </Menu>
          </Popover>
        </MenuTrigger>
      );
    }
    let menuCount = () => document.querySelectorAll('[role="menu"]').length;
    let testUtilUser = new User();
    let screen = await render(<Example />);
    let menuTester = testUtilUser.createTester('Menu', {
      root: screen.getByRole('button', {name: 'Menu'}).element() as HTMLElement,
      interactionType: 'keyboard'
    });
    await menuTester.open();
    let l2 = await menuTester.openSubmenu({submenuTrigger: menuTester.getSubmenuTriggers()[0]});
    await l2.openSubmenu({submenuTrigger: l2.getSubmenuTriggers()[0]});
    await expect.poll(menuCount).toBe(3);

    // Each Escape closes only the deepest submenu, restoring focus to its trigger.
    await press('Escape');
    await expect.poll(menuCount).toBe(2);
    await press('Escape');
    await expect.poll(menuCount).toBe(1);
    await press('Escape');
    await expect.poll(menuCount).toBe(0);
    await expect
      .poll(() => document.activeElement)
      .toBe(screen.getByRole('button', {name: 'Menu'}).element());
  });
});
