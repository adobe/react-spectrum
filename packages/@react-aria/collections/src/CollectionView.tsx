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

import {chain} from '@react-aria/utils';
import {Collection, Layout} from '@react-stately/collections';
import {CollectionItem} from './CollectionItem';
import React, {FocusEvent, HTMLAttributes, Key, ReactElement, useCallback, useEffect, useRef} from 'react';
import {ReusableView} from '@react-stately/collections';
import {ScrollView} from './ScrollView';
import {useCollectionState} from '@react-stately/collections';

interface CollectionViewProps<T extends object, V> extends HTMLAttributes<HTMLElement> {
  children: (type: string, content: T) => V,
  renderWrapper?: (
    parent: ReusableView<T, V> | null,
    reusableView: ReusableView<T, V>,
    children: ReusableView<T, V>[],
    renderChildren: (views: ReusableView<T, V>[]) => ReactElement[]
  ) => ReactElement,
  layout: Layout<T>,
  collection: Collection<T>,
  focusedKey?: Key,
  sizeToFit?: 'width' | 'height'
}

export function CollectionView<T extends object, V>(props: CollectionViewProps<T, V>) {
  let {children: renderView, renderWrapper, layout, collection, focusedKey, sizeToFit, ...otherProps} = props;
  let {
    visibleViews,
    visibleRect,
    setVisibleRect,
    contentSize,
    isAnimating,
    collectionManager
  } = useCollectionState({
    layout,
    collection,
    renderView,
    renderWrapper: renderWrapper || defaultRenderWrapper
  });

  let ref = useRef<HTMLDivElement>();

  // Scroll to the focusedKey when it changes. Actually focusing the focusedKey
  // is up to the implementation using CollectionView since we don't have refs
  // to all of the item DOM nodes.
  useEffect(() => {
    if (focusedKey) {
      collectionManager.scrollToItem(focusedKey, 0);
    }
  }, [focusedKey, collectionManager]);

  let isFocusWithin = useRef(false);
  let onFocus = useCallback((e: FocusEvent) => {
    // If the focused item is scrolled out of view and is not in the DOM, the CollectionView
    // will have tabIndex={0}. When tabbing in from outside, scroll the focused item into view.
    // We only want to do this if the CollectionView itself is receiving focus, not a child
    // element, and we aren't moving focus to the CollectionView from within (see below).
    if (e.target === ref.current && !isFocusWithin.current) {
      collectionManager.scrollToItem(focusedKey, 0);
    }

    isFocusWithin.current = e.target !== ref.current;
  }, [focusedKey, collectionManager]);

  let onBlur = useCallback((e: FocusEvent) => {
    isFocusWithin.current = ref.current.contains(e.relatedTarget as Element);
  }, []);

  // When the focused item is scrolled out of view and is removed from the DOM, 
  // move focus to the collection view as a whole if focus was within before.
  let focusedView = collectionManager.getItemView(focusedKey);
  useEffect(() => {
    if (focusedKey && !focusedView && isFocusWithin.current && document.activeElement !== ref.current) {
      ref.current.focus();
    }
  });
  
  return (
    <ScrollView 
      {...otherProps}
      tabIndex={focusedView ? -1 : 0}
      ref={ref}
      onFocus={chain(otherProps.onFocus, onFocus)}
      onBlur={chain(otherProps.onBlur, onBlur)}
      innerStyle={isAnimating ? {transition: `none ${collectionManager.transitionDuration}ms`} : undefined}
      contentSize={contentSize}
      visibleRect={visibleRect}
      onVisibleRectChange={setVisibleRect}
      sizeToFit={sizeToFit}>
      {visibleViews}
    </ScrollView>
  );
}

function defaultRenderWrapper<T extends object, V>(
  parent: ReusableView<T, V> | null,
  reusableView: ReusableView<T, V>
) {
  return (
    <CollectionItem
      key={reusableView.key}
      reusableView={reusableView}
      parent={parent} />
  );
}
