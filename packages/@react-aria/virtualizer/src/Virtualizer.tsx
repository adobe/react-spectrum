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
import {getInteractionModality} from '@react-aria/interactions';
import {Layout, Rect, ReusableView, useVirtualizerState, VirtualizerState} from '@react-stately/virtualizer';
import {mergeProps, useLayoutEffect} from '@react-aria/utils';
import React, {FocusEvent, HTMLAttributes, Key, ReactElement, ReactNode, RefObject, useCallback, useEffect, useMemo, useRef} from 'react';
import {ScrollView} from './ScrollView';
import {VirtualizerItem} from './VirtualizerItem';

interface VirtualizerProps<T extends object, V> extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
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
  shouldUseVirtualFocus?: boolean,
  scrollToItem?: (key: Key) => void,
  autoFocus?: boolean
}

function Virtualizer<T extends object, V extends ReactNode>(props: VirtualizerProps<T, V>, ref: RefObject<HTMLDivElement>) {
  let {
    children: renderView,
    renderWrapper,
    layout,
    collection,
    sizeToFit,
    scrollDirection,
    transitionDuration,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isLoading,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onLoadMore,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    focusedKey,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    shouldUseVirtualFocus,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    scrollToItem,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    autoFocus,
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

  let {virtualizerProps, scrollViewProps} = useVirtualizer(props, state, ref);

  return (
    <ScrollView
      {...mergeProps(otherProps, virtualizerProps, scrollViewProps)}
      ref={ref}
      innerStyle={state.isAnimating ? {transition: `none ${state.virtualizer.transitionDuration}ms`} : undefined}
      contentSize={state.contentSize}
      onScrollStart={state.startScrolling}
      onScrollEnd={state.endScrolling}
      sizeToFit={sizeToFit}
      scrollDirection={scrollDirection}>
      {state.visibleViews}
    </ScrollView>
  );
}

interface VirtualizerOptions {
  tabIndex?: number,
  focusedKey?: Key,
  scrollToItem?: (key: Key) => void,
  shouldUseVirtualFocus?: boolean,
  autoFocus?: boolean,
  isLoading?: boolean,
  onLoadMore?: () => void
}

export function useVirtualizer<T extends object, V extends ReactNode, W>(props: VirtualizerOptions, state: VirtualizerState<T, V, W>, ref: RefObject<HTMLElement>) {
  let {focusedKey, scrollToItem, shouldUseVirtualFocus, isLoading, onLoadMore} = props;
  let {virtualizer} = state;
  // Scroll to the focusedKey when it changes. Actually focusing the focusedKey
  // is up to the implementation using Virtualizer since we don't have refs
  // to all of the item DOM nodes.
  let lastFocusedKey = useRef(null);
  let isFocusWithin = useRef(false);
  let autoFocus = useRef(props.autoFocus);
  useEffect(() => {
    if (virtualizer.visibleRect.height === 0) {
      return;
    }

    // Only scroll the focusedKey into view if the modality is not pointer to avoid jumps in position when clicking/pressing tall items.
    let modality = getInteractionModality();
    if (focusedKey !== lastFocusedKey.current && (modality !== 'pointer' || autoFocus.current)) {
      autoFocus.current = false;
      if (scrollToItem) {
        // If user provides scrolltoitem, then it is their responsibility to call scrollIntoViewport if desired
        // since we don't know if their scrollToItem may take some time to actually bring the active element into the virtualizer's visible rect.
        scrollToItem(focusedKey);
      } else {
        virtualizer.scrollToItem(focusedKey, {duration: 0});

      }
    }

    lastFocusedKey.current = focusedKey;
  }, [focusedKey, virtualizer.visibleRect.height, virtualizer, lastFocusedKey, scrollToItem, ref]);

  // Persist the focusedKey and prevent it from being removed from the DOM when scrolled out of view.
  virtualizer.persistedKeys = useMemo(() => focusedKey ? new Set([focusedKey]) : new Set(), [focusedKey]);

  let onFocus = useCallback((e: FocusEvent) => {
    // If the focused item is scrolled out of view and is not in the DOM, the collection
    // will have tabIndex={0}. When tabbing in from outside, scroll the focused item into view.
    // Ignore focus events that bubble through portals (e.g. focus that happens on a menu popover child of the virtualizer)
    // Don't scroll focused key into view if modality is pointer to prevent sudden jump in position (e.g. CardView).
    let modality = getInteractionModality();
    if (!isFocusWithin.current && ref.current.contains(e.target) && modality !== 'pointer') {
      if (scrollToItem) {
        scrollToItem(focusedKey);
      } else {
        virtualizer.scrollToItem(focusedKey, {duration: 0});
      }
    }

    isFocusWithin.current = e.target !== ref.current;
  }, [ref, virtualizer, focusedKey, scrollToItem]);

  let onBlur = useCallback((e: FocusEvent) => {
    isFocusWithin.current = ref.current.contains(e.relatedTarget as Element);
  }, [ref]);

  // Set tabIndex to -1 if there is a focused key, otherwise 0 so that the collection
  // itself is tabbable. When the collection receives focus, we scroll the focused item back into
  // view, which will allow it to be properly focused. If using virtual focus, don't set a
  // tabIndex at all so that VoiceOver on iOS 14 doesn't try to move real DOM focus to the element anyway.
  let tabIndex: number;
  if (!shouldUseVirtualFocus) {
    // When there is no focusedKey the default tabIndex is 0. We include logic for empty collections too.
    // For collections that are empty, but have a link in the empty children we want to skip focusing this
    // and let focus move to the link similar to link moving to children.
    tabIndex = focusedKey != null ? -1 : 0;

    // If the collection is empty, we want the tabIndex provided from props (if any)
    // so that we handle when tabbable items are added to the empty state.
    if (virtualizer.collection.size === 0 && props.tabIndex != null) {
      tabIndex = props.tabIndex;
    }
  }

  // Handle scrolling, and call onLoadMore when nearing the bottom.
  let isLoadingRef = useRef(isLoading);
  let prevProps = useRef(props);
  let onVisibleRectChange = useCallback((rect: Rect) => {
    state.setVisibleRect(rect);

    if (!isLoadingRef.current && onLoadMore) {
      let scrollOffset = state.virtualizer.contentSize.height - rect.height * 2;
      if (rect.y > scrollOffset) {
        isLoadingRef.current = true;
        onLoadMore();
      }
    }
  }, [onLoadMore, state]);

  let lastContentSize = useRef(0);
  useLayoutEffect(() => {
    // If animating, wait until we're done.
    if (state.isAnimating) {
      return;
    }

    // Only update isLoadingRef if props object actually changed,
    // not if a local state change occurred.
    let wasLoading = isLoadingRef.current;
    if (props !== prevProps.current) {
      isLoadingRef.current = isLoading;
      prevProps.current = props;
    }

    let shouldLoadMore = !isLoadingRef.current
      && onLoadMore
      && state.contentSize.height > 0
      && state.contentSize.height <= state.virtualizer.visibleRect.height
      // Only try loading more if the content size changed, or if we just finished
      // loading and still have room for more items.
      && (wasLoading || state.contentSize.height !== lastContentSize.current);

    if (shouldLoadMore) {
      isLoadingRef.current = true;
      onLoadMore();
    }
    lastContentSize.current = state.contentSize.height;
  }, [state.contentSize, state.isAnimating, state.virtualizer, isLoading, onLoadMore, props]);

  return {
    virtualizerProps: {
      tabIndex,
      onFocus,
      onBlur
    },
    scrollViewProps: {
      onVisibleRectChange
    }
  };
}

// forwardRef doesn't support generic parameters, so cast the result to the correct type
// https://stackoverflow.com/questions/58469229/react-with-typescript-generics-while-using-react-forwardref
const _Virtualizer = React.forwardRef(Virtualizer) as <T extends object, V>(props: VirtualizerProps<T, V> & {ref?: RefObject<HTMLDivElement>}) => ReactElement;
export {_Virtualizer as Virtualizer};

function defaultRenderWrapper<T extends object, V extends ReactNode>(
  parent: ReusableView<T, V> | null,
  reusableView: ReusableView<T, V>
) {
  return (
    <VirtualizerItem
      key={reusableView.key}
      layoutInfo={reusableView.layoutInfo}
      virtualizer={reusableView.virtualizer}
      parent={parent?.layoutInfo}>
      {reusableView.rendered}
    </VirtualizerItem>
  );
}
