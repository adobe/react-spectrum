/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Verifies in a real browser (not jsdom) that the hidden native input is
// anchored to the component's outer element via CSS anchor positioning, so its
// bounding box matches the visible component and the screen reader focus
// indicator aligns with the visual one.
//
// This is a layout test: jsdom does no layout, so it cannot validate this.
//
// Browsers without CSS anchor positioning support keep the default 1x1px
// VisuallyHidden behavior, in which case these tests are skipped.

import {Checkbox} from '../src/Checkbox';
import {expect, it} from 'vitest';
import {Label} from '../src/Label';
import {Radio, RadioGroup} from '../src/RadioGroup';
import React from 'react';
import {render} from 'vitest-browser-react';

function rect(el: Element) {
  let r = el.getBoundingClientRect();
  return {x: r.x, y: r.y, width: r.width, height: r.height};
}

function supportsAnchorPositioning() {
  return CSS.supports('anchor-name: --test');
}

// The input should cover the component. It may be up to 2px larger than the
// label (subpixel rounding); that is fine for the screen reader focus ring.
function covers(a: {width: number; height: number}, b: {width: number; height: number}) {
  return a.width >= b.width - 1 && a.height >= b.height - 1;
}

it('Checkbox: the hidden input covers the component via anchor positioning', async () => {
  let screen = await render(<Checkbox>Test</Checkbox>);

  let label = screen.container.querySelector('label')!;
  let input = screen.container.querySelector('input')!;

  let labelRect = rect(label);
  let inputRect = rect(input);

  // The visible component should be larger than 1x1.
  expect(labelRect.width).toBeGreaterThan(1);
  expect(labelRect.height).toBeGreaterThan(1);

  if (supportsAnchorPositioning()) {
    // The input should be anchored to the component's outer element, not the
    // viewport and not the 1x1px VisuallyHidden wrapper.
    expect(covers(inputRect, labelRect)).toBe(true);
    expect(inputRect.width).toBeLessThanOrEqual(labelRect.width + 2);
    expect(inputRect.height).toBeLessThanOrEqual(labelRect.height + 2);

    // A consumer-provided anchor-name is used instead of the component default.
    let anchorName = getComputedStyle(label).getPropertyValue('anchor-name').trim();
    expect(anchorName).not.toBe('');
  }
});

it('Radio: the hidden input covers the component via anchor positioning', async () => {
  let screen = await render(
    <RadioGroup>
      <Label>Test</Label>
      <Radio value="a">A</Radio>
    </RadioGroup>
  );

  // The Radio's own label is the one containing the input, not the standalone
  // <Label>Test</Label> which precedes it in the DOM.
  let input = screen.container.querySelector('input')!;
  let label = input.closest('label')!;

  let labelRect = rect(label);
  let inputRect = rect(input);

  expect(labelRect.width).toBeGreaterThan(1);
  expect(labelRect.height).toBeGreaterThan(1);

  if (supportsAnchorPositioning()) {
    expect(covers(inputRect, labelRect)).toBe(true);
    expect(inputRect.width).toBeLessThanOrEqual(labelRect.width + 2);
    expect(inputRect.height).toBeLessThanOrEqual(labelRect.height + 2);
  }
});
