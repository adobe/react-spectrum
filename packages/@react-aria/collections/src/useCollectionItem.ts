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

import {CollectionManager, LayoutInfo, Size} from '@react-stately/collections';
import {RefObject, useCallback, useLayoutEffect} from 'react';

interface CollectionItemOptions<T extends object, V, W> {
  layoutInfo: LayoutInfo,
  collectionManager: CollectionManager<T, V, W>,
  ref: RefObject<HTMLElement>
}

export function useCollectionItem<T extends object, V, W>(options: CollectionItemOptions<T, V, W>) {
  let {layoutInfo, collectionManager, ref} = options;

  let updateSize = useCallback(() => {
    let size = getSize(ref.current);
    collectionManager.updateItemSize(layoutInfo.key, size);
  }, [collectionManager, layoutInfo.key, ref]);

  useLayoutEffect(() => {
    if (layoutInfo.estimatedSize) {
      updateSize();
    }
  });

  return {updateSize};
}

function getSize(node: HTMLElement) {
  // Get bounding rect of all children
  let top = Infinity, left = Infinity, bottom = 0, right = 0;
  for (let child of Array.from(node.childNodes)) {
    let rect = (child as HTMLElement).getBoundingClientRect();
    top = Math.min(top, rect.top);
    left = Math.min(left, rect.left);
    bottom = Math.max(bottom, rect.bottom);
    right = Math.max(right, rect.right);
  }

  return new Size(right - left, bottom - top);
}
