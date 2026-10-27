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
import {Dialog, DialogTrigger} from '../src/Dialog';
import {expect, it} from 'vitest';
import {Heading} from '../src/Heading';
import {Modal, ModalOverlay} from '../src/Modal';
import React from 'react';
import {render} from 'vitest-browser-react';

declare module 'vitest/browser' {
  interface BrowserCommands {
    mouseDownOnElement: (selector: string, offsetX?: number, offsetY?: number) => Promise<void>;
    mouseUp: () => Promise<void>;
  }
}

const OFFSET_VH = 5;

function ScrollJumpExample() {
  return (
    <DialogTrigger>
      <Button>Open modal</Button>
      <ModalOverlay
        isDismissable
        data-testid="scroll-jump-backdrop"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          justifyContent: 'center',
          overflowY: 'auto',
          background: 'rgba(0, 0, 0, 0.7)'
        }}>
        <Modal
          data-testid="scroll-jump-modal"
          style={{
            marginTop: `${OFFSET_VH}dvh`,
            minHeight: `${100 - OFFSET_VH}dvh`,
            width: '100%',
            maxWidth: '42rem',
            background: 'white'
          }}>
          <Dialog
            data-testid="scroll-jump-dialog"
            style={{
              display: 'flex',
              minHeight: '100%',
              flexDirection: 'column',
              padding: '2rem',
              outline: 'none'
            }}>
            <Heading slot="title">Modal in a scrollable overlay</Heading>
            {Array.from({length: 10}, (_, i) => (
              <div key={i} style={{height: '10rem', flexShrink: 0}}>
                {i + 1}
              </div>
            ))}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}

// mousedown on the backdrop moves focus to <body> in Chrome/Safari; Firefox does not.
// FocusScope containment must restore focus to the Dialog without scrolling,
// otherwise the modal visibly jumps to the top of the screen.
// Uses a trusted press so the native focus move actually happens. This cannot be
// tested in a unit test nor in Chromatic play.
it('does not scroll the modal into view when the backdrop is pressed', async () => {
  await render(<ScrollJumpExample />);

  await userEvent.click(page.getByRole('button', {name: 'Open modal'}));
  await expect.element(page.getByRole('dialog')).toBeInTheDocument();

  let overlay = page.getByTestId('scroll-jump-backdrop').element() as HTMLElement;
  let modal = page.getByTestId('scroll-jump-modal').element() as HTMLElement;

  overlay.scrollTop = 0;
  let modalTopBefore = Math.round(modal.getBoundingClientRect().top);
  expect(overlay.scrollTop).toBe(0);
  expect(modalTopBefore).toBeGreaterThan(0);

  // Do not release so we can observe the state
  await commands.mouseDownOnElement(page.getByTestId('scroll-jump-backdrop').selector, 5);

  // Wait a couple frames for FocusScope's requestAnimationFrame focus restore to run.
  await new Promise(resolve =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve(null)))
  );

  // the modal stays at its offset
  expect(overlay.scrollTop).toBe(0);
  expect(Math.round(modal.getBoundingClientRect().top)).toBe(modalTopBefore);

  await commands.mouseUp();
});
