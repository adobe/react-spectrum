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

import type {AsyncLoadable, Collection} from '@react-types/shared';
import {getScrollParent} from './getScrollParent';
import {RefObject, useRef} from 'react';
import {useEffectEvent} from './useEffectEvent';
import {useLayoutEffect} from './useLayoutEffect';

export interface LoadMoreSentinelProps extends Omit<AsyncLoadable, 'isLoading'> {
  collection: Collection<any>,
  /**
   * The amount of offset from the bottom of your scrollable region that should trigger load more.
   * Uses a percentage value relative to the scroll body's client height. Load more is then triggered
   * when your current scroll position's distance from the bottom of the currently loaded list of items is less than
   * or equal to the provided value. (e.g. 1 = 100% of the scroll region's height).
   * @default 1
   */
  scrollOffset?: number
}

export function UNSTABLE_useLoadMoreSentinel(props: LoadMoreSentinelProps, ref: RefObject<HTMLElement | null>): void {
  let {collection, onLoadMore, scrollOffset = 1} = props;

  let sentinelObserver = useRef<IntersectionObserver>(null);

  let triggerLoadMore = useEffectEvent((entries: IntersectionObserverEntry[]) => {
    // Use "isIntersecting" over an equality check of 0 since it seems like there is cases where
    // a intersection ratio of 0 can be reported when isIntersecting is actually true
    for (let entry of entries) {
      // Note that this will be called if the collection changes, even if onLoadMore was already called and is being processed.
      // Up to user discretion as to how to handle these multiple onLoadMore calls
      if (entry.isIntersecting && onLoadMore) {
        onLoadMore();
      }
    }
  });

  useLayoutEffect(() => {
    if (ref.current) {
      // Tear down and set up a new IntersectionObserver when the collection changes so that we can properly trigger additional loadMores if there is room for more items
      // Need to do this tear down and set up since using a large rootMargin will mean the observer's callback isn't called even when scrolling the item into view beause its visibility hasn't actually changed
      // https://codesandbox.io/p/sandbox/magical-swanson-dhgp89?file=%2Fsrc%2FApp.js%3A21%2C21
      sentinelObserver.current = new IntersectionObserver(triggerLoadMore, {root: getScrollParent(ref?.current) as HTMLElement, rootMargin: `0px ${100 * scrollOffset}% ${100 * scrollOffset}% ${100 * scrollOffset}%`});
      sentinelObserver.current.observe(ref.current);
    }

    return () => {
      if (sentinelObserver.current) {
        sentinelObserver.current.disconnect();
      }
    };
  }, [collection, triggerLoadMore, ref, scrollOffset]);
}
