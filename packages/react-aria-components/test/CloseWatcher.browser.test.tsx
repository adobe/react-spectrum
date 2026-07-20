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
import {describe, expect, it} from 'vitest';
import {Dialog, DialogTrigger} from '../src/Dialog';
import {Heading} from '../src/Heading';
import {Modal, ModalOverlay} from '../src/Modal';
import {Popover} from '../src/Popover';
import React from 'react';
import {render} from 'vitest-browser-react';
import {userEvent} from 'vitest/browser';

// CloseWatcher is required for these tests. Skip on browsers that lack it
// rather than exercising the keydown fallback (covered by the jsdom suite).
let supportsCloseWatcher = typeof window.CloseWatcher === 'function';
let describeCloseWatcher = supportsCloseWatcher ? describe : describe.skip;

async function press(key: string) {
  await userEvent.keyboard(`{${key}}`);
}

describeCloseWatcher('CloseWatcher dismissal', () => {
  it('closes a single modal on Escape', async () => {
    // vitest-browser-react's render() returns Locator-based selectors
    // (getByRole etc.), not testing-library's query*/queryAll* helpers.
    // Presence/absence is asserted via the auto-retrying `expect.element(...)`
    // matcher so we don't race the modal's exit animation/unmount.
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
    // Locator has no queryAllByRole equivalent; count via elements(), and poll
    // rather than reading synchronously so exit-animation unmounts aren't missed.
    await expect.poll(() => screen.getByRole('dialog').elements().length).toBe(1);
    await userEvent.click(screen.getByRole('button', {name: 'Open inner'}));
    await expect.poll(() => screen.getByRole('dialog').elements().length).toBe(2);
    await press('Escape');
    // Inner closed, outer remains.
    await expect.poll(() => screen.getByRole('dialog').elements().length).toBe(1);
    await expect.element(screen.getByRole('dialog')).toBeInTheDocument();
    await press('Escape');
    // Outer closes on the replacement/next watcher.
    await expect.poll(() => screen.getByRole('dialog').elements().length).toBe(0);
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
    await userEvent.click(screen.getByRole('button', {name: 'Open popover'}));
    await expect.element(screen.getByText('Popover content')).toBeInTheDocument();
    await press('Escape');
    // Popover (most-recent watcher) closes; modal stays.
    await expect.element(screen.getByText('Popover content')).not.toBeInTheDocument();
    await expect.element(screen.getByRole('dialog')).toBeInTheDocument();
    await press('Escape');
    // Modal closes on the next close request.
    await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('recreates a watcher when a controlled parent ignores onOpenChange', async () => {
    let closeCount = 0;
    function Controlled() {
      // Always open; ignore onOpenChange(false) so the modal stays open.
      return (
        <DialogTrigger
          isOpen
          onOpenChange={isOpen => {
            if (!isOpen) {
              closeCount++;
            }
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
    await expect.poll(() => closeCount).toBe(2);
    await expect.element(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
