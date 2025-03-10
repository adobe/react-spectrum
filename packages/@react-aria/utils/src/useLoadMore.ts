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
    // Only update this flag if the collection changes when we aren't loading. Guard against the addition of a loading spinner when a load starts
    // which mutates the collection? Alternatively, the user might wipe the collection during load
    // If collection isn't provided, update flag
    if (collection !== lastCollection.current && !isLoading) {
      collectionAwaitingUpdate.current = false;
    }

    // TODO: if we aren't loading, if the collection has changed, and the height is the same, we should load more
    // if we aren't loading, if the collection is the same, and the height is the same, we are either in a case where we are still processing
    // the collection and thus don't want to trigger a load or we had items preloaded and need to load more. That means comparing collection to lastCollection is
    // insufficient
    // might need to wait for height to change?
    // TODO: This doesn't quite work if we dont set a rowHeight in the ListLayout, this is because when
    // Will also need to test against a case where there are sections being loaded and/or estimated height
    // Ideally this layoutEffect would trigger after the collection updates AND the item size has settled
    // Previously, Virtualizer passed state from useVirtualizerState into this hook so that we could get a rerender and trigger this effect
    // as well as compare previous/last sizes
    let shouldLoadMore = onLoadMore
      && !isLoading
      // For v3 virtualizer, no collection will be provided to this hook so skip this check. Otherwise we should stop loadMore
      // calls in RAC if we are waiting for the collection to be updated from a async load call
      && (!(collection && collectionAwaitingUpdate.current))
      && (ref?.current && ref.current.clientHeight === ref.current.scrollHeight);

    if (shouldLoadMore) {
      onLoadMore?.();
      // Only update this flag if a collection has been provided, v3 virtualizer doesn't provide a collection so we don't need
      // to use collectionAwaitingUpdate at all.
      if (collection !== null && lastCollection.current !== null) {
        collectionAwaitingUpdate.current = true;
      }
    }

    // TODO: only update this when isLoading is false? Might need to guard against the case where loading spinners are added/collection is temporarly wiped/
    // loading spinner is removed when loading finishes (this last one we might still need to guard against somehow...). Seems to be ok for now
    lastCollection.current = collection;
  }, [isLoading, onLoadMore, props, ref, collection]);

  // TODO: maybe this should still just return scroll props?
  // Test against case where the ref isn't defined when this is called
  // Think this was a problem when trying to attach to the scrollable body of the table in OnLoadMoreTableBodyScroll
  useEvent(ref, 'scroll', onScroll);
}
