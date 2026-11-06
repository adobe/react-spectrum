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
import React, {StrictMode} from 'react';
import {render} from 'vitest-browser-react';
import {Sheet, SheetBackdrop, SheetContent, SheetOverlay, SheetTrigger} from '../src/Sheet';

function NestedSheets({position}: {position: 'bottom' | 'right'}) {
  let sheet = (depth: number): React.ReactNode => (
    <SheetOverlay position={position} data-testid={`overlay-${depth}`}>
      <SheetBackdrop swipeAnimation="sheet-test-backdrop" data-testid={`backdrop-${depth}`} />
      <Sheet
        overscrollPadding
        stackAnimation="sheet-test-stack"
        style={{
          width: 340,
          height: 'auto',
          margin: 12,
          background: 'white',
          transform: 'perspective(1000px)',
          transformOrigin: 'center -150px'
        }}>
        <SheetContent style={{padding: 20, boxSizing: 'border-box'}}>
          <Heading slot="title">Sheet {depth}</Heading>
          {depth < 3 && (
            <SheetTrigger>
              <Button>Open sheet {depth + 1}</Button>
              {sheet(depth + 1)}
            </SheetTrigger>
          )}
          <Button slot="close">Close sheet {depth}</Button>
        </SheetContent>
      </Sheet>
    </SheetOverlay>
  );

  return (
    <StrictMode>
      <style>{`
        [data-testid="backdrop-1"] { background: rgb(0 0 0 / 0.4); }
        @keyframes sheet-test-backdrop { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sheet-test-stack { to { transform: translateZ(-120px); } }
      `}</style>
      <SheetTrigger>
        <Button>Open sheet 1</Button>
        {sheet(1)}
      </SheetTrigger>
    </StrictMode>
  );
}

// This needs real view timelines. In Firefox, run with
// layout.css.scroll-driven-animations.enabled=true to exercise the reported flash.
it.skipIf(!CSS.supports('animation-timeline: view()')).each(['bottom', 'right'] as const)(
  'keeps the bottom backdrop dimmed while nested %s sheets open and close',
  async position => {
    await render(<NestedSheets position={position} />);
    await userEvent.click(page.getByRole('button', {name: 'Open sheet 1', exact: true}));
    await expect.element(page.getByTestId('overlay-1')).not.toHaveAttribute('data-entering');
    let backdrop = page.getByTestId('backdrop-1').element() as HTMLElement;
    await expect.poll(() => Number(getComputedStyle(backdrop).opacity)).toBe(1);

    let opacities: number[] = [];
    let frame: number;
    function sample() {
      opacities.push(Number(getComputedStyle(backdrop).opacity));
      frame = requestAnimationFrame(sample);
    }
    frame = requestAnimationFrame(sample);
    async function expectBackdropToStayDimmed() {
      // Include the frame after the transition, especially after a sheet is removed.
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      expect(opacities.length).toBeGreaterThan(0);
      expect(Math.min(...opacities)).toBe(1);
      opacities = [];
    }
    try {
      // Include the first nested opening, deeper stacks, and reopening after dismissal.
      for (let attempt = 0; attempt < 2; attempt++) {
        for (let depth of [2, 3]) {
          await userEvent.click(
            page.getByRole('button', {name: `Open sheet ${depth}`, exact: true})
          );
          await expect
            .element(page.getByTestId(`overlay-${depth}`))
            .not.toHaveAttribute('data-entering');
          await expectBackdropToStayDimmed();
        }
        for (let depth of [3, 2]) {
          await userEvent.click(
            page.getByRole('button', {name: `Close sheet ${depth}`, exact: true})
          );
          await expect.element(page.getByTestId(`overlay-${depth}`)).not.toBeInTheDocument();
          await expectBackdropToStayDimmed();
        }
      }
    } finally {
      cancelAnimationFrame(frame);
    }
    await userEvent.click(page.getByRole('button', {name: 'Close sheet 1', exact: true}));
    await expect
      .element(page.getByRole('dialog', {name: 'Sheet 1', exact: true}))
      .not.toBeInTheDocument();
  }
);
