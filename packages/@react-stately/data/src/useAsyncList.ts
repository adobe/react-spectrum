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

import {createListActions, ListData, ListState} from './useListData';
import {Key, Reducer, useEffect, useMemo, useReducer} from 'react';
import {Selection, SortDescriptor} from '@react-types/shared';

interface AsyncListOptions<T, C> {
  /** The keys for the initially selected items. */
  initialSelectedKeys?: Iterable<Key>,
  /** The initial sort descriptor. */
  initialSortDescriptor?: SortDescriptor,
  /** The initial filter text. */
  initialFilterText?: string,
  /** A function that returns a unique key for an item object. */
  getKey?: (item: T) => Key,
  /** A function that loads the data for the items in the list. */
  load: AsyncListLoadFunction<T, C>,
  /**
   * An optional function that performs sorting. If not provided,
   * then `sortDescriptor` is passed to the `load` function.
   */
  sort?: AsyncListLoadFunction<T, C>,
  /** A function that returns whether a item matches the current filter text. */
  filterFn?: (item: T, filterText: string) => boolean
}

type AsyncListLoadFunction<T, C> = (state: AsyncListLoadOptions<T, C>) => Promise<AsyncListStateUpdate<T, C>>;
interface AsyncListLoadOptions<T, C> {
  /** The items currently in the list. */
  items: T[],
  /** The keys of the currently selected items in the list. */
  selectedKeys: Selection,
  /** The current sort descriptor for the list. */
  sortDescriptor: SortDescriptor,
  /** An abort signal used to notify the load function that the request has been aborted. */
  signal: AbortSignal,
  /** The pagination cursor returned from the last page load. */
  cursor?: C,
  // TODO: ask if this is what we want?
  filterText?: string
}

interface AsyncListStateUpdate<T, C> {
  /** The new items to append to the list. */
  items: Iterable<T>,
  /** The keys to add to the selection. */
  selectedKeys?: Iterable<Key>,
  /** The sort descriptor to set. */
  sortDescriptor?: SortDescriptor,
  /** The pagination cursor to be used for the next page load. */
  cursor?: C
}

// TODO: figure out if we want filteredItems here
interface AsyncListState<T, C> extends Omit<ListState<T>, 'filteredItems'> {
  state: 'loading' | 'sorting' | 'loadingMore' | 'error' | 'idle',
  items: T[],
  // disabledKeys?: Iterable<Key>,
  selectedKeys: Selection,
  // selectedKey?: Key,
  // expandedKeys?: Iterable<Key>,
  sortDescriptor?: SortDescriptor,
  error?: Error,
  abortController?: AbortController,
  cursor?: C
}

type ActionType = 'success' | 'error' | 'loading' | 'loadingMore' | 'sorting' | 'update';
interface Action<T, C> {
  type: ActionType,
  items?: Iterable<T>,
  selectedKeys?: Iterable<Key>,
  sortDescriptor?: SortDescriptor,
  error?: Error,
  abortController?: AbortController,
  updater?: (state: ListState<T>) => ListState<T>,
  cursor?: C
}

interface AsyncListData<T> extends ListData<T> {
  /** Whether data is currently being loaded. */
  isLoading: boolean,
  /** If loading data failed, then this contains the error that occurred. */
  error?: Error,
  // disabledKeys?: Set<Key>,
  // selectedKey?: Key,
  // expandedKeys?: Set<Key>,
  /** The current sort descriptor for the list. */
  sortDescriptor?: SortDescriptor,

  /** Reloads the data in the list. */
  reload(): void,
  /** Loads the next page of data in the list. */
  loadMore(): void,
  /** Triggers sorting for the list. */
  sort(descriptor: SortDescriptor): void
}

function reducer<T, C>(data: AsyncListState<T, C>, action: Action<T, C>): AsyncListState<T, C> {
  switch (data.state) {
    case 'idle':
    case 'error':
      switch (action.type) {
        case 'loading':
        case 'loadingMore':
        case 'sorting':
          return {
            ...data,
            state: action.type,
            // Reset items to an empty list if loading, but not when sorting.
            items: action.type === 'loading' ? [] : data.items,
            sortDescriptor: action.sortDescriptor ?? data.sortDescriptor,
            abortController: action.abortController
          };
        case 'update':
          return {
            ...data,
            ...action.updater(data)
          };
        case 'success':
        case 'error':
          return data;
        default:
          throw new Error(`Invalid action "${action.type}" in state "${data.state}"`);
      }
    case 'loading':
    case 'sorting':
      switch (action.type) {
        case 'success':
          // Ignore if there is a newer abortcontroller in state.
          // This means that multiple requests were going at once.
          // We want to take only the latest result.
          if (action.abortController !== data.abortController) {
            return data;
          }

          return {
            ...data,
            state: 'idle',
            items: [...action.items],
            selectedKeys: new Set(action.selectedKeys ?? data.selectedKeys),
            sortDescriptor: action.sortDescriptor ?? data.sortDescriptor,
            abortController: null,
            cursor: action.cursor
          };
        case 'error':
          if (action.abortController !== data.abortController) {
            return data;
          }

          return {
            ...data,
            state: 'error',
            error: action.error,
            abortController: null
          };
        case 'loading':
        case 'loadingMore':
        case 'sorting':
          // We're already loading, and another load was triggered at the same time.
          // We need to abort the previous load and start a new one.
          data.abortController.abort();
          return {
            ...data,
            state: action.type,
            // Reset items to an empty list if loading, but not when sorting.
            items: action.type === 'loading' ? [] : data.items,
            abortController: action.abortController
          };
        case 'update':
          // TODO: Ask if this is appropriate, I want to cancel prior loads if the user is rapidly typing
          // but "update" also covers a bunch of other actions (like item insertion)
          // Was loading but update happened, so abort previous load.
          data.abortController.abort();
          return {
            ...data,
            ...action.updater(data)
          };
        default:
          throw new Error(`Invalid action "${action.type}" in state "${data.state}"`);
      }
    case 'loadingMore':
      switch (action.type) {
        case 'success':
          // Append the new items
          return {
            ...data,
            state: 'idle',
            items: [...data.items, ...action.items],
            selectedKeys: new Set([...data.selectedKeys, ...(action.selectedKeys ?? [])]),
            sortDescriptor: action.sortDescriptor ?? data.sortDescriptor,
            abortController: null,
            cursor: action.cursor
          };
        case 'error':
          return {
            ...data,
            state: 'error',
            error: action.error
          };
        case 'loading':
        case 'sorting':
          // We're already loading more, and another load was triggered at the same time.
          // We need to abort the previous load more and start a new one.
          data.abortController.abort();
          return {
            ...data,
            state: 'loading',
            // Reset items to an empty list if loading, but not when sorting.
            items: action.type === 'loading' ? [] : data.items,
            abortController: action.abortController
          };
        case 'update':
          // TODO: Ask if this is appropriate
          // Scenario is if menu is open and is attempting to load more items and user begins to type
          // Cancel previous load and thats it? Additional load will need to be triggered by user action (either more typing or scrolling down the list)
          data.abortController.abort();

          return {
            ...data,
            ...action.updater(data)
          };
        default:
          throw new Error(`Invalid action "${action.type}" in state "${data.state}"`);
      }
    default:
      throw new Error(`Invalid state "${data.state}"`);
  }
}

/**
 * Manages state for an immutable async loaded list data structure, and provides convenience methods to
 * update the data over time. Manages loading and error states, pagination, and sorting.
 */
export function useAsyncList<T, C = string>(options: AsyncListOptions<T, C>): AsyncListData<T> {
  const {
    load,
    sort,
    initialSelectedKeys,
    initialSortDescriptor,
    getKey = (item: any) => item.id || item.key,
    initialFilterText = '',
    filterFn
  } = options;

  let [data, dispatch] = useReducer<Reducer<AsyncListState<T, C>, Action<T, C>>>(reducer, {
    state: 'idle',
    error: null,
    items: [],
    selectedKeys: new Set(initialSelectedKeys),
    sortDescriptor: initialSortDescriptor,
    filterText: initialFilterText
  });

  const dispatchFetch = async (action: Action<T, C>, fn: AsyncListLoadFunction<T, C>) => {
    let abortController = new AbortController();
    try {
      dispatch({...action, abortController});

      let response = await fn({
        items: data.items.slice(),
        selectedKeys: data.selectedKeys,
        sortDescriptor: action.sortDescriptor ?? data.sortDescriptor,
        signal: abortController.signal,
        cursor: action.type === 'loadingMore' ? data.cursor : null,
        filterText: data.filterText
      });
      dispatch({type: 'success', ...response, abortController});
    } catch (e) {
      dispatch({type: 'error', error: e, abortController});
    }
  };

  // Handle initial load
  useEffect(() => {
    dispatchFetch({type: 'loading'}, load);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload on changes to filter text but only if performing server side filtering
  // Kinda weird since it will trigger a reload when user selects a option
  useEffect(() => {
    if (!filterFn) {
      dispatchFetch({type: 'loading'}, load);
    }
  }, [data.filterText, filterFn, load, dispatchFetch]);

  let filteredItems = useMemo(
    () => filterFn ? data.items.filter(item => filterFn(item, data.filterText)) : data.items,
    [data.items, data.filterText, filterFn]);

  return {
    items: filteredItems,
    selectedKeys: data.selectedKeys,
    sortDescriptor: data.sortDescriptor,
    isLoading: data.state === 'loading' || data.state === 'loadingMore' || data.state === 'sorting',
    error: data.error,
    filterText: data.filterText,
    getItem(key: Key) {
      return data.items.find(item => getKey(item) === key);
    },
    reload() {
      dispatchFetch({type: 'loading'}, load);
    },
    loadMore() {
      // Ignore if already loading or loading more.
      // TODO: ask if this is appropriate
      if (data.state === 'loadingMore' || data.state === 'loading' || data.cursor == null) {
        return;
      }

      dispatchFetch({type: 'loadingMore'}, load);
    },
    sort(sortDescriptor: SortDescriptor) {
      dispatchFetch({type: 'sorting', sortDescriptor}, sort || load);
    },
    ...createListActions({...options, getKey}, fn => {
      dispatch({type: 'update', updater: fn});
    })
  };
}
