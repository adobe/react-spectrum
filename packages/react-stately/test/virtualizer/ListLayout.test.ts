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

import {Key, Node} from '@react-types/shared';
import {ListLayout, ListLayoutOptions} from '../../src/layout/ListLayout';
import {Rect} from '../../src/virtualizer/Rect';
import {Size} from '../../src/virtualizer/Size';

/**
 * Creates a minimal mock virtualizer and collection, then calls layout.update()
 * so the layout has valid internal state for contentSize verification.
 */
function setupListLayout(
  options: ListLayoutOptions = {},
  itemCount = 4,
  viewportWidth = 250.5,
  viewportHeight = 600
) {
  let layout = new ListLayout<Node<unknown>, ListLayoutOptions>();

  // Build a minimal collection
  let items: Node<unknown>[] = [];
  for (let i = 0; i < itemCount; i++) {
    items.push({
      type: 'item',
      key: `item-${i}`,
      value: null,
      level: 0,
      hasChildNodes: false,
      rendered: null,
      textValue: `Item ${i}`,
      'aria-label': undefined,
      index: i,
      parentKey: null,
      prevKey: i > 0 ? `item-${i - 1}` : null,
      nextKey: i < itemCount - 1 ? `item-${i + 1}` : null,
      childNodes: [],
      props: {}
    } as unknown as Node<unknown>);
  }

  let collection = {
    size: items.length,
    getItem(key: Key) {
      return items.find(i => i.key === key) ?? null;
    },
    getFirstKey() {
      return items[0]?.key ?? null;
    },
    getLastKey() {
      return items[items.length - 1]?.key ?? null;
    },
    getKeyBefore(key: Key) {
      let idx = items.findIndex(i => i.key === key);
      return idx > 0 ? items[idx - 1].key : null;
    },
    getKeyAfter(key: Key) {
      let idx = items.findIndex(i => i.key === key);
      return idx < items.length - 1 ? items[idx + 1].key : null;
    },
    [Symbol.iterator]() {
      return items[Symbol.iterator]();
    }
  };

  // Attach a mock virtualizer
  (layout as any).virtualizer = {
    collection,
    visibleRect: new Rect(0, 0, viewportWidth, viewportHeight),
    size: new Size(viewportWidth, viewportHeight),
    isPersistedKey: () => false
  };

  // Run layout update
  layout.update({
    layoutOptions: {
      rowSize: 40,
      ...options
    },
    sizeChanged: true,
    offsetChanged: false,
    layoutOptionsChanged: true
  });

  return layout;
}

describe('ListLayout', () => {
  it('floors the contentSize width when the viewport width is fractional', () => {
    let layout = setupListLayout();
    let contentSize = layout.getContentSize();
    // Viewport width 250.5 should be rounded down to 250 so no content
    // overflows the container, which would produce a horizontal scrollbar.
    expect(contentSize.width).toBe(250);
    expect(Number.isInteger(contentSize.width)).toBe(true);
  });

  it('does not change contentSize for integer viewport widths', () => {
    let layout = setupListLayout({}, 4, 300);
    let contentSize = layout.getContentSize();
    expect(contentSize.width).toBe(300);
  });

  it('floors section and item rect widths to avoid fractional overflow', () => {
    let layout = setupListLayout();
    let itemInfo = layout.getLayoutInfo('item-0');
    expect(itemInfo).not.toBeNull();
    expect(itemInfo!.rect.width).toBeLessThanOrEqual(250);
    expect(Number.isInteger(itemInfo!.rect.width)).toBe(true);
  });
});