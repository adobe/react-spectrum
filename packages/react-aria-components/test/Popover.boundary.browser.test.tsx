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

import {afterEach, beforeEach, expect, it} from 'vitest';
import {Button} from '../src/Button';
import {Dialog, DialogTrigger} from '../src/Dialog';
import {page, userEvent} from 'vitest/browser';
import {Popover} from '../src/Popover';
import React, {useState} from 'react';
import {render} from 'vitest-browser-react';

let bodyStyle: string;

beforeEach(() => {
  bodyStyle = document.body.style.cssText;
  Object.assign(document.body.style, {
    margin: '0',
    width: '2400px',
    height: '2000px'
  });
});

afterEach(() => {
  document.body.style.cssText = bodyStyle;
  window.scrollTo(0, 0);
});

function Example({
  boundaryPosition,
  scroll,
  placement
}: {
  boundaryPosition: 'fixed' | 'absolute';
  scroll: number;
  placement: 'bottom' | 'right';
}) {
  let [boundary, setBoundary] = useState<HTMLDivElement | null>(null);
  return (
    <>
      <div
        ref={setBoundary}
        data-testid="boundary"
        style={{
          position: boundaryPosition,
          top: 8 + (boundaryPosition === 'absolute' && placement === 'bottom' ? scroll : 0),
          left: 8 + (boundaryPosition === 'absolute' && placement === 'right' ? scroll : 0),
          width: window.innerWidth - 136,
          height: window.innerHeight - 136
        }}
      />
      <DialogTrigger>
        <Button
          style={{
            position: 'fixed',
            top: window.innerHeight - 200,
            left: window.innerWidth - 200,
            width: 80,
            height: 24
          }}>
          Open
        </Button>
        <Popover
          boundaryElement={boundary ?? undefined}
          placement={placement}
          offset={0}
          isNonModal
          style={{width: 300, height: 300, overflow: 'auto'}}>
          <Dialog aria-label="Details">Content</Dialog>
        </Popover>
      </DialogTrigger>
    </>
  );
}

it.each(['fixed', 'absolute'] as const)(
  'keeps vertical placement within a %s-positioned boundary after document scrolling',
  async boundaryPosition => {
    for (let scroll of [0, 400]) {
      let result = await render(
        <Example boundaryPosition={boundaryPosition} scroll={scroll} placement="bottom" />
      );
      window.scrollTo(0, scroll);
      await expect.poll(() => window.scrollY).toBe(scroll);
      await userEvent.click(page.getByRole('button', {name: 'Open'}));
      let popover = document.querySelector('.react-aria-Popover') as HTMLElement;
      await expect.element(popover).toHaveAttribute('data-placement', 'top');
      let trigger = page.getByRole('button', {name: 'Open'}).element();
      let boundary = page.getByTestId('boundary').element();
      expect(popover.getBoundingClientRect().bottom).toBeCloseTo(
        trigger.getBoundingClientRect().top
      );
      expect(parseFloat(popover.style.maxHeight)).toBeCloseTo(
        trigger.getBoundingClientRect().top - boundary.getBoundingClientRect().top - 12
      );
      await result.unmount();
    }
  }
);

it.each(['fixed', 'absolute'] as const)(
  'keeps horizontal placement within a %s-positioned boundary after document scrolling',
  async boundaryPosition => {
    for (let scroll of [0, 400]) {
      let result = await render(
        <Example boundaryPosition={boundaryPosition} scroll={scroll} placement="right" />
      );
      window.scrollTo(scroll, 0);
      await expect.poll(() => window.scrollX).toBe(scroll);
      await userEvent.click(page.getByRole('button', {name: 'Open'}));
      let popover = document.querySelector('.react-aria-Popover') as HTMLElement;
      await expect.element(popover).toHaveAttribute('data-placement', 'left');
      let trigger = page.getByRole('button', {name: 'Open'}).element();
      expect(popover.getBoundingClientRect().right).toBeCloseTo(
        trigger.getBoundingClientRect().left
      );
      await result.unmount();
    }
  }
);
