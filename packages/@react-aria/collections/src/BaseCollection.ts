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

import {Collection as ICollection, Key, Node} from '@react-types/shared';
import {ReactElement, ReactNode} from 'react';

export type Mutable<T> = {
  -readonly[P in keyof T]: T[P]
}

/** An immutable object representing a Node in a Collection. */
export class CollectionNode<T> implements Node<T> {
  readonly type: string;
  readonly key: Key;
  readonly value: T | null = null;
  readonly level: number = 0;
  readonly hasChildNodes: boolean = false;
  readonly rendered: ReactNode = null;
  readonly textValue: string = '';
  readonly 'aria-label'?: string = undefined;
  readonly index: number = 0;
  readonly parentKey: Key | null = null;
  readonly prevKey: Key | null = null;
  readonly nextKey: Key | null = null;
  readonly firstChildKey: Key | null = null;
  readonly lastChildKey: Key | null = null;
  readonly props: any = {};
  readonly render?: (node: Node<any>) => ReactElement;
  readonly colSpan: number | null = null;
  readonly colIndex: number | null = null;

  constructor(type: string, key: Key) {
    this.type = type;
    this.key = key;
  }

  get childNodes(): Iterable<Node<T>> {
    throw new Error('childNodes is not supported');
  }

  clone(): CollectionNode<T> {
    let node: Mutable<CollectionNode<T>> = new CollectionNode(this.type, this.key);
    node.value = this.value;
    node.level = this.level;
    node.hasChildNodes = this.hasChildNodes;
    node.rendered = this.rendered;
    node.textValue = this.textValue;
    node['aria-label'] = this['aria-label'];
    node.index = this.index;
    node.parentKey = this.parentKey;
    node.prevKey = this.prevKey;
    node.nextKey = this.nextKey;
    node.firstChildKey = this.firstChildKey;
    node.lastChildKey = this.lastChildKey;
    node.props = this.props;
    node.render = this.render;
    node.colSpan = this.colSpan;
    node.colIndex = this.colIndex;
    node.filter = this.filter;
    return node;
  }

  filter(collection: BaseCollection<T>, newCollection: BaseCollection<T>, filterFn: (node: Node<T>) => boolean): CollectionNode<T> | null {
    let [firstKey, lastKey] = filterChildren(collection, newCollection, this.firstChildKey, filterFn);
    let newNode: Mutable<CollectionNode<T>> = this.clone();
    newNode.firstChildKey = firstKey;
    newNode.lastChildKey = lastKey;
    return newNode;
  }
}

// TODO: naming, but essentially these nodes shouldn't be affected by filtering (BaseNode)?
// Perhaps this filter logic should be in CollectionNode instead and the current logic of CollectionNode's filter should move to Table
export class FilterLessNode<T> extends CollectionNode<T> {
  // TODO: resolve this
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-unused-vars
  filter(_, __, ___): FilterLessNode<T> | null {
    return this.clone();
  }
}

export class ItemNode<T> extends CollectionNode<T> {
  static readonly type = 'item';

  constructor(key: Key) {
    super(ItemNode.type, key);
  }

  // TODO: resolve this
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  filter(_, __, filterFn: (node: Node<T>) => boolean): ItemNode<T> | null {
    if (filterFn(this)) {
      return this.clone();
    }

    return null;
  }
}

export class SectionNode<T> extends CollectionNode<T> {
  static readonly type = 'section';

  constructor(key: Key) {
    super(SectionNode.type, key);
  }

  filter(collection: BaseCollection<T>, newCollection: BaseCollection<T>, filterFn: (node: Node<T>) => boolean): SectionNode<T> | null {
    let filteredSection = super.filter(collection, newCollection, filterFn);
    if (filteredSection) {
      if (filteredSection.lastChildKey !== null) {
        let lastChild = collection.getItem(filteredSection.lastChildKey);
        if (lastChild && lastChild.type !== 'header') {
          return filteredSection;
        }
      }
    }

    return null;
  }
}

/**
 * An immutable Collection implementation. Updates are only allowed
 * when it is not marked as frozen. This can be subclassed to implement
 * custom collection behaviors.
 */
export class BaseCollection<T> implements ICollection<Node<T>> {
  private keyMap: Map<Key, CollectionNode<T>> = new Map();
  private firstKey: Key | null = null;
  private lastKey: Key | null = null;
  private frozen = false;
  private itemCount: number = 0;

  get size(): number {
    return this.itemCount;
  }

  getKeys(): IterableIterator<Key> {
    return this.keyMap.keys();
  }

  *[Symbol.iterator](): IterableIterator<Node<T>> {
    let node: Node<T> | undefined = this.firstKey != null ? this.keyMap.get(this.firstKey) : undefined;
    while (node) {
      yield node;
      node = node.nextKey != null ? this.keyMap.get(node.nextKey) : undefined;
    }
  }

  getChildren(key: Key): Iterable<Node<T>> {
    let keyMap = this.keyMap;
    return {
      *[Symbol.iterator]() {
        let parent = keyMap.get(key);
        let node = parent?.firstChildKey != null ? keyMap.get(parent.firstChildKey) : null;
        while (node) {
          yield node as Node<T>;
          node = node.nextKey != null ? keyMap.get(node.nextKey) : undefined;
        }
      }
    };
  }

  getKeyBefore(key: Key): Key | null {
    let node = this.keyMap.get(key);
    if (!node) {
      return null;
    }

    if (node.prevKey != null) {
      node = this.keyMap.get(node.prevKey);

      while (node && node.type !== 'item' && node.lastChildKey != null) {
        node = this.keyMap.get(node.lastChildKey);
      }

      return node?.key ?? null;
    }

    return node.parentKey;
  }

  getKeyAfter(key: Key): Key | null {
    let node = this.keyMap.get(key);
    if (!node) {
      return null;
    }

    if (node.type !== 'item' && node.firstChildKey != null) {
      return node.firstChildKey;
    }

    while (node) {
      if (node.nextKey != null) {
        return node.nextKey;
      }

      if (node.parentKey != null) {
        node = this.keyMap.get(node.parentKey);
      } else {
        return null;
      }
    }

    return null;
  }

  getFirstKey(): Key | null {
    return this.firstKey;
  }

  getLastKey(): Key | null {
    let node = this.lastKey != null ? this.keyMap.get(this.lastKey) : null;
    while (node?.lastChildKey != null) {
      node = this.keyMap.get(node.lastChildKey);
    }

    return node?.key ?? null;
  }

  getItem(key: Key): Node<T> | null {
    return this.keyMap.get(key) ?? null;
  }

  at(): Node<T> {
    throw new Error('Not implemented');
  }

  clone(): this {
    // We need to clone using this.constructor so that subclasses have the right prototype.
    // TypeScript isn't happy about this yet.
    // https://github.com/microsoft/TypeScript/issues/3841
    let Constructor: any = this.constructor;
    let collection: this = new Constructor();
    collection.keyMap = new Map(this.keyMap);
    collection.firstKey = this.firstKey;
    collection.lastKey = this.lastKey;
    collection.itemCount = this.itemCount;
    return collection;
  }

  addNode(node: CollectionNode<T>): void {
    if (this.frozen) {
      throw new Error('Cannot add a node to a frozen collection');
    }

    if (node.type === 'item' && this.keyMap.get(node.key) == null) {
      this.itemCount++;
    }

    this.keyMap.set(node.key, node);
  }

  removeNode(key: Key): void {
    if (this.frozen) {
      throw new Error('Cannot remove a node to a frozen collection');
    }

    let node = this.keyMap.get(key);
    if (node != null && node.type === 'item') {
      this.itemCount--;
    }

    this.keyMap.delete(key);
  }

  commit(firstKey: Key | null, lastKey: Key | null, isSSR = false): void {
    if (this.frozen) {
      throw new Error('Cannot commit a frozen collection');
    }

    this.firstKey = firstKey;
    this.lastKey = lastKey;
    this.frozen = !isSSR;
  }

  filter(filterFn: (node: Node<T>) => boolean, newCollection?: BaseCollection<T>): BaseCollection<T> {
    if (newCollection == null) {
      newCollection = new BaseCollection<T>();
    }

    let [firstKey, lastKey] = filterChildren(this, newCollection, this.firstKey, filterFn);
    newCollection.firstKey = firstKey;
    newCollection.lastKey = lastKey;
    return newCollection;
  }
}

function filterChildren<T>(collection: BaseCollection<T>, newCollection: BaseCollection<T>, firstChildKey: Key | null, filterFn: (node: Node<T>) => boolean): [Key | null, Key | null] {
  // loop over the siblings for firstChildKey
  // create new nodes based on calling node.filter for each child
  // if it returns null then don't include it, otherwise update its prev/next keys
  // add them to the newCollection
  if (firstChildKey == null) {
    return [null, null];
  }

  let firstNode: Node<T> | null = null;
  let lastNode: Node<T> | null = null;
  let currentNode = collection.getItem(firstChildKey);

  while (currentNode != null) {
    let newNode: Mutable<CollectionNode<T>> | null = (currentNode as CollectionNode<T>).filter(collection, newCollection, filterFn);
    if (newNode != null) {
      newNode.nextKey = null;
      if (lastNode) {
        newNode.prevKey = lastNode.key;
        lastNode.nextKey = newNode.key;
      }

      if (firstNode == null) {
        firstNode = newNode;
      }

      newCollection.addNode(newNode);
      lastNode = newNode;
    }

    currentNode = currentNode.nextKey ? collection.getItem(currentNode.nextKey) : null;
  }

  // TODO: this is pretty specific to dividers but doesn't feel like there is a good way to get around it since we only can know
  // to filter the last separator in a collection only after performing a filter for the rest of the contents after it
  // Its gross that it needs to live here, might be nice if somehow we could have this live in the separator code
  if (lastNode && lastNode.type === 'separator') {
    let prevKey = lastNode.prevKey;
    newCollection.removeNode(lastNode.key);

    if (prevKey) {
      lastNode = newCollection.getItem(prevKey) as Mutable<CollectionNode<T>>;
      lastNode.nextKey = null;
    } else {
      lastNode = null;
    }
  }

  return [firstNode?.key ?? null, lastNode?.key ?? null];
}
