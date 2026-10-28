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

import {isElementVisible} from '../utils/isElementVisible';
import {LayoutInfo, ReusableView, Size, VirtualizerState} from 'react-stately/useVirtualizerState';
import {RefObject} from '@react-types/shared';
import {useLayoutEffect} from '../utils/useLayoutEffect';

export interface VirtualizerOptions {}

export const itemMap: WeakMap<LayoutInfo, HTMLElement> = new WeakMap();

export function useVirtualizer<T extends object, V>(
  props: VirtualizerOptions,
  state: VirtualizerState<T, V>,
  _ref: RefObject<HTMLElement | null>
): void {
  useLayoutEffect(() => {
    let views: ReusableView<T, V>[] = [...state.visibleViews];
    let layoutInfos: LayoutInfo[] = [];
    let nodes: HTMLElement[] = [];
    let heights: string[] = [];

    for (let view of views) {
      views.push(...view.children);
      let layoutInfo = view.layoutInfo!;
      let node = itemMap.get(layoutInfo);
      if (node && layoutInfo.estimatedSize) {
        layoutInfos.push(layoutInfo);
        nodes.push(node);
        heights.push(node.style.height);
        node.style.height = '';
      }
    }

    let sizes = nodes.map(node =>
      isElementVisible(node) ? new Size(node.scrollWidth, node.scrollHeight) : null
    );

    nodes.forEach((node, i) => {
      node.style.height = heights[i];
      let size = sizes[i];
      if (size) {
        state.virtualizer.updateItemSize(layoutInfos[i].key, size);
      }
    });
  });
}
