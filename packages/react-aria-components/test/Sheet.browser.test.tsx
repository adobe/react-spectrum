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
import {expect, it} from 'vitest';
import {Heading} from '../src/Heading';
import {page, userEvent} from 'vitest/browser';
import React from 'react';
import {render} from 'vitest-browser-react';
import {Sheet, SheetContent, SheetOverlay, SheetTrigger} from '../src/Sheet';

function SheetExample() {
  return (
    <SheetTrigger>
      <Button>Open sheet</Button>
      <SheetOverlay>
        <Sheet style={{height: 200, background: 'white'}}>
          <SheetContent>
            <Heading slot="title">Sheet title</Heading>
          </SheetContent>
        </Sheet>
      </SheetOverlay>
    </SheetTrigger>
  );
}

it('finishes closing once the exit scroll ends, even if the sheet is never reported hidden', async () => {
  // Drop the observer's report that the sheet has left the viewport.
  let NativeIntersectionObserver = window.IntersectionObserver;
  window.IntersectionObserver = class extends NativeIntersectionObserver {
    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      super((entries, observer) => {
        if (entries.every(entry => entry.intersectionRatio > 0)) {
          callback(entries, observer);
        }
      }, options);
    }
  };

  try {
    await render(<SheetExample />);
    await userEvent.click(page.getByRole('button', {name: 'Open sheet'}));
    // The dialog is focused once the sheet has entered.
    let dialog = page.getByRole('dialog').element();
    await expect.poll(() => document.activeElement).toBe(dialog);

    await userEvent.keyboard('{Escape}');
    await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
  } finally {
    window.IntersectionObserver = NativeIntersectionObserver;
  }
});
