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

import {createPortal} from 'react-dom';
import {expect, it} from 'vitest';
import React, {useRef, useState} from 'react';
import {render} from 'vitest-browser-react';
import {useOverlayPosition} from '../../src/overlays/useOverlayPosition';

it.each(['fixed', 'absolute'] as const)(
  'positions an overlay against a %s target without modifying its rectangle',
  async position => {
    for (let rectType of ['DOMRect', 'DOMRectReadOnly', 'object', 'default']) {
      let rects: DOMRectReadOnly[] = [];
      let originalRects: string[] = [];
      function Example() {
        let targetRef = useRef<HTMLButtonElement>(null);
        let overlayRef = useRef<HTMLDivElement>(null);
        let [container, setContainer] = useState<HTMLDivElement | null>(null);
        let {overlayProps} = useOverlayPosition({
          targetRef,
          overlayRef,
          placement: 'bottom left',
          isOpen: !!container,
          getTargetRect:
            rectType === 'default'
              ? undefined
              : target => {
                  let rect: DOMRectReadOnly = target.getBoundingClientRect();
                  if (rectType === 'DOMRectReadOnly') {
                    rect = DOMRectReadOnly.fromRect(rect);
                  } else if (rectType === 'object') {
                    rect = Object.freeze(rect.toJSON());
                  }
                  rects.push(rect);
                  originalRects.push(JSON.stringify(rect));
                  return rect;
                }
        });
        return (
          <>
            <button
              ref={targetRef}
              style={{
                position,
                top: 20,
                left: 20,
                width: 80,
                height: 30,
                marginTop: 7,
                marginLeft: 11
              }}>
              Trigger
            </button>
            <div
              ref={setContainer}
              style={{position: 'absolute', top: 0, left: 0, transform: 'translateZ(0)'}}
            />
            {container &&
              createPortal(
                <div
                  ref={overlayRef}
                  data-testid="overlay"
                  {...overlayProps}
                  style={{...overlayProps.style, width: 100, height: 50}}>
                  Overlay
                </div>,
                container
              )}
          </>
        );
      }
      let result = await render(<Example />);
      let trigger = result.container.querySelector('button')!;
      let overlay = result.container.querySelector('[data-testid="overlay"]')!;
      await expect
        .poll(() => overlay.getBoundingClientRect().top)
        .toBe(trigger.getBoundingClientRect().bottom);
      expect(overlay.getBoundingClientRect().left).toBe(trigger.getBoundingClientRect().left);
      expect(rects.map(rect => JSON.stringify(rect))).toEqual(originalRects);
      await result.unmount();
    }
  }
);

it('preserves the scroll position of the scroll container when repositioning', async () => {
  function Example() {
    let targetRef = useRef<HTMLButtonElement>(null);
    let overlayRef = useRef<HTMLDivElement>(null);
    let scrollRef = useRef<HTMLDivElement>(null);
    let {overlayProps} = useOverlayPosition({
      targetRef,
      overlayRef,
      scrollRef,
      placement: 'bottom left',
      isOpen: true
    });
    return (
      <>
        <button ref={targetRef} style={{position: 'absolute', top: 200, left: 20, height: 30}}>
          Trigger
        </button>
        {createPortal(
          <div
            ref={overlayRef}
            {...overlayProps}
            style={{...overlayProps.style, width: 200, display: 'flex'}}>
            <div
              ref={scrollRef}
              data-testid="scroller"
              style={{maxHeight: 'inherit', overflow: 'auto', flex: 1}}>
              {Array.from({length: 100}, (_, i) => (
                <div key={i} style={{height: 30}}>
                  Item {i + 1}
                </div>
              ))}
            </div>
          </div>,
          document.body
        )}
      </>
    );
  }

  let result = await render(<Example />);
  let scroller = document.querySelector('[data-testid="scroller"]') as HTMLElement;
  await expect.poll(() => scroller.scrollHeight > scroller.clientHeight).toBe(true);

  // Scroll to the bottom of the list.
  scroller.scrollTop = scroller.scrollHeight;
  let scrollTop = scroller.scrollTop;
  expect(scrollTop).toBeGreaterThan(0);

  // Trigger a reposition, as happens when the window is resized.
  window.dispatchEvent(new Event('resize'));
  await new Promise(resolve => requestAnimationFrame(resolve));

  expect(scroller.scrollTop).toBe(scrollTop);
  await result.unmount();
});
