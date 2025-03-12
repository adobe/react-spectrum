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
import {RefObject, useCallback, useRef} from 'react';
import {useEvent} from './useEvent';
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
  // TODO: will need to refactor the existing components that use items
  // this is a breaking change but this isn't documented and is in the react-aria/utils package so might be ok? Maybe can move this to a different package?
  // /** The data currently loaded. */
  // items?: any,
  collection?: Collection<Node<unknown>>
}

export function useLoadMore(props: LoadMoreProps, ref: RefObject<HTMLElement | null>) {
  let {isLoading, onLoadMore, scrollOffset = 1, collection} = props;

  // Handle scrolling, and call onLoadMore when nearing the bottom.
  let onScroll = useCallback(() => {
    if (ref.current && !isLoading && onLoadMore) {
      let shouldLoadMore = ref.current.scrollHeight - ref.current.scrollTop - ref.current.clientHeight < ref.current.clientHeight * scrollOffset;

      if (shouldLoadMore) {
        onLoadMore();
      }
    }
  }, [onLoadMore, isLoading, ref, scrollOffset]);

  let lastCollection = useRef(collection);
  // If we are in a loading state when this hook is called and a collection is provided, we can assume that the collection will update in the future so we don't
  // want to trigger another loadMore until the collection has updated as a result of the load.
  // TODO: If the load doesn't end up updating the collection even after completion, this flag could get stuck as true. However, not tracking
  // this means we could end up calling onLoadMore multiple times if isLoading changes but the collection takes time to update
  let collectionAwaitingUpdate = useRef(collection && isLoading);
  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    // Only update this flag if the collection changes when we aren't loading. Guard against the addition of a loading spinner when a load starts
    // which mutates the collection? Alternatively, the user might wipe the collection during load
    // If collection isn't provided, update flag
    if (collection !== lastCollection.current && !isLoading) {
      collectionAwaitingUpdate.current = false;
    }

    let observer = new IntersectionObserver((entries) => {
      let allItemsInView = true;
      entries.forEach((entry) => {
        // TODO this is problematic if the entry is a long row since a part of it will always out of view meaning the intersectionRatio is < 1
        if (entry.intersectionRatio < 1) {
          allItemsInView = false;
        }
      });

      if (allItemsInView && !isLoading && !(collection && collectionAwaitingUpdate.current) && onLoadMore) {
        onLoadMore();
        if (collection !== null && lastCollection.current !== null) {
          collectionAwaitingUpdate.current = true;
        }
      }
    }, {root: ref.current});

    // TODO: right now this is using the Virtualizer's div that wraps the rows, but perhaps should be the items themselves
    // This also has various problems because we'll need to figure out what is the proper element to compare the scroll container height to

    let lastElement = ref.current.querySelector('[role="presentation"]');
    // let lastElement = ref.current.querySelector('[role="presentation"]>[role="presentation"]:last-child');
    if (lastElement) {
      observer.observe(lastElement);
    }

    lastCollection.current = collection;
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [isLoading, onLoadMore, props, ref, collection]);


  // TODO: maybe this should still just return scroll props?
  // Test against case where the ref isn't defined when this is called
  // Think this was a problem when trying to attach to the scrollable body of the table in OnLoadMoreTableBodyScroll
  useEvent(ref, 'scroll', onScroll);
}
