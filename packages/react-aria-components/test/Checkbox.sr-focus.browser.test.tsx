/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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

// The input should cover the component. Subpixel rounding can leave up to a
// pixel of difference; that is fine for the screen reader focus ring.
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

    // The component declares the anchor on its outer element.
    let anchorName = getComputedStyle(label).getPropertyValue('anchor-name').trim();
    expect(anchorName).not.toBe('');
    // And the input is tethered to that same name.
    expect(getComputedStyle(input).getPropertyValue('position-anchor').trim()).toBe(anchorName);
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

it('each component anchors to itself, not to a sibling', async () => {
  let screen = await render(
    <div>
      <Checkbox>One</Checkbox>
      <Checkbox>Two</Checkbox>
      <Checkbox>Three</Checkbox>
    </div>
  );

  let labels = [...screen.container.querySelectorAll('label')];

  if (supportsAnchorPositioning()) {
    // Every instance declares its own name, so no two share an anchor. Without
    // anchor positioning support the declaration is dropped and every label
    // computes to the same empty value, so there is nothing to compare.
    let names = labels.map(l => getComputedStyle(l).getPropertyValue('anchor-name').trim());
    expect(new Set(names).size).toBe(labels.length);

    labels.forEach(label => {
      let input = label.querySelector('input')!;
      expect(getComputedStyle(input).getPropertyValue('position-anchor').trim()).toBe(
        getComputedStyle(label).getPropertyValue('anchor-name').trim()
      );
      let labelRect = rect(label);
      let inputRect = rect(input);
      expect(covers(inputRect, labelRect)).toBe(true);
    });
  }
});

it('the hidden input covers the component in RTL', async () => {
  let screen = await render(
    <div dir="rtl">
      <Checkbox>Test</Checkbox>
    </div>
  );

  let label = screen.container.querySelector('label')!;
  let input = screen.container.querySelector('input')!;

  let labelRect = rect(label);
  let inputRect = rect(input);

  if (supportsAnchorPositioning()) {
    // The inset shorthand resolves physically, so it holds in RTL. Routing
    // anchor(left) through a logical property mirrored the input to the wrong
    // side instead.
    expect(covers(inputRect, labelRect)).toBe(true);
    expect(inputRect.width).toBeLessThanOrEqual(labelRect.width + 2);
    expect(Math.abs(inputRect.x - labelRect.x)).toBeLessThanOrEqual(2);
  }
});

it('the hidden input respects an anchor name provided via the custom property', async () => {
  let style = document.createElement('style');
  style.textContent = '.custom-anchor-host { --react-aria-anchor-name: --from-stylesheet; }';
  document.head.appendChild(style);

  let screen = await render(<Checkbox className="custom-anchor-host">Test</Checkbox>);

  let input = screen.container.querySelector('input')!;
  let label = screen.container.querySelector('label')!;

  if (supportsAnchorPositioning()) {
    // The custom property inherits, so the input picks up the consumer's name
    // even though the declaration lives in a stylesheet.
    expect(getComputedStyle(label).getPropertyValue('anchor-name').trim()).toBe(
      '--from-stylesheet'
    );
    expect(getComputedStyle(input).getPropertyValue('position-anchor').trim()).toBe(
      '--from-stylesheet'
    );

    let labelRect = rect(label);
    let inputRect = rect(input);
    expect(covers(inputRect, labelRect)).toBe(true);
  }

  style.remove();
});

it('the hidden input respects an anchor name provided via inline style', async () => {
  let screen = await render(
    <Checkbox style={{position: 'relative', ['anchorName' as any]: '--custom-anchor'}}>
      Test
    </Checkbox>
  );

  let input = screen.container.querySelector('input')!;
  let label = screen.container.querySelector('label')!;

  if (supportsAnchorPositioning()) {
    expect(getComputedStyle(label).getPropertyValue('anchor-name').trim()).toBe('--custom-anchor');
    expect(getComputedStyle(input).getPropertyValue('position-anchor').trim()).toBe(
      '--custom-anchor'
    );

    let labelRect = rect(label);
    let inputRect = rect(input);
    expect(covers(inputRect, labelRect)).toBe(true);
  }
});
