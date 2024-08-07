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
import {LayoutInfo} from '@react-stately/virtualizer';
import React, {CSSProperties, ReactNode, useRef} from 'react';
import {useLocale} from '@react-aria/i18n';
import {useVirtualizerItem, VirtualizerItemOptions} from './useVirtualizerItem';

interface VirtualizerItemProps extends Omit<VirtualizerItemOptions, 'ref'> {
  parent?: LayoutInfo | null,
  className?: string,
  children: ReactNode
}

export function VirtualizerItem(props: VirtualizerItemProps) {
  let {className, layoutInfo, virtualizer, parent, children} = props;
  let {direction} = useLocale();
  let ref = useRef(undefined);
  useVirtualizerItem({
    layoutInfo,
    virtualizer,
    ref
  });

  return (
    <div role="presentation" ref={ref} className={className} style={layoutInfoToStyle(layoutInfo, direction, parent)}>
      {children}
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

  let rectStyles = {
    top: layoutInfo.rect.y - (parent ? parent.rect.y : 0),
    [xProperty]: layoutInfo.rect.x - (parent ? parent.rect.x : 0),
    width: layoutInfo.rect.width,
    height: layoutInfo.rect.height
  };

  // Get rid of any non finite values since they aren't valid css values
  Object.entries(rectStyles).forEach(([key, value]) => {
    if (!Number.isFinite(value)) {
      rectStyles[key] = undefined;
    }
  });

  let style: CSSProperties = {
    position: layoutInfo.isSticky ? 'sticky' : 'absolute',
    // Sticky elements are positioned in normal document flow. Display inline-block so that they don't push other sticky columns onto the following rows.
    display: layoutInfo.isSticky ? 'inline-block' : undefined,
    overflow: layoutInfo.allowOverflow ? 'visible' : 'hidden',
    opacity: layoutInfo.opacity,
    zIndex: layoutInfo.zIndex,
    transform: layoutInfo.transform,
    contain: 'size layout style',
    ...rectStyles
  };

  cache.set(layoutInfo, style);
  return style;
}
