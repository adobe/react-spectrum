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

import {Collection, Layout, Rect} from '@react-stately/collections';
import {CollectionItem} from './CollectionItem';
import {CollectionState, useCollectionState} from '@react-stately/collections';
import {focusWithoutScrolling, mergeProps} from '@react-aria/utils';
import React, {FocusEvent, HTMLAttributes, Key, ReactElement, RefObject, useCallback, useEffect, useRef} from 'react';
import {ReusableView} from '@react-stately/collections';
import {ScrollView} from './ScrollView';

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
  sizeToFit?: 'width' | 'height',
  scrollDirection?: 'horizontal' | 'vertical' | 'both',
  isLoading?: boolean,
  onLoadMore?: () => void
}

function CollectionView<T extends object, V>(props: CollectionViewProps<T, V>, ref: RefObject<HTMLDivElement>) {
  let {children: renderView, renderWrapper, layout, collection, sizeToFit, scrollDirection, ...otherProps} = props;

  let fallbackRef = useRef<HTMLDivElement>();
  ref = ref || fallbackRef;

  let state = useCollectionState({
    layout,
    collection,
    renderView,
    renderWrapper: renderWrapper || defaultRenderWrapper,
    onVisibleRectChange(rect) {
      ref.current.scrollLeft = rect.x;
      ref.current.scrollTop = rect.y;
    }
  });

  let {collectionViewProps} = useCollectionView(props, state, ref);

  // Handle scrolling, and call onLoadMore when nearing the bottom.
  let onVisibleRectChange = useCallback((rect: Rect) => {
    state.setVisibleRect(rect);

    if (!props.isLoading && props.onLoadMore) {
      let scrollOffset = state.collectionManager.contentSize.height - rect.height * 2;
      if (rect.y > scrollOffset) {
        props.onLoadMore();
      }
    }
  }, [props.isLoading, props.onLoadMore, state]);
  
  return (
    <ScrollView 
      {...mergeProps(otherProps, collectionViewProps)}
      ref={ref}
      innerStyle={state.isAnimating ? {transition: `none ${state.collectionManager.transitionDuration}ms`} : undefined}
      contentSize={state.contentSize}
      onVisibleRectChange={onVisibleRectChange}
      onScrollStart={state.startScrolling}
      onScrollEnd={state.endScrolling}
      sizeToFit={sizeToFit}
      scrollDirection={scrollDirection}>
      {state.visibleViews}
    </ScrollView>
  );
}

interface CollectionViewOpts {
  focusedKey?: Key
}

export function useCollectionView<T extends object, V, W>(props: CollectionViewOpts, state: CollectionState<T, V, W>, ref: RefObject<HTMLElement>) {
  let {focusedKey} = props;
  let {collectionManager} = state;

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
  }, [ref, collectionManager, focusedKey]);

  let onBlur = useCallback((e: FocusEvent) => {
    isFocusWithin.current = ref.current.contains(e.relatedTarget as Element);
  }, [ref]);

  // When the focused item is scrolled out of view and is removed from the DOM, 
  // move focus to the collection view as a whole if focus was within before.
  let focusedView = collectionManager.getView(focusedKey);
  useEffect(() => {
    if (focusedKey && !focusedView && isFocusWithin.current && document.activeElement !== ref.current) {
      focusWithoutScrolling(ref.current);
    }
  });

  return {
    collectionViewProps: {
      tabIndex: focusedView ? -1 : 0,
      onFocus,
      onBlur
    }
  };
}

// forwardRef doesn't support generic parameters, so cast the result to the correct type
// https://stackoverflow.com/questions/58469229/react-with-typescript-generics-while-using-react-forwardref
const _CollectionView = React.forwardRef(CollectionView) as <T extends object, V>(props: CollectionViewProps<T, V> & {ref?: RefObject<HTMLDivElement>}) => ReactElement;
export {_CollectionView as CollectionView};

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
