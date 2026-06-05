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

function makeCollection(itemCount: number) {
  let items: Node<unknown>[] = Array.from({length: itemCount}, (_, index) => ({
    type: 'item',
    key: index,
    value: null,
    level: 0,
    hasChildNodes: false,
    rendered: null,
    textValue: `Item ${index}`,
    'aria-label': undefined,
    index,
    parentKey: null,
    prevKey: index > 0 ? index - 1 : null,
    nextKey: index < itemCount - 1 ? index + 1 : null,
    childNodes: [],
    props: {}
  } as unknown as Node<unknown>));

  return {
    size: items.length,
    getItem(key: Key) {
      return items.find(item => item.key === key) ?? null;
    },
    getFirstKey() {
      return items[0]?.key ?? null;
    },
    getLastKey() {
      return items.at(-1)?.key ?? null;
    },
    getKeyBefore(key: Key) {
      let index = items.findIndex(item => item.key === key);
      return index > 0 ? items[index - 1].key : null;
    },
    getKeyAfter(key: Key) {
      let index = items.findIndex(item => item.key === key);
      return index >= 0 && index < items.length - 1 ? items[index + 1].key : null;
    },
    getKeys() {
      return items.map(item => item.key);
    },
    [Symbol.iterator]() {
      return items[Symbol.iterator]();
    }
  };
}

describe('ListLayout', () => {
  it('renders a persisted key that is newly added outside the current requested rect', () => {
    let layout = new ListLayout<Node<unknown>, ListLayoutOptions>();
    let virtualizer = {
      collection: makeCollection(75),
      visibleRect: new Rect(0, 3354, 160, 400),
      size: new Size(160, 400),
      persistedKeys: new Set<Key>([74]),
      isPersistedKey(key: Key) {
        return this.persistedKeys.has(key);
      }
    };

    (layout as any).virtualizer = virtualizer;
    layout.update({
      layoutOptions: {
        rowHeight: 50,
        padding: 4,
        loaderHeight: 30
      },
      sizeChanged: true,
      offsetChanged: false,
      layoutOptionsChanged: true
    });

    expect(layout.getVisibleLayoutInfos(virtualizer.visibleRect).map(info => info.key)).toContain(74);

    // Simulate a previous random access such as End, which can expand the requested rect
    // to the full content size before additional async items are appended.
    (layout as any).requestedRect = new Rect(0, 0, Infinity, Infinity);

    virtualizer.collection = makeCollection(100);
    virtualizer.persistedKeys = new Set([99]);
    (layout as any).lastCollection = virtualizer.collection;

    let keys = layout.getVisibleLayoutInfos(virtualizer.visibleRect).map(info => info.key);
    expect(keys).toContain(99);
  });
});
