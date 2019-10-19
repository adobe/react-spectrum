
import {ReactElement, ReactNode, Key} from 'react';

export type ItemRenderer<T> = (item: T) => ReactElement<ItemProps<T>>;
export interface ItemProps<T> {
  // key?: Key, // goes on ReactElement
  title?: ReactNode, // label??
  childItems?: Array<T>, // what if they haven't loaded yet? hasChildren?,
  hasChildItems?: boolean,
  children: ReactNode // CellRenderer??
}

interface AsyncLoadable<T> {
  items?: Array<T>,
  itemKey?: string,
  isLoading?: boolean, // possibly isLoadingMore
  onLoadMore?: () => any,
}

// should this be async loadable?
export interface SectionProps<T> extends AsyncLoadable<T> {
  title?: ReactNode,
  children: ReactElement<ItemProps<T>> | ItemRenderer<T>
}

export interface CellProps {
  children: ReactNode
}

export type CollectionElement<T> = ReactElement<SectionProps<T>> | ReactElement<ItemProps<T>>;
export type CollectionChildren<T> = CollectionElement<T> | CollectionElement<T>[] | ((item: T) => CollectionElement<T>);
export interface CollectionBase<T> extends AsyncLoadable<T> {
  children: CollectionChildren<T>,
  disabledKeys?: Array<Key>
}

export interface SingleSelection {
  selectedKey?: Key,
  defaultSelectedKey?: Key,
  onSelectionChange?: (key: Key) => any
}

export interface MultipleSelection {
  selectedKeys?: Array<Key>,
  defaultSelectedKeys?: Array<Key>,
  onSelectionChange?: (keys: Array<Key>) => any
}

export interface Expandable {
  expandedKeys?: Array<Key>,
  defaultExpandedKeys?: Array<Key>,
  onExpandedChange?: (keys: Array<Key>) => any
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
