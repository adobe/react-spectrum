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

import {Collection, Key} from '@react-types/shared';
import {Layout} from '../../src/virtualizer/Layout';
import {LayoutInfo} from '../../src/virtualizer/LayoutInfo';
import {Rect} from '../../src/virtualizer/Rect';
import {Size} from '../../src/virtualizer/Size';
import {Virtualizer} from '../../src/virtualizer/Virtualizer';

class TestLayout extends Layout<object> {
  infos = new Map<Key, LayoutInfo>();
  getLayoutInfoCalls = 0;

  getVisibleLayoutInfos(_rect: Rect): LayoutInfo[] {
    return [];
  }

  getLayoutInfo(key: Key) {
    this.getLayoutInfoCalls++;
    return this.infos.get(key) ?? null;
  }

  getContentSize(): Size {
    return new Size();
  }
}

function createCollection(): Collection<object> {
  return {
    size: 0,
    getKeys: () => [],
    getItem: () => null,
    at: () => null,
    getKeyBefore: () => null,
    getKeyAfter: () => null,
    getFirstKey: () => null,
    getLastKey: () => null,
    [Symbol.iterator]: function* () {}
  };
}

describe('Virtualizer', () => {
  it('caches persisted key ancestors and rebuilds them when persisted keys change', () => {
    let layout = new TestLayout();
    let addInfo = (key: Key, parentKey: Key | null) => {
      let info = new LayoutInfo('item', key, new Rect());
      info.parentKey = parentKey;
      layout.infos.set(key, info);
    };
    addInfo('leaf', 'parent');
    addInfo('parent', 'root');
    addInfo('root', null);
    addInfo('otherLeaf', 'otherParent');
    addInfo('otherParent', 'otherRoot');
    addInfo('otherRoot', null);

    let virtualizer = new Virtualizer({
      delegate: {
        setVisibleRect() {},
        renderView: () => null,
        invalidate() {}
      },
      collection: createCollection(),
      layout
    });
    virtualizer.persistedKeys.add('leaf');

    expect(virtualizer.isPersistedKey('parent')).toBe(true);
    let getLayoutInfoCalls = layout.getLayoutInfoCalls;
    expect(virtualizer.isPersistedKey('root')).toBe(true);
    expect(virtualizer.isPersistedKey('unrelated')).toBe(false);
    expect(layout.getLayoutInfoCalls).toBe(getLayoutInfoCalls);

    virtualizer.render({
      layout,
      collection: virtualizer.collection,
      persistedKeys: new Set(['otherLeaf']),
      visibleRect: new Rect(),
      size: new Size(),
      invalidationContext: {},
      isScrolling: false
    });

    expect(virtualizer.isPersistedKey('parent')).toBe(false);
    expect(virtualizer.isPersistedKey('otherParent')).toBe(true);
  });
});
