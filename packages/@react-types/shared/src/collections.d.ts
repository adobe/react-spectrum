
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
import {Key, ReactElement, ReactNode} from 'react';

export interface ItemProps<T> {
  title?: ReactNode, // label?? contents?
  childItems?: Iterable<T>,
  hasChildItems?: boolean,
  children: ReactNode, // CellRenderer??
  textValue?: string,
  uniqueKey?: Key
}

export type ItemElement<T> = ReactElement<ItemProps<T>>;
export type ItemRenderer<T> = (item: T) => ItemElement<T>;

interface AsyncLoadable<T> {
  items?: Iterable<T>,
  itemKey?: string,
  isLoading?: boolean, // possibly isLoadingMore
  onLoadMore?: () => any,
}

export interface SectionProps<T> extends AsyncLoadable<T> {
  title?: ReactNode,
  children: ItemElement<T> | ItemElement<T>[] | ItemRenderer<T>,
  uniqueKey?: Key
}

export type SectionElement<T> = ReactElement<SectionProps<T>>;

export interface CellProps {
  children: ReactNode
}

export type CollectionElement<T> = SectionElement<T> | ItemElement<T>;
export type CollectionChildren<T> = CollectionElement<T> | CollectionElement<T>[] | ((item: T) => CollectionElement<T>);
export interface CollectionBase<T> extends AsyncLoadable<T> {
  children: CollectionChildren<T>,
  disabledKeys?: Iterable<Key>
}

export interface SingleSelection {
  disableEmptySelection?: boolean,
  selectedKey?: Key,
  defaultSelectedKey?: Key,
  onSelectionChange?: (key: Key) => any
}

export type SelectionMode = 'none' | 'single' | 'multiple';
export interface MultipleSelection {
  selectionMode?: SelectionMode,
  disableEmptySelection?: boolean,
  selectedKeys?: Iterable<Key>,
  defaultSelectedKeys?: Iterable<Key>,
  onSelectionChange?: (keys: Set<Key>) => any
}

export interface Expandable {
  expandedKeys?: Iterable<Key>,
  defaultExpandedKeys?: Iterable<Key>,
  onExpandedChange?: (keys: Set<Key>) => any
}

export interface Sortable {
  sortDescriptor?: SortDescriptor,
  defaultSortDescriptor?: SortDescriptor,
  onSortChange?: (descriptor: SortDescriptor) => any
}

export interface SortDescriptor {
  column?: string,
  direction?: SortDirection
}

export enum SortDirection {
  ASC,
  DESC
}

export interface KeyboardDelegate {
  /** Returns the key visually below the given one, or `null` for none. */
  getKeyBelow?(key: Key): Key,

  /** Returns the key visually above the given one, or `null` for none. */
  getKeyAbove?(key: Key): Key,

  /** Returns the key visually to the left of the given one, or `null` for none. */
  getKeyLeftOf?(key: Key): Key,

  /** Returns the key visually to the right of the given one, or `null` for none. */
  getKeyRightOf?(key: Key): Key,

  /** Returns the key visually one page below the given one, or `null` for none. */
  getKeyPageBelow?(key: Key): Key,

  /** Returns the key visually one page above the given one, or `null` for none. */
  getKeyPageAbove?(key: Key): Key,
  
  /** Returns the first key, or `null` for none. */
  getFirstKey?(): Key,

  /** Returns the last key, or `null` for none. */
  getLastKey?(): Key,

  /** Returns the next key after `fromKey` that matches the given search string, or `null` for none. */
  getKeyForSearch?(search: string, fromKey?: Key): Key
}

interface AsyncListOptions<T> {
  load: (state: ListState<T>) => Promise<ListState<T>>,
  loadMore?: (state: ListState<T>) => Promise<ListState<T>>,
  defaultSortDescriptor?: SortDescriptor,
  sort?: (state: ListState<T>) => Promise<ListState<T>>
}

interface ListState<T> {
  items: Iterable<T>,
  disabledKeys?: Iterable<Key>,
  selectedKeys?: Iterable<Key>,
  selectedKey?: Key,
  expandedKeys?: Iterable<Key>,
  sortDescriptor?: SortDescriptor
}

interface AsyncListProps<T> {
  items: Iterable<T>,
  isLoading: boolean,
  error?: Error,
  onLoadMore?: () => void,
  sortDescriptor?: SortDescriptor,
  onSortChange?: (desc: SortDescriptor) => void,
  disabledKeys?: Iterable<Key>,
  selectedKeys?: Iterable<Key>,
  selectedKey?: Key,
  expandedKeys?: Iterable<Key>
}

declare function useAsyncList<T>(opts: AsyncListOptions<T>): AsyncListProps<T>;
