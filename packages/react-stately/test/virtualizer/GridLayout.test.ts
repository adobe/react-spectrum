/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {GridLayout, GridLayoutOptions} from '../../src/layout/GridLayout';
import {Key, Node} from '@react-types/shared';
import {Rect} from '../../src/virtualizer/Rect';
import {Size} from '../../src/virtualizer/Size';

/**
 * Creates a minimal mock virtualizer and collection, then calls layout.update()
 * so the layout has valid internal state for testing getDropTargetFromPoint.
 */
function setupGridLayout(options: GridLayoutOptions = {}, itemCount = 4, viewportWidth = 400) {
  let layout = new GridLayout<Node<unknown>, GridLayoutOptions>();

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
    visibleRect: new Rect(0, 0, viewportWidth, 600),
    size: new Size(viewportWidth, 600),
    isPersistedKey: () => false
  };

  // Run layout update
  layout.update({
    layoutOptions: {
      minItemSize: new Size(100, 100),
      maxItemSize: new Size(100, 100),
      minSpace: new Size(10, 10),
      ...options
    },
    sizeChanged: true,
    offsetChanged: false,
    layoutOptionsChanged: true
  });

  return layout;
}

describe('GridLayout', () => {
  describe('getDropTargetFromPoint', () => {
    let isValidDropTarget = () => true;

    it('returns "before" when dropping to the left of an item in LTR', () => {
      let layout = setupGridLayout({direction: 'ltr'});
      // Drop near the left edge of item-1 (second column).
      // With 400px viewport, 100px items, 10px gaps, items start at ~55px and ~165px.
      let layoutInfo = layout.getLayoutInfo('item-1');
      expect(layoutInfo).not.toBeNull();

      let target = layout.getDropTargetFromPoint(
        layoutInfo!.rect.x + 2, // just inside left edge
        layoutInfo!.rect.y + layoutInfo!.rect.height / 2,
        isValidDropTarget
      );
      expect(target).toEqual({type: 'item', key: 'item-1', dropPosition: 'before'});
    });

    it('returns "after" when dropping to the right of an item in LTR', () => {
      let layout = setupGridLayout({direction: 'ltr'});
      let layoutInfo = layout.getLayoutInfo('item-0');
      expect(layoutInfo).not.toBeNull();

      let target = layout.getDropTargetFromPoint(
        layoutInfo!.rect.maxX - 2, // just inside right edge
        layoutInfo!.rect.y + layoutInfo!.rect.height / 2,
        isValidDropTarget
      );
      expect(target).toEqual({type: 'item', key: 'item-0', dropPosition: 'after'});
    });

    it('returns "before" when dropping to the right of an item in RTL', () => {
      // In RTL, the visual right side of an item corresponds to "before" because
      // items flow right-to-left. The layout uses x values as right-offsets,
      // so the coordinate must be flipped.
      let layout = setupGridLayout({direction: 'rtl'});
      let layoutInfo = layout.getLayoutInfo('item-1');
      expect(layoutInfo).not.toBeNull();

      // In RTL, item-1 is visually on the LEFT (second in RTL order).
      // Its layout rect x is the right-offset. The visual left edge of item-1
      // corresponds to a high x in visual space.
      // Visual x near the right-offset edge (which is the "start" in RTL).
      let contentWidth = layout.getContentSize().width;
      let visualX = contentWidth - layoutInfo!.rect.x - 2; // near the visual right edge
      let target = layout.getDropTargetFromPoint(
        visualX,
        layoutInfo!.rect.y + layoutInfo!.rect.height / 2,
        isValidDropTarget
      );
      expect(target).toEqual({type: 'item', key: 'item-1', dropPosition: 'before'});
    });

    it('returns "after" when dropping to the left of an item in RTL', () => {
      let layout = setupGridLayout({direction: 'rtl'});
      let layoutInfo = layout.getLayoutInfo('item-0');
      expect(layoutInfo).not.toBeNull();

      let contentWidth = layout.getContentSize().width;
      // Visual x near the left edge of item-0, which in RTL is the "end" side.
      let visualX = contentWidth - layoutInfo!.rect.maxX + 2;
      let target = layout.getDropTargetFromPoint(
        visualX,
        layoutInfo!.rect.y + layoutInfo!.rect.height / 2,
        isValidDropTarget
      );
      expect(target).toEqual({type: 'item', key: 'item-0', dropPosition: 'after'});
    });

    it('returns root drop target for empty layout', () => {
      let layout = setupGridLayout({}, 0);
      let target = layout.getDropTargetFromPoint(50, 50, isValidDropTarget);
      expect(target).toEqual({type: 'root'});
    });

    it('single column layout is unaffected by direction', () => {
      // With viewport width 120 and minItemSize 100, only 1 column fits.
      let ltrLayout = setupGridLayout({direction: 'ltr'}, 4, 120);
      let rtlLayout = setupGridLayout({direction: 'rtl'}, 4, 120);

      let y = ltrLayout.getLayoutInfo('item-1')!.rect.y + 2;
      let ltrTarget = ltrLayout.getDropTargetFromPoint(60, y, isValidDropTarget);
      let rtlTarget = rtlLayout.getDropTargetFromPoint(60, y, isValidDropTarget);
      expect(ltrTarget).toEqual(rtlTarget);
    });
  });
});
