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
import {expect, it, vi} from 'vitest';
import {getOwnerWindow} from '../../src/utils/domHelpers';
import React, {useRef, useState} from 'react';
import {render} from 'vitest-browser-react';
import {useCloseOnScroll} from '../../src/overlays/useCloseOnScroll';
import {useOverlayPosition} from '../../src/overlays/useOverlayPosition';

it('positions an overlay in its own viewport and responds to that window’s resize event', async () => {
  let frame = document.createElement('iframe');
  frame.style.width = '320px';
  frame.style.height = '240px';
  document.body.append(frame);

  try {
    let body = frame.contentDocument!.body;
    function Example() {
      let targetRef = useRef<HTMLInputElement>(null);
      let overlayRef = useRef<HTMLDivElement>(null);
      let {overlayProps, placement} = useOverlayPosition({
        targetRef,
        overlayRef,
        placement: 'bottom left'
      });

      return createPortal(
        <>
          <input
            ref={targetRef}
            aria-label="Search"
            style={{position: 'absolute', top: 180, left: 50, height: 30, boxSizing: 'border-box'}}
          />
          <div
            ref={overlayRef}
            data-placement={placement}
            {...overlayProps}
            style={{...overlayProps.style, width: 140, height: 100}}>
            Overlay
          </div>
        </>,
        body
      );
    }

    let result = await render(<Example />);
    try {
      let target = body.querySelector('input')!;
      let overlay = body.querySelector<HTMLElement>('[data-placement]')!;
      let ownerWindow = getOwnerWindow(target);
      await expect.poll(() => overlay.dataset.placement).toBe('top');
      expect(overlay.style.maxHeight).toBe('168px');

      // Move the trigger without changing its size so only the resize event updates placement.
      target.style.top = '20px';
      ownerWindow.dispatchEvent(new ownerWindow.Event('resize'));
      await expect.poll(() => overlay.dataset.placement).toBe('bottom');
      expect(overlay.getBoundingClientRect().top).toBe(target.getBoundingClientRect().bottom);
    } finally {
      await result.unmount();
    }
  } finally {
    frame.remove();
  }
});

it('dismisses on ancestor scroll but ignores other scroll targets in a second document', async () => {
  let frame = document.createElement('iframe');
  document.body.append(frame);

  try {
    let body = frame.contentDocument!.body;
    let onClose = vi.fn();
    function Example() {
      let triggerRef = useRef<HTMLInputElement>(null);
      useCloseOnScroll({triggerRef, isOpen: true, onClose});

      return createPortal(
        <>
          <div>
            <input ref={triggerRef} aria-label="Search" />
          </div>
          <div data-testid="unrelated">Unrelated scroll region</div>
        </>,
        body
      );
    }

    let result = await render(<Example />);
    try {
      let trigger = body.querySelector('input')!;
      let ownerWindow = getOwnerWindow(trigger);
      body
        .querySelector('[data-testid="unrelated"]')!
        .dispatchEvent(new ownerWindow.Event('scroll'));
      trigger.dispatchEvent(new ownerWindow.Event('scroll'));
      expect(onClose).not.toHaveBeenCalled();

      trigger.parentElement!.dispatchEvent(new ownerWindow.Event('scroll'));
      expect(onClose).toHaveBeenCalledTimes(1);
    } finally {
      await result.unmount();
    }
  } finally {
    frame.remove();
  }
});

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
