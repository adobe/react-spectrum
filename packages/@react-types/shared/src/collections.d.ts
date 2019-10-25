
import {ReactElement, ReactNode, Key} from 'react';

export interface ItemProps<T> {
  title?: ReactNode, // label?? contents?
  childItems?: Iterable<T>,
  hasChildItems?: boolean,
  children: ReactNode // CellRenderer??
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
  children: ItemElement<T> | ItemElement<T>[] | ItemRenderer<T>
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
  selectedKey?: Key,
  defaultSelectedKey?: Key,
  onSelectionChange?: (key: Key) => any
}

export interface MultipleSelection {
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

interface FocusManagerDelegate {
  getKeyLeftOf?(key: Key): Key,
  getKeyRightOf?(key: Key): Key,
  getKeyAbove?(key: Key): Key,
  getKeyBelow?(key: Key): Key
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
  onLoadMore?: () => void,
  sortDescriptor?: SortDescriptor,
  onSortChange?: (desc: SortDescriptor) => void,
  disabledKeys?: Iterable<Key>,
  selectedKeys?: Iterable<Key>,
  selectedKey?: Key,
  expandedKeys?: Iterable<Key>
}

declare function useAsyncList<T>(opts: AsyncListOptions<T>): AsyncListProps<T>;
