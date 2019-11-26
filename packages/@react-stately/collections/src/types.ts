import {Key, ReactNode} from 'react';
import {Rect} from './Rect';
import {ReusableView} from './ReusableView';
import {Size} from './Size';
import {Transaction} from './Transaction';

export interface ItemStates {
  isSelected?: boolean,
  isExpanded?: boolean,
  isDisabled?: boolean,
  isFocused?: boolean
}

export interface Node<T> extends ItemStates {
  type: 'section' | 'item',
  key: Key,
  value: T,
  level: number,
  hasChildNodes: boolean,
  childNodes: Iterable<Node<T>>,
  rendered: ReactNode,
  prevKey?: Key,
  nextKey?: Key
}

export interface Collection<T> {
  getKeys(): Iterable<Key>,
  getItem(key: Key): T,
  getKeyBefore(key: Key): Key | null,
  getKeyAfter(key: Key): Key | null,
  getFirstKey(): Key | null,
  getLastKey(): Key | null
}

export interface InvalidationContext<T, V> {
  contentChanged?: boolean,
  offsetChanged?: boolean,
  sizeChanged?: boolean,
  animated?: boolean,
  beforeLayout?(): void,
  afterLayout?(): void,
  afterAnimation?(): void,
  transaction?: Transaction<T, V>
}

export interface CollectionManagerDelegate<T, V, W> {
  setVisibleViews(views: Set<W>): void,
  setContentSize(size: Size): void,
  setVisibleRect(rect: Rect): void,
  getType?(content: T): string,
  renderView(type: string, content: T): V,
  renderWrapper(reusableView: ReusableView<T, V>): W,
  beginAnimations(): void,
  endAnimations(): void,
  getScrollAnchor?(rect: Rect): Key
}
