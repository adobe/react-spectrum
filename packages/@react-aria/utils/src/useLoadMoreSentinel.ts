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

import type {AsyncLoadable} from '@react-types/shared';
import {getScrollParent} from './getScrollParent';
import {RefObject, useRef} from 'react';
import {useEffectEvent} from './useEffectEvent';
import {useLayoutEffect} from './useLayoutEffect';

export interface LoadMoreSentinelProps extends AsyncLoadable {
  /**
   * The amount of offset from the bottom of your scrollable region that should trigger load more.
   * Uses a percentage value relative to the scroll body's client height. Load more is then triggered
   * when your current scroll position's distance from the bottom of the currently loaded list of items is less than
   * or equal to the provided value. (e.g. 1 = 100% of the scroll region's height).
   * @default 1
   */
  scrollOffset?: number
  // TODO: Maybe include a scrollRef option so the user can provide the scrollParent to compare against instead of having us look it up
}

export function useLoadMoreSentinel(props: LoadMoreSentinelProps, ref: RefObject<HTMLElement | null>): void {
  let {isLoading, onLoadMore, scrollOffset = 1} = props;

  let sentinelObserver = useRef<IntersectionObserver>(null);

  let triggerLoadMore = useEffectEvent((entries: IntersectionObserverEntry[]) => {
    // Use "isIntersecting" over an equality check of 0 since it seems like there is cases where
    // a intersection ratio of 0 can be reported when isIntersecting is actually true
    for (let entry of entries) {
      if (entry.isIntersecting && !isLoading && onLoadMore) {
        onLoadMore();
      }
    }
  });

  useLayoutEffect(() => {
    if (ref.current) {
      // TODO: problem with S2's Table loading spinner. Now that we use the isLoading provided to the sentinel in the layout to adjust the height of the loader,
      // we are getting space reserved for the loadMore spinner when doing initial loading and rendering empty state at the same time. We can somewhat fix this by providing isLoading={loadingState === 'loadingMore'}
      // which will mean the layout won't reserve space for the loader for initial loads, but that breaks the load more behavior (specifically, auto load more to fill scrollOffset. Scroll to load more seems broken to after initial load).
      // We need to tear down and set up a new IntersectionObserver to force a check if the sentinel is "in view", see  https://codesandbox.io/p/sandbox/magical-swanson-dhgp89?file=%2Fsrc%2FApp.js%3A21%2C21
      sentinelObserver.current = new IntersectionObserver(triggerLoadMore, {root: getScrollParent(ref?.current) as HTMLElement, rootMargin: `0px ${100 * scrollOffset}% ${100 * scrollOffset}% ${100 * scrollOffset}%`});
      sentinelObserver.current.observe(ref.current);
    }

    return () => {
      if (sentinelObserver.current) {
        sentinelObserver.current.disconnect();
      }
    };
  }, [isLoading, triggerLoadMore, ref, scrollOffset]);
}
