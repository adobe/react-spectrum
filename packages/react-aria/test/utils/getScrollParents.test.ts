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

import {getScrollParents} from '../src/getScrollParents';

describe('getScrollParents', () => {
  let root: Element;

  beforeEach(() => {
    root = document.documentElement;
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  it('includes root as a scroll parent for a node in the document', () => {
    let div = document.createElement('div');
    document.body.appendChild(div);

    let parents = getScrollParents(div);
    expect(parents).toContain(root);
  });

  it('does not include root when root has overflow: hidden', () => {
    let div = document.createElement('div');
    document.body.appendChild(div);

    jest.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
      if (el === root) {
        return {overflow: 'hidden'} as CSSStyleDeclaration;
      }
      return {overflow: 'visible'} as CSSStyleDeclaration;
    });

    let parents = getScrollParents(div);
    expect(parents).not.toContain(root);
  });

  it('includes a scrollable intermediate parent', () => {
    let scrollable = document.createElement('div');
    let child = document.createElement('div');
    document.body.appendChild(scrollable);
    scrollable.appendChild(child);

    jest.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
      if (el === scrollable) {
        return {overflow: 'auto'} as CSSStyleDeclaration;
      }
      return {overflow: 'visible'} as CSSStyleDeclaration;
    });

    let parents = getScrollParents(child);
    expect(parents).toContain(scrollable);
    expect(parents).toContain(root);
  });

  it('excludes non-scrollable ancestors', () => {
    let plain = document.createElement('div');
    let child = document.createElement('div');
    document.body.appendChild(plain);
    plain.appendChild(child);

    let parents = getScrollParents(child);
    expect(parents).not.toContain(plain);
    expect(parents).not.toContain(document.body);
  });
});
