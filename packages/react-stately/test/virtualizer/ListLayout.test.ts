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
 * so the layout has valid internal state for testing getDropTargetFromPoint.
 */
function setupListLayout(options: ListLayoutOptions = {}, itemCount = 4, viewportSize = 400) {
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
    getKeys() {
      return items.map(i => i.key);
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
    visibleRect: new Rect(0, 0, viewportSize, viewportSize),
    size: new Size(viewportSize, viewportSize),
    persistedKeys: new Set(),
    isPersistedKey: () => false
  };

  // Run layout update
  layout.update({
    layoutOptions: {
      rowHeight: 100,
      ...options
    },
    sizeChanged: true,
    offsetChanged: false,
    layoutOptionsChanged: true
  });

  return layout;
}

describe('ListLayout', () => {
  describe('getDropTargetFromPoint', () => {
    let isValidDropTarget = () => true;

    it('returns "before" when dropping to the top of an item in vertical orientation', () => {
      let layout = setupListLayout();
      let layoutInfo = layout.getLayoutInfo('item-1');
      expect(layoutInfo).not.toBeNull();

      let target = layout.getDropTargetFromPoint(
        layoutInfo!.rect.x + layoutInfo!.rect.width / 2,
        layoutInfo!.rect.y + 2, // just inside top edge
        isValidDropTarget
      );
      expect(target).toEqual({type: 'item', key: 'item-1', dropPosition: 'before'});
    });

    it('returns "after" when dropping to the bottom of an item in vertical orientation', () => {
      let layout = setupListLayout();
      let layoutInfo = layout.getLayoutInfo('item-1');
      expect(layoutInfo).not.toBeNull();

      let target = layout.getDropTargetFromPoint(
        layoutInfo!.rect.x + layoutInfo!.rect.width / 2,
        layoutInfo!.rect.maxY - 2, // just inside bottom edge
        isValidDropTarget
      );
      expect(target).toEqual({type: 'item', key: 'item-1', dropPosition: 'after'});
    });

    it('returns "before" when dropping to the left of an item in horizontal orientation', () => {
      let layout = setupListLayout({orientation: 'horizontal'});
      let layoutInfo = layout.getLayoutInfo('item-1');
      expect(layoutInfo).not.toBeNull();

      let target = layout.getDropTargetFromPoint(
        layoutInfo!.rect.x + 2, // just inside left edge
        layoutInfo!.rect.y + layoutInfo!.rect.height / 2,
        isValidDropTarget
      );
      expect(target).toEqual({type: 'item', key: 'item-1', dropPosition: 'before'});
    });

    it('returns "after" when dropping to the right of an item in horizontal orientation', () => {
      let layout = setupListLayout({orientation: 'horizontal'});
      let layoutInfo = layout.getLayoutInfo('item-1');
      expect(layoutInfo).not.toBeNull();

      let target = layout.getDropTargetFromPoint(
        layoutInfo!.rect.maxX - 2, // just inside right edge
        layoutInfo!.rect.y + layoutInfo!.rect.height / 2,
        isValidDropTarget
      );
      expect(target).toEqual({type: 'item', key: 'item-1', dropPosition: 'after'});
    });

    it('returns root drop target for empty layout in vertical orientation', () => {
      let layout = setupListLayout({}, 0);
      let target = layout.getDropTargetFromPoint(50, 50, isValidDropTarget);
      expect(target).toEqual({type: 'root'});
    });

    it('returns root drop target for empty layout in horizontal orientation', () => {
      let layout = setupListLayout({orientation: 'horizontal'}, 0);
      let target = layout.getDropTargetFromPoint(50, 50, isValidDropTarget);
      expect(target).toEqual({type: 'root'});
    });
  });
});
