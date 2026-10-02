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

interface SectionDescription {
  id: string;
  itemCount: number;
  hasHeader?: boolean;
}

/**
 * Creates a mock virtualizer and a collection containing sections with headers and items,
 * then calls layout.update() so the layout has valid internal state for testing.
 */
function setupSectionedGridLayout(
  options: GridLayoutOptions = {},
  sections: SectionDescription[],
  viewportWidth = 400
) {
  let layout = new GridLayout<Node<unknown>, GridLayoutOptions>();

  let rootNodes: Node<unknown>[] = [];
  let nodesByKey = new Map<Key, Node<unknown>>();
  for (let section of sections) {
    let children: Node<unknown>[] = [];
    if (section.hasHeader ?? true) {
      children.push({
        type: 'header',
        key: `${section.id}-header`,
        rendered: 'Header',
        textValue: '',
        parentKey: section.id,
        childNodes: [],
        props: {}
      } as unknown as Node<unknown>);
    }

    for (let i = 0; i < section.itemCount; i++) {
      children.push({
        type: 'item',
        key: `${section.id}-item-${i}`,
        rendered: null,
        textValue: `Item ${i}`,
        parentKey: section.id,
        childNodes: [],
        props: {}
      } as unknown as Node<unknown>);
    }

    let sectionNode = {
      type: 'section',
      key: section.id,
      rendered: null,
      textValue: '',
      parentKey: null,
      childNodes: children,
      props: {}
    } as unknown as Node<unknown>;
    rootNodes.push(sectionNode);
    nodesByKey.set(sectionNode.key, sectionNode);
    for (let child of children) {
      nodesByKey.set(child.key, child);
    }
  }

  let collection = {
    size: nodesByKey.size,
    getItem(key: Key) {
      return nodesByKey.get(key) ?? null;
    },
    getFirstKey() {
      return rootNodes[0]?.key ?? null;
    },
    getLastKey() {
      return rootNodes[rootNodes.length - 1]?.key ?? null;
    },
    [Symbol.iterator]() {
      return rootNodes[Symbol.iterator]();
    }
  };

  (layout as any).virtualizer = {
    collection,
    visibleRect: new Rect(0, 0, viewportWidth, 600),
    size: new Size(viewportWidth, 600),
    isPersistedKey: () => false
  };

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
  // With a 400px viewport, 100x100 items and 10px min space: 3 columns,
  // 25px horizontal spacing, so columns are at x = 25, 150 and 275.
  describe('sections', () => {
    it('lays out headers as full width rows interleaved with grid rows', () => {
      let layout = setupSectionedGridLayout({headingSize: 40}, [
        {id: 's1', itemCount: 4},
        {id: 's2', itemCount: 2}
      ]);

      // Section 1: header row, then a row of 3 items and a row with 1 item.
      expect(layout.getLayoutInfo('s1-header')!.rect).toEqual(new Rect(25, 10, 350, 40));
      expect(layout.getLayoutInfo('s1-item-0')!.rect).toEqual(new Rect(25, 60, 100, 100));
      expect(layout.getLayoutInfo('s1-item-1')!.rect).toEqual(new Rect(150, 60, 100, 100));
      expect(layout.getLayoutInfo('s1-item-2')!.rect).toEqual(new Rect(275, 60, 100, 100));
      expect(layout.getLayoutInfo('s1-item-3')!.rect).toEqual(new Rect(25, 170, 100, 100));

      // Section 2 starts on a new row below section 1.
      expect(layout.getLayoutInfo('s2-header')!.rect).toEqual(new Rect(25, 280, 350, 40));
      expect(layout.getLayoutInfo('s2-item-0')!.rect).toEqual(new Rect(25, 330, 100, 100));
      expect(layout.getLayoutInfo('s2-item-1')!.rect).toEqual(new Rect(150, 330, 100, 100));

      expect(layout.getContentSize().height).toBe(440);
    });

    it('produces section layout infos containing their children', () => {
      let layout = setupSectionedGridLayout({headingSize: 40}, [
        {id: 's1', itemCount: 4},
        {id: 's2', itemCount: 2}
      ]);

      let s1 = layout.getLayoutInfo('s1')!;
      expect(s1.type).toBe('section');
      expect(s1.rect).toEqual(new Rect(0, 10, 400, 260));
      expect(layout.getLayoutInfo('s2')!.rect).toEqual(new Rect(0, 280, 400, 150));

      expect(layout.getLayoutInfo('s1-header')!.parentKey).toBe('s1');
      expect(layout.getLayoutInfo('s1-item-0')!.parentKey).toBe('s1');
      expect(layout.getLayoutInfo('s2-item-1')!.parentKey).toBe('s2');
    });

    it('aligns columns across sections', () => {
      let layout = setupSectionedGridLayout({}, [
        {id: 's1', itemCount: 4},
        {id: 's2', itemCount: 3}
      ]);

      // Keyboard navigation across section boundaries depends on this.
      expect(layout.getLayoutInfo('s2-item-0')!.rect.x).toBe(
        layout.getLayoutInfo('s1-item-0')!.rect.x
      );
      expect(layout.getLayoutInfo('s2-item-1')!.rect.x).toBe(
        layout.getLayoutInfo('s1-item-1')!.rect.x
      );
    });

    it('supports sections without headers', () => {
      let layout = setupSectionedGridLayout({}, [
        {id: 's1', itemCount: 3, hasHeader: false},
        {id: 's2', itemCount: 3, hasHeader: false}
      ]);

      expect(layout.getLayoutInfo('s1')!.rect).toEqual(new Rect(0, 10, 400, 100));
      expect(layout.getLayoutInfo('s1-item-0')!.rect).toEqual(new Rect(25, 10, 100, 100));
      expect(layout.getLayoutInfo('s2-item-0')!.rect).toEqual(new Rect(25, 120, 100, 100));
    });

    it('uses estimatedHeadingSize until headers are measured', () => {
      let layout = setupSectionedGridLayout({estimatedHeadingSize: 60}, [{id: 's1', itemCount: 1}]);

      let header = layout.getLayoutInfo('s1-header')!;
      expect(header.rect.height).toBe(60);
      expect(header.estimatedSize).toBe(true);

      // Headers with a fixed headingSize are not estimated.
      layout = setupSectionedGridLayout({headingSize: 40}, [{id: 's1', itemCount: 1}]);
      header = layout.getLayoutInfo('s1-header')!;
      expect(header.rect.height).toBe(40);
      expect(header.estimatedSize).toBe(false);
    });

    it('returns sections before their children in getVisibleLayoutInfos', () => {
      let layout = setupSectionedGridLayout({headingSize: 40}, [
        {id: 's1', itemCount: 4},
        {id: 's2', itemCount: 2}
      ]);

      let visible = layout.getVisibleLayoutInfos(new Rect(0, 0, 400, 100));
      let keys = visible.map(v => v.key);
      expect(keys).toEqual(['s1', 's1-header', 's1-item-0', 's1-item-1', 's1-item-2']);
    });

    it('includes headers of visible sections even when scrolled past', () => {
      let layout = setupSectionedGridLayout({headingSize: 40}, [
        {id: 's1', itemCount: 12},
        {id: 's2', itemCount: 2}
      ]);

      // A rect in the middle of section 1, past its header.
      let visible = layout.getVisibleLayoutInfos(new Rect(0, 170, 400, 100));
      let keys = visible.map(v => v.key);
      expect(keys).toContain('s1-header');
      expect(keys).not.toContain('s2-header');
    });
  });

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
