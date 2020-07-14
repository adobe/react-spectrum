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

import {Collection} from '@react-types/shared';
import {focusWithoutScrolling, mergeProps} from '@react-aria/utils';
import {Layout, Rect, ReusableView, useVirtualizerState, VirtualizerState} from '@react-stately/virtualizer';
import React, {FocusEvent, HTMLAttributes, Key, ReactElement, RefObject, useCallback, useEffect, useRef} from 'react';
import {ScrollView} from './ScrollView';
import {VirtualizerItem} from './VirtualizerItem';

interface VirtualizerProps<T extends object, V> extends HTMLAttributes<HTMLElement> {
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
  transitionDuration?: number,
  isLoading?: boolean,
  onLoadMore?: () => void,
}

function Virtualizer<T extends object, V>(props: VirtualizerProps<T, V>, ref: RefObject<HTMLDivElement>) {
  let {
    children: renderView,
    renderWrapper,
    layout,
    collection,
    sizeToFit,
    scrollDirection,
    transitionDuration,
    isLoading,
    onLoadMore,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    focusedKey,
    ...otherProps
  } = props;

  let fallbackRef = useRef<HTMLDivElement>();
  ref = ref || fallbackRef;

  let state = useVirtualizerState({
    transitionDuration,
    layout,
    collection,
    renderView,
    renderWrapper: renderWrapper || defaultRenderWrapper,
    onVisibleRectChange(rect) {
      ref.current.scrollLeft = rect.x;
      ref.current.scrollTop = rect.y;
    }
  });

  let {virtualizerProps} = useVirtualizer(props, state, ref);

  // Handle scrolling, and call onLoadMore when nearing the bottom.
  let onVisibleRectChange = useCallback((rect: Rect) => {
    state.setVisibleRect(rect);

    if (!isLoading && onLoadMore) {
      let scrollOffset = state.virtualizer.contentSize.height - rect.height * 2;
      if (rect.y > scrollOffset) {
        onLoadMore();
      }
    }
  }, [isLoading, onLoadMore, state]);

  return (
    <ScrollView
      {...mergeProps(otherProps, virtualizerProps)}
      ref={ref}
      innerStyle={state.isAnimating ? {transition: `none ${state.virtualizer.transitionDuration}ms`} : undefined}
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

interface VirtualizerOptions {
  focusedKey?: Key,
  scrollToItem?: (key: Key) => void
}

export function useVirtualizer<T extends object, V, W>(props: VirtualizerOptions, state: VirtualizerState<T, V, W>, ref: RefObject<HTMLElement>) {
  let {focusedKey, scrollToItem} = props;
  let {virtualizer} = state;

  // Scroll to the focusedKey when it changes. Actually focusing the focusedKey
  // is up to the implementation using Virtualizer since we don't have refs
  // to all of the item DOM nodes.
  let lastFocusedKey = useRef(null);
  useEffect(() => {
    if (virtualizer.visibleRect.height === 0) {
      return;
    }

    if (focusedKey !== lastFocusedKey.current) {
      if (scrollToItem) {
        scrollToItem(focusedKey);
      } else {
        virtualizer.scrollToItem(focusedKey, {duration: 0});
      }
    }

    lastFocusedKey.current = focusedKey;
  }, [focusedKey, virtualizer.visibleRect.height, virtualizer, lastFocusedKey, scrollToItem]);

  let isFocusWithin = useRef(false);
  let onFocus = useCallback((e: FocusEvent) => {
    // If the focused item is scrolled out of view and is not in the DOM, the collection
    // will have tabIndex={0}. When tabbing in from outside, scroll the focused item into view.
    // We only want to do this if the collection itself is receiving focus, not a child
    // element, and we aren't moving focus to the collection from within (see below).
    if (e.target === ref.current && !isFocusWithin.current) {
      virtualizer.scrollToItem(focusedKey, {duration: 0});
    }

    isFocusWithin.current = e.target !== ref.current;
  }, [ref, virtualizer, focusedKey]);

  let onBlur = useCallback((e: FocusEvent) => {
    isFocusWithin.current = ref.current.contains(e.relatedTarget as Element);
  }, [ref]);

  // When the focused item is scrolled out of view and is removed from the DOM,
  // move focus to the collection view as a whole if focus was within before.
  let focusedView = virtualizer.getView(focusedKey);
  useEffect(() => {
    if (focusedKey && !focusedView && isFocusWithin.current && document.activeElement !== ref.current) {
      focusWithoutScrolling(ref.current);
    }
  });

  return {
    virtualizerProps: {
      tabIndex: focusedView ? -1 : 0,
      onFocus,
      onBlur
    }
  };
}

// forwardRef doesn't support generic parameters, so cast the result to the correct type
// https://stackoverflow.com/questions/58469229/react-with-typescript-generics-while-using-react-forwardref
const _Virtualizer = React.forwardRef(Virtualizer) as <T extends object, V>(props: VirtualizerProps<T, V> & {ref?: RefObject<HTMLDivElement>}) => ReactElement;
export {_Virtualizer as Virtualizer};

function defaultRenderWrapper<T extends object, V>(
  parent: ReusableView<T, V> | null,
  reusableView: ReusableView<T, V>
) {
  return (
    <VirtualizerItem
      key={reusableView.key}
      reusableView={reusableView}
      parent={parent} />
  );
}
