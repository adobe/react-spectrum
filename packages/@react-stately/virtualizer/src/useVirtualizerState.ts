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

import {Collection, Key} from '@react-types/shared';
import {InvalidationContext} from './types';
import {Layout} from './Layout';
import {Rect} from './Rect';
import {ReusableView} from './ReusableView';
import {Size} from './Size';
import {useCallback, useMemo, useRef, useState} from 'react';
import {useLayoutEffect} from '@react-aria/utils';
import {Virtualizer} from './Virtualizer';

interface VirtualizerProps<T extends object, V, W, O> {
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
  persistedKeys?: Set<Key>,
  layoutOptions?: O
}

export interface VirtualizerState<T extends object, V, W> {
  visibleViews: W[],
  setVisibleRect: (rect: Rect) => void,
  contentSize: Size,
  virtualizer: Virtualizer<T, V, W>,
  isScrolling: boolean,
  startScrolling: () => void,
  endScrolling: () => void
}

export function useVirtualizerState<T extends object, V, W, O = any>(opts: VirtualizerProps<T, V, W, O>): VirtualizerState<T, V, W> {
  let [visibleRect, setVisibleRect] = useState(new Rect(0, 0, 0, 0));
  let [isScrolling, setScrolling] = useState(false);
  let [invalidationContext, setInvalidationContext] = useState<InvalidationContext>({});
  let visibleRectChanged = useRef(false);
  let [virtualizer] = useState(() => new Virtualizer<T, V, W>({
    setVisibleRect(rect) {
      setVisibleRect(rect);
      visibleRectChanged.current = true;
    },
    // TODO: should changing these invalidate the entire cache?
    renderView: opts.renderView,
    renderWrapper: opts.renderWrapper,
    invalidate: setInvalidationContext
  }));

  // onVisibleRectChange must be called from an effect, not during render.
  useLayoutEffect(() => {
    if (visibleRectChanged.current) {
      visibleRectChanged.current = false;
      opts.onVisibleRectChange(visibleRect);
    }
  });

  let mergedInvalidationContext = useMemo(() => {
    if (opts.layoutOptions != null) {
      return {...invalidationContext, layoutOptions: opts.layoutOptions};
    }
    return invalidationContext;
  }, [invalidationContext, opts.layoutOptions]);

  let visibleViews = virtualizer.render({
    layout: opts.layout,
    collection: opts.collection,
    persistedKeys: opts.persistedKeys,
    layoutOptions: opts.layoutOptions,
    visibleRect,
    invalidationContext: mergedInvalidationContext,
    isScrolling
  });

  let contentSize = virtualizer.contentSize;

  let startScrolling = useCallback(() => {
    setScrolling(true);
  }, []);
  let endScrolling = useCallback(() => {
    setScrolling(false);
  }, []);

  let state = useMemo(() => ({
    virtualizer,
    visibleViews,
    setVisibleRect,
    contentSize,
    isScrolling,
    startScrolling,
    endScrolling
  }), [
    virtualizer,
    visibleViews,
    setVisibleRect,
    contentSize,
    isScrolling,
    startScrolling,
    endScrolling
  ]);

  return state;
}
