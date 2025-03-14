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

import {Collection, Node} from '@react-types/shared';
import {RefObject, useRef} from 'react';
import {useEffectEvent} from './useEffectEvent';
import {useLayoutEffect} from './useLayoutEffect';

export interface LoadMoreProps {
  /** Whether data is currently being loaded. */
  isLoading?: boolean,
  /** Handler that is called when more items should be loaded, e.g. while scrolling near the bottom. */
  onLoadMore?: () => void,
  /**
   * The amount of offset from the bottom of your scrollable region that should trigger load more.
   * Uses a percentage value relative to the scroll body's client height. Load more is then triggered
   * when your current scroll position's distance from the bottom of the currently loaded list of items is less than
   * or equal to the provided value. (e.g. 1 = 100% of the scroll region's height).
   * @default 1
   */
  scrollOffset?: number,
  // TODO: this is a breaking change but this isn't documented and is in the react-aria/utils package so might be ok? Maybe can move this to a different package?
  collection?: Collection<Node<unknown>>,
  /**
   * A ref to a sentinel element that is positioned at the end of the list's content. The visibility of this senetinel
   * with respect to the scrollable region and its offset determines if we should load more.
   */
  sentinelRef: RefObject<HTMLElement | null>
}

export function useLoadMore(props: LoadMoreProps, ref: RefObject<HTMLElement | null>): void {
  let {isLoading, onLoadMore, scrollOffset = 1, collection, sentinelRef} = props;
  let lastCollection = useRef(collection);

  // If we are in a loading state when this hook is called and a collection is provided, we can assume that the collection will update in the future so we don't
  // want to trigger another loadMore until the collection has updated as a result of the load.
  // TODO: If the load doesn't end up updating the collection even after completion, this flag could get stuck as true. However, not tracking
  // this means we could end up calling onLoadMore multiple times if isLoading changes but the collection takes time to update
  let collectionAwaitingUpdate = useRef(collection && isLoading);
  let sentinelObserver = useRef<IntersectionObserver>(null);

  let triggerLoadMore = useEffectEvent((entries: IntersectionObserverEntry[]) => {
    // Only one entry should exist so this should be ok. Also use "isIntersecting" over an equality check of 0 since it seems like there is cases where
    // a intersection ratio of 0 can be reported when isIntersecting is actually true
    if (entries[0].isIntersecting && !isLoading && !(collection && collectionAwaitingUpdate.current) && onLoadMore) {
      onLoadMore();
      if (collection !== null && lastCollection.current !== null) {
        collectionAwaitingUpdate.current = true;
      }
    }
  });

  // TODO: maybe can optimize creating the intersection observer by adding it in a useLayoutEffect but would need said effect to run every render
  // so that we can catch when ref.current exists or is modified (maybe return a callbackRef?) and then would need to check if scrollOffset changed.
  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    // Only update this flag if the collection changes when we aren't loading. Guards against cases like the addition of a loading spinner when a load starts or if the user
    // temporarily wipes the collection during loading which isn't the collection update via fetch which we are waiting for.
    // If collection isn't provided (aka for RSP components which won't provide a collection), flip flag to false so we still trigger onLoadMore
    if (collection !== lastCollection.current && !isLoading) {
      collectionAwaitingUpdate.current = false;
    }

    sentinelObserver.current = new IntersectionObserver(triggerLoadMore, {root: ref.current, rootMargin: `0px ${100 * scrollOffset}% ${100 * scrollOffset}% ${100 * scrollOffset}%`});
    if (sentinelRef?.current) {
      sentinelObserver.current.observe(sentinelRef.current);
    }

    lastCollection.current = collection;
    return () => {
      if (sentinelObserver.current) {
        sentinelObserver.current.disconnect();
      }
    };
  }, [isLoading, triggerLoadMore, ref, collection, scrollOffset, sentinelRef]);
}
