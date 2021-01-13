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

import {Direction} from '@react-types/shared';
import {LayoutInfo, ReusableView} from '@react-stately/virtualizer';
import React, {CSSProperties, useRef} from 'react';
import {useLocale} from '@react-aria/i18n';
import {useVirtualizerItem} from './useVirtualizerItem';

interface VirtualizerItemProps<T extends object, V> {
  reusableView: ReusableView<T, V>,
  parent?: ReusableView<T, V>,
  className?: string
}

export function VirtualizerItem<T extends object, V>(props: VirtualizerItemProps<T, V>) {
  let {className, reusableView, parent} = props;
  let {direction} = useLocale();
  let ref = useRef();
  useVirtualizerItem({
    reusableView,
    ref
  });

  return (
    <div role="presentation" ref={ref} className={className} style={layoutInfoToStyle(reusableView.layoutInfo, direction, parent && parent.layoutInfo)}>
      {reusableView.rendered}
    </div>
  );
}

let cache = new WeakMap();
export function layoutInfoToStyle(layoutInfo: LayoutInfo, dir: Direction, parent?: LayoutInfo | null): CSSProperties {
  let xProperty = dir === 'rtl' ? 'right' : 'left';
  let cached = cache.get(layoutInfo);
  if (cached && cached[xProperty] != null) {
    if (!parent) {
      return cached;
    }

    // Invalidate if the parent position changed.
    let top = layoutInfo.rect.y - parent.rect.y;
    let x = layoutInfo.rect.x - parent.rect.x;
    if (cached.top === top && cached[xProperty] === x) {
      return cached;
    }
  }

  let style: CSSProperties = {
    position: layoutInfo.isSticky ? 'sticky' : 'absolute',
    overflow: 'hidden',
    top: layoutInfo.rect.y - (parent ? parent.rect.y : 0),
    [xProperty]: layoutInfo.rect.x - (parent ? parent.rect.x : 0),
    transition: 'all',
    WebkitTransition: 'all',
    WebkitTransitionDuration: 'inherit',
    transitionDuration: 'inherit',
    width: layoutInfo.rect.width,
    height: layoutInfo.rect.height,
    opacity: layoutInfo.opacity,
    zIndex: layoutInfo.zIndex,
    transform: layoutInfo.transform,
    contain: 'size layout style paint'
  };

  cache.set(layoutInfo, style);
  return style;
}
