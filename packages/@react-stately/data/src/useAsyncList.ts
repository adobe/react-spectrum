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

import {SortDescriptor} from '@react-types/shared';
import {useEffect, useReducer, Key, Reducer} from 'react';
import { ListData, useListData, createListActions, ListState } from './useListData';

interface AsyncListOptions<T, C> {
  initialSelectedKeys?: Iterable<Key>,
  initialSortDescriptor?: SortDescriptor,
  getKey?: (item: T) => Key,
  load: AsyncListLoadFunction<T, C>,
  sort?: AsyncListLoadFunction<T, C>
}

type AsyncListLoadFunction<T, C> = (state: AsyncListLoadOptions<T, C>) => Promise<AsyncListStateUpdate<T, C>>;
interface AsyncListLoadOptions<T, C> {
  items: T[],
  selectedKeys: Set<Key>,
  sortDescriptor: SortDescriptor,
  signal: AbortSignal,
  cursor?: C
}

interface AsyncListStateUpdate<T, C> {
  items: Iterable<T>,
  selectedKeys?: Iterable<Key>,
  sortDescriptor?: SortDescriptor,
  cursor?: C
}

interface AsyncListState<T, C> extends ListState<T> {
  state: 'loading' | 'sorting' | 'loadingMore' | 'error' | 'idle'
  items: T[],
  // disabledKeys?: Iterable<Key>,
  selectedKeys: Set<Key>,
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
  isLoading: boolean,
  error?: Error,
  // disabledKeys?: Set<Key>,
  // selectedKey?: Key,
  // expandedKeys?: Set<Key>,
  sortDescriptor?: SortDescriptor,

  reload(): void,
  loadMore(): void,
  sort(desc: SortDescriptor): void
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
            selectedKeys: new Set(action.selectedKeys ?? data.selectedKeys),
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
        default:
          throw new Error(`Invalid action "${action.type}" in state "${data.state}"`);
      }
    default:
      throw new Error(`Invalid state "${data.state}"`);
  }
}

export function useAsyncList<T, C = string>(options: AsyncListOptions<T, C>): AsyncListData<T> {
  const {
    load,
    sort,
    initialSelectedKeys,
    initialSortDescriptor,
    getKey = (item: any) => item.id || item.key
  } = options;

  let [data, dispatch] = useReducer<Reducer<AsyncListState<T, C>, Action<T, C>>>(reducer, {
    state: 'idle',
    error: null,
    items: [],
    selectedKeys: new Set(initialSelectedKeys),
    sortDescriptor: initialSortDescriptor
  });

  const dispatchFetch = async (action: Action<T, C>, fn: AsyncListLoadFunction<T, C>) => {
    let abortController = new AbortController();
    try {
      dispatch({...action, abortController});

      let response = await fn({
        items: data.items,
        selectedKeys: data.selectedKeys,
        sortDescriptor: action.sortDescriptor ?? data.sortDescriptor,
        signal: abortController.signal,
        cursor: action.type === 'loadingMore' ? data.cursor : null
      });
      dispatch({type: 'success', ...response, abortController});
    } catch (e) {
      dispatch({type: 'error', error: e, abortController});
    }
  };

  useEffect(() => {
    dispatchFetch({type: 'loading'}, load);
  }, []);

  return {
    items: data.items,
    selectedKeys: data.selectedKeys,
    sortDescriptor: data.sortDescriptor,
    isLoading: data.state === 'loading' || data.state === 'loadingMore' || data.state === 'sorting',
    error: data.error,
    getItem(key: Key) {
      return data.items.find(item => getKey(item) === key);
    },
    reload() {
      dispatchFetch({type: 'loading'}, load);
    },
    loadMore() {
      // Ignore if already loading more.
      if (data.state === 'loadingMore' || data.cursor == null) {
        return;
      }

      dispatchFetch({type: 'loadingMore'}, load);
    },
    sort(sortDescriptor: SortDescriptor) {
      dispatchFetch({type: 'sorting', sortDescriptor}, sort || load);
    },
    ...createListActions(options, fn => {
      dispatch({type: 'update', updater: fn})
    })
  };
}
