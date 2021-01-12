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
  filter?: (item: T, filterText: string) => boolean
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
  /** The current filter text used to perform server side filtering. */
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

interface AsyncListState<T, C> extends ListState<T> {
  state: 'loading' | 'sorting' | 'loadingMore' | 'error' | 'idle' | 'filtering',
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

type ActionType = 'success' | 'error' | 'loading' | 'loadingMore' | 'sorting' | 'update' | 'filtering';
interface Action<T, C> {
  type: ActionType,
  items?: Iterable<T>,
  selectedKeys?: Iterable<Key>,
  sortDescriptor?: SortDescriptor,
  error?: Error,
  abortController?: AbortController,
  updater?: (state: ListState<T>) => ListState<T>,
  cursor?: C,
  filterText?: string
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
  console.log('in reducer data state and action type', data.state, action.type, data.items);
  switch (data.state) {
    case 'idle':
    case 'error':
      switch (action.type) {
        case 'loading':
        case 'loadingMore':
        case 'sorting':
        case 'filtering':
          // If there isn't a abortController provided by the action and it is a filtering action (aka clientside filtering), it is an filterText update
          if (!action.abortController && action.type === 'filtering') {
            return {
              ...data,
              filterText: action.filterText ?? data.filterText
            };
          }

          return {
            ...data,
            filterText: action.filterText ?? data.filterText,
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
    case 'filtering':
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
        case 'filtering':
          // If there isn't a abortController provided by the action and it is a filtering action (aka clientside filtering), it is an filterText update
          if (!action.abortController && action.type === 'filtering') {
            return {
              ...data,
              filterText: action.filterText ?? data.filterText
              // TODO: should this be a return to idle?
              // state: 'idle'
            };
          }

          // We're already loading, and another load was triggered at the same time.
          // We need to abort the previous load and start a new one.
          data.abortController.abort();
          return {
            ...data,
            filterText: action.filterText ?? data.filterText,
            state: action.type,
            // Reset items to an empty list if loading, but not when sorting.
            items: action.type === 'loading' ? [] : data.items,
            abortController: action.abortController
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
        case 'filtering':
          // If there isn't a abortController provided by the action (aka client side filtering), it is an filterText update
          if (!action.abortController) {
            return {
              ...data,
              filterText: action.filterText ?? data.filterText
            };
          }

          // We're already loading more, and filter text was changed at the same time.
          // We need to abort the previous load more and start a new one.
          data.abortController.abort();
          return {
            ...data,
            filterText: action.filterText ?? data.filterText,
            state: data.cursor ? data.state : 'filtering',
            items: data.items,
            abortController: action.abortController
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
    filter
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
      console.log('in dispatchFetch', action.filterText, data.state, action.type);
      dispatch({...action, abortController});
      let response = await fn({
        items: data.items.slice(),
        selectedKeys: data.selectedKeys,
        sortDescriptor: action.sortDescriptor ?? data.sortDescriptor,
        signal: abortController.signal,
        cursor: action.type === 'loadingMore' ? data.cursor : null,
        filterText: action.filterText ?? data.filterText
      });
      dispatch({type: 'success', ...response, abortController});
    } catch (e) {
      dispatch({type: 'error', error: e, abortController});
    }
  };

  useEffect(() => {
    dispatchFetch({type: 'loading'}, load);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let filteredItems = useMemo(
    () =>  filter ? data.items.filter(item => filter(item, data.filterText)) : data.items,
    [data.items, data.filterText, filter]);

  return {
    items: filteredItems,
    selectedKeys: data.selectedKeys,
    sortDescriptor: data.sortDescriptor,
    // TODO: add isFiltering? This is so we can have the loading icon in the textfield when filter text changes instead of in the listbox
    isLoading: data.state === 'loading' || data.state === 'loadingMore' || data.state === 'sorting' || data.state === 'filtering',
    error: data.error,
    filterText: data.filterText,
    getItem(key: Key) {
      return data.items.find(item => getKey(item) === key);
    },
    reload() {
      dispatchFetch({type: 'loading'}, load);
    },
    loadMore() {
      // Ignore if already loading more or if performing server side filtering.
      if (data.state === 'loadingMore' || data.cursor == null) {
        return;
      }

      dispatchFetch({type: 'loadingMore'}, load);
    },
    sort(sortDescriptor: SortDescriptor) {
      dispatchFetch({type: 'sorting', sortDescriptor}, sort || load);
    },
    ...createListActions({...options, getKey}, fn => {
      dispatch({type: 'update', updater: fn});
    }),
    setFilterText(filterText: string) {
      console.log('filterText', filterText, filter, data.items);
      if (filter && data.items.length > 0) {
        // If client side filtering and items already exist, don't sent a fetch request, just update filterText
        dispatch({type: 'filtering', filterText});
      } else {
        dispatchFetch({type: 'filtering', filterText}, load);
      }
    }
  };
}
