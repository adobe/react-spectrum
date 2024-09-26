/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {RefObject, useCallback, useRef} from 'react';
import {useEvent} from './useEvent';
// eslint-disable-next-line rulesdir/useLayoutEffectRule
import {useLayoutEffect} from './useLayoutEffect';

export interface LoadMoreProps {
  /** Whether data is currently being loaded. */
  isLoading?: boolean,
  /** Handler that is called when more items should be loaded, e.g. while scrolling near the bottom.  */
  onLoadMore?: () => void,
  /**
   * The amount of offset from the bottom of your scrollable region that should trigger load more.
   * Uses a percentage value relative to the scroll body's client height. Load more is then triggered
   * when your current scroll position's distance from the bottom of the currently loaded list of items is less than
   * or equal to the provided value. (e.g. 1 = 100% of the scroll region's height).
   * @default 1
   */
  scrollOffset?: number,
  /** The data currently loaded. */
  items?: any
}

export function useLoadMore(props: LoadMoreProps, ref: RefObject<HTMLElement | null>) {
  let {isLoading, onLoadMore, scrollOffset = 1, items} = props;

  // Handle scrolling, and call onLoadMore when nearing the bottom.
  let isLoadingRef = useRef(isLoading);
  let prevProps = useRef(props);
  let onScroll = useCallback(() => {
    if (ref.current && !isLoadingRef.current && onLoadMore) {
      let shouldLoadMore = ref.current.scrollHeight - ref.current.scrollTop - ref.current.clientHeight < ref.current.clientHeight * scrollOffset;

      if (shouldLoadMore) {
        isLoadingRef.current = true;
        onLoadMore();
      }
    }
  }, [onLoadMore, ref, scrollOffset]);

  let lastItems = useRef(items);
  useLayoutEffect(() => {
    // Only update isLoadingRef if props object actually changed,
    // not if a local state change occurred.
    if (props !== prevProps.current) {
      isLoadingRef.current = isLoading;
      prevProps.current = props;
    }

    // TODO: Eventually this hook will move back into RAC during which we will accept the collection as a option to this hook.
    // We will only load more if the collection has changed after the last load to prevent multiple onLoadMore from being called
    // while the data from the last onLoadMore is being processed by RAC collection.
    let shouldLoadMore = ref?.current
      && !isLoadingRef.current
      && onLoadMore
      && (!items || items !== lastItems.current)
      && ref.current.clientHeight === ref.current.scrollHeight;

    if (shouldLoadMore) {
      isLoadingRef.current = true;
      onLoadMore?.();
    }

    lastItems.current = items;
  }, [isLoading, onLoadMore, props, ref, items]);

  // TODO: maybe this should still just return scroll props?
  // Test against case where the ref isn't defined when this is called
  // Think this was a problem when trying to attach to the scrollable body of the table in OnLoadMoreTableBodyScroll
  useEvent(ref, 'scroll', onScroll);
}
