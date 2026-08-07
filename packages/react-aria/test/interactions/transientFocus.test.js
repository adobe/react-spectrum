/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  beginTransientCollectionFocus,
  endTransientCollectionFocus,
  ignoreFocusEvent,
  ignoreTransientFocus,
  shouldIgnoreTransientFocusChange
} from '../../src/interactions/utils';

describe('transient collection focus', () => {
  let root;
  let child;
  let outside;

  beforeEach(() => {
    outside = document.createElement('button');
    root = document.createElement('div');
    child = document.createElement('button');
    root.tabIndex = 0;
    root.appendChild(child);
    document.body.appendChild(outside);
    document.body.appendChild(root);
  });

  afterEach(() => {
    endTransientCollectionFocus();
    document.body.removeChild(outside);
    document.body.removeChild(root);
  });

  it('shouldIgnoreTransientFocusChange when collection root receives focus from descendant', () => {
    beginTransientCollectionFocus(root);
    expect(shouldIgnoreTransientFocusChange(child, root)).toBe(true);
  });

  it('should not ignore blur when focus moves from descendant to root', () => {
    beginTransientCollectionFocus(root);
    expect(shouldIgnoreTransientFocusChange(root, child)).toBe(false);
  });

  it('should not ignore focus changes when focus moves from root to outside', () => {
    beginTransientCollectionFocus(root);
    expect(shouldIgnoreTransientFocusChange(outside, root)).toBe(false);
  });

  it('should not ignore focus changes when transient focus is inactive', () => {
    expect(shouldIgnoreTransientFocusChange(root, child)).toBe(false);
  });

  it('sets ignoreFocusEvent while transient focus is active', () => {
    expect(ignoreTransientFocus).toBe(false);
    expect(ignoreFocusEvent).toBe(false);
    beginTransientCollectionFocus(root);
    expect(ignoreTransientFocus).toBe(true);
    expect(ignoreFocusEvent).toBe(true);
    endTransientCollectionFocus();
    expect(ignoreTransientFocus).toBe(false);
    expect(ignoreFocusEvent).toBe(false);
  });
});
