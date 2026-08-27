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

// Verifies in a real browser (not jsdom) that exposing visuallyHiddenStyle and
// inputStyle lets the hidden native input's bounding box match the visible
// component, so the screen reader focus ring aligns with the visual one.
//
// This is a layout test: jsdom does no layout, so it cannot validate this.
//
// The fix requires the component's label to be a positioned containing block
// (position: relative) for the input's inset: 0 to resolve against it rather
// than the viewport. The tests set position: relative on the label to reflect
// the documented usage.

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

// The input should cover the component. The VisuallyHidden wrapper keeps a
// margin: -1px from its base styles, so the input can be up to 2px larger
// than the label; that is fine for the screen reader focus ring.
function covers(a: {width: number; height: number}, b: {width: number; height: number}) {
  return a.width >= b.width - 1 && a.height >= b.height - 1;
}

it('Checkbox: visuallyHiddenStyle + inputStyle make the input cover the component', async () => {
  let screen = await render(
    <Checkbox
      style={{position: 'relative'}}
      visuallyHiddenStyle={{inset: 0, width: 'auto', height: 'auto'}}
      inputStyle={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
      Test
    </Checkbox>
  );

  let label = screen.container.querySelector('label')!;
  let input = screen.container.querySelector('input')!;

  let labelRect = rect(label);
  let inputRect = rect(input);

  // The visible component should be larger than 1x1.
  expect(labelRect.width).toBeGreaterThan(1);
  expect(labelRect.height).toBeGreaterThan(1);

  // The input should cover the component, not the viewport.
  expect(covers(inputRect, labelRect)).toBe(true);
  expect(inputRect.width).toBeLessThanOrEqual(labelRect.width + 2);
  expect(inputRect.height).toBeLessThanOrEqual(labelRect.height + 2);
});

it('Radio: visuallyHiddenStyle + inputStyle make the input cover the component', async () => {
  let screen = await render(
    <RadioGroup>
      <Label>Test</Label>
      <Radio
        value="a"
        style={{position: 'relative'}}
        visuallyHiddenStyle={{inset: 0, width: 'auto', height: 'auto'}}
        inputStyle={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
        A
      </Radio>
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
  expect(covers(inputRect, labelRect)).toBe(true);
  expect(inputRect.width).toBeLessThanOrEqual(labelRect.width + 2);
  expect(inputRect.height).toBeLessThanOrEqual(labelRect.height + 2);
});
