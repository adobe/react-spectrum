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

import {ariaHideOutside} from '../../src/overlays/ariaHideOutside';
import {expect, test} from 'vitest';

test('a separate window does not hide content in its opener', () => {
  let popup = window.open('about:blank', '_blank');
  expect(popup).not.toBeNull();
  let openerContent = document.createElement('div');
  document.body.appendChild(openerContent);
  let revert: (() => void) | undefined;
  try {
    popup!.document.body.innerHTML = '<div id="outside"></div><div id="target"></div>';
    let target = popup!.document.getElementById('target')!;
    let outside = popup!.document.getElementById('outside')!;
    expect(popup!.frameElement).toBeNull();
    revert = ariaHideOutside([target]);
    expect(outside.getAttribute('aria-hidden')).toBe('true');
    expect(target.hasAttribute('aria-hidden')).toBe(false);
    expect(popup!.document.body.hasAttribute('aria-hidden')).toBe(false);
    expect(document.body.hasAttribute('aria-hidden')).toBe(false);
    expect(openerContent.hasAttribute('aria-hidden')).toBe(false);
    revert();
    revert = undefined;
    expect(outside.hasAttribute('aria-hidden')).toBe(false);
  } finally {
    revert?.();
    popup?.close();
    openerContent.remove();
  }
});

test('a modal in nested iframes hides siblings in each containing document', () => {
  let frame = document.createElement('iframe');
  let outside = document.createElement('div');
  document.body.append(frame, outside);
  let revert: (() => void) | undefined;
  try {
    let nestedFrame = frame.contentDocument!.createElement('iframe');
    let frameSibling = frame.contentDocument!.createElement('div');
    frame.contentDocument!.body.append(nestedFrame, frameSibling);
    let target = nestedFrame.contentDocument!.createElement('div');
    nestedFrame.contentDocument!.body.appendChild(target);
    revert = ariaHideOutside([target]);
    expect(outside.getAttribute('aria-hidden')).toBe('true');
    expect(frameSibling.getAttribute('aria-hidden')).toBe('true');
    for (let element of [document.body, frame, frame.contentDocument!.body, nestedFrame, target]) {
      expect(element.hasAttribute('aria-hidden')).toBe(false);
    }
    revert();
    revert = undefined;
    expect(outside.hasAttribute('aria-hidden')).toBe(false);
    expect(frameSibling.hasAttribute('aria-hidden')).toBe(false);
  } finally {
    revert?.();
    frame.remove();
    outside.remove();
  }
});
