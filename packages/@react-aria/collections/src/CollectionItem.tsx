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

import {LayoutInfo} from '@react-stately/collections';
import React, {CSSProperties, useRef} from 'react';
import {ReusableView} from '@react-stately/collections';
import {useCollectionItem} from './useCollectionItem';

interface CollectionItemProps<T extends object, V> {
  reusableView: ReusableView<T, V>,
  parent?: ReusableView<T, V>
}

export function CollectionItem<T extends object, V>(props: CollectionItemProps<T, V>) {
  let {reusableView, parent} = props;
  let ref = useRef();
  useCollectionItem({
    reusableView,
    ref
  });

  return (
    <div role="presentation" ref={ref} style={layoutInfoToStyle(reusableView.layoutInfo, parent && parent.layoutInfo)}>
      {reusableView.rendered}
    </div>
  );
}

export function layoutInfoToStyle(layoutInfo: LayoutInfo, parent?: LayoutInfo | null): CSSProperties {
  return {
    position: 'absolute',
    overflow: 'hidden',
    top: layoutInfo.rect.y - (parent ? parent.rect.y : 0),
    left: layoutInfo.rect.x - (parent ? parent.rect.x : 0),
    transition: 'all',
    WebkitTransition: 'all',
    WebkitTransitionDuration: 'inherit',
    transitionDuration: 'inherit',
    width: layoutInfo.rect.width + 'px',
    height: layoutInfo.rect.height + 'px',
    opacity: layoutInfo.opacity,
    zIndex: layoutInfo.zIndex,
    transform: layoutInfo.transform,
    contain: 'size layout style paint'
  };
}
