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

import {Collection} from './types';
import {CollectionManager} from './CollectionManager';
import {Key, useCallback, useLayoutEffect, useMemo, useState} from 'react';
import {Layout} from './Layout';
import {Rect} from './Rect';
import {ReusableView} from './ReusableView';
import {Size} from './Size';

interface CollectionProps<T extends object, V, W> {
  renderView(type: string, content: T): V,
  renderWrapper(
    parent: ReusableView<T, V> | null,
    reusableView: ReusableView<T, V>,
    children: ReusableView<T, V>[],
    renderChildren: (views: ReusableView<T, V>[]) => W[]
  ): W,
  layout: Layout<T>,
  collection: Collection<T>,
  onVisibleRectChange(rect: Rect): void,
  getScrollAnchor?(rect: Rect): Key
}

export interface CollectionState<T extends object, V, W> {
  visibleViews: W[],
  setVisibleRect: (rect: Rect) => void,
  contentSize: Size,
  isAnimating: boolean,
  collectionManager: CollectionManager<T, V, W>,
  isScrolling: boolean,
  startScrolling: () => void,
  endScrolling: () => void
}

export function useCollectionState<T extends object, V, W>(opts: CollectionProps<T, V, W>): CollectionState<T, V, W> {
  let [visibleViews, setVisibleViews] = useState<W[]>([]);
  let [contentSize, setContentSize] = useState(new Size());
  let [isAnimating, setAnimating] = useState(false);
  let [isScrolling, setScrolling] = useState(false);
  let collectionManager = useMemo(() => new CollectionManager<T, V, W>(), []);

  collectionManager.delegate = {
    setVisibleViews,
    setVisibleRect(rect) {
      collectionManager.visibleRect = rect;
      opts.onVisibleRectChange(rect);
    },
    setContentSize,
    renderView: opts.renderView,
    renderWrapper: opts.renderWrapper,
    beginAnimations: () => setAnimating(true),
    endAnimations: () => setAnimating(false),
    getScrollAnchor: opts.getScrollAnchor
  };

  collectionManager.layout = opts.layout;
  collectionManager.collection = opts.collection;

  useLayoutEffect(() => {
    collectionManager.afterRender();
  });

  return {
    collectionManager,
    visibleViews,
    setVisibleRect: useCallback((rect) => {
      collectionManager.visibleRect = rect;
    }, [collectionManager]),
    contentSize,
    isAnimating,
    isScrolling,
    startScrolling: useCallback(() => {
      collectionManager.startScrolling();
      setScrolling(true);
    }, [collectionManager]),
    endScrolling: useCallback(() => {
      collectionManager.endScrolling();
      setScrolling(false);
    }, [collectionManager])
  };
}
