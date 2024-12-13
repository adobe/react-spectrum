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

import {BaseCollection, CollectionNode, Mutable} from './BaseCollection';
import {ForwardedRef, ReactElement} from 'react';
import {Node} from '@react-types/shared';

// This Collection implementation is perhaps a little unusual. It works by rendering the React tree into a
// Portal to a fake DOM implementation. This gives us efficient access to the tree of rendered objects, and
// supports React features like composition and context. We use this fake DOM to access the full set of elements
// before we render into the real DOM, which allows us to render a subset of the elements (e.g. virtualized scrolling),
// and compute properties like the total number of items. It also enables keyboard navigation, selection, and other features.
// React takes care of efficiently rendering components and updating the collection for us via this fake DOM.
//
// The DOM is a mutable API, and React expects the node instances to remain stable over time. So the implementation is split
// into two parts. Each mutable fake DOM node owns an instance of an immutable collection node. When a fake DOM node is updated,
// it queues a second render for the collection. Multiple updates to a collection can be queued at once. Collection nodes are
// lazily copied on write, so only the changed nodes need to be cloned. During the second render, the new immutable collection
// is finalized by updating the map of Key -> Node with the new cloned nodes. Then the new collection is frozen so it can no
// longer be mutated, and returned to the calling component to render.

/**
 * A mutable node in the fake DOM tree. When mutated, it marks itself as dirty
 * and queues an update with the owner document.
 */
export class BaseNode<T> {
  private _firstChild: ElementNode<T> | null = null;
  private _lastChild: ElementNode<T> | null = null;
  private _previousSibling: ElementNode<T> | null = null;
  private _nextSibling: ElementNode<T> | null = null;
  private _parentNode: BaseNode<T> | null = null;
  ownerDocument: Document<T, any>;

  constructor(ownerDocument: Document<T, any>) {
    this.ownerDocument = ownerDocument;
  }

  *[Symbol.iterator]() {
    let node = this.firstChild;
    while (node) {
      yield node;
      node = node.nextSibling;
    }
  }

  get firstChild() {
    return this._firstChild;
  }

  set firstChild(firstChild) {
    this._firstChild = firstChild;
    this.ownerDocument.markDirty(this);
  }

  get lastChild() {
    return this._lastChild;
  }

  set lastChild(lastChild) {
    this._lastChild = lastChild;
    this.ownerDocument.markDirty(this);
  }

  get previousSibling() {
    return this._previousSibling;
  }

  set previousSibling(previousSibling) {
    this._previousSibling = previousSibling;
    this.ownerDocument.markDirty(this);
  }

  get nextSibling() {
    return this._nextSibling;
  }

  set nextSibling(nextSibling) {
    this._nextSibling = nextSibling;
    this.ownerDocument.markDirty(this);
  }

  get parentNode() {
    return this._parentNode;
  }

  set parentNode(parentNode) {
    this._parentNode = parentNode;
    this.ownerDocument.markDirty(this);
  }

  get isConnected() {
    return this.parentNode?.isConnected || false;
  }

  appendChild(child: ElementNode<T>) {
    this.ownerDocument.startTransaction();
    if (child.parentNode) {
      child.parentNode.removeChild(child);
    }

    if (this.firstChild == null) {
      this.firstChild = child;
    }

    if (this.lastChild) {
      this.lastChild.nextSibling = child;
      child.index = this.lastChild.index + 1;
      child.previousSibling = this.lastChild;
    } else {
      child.previousSibling = null;
      child.index = 0;
    }

    child.parentNode = this;
    child.nextSibling = null;
    this.lastChild = child;

    this.ownerDocument.markDirty(this);
    if (child.hasSetProps) {
      // Only add the node to the collection if we already received props for it.
      // Otherwise wait until then so we have the correct id for the node.
      this.ownerDocument.addNode(child);
    }

    this.ownerDocument.endTransaction();
    this.ownerDocument.queueUpdate();
  }

  insertBefore(newNode: ElementNode<T>, referenceNode: ElementNode<T>) {
    if (referenceNode == null) {
      return this.appendChild(newNode);
    }

    this.ownerDocument.startTransaction();
    if (newNode.parentNode) {
      newNode.parentNode.removeChild(newNode);
    }

    newNode.nextSibling = referenceNode;
    newNode.previousSibling = referenceNode.previousSibling;
    newNode.index = referenceNode.index;

    if (this.firstChild === referenceNode) {
      this.firstChild = newNode;
    } else if (referenceNode.previousSibling) {
      referenceNode.previousSibling.nextSibling = newNode;
    }

    referenceNode.previousSibling = newNode;
    newNode.parentNode = referenceNode.parentNode;

    let node: ElementNode<T> | null = referenceNode;
    while (node) {
      node.index++;
      node = node.nextSibling;
    }

    if (newNode.hasSetProps) {
      this.ownerDocument.addNode(newNode);
    }

    this.ownerDocument.endTransaction();
    this.ownerDocument.queueUpdate();
  }

  removeChild(child: ElementNode<T>) {
    if (child.parentNode !== this || !this.ownerDocument.isMounted) {
      return;
    }

    this.ownerDocument.startTransaction();
    let node = child.nextSibling;
    while (node) {
      node.index--;
      node = node.nextSibling;
    }

    if (child.nextSibling) {
      child.nextSibling.previousSibling = child.previousSibling;
    }

    if (child.previousSibling) {
      child.previousSibling.nextSibling = child.nextSibling;
    }

    if (this.firstChild === child) {
      this.firstChild = child.nextSibling;
    }

    if (this.lastChild === child) {
      this.lastChild = child.previousSibling;
    }

    child.parentNode = null;
    child.nextSibling = null;
    child.previousSibling = null;
    child.index = 0;

    this.ownerDocument.removeNode(child);
    this.ownerDocument.endTransaction();
    this.ownerDocument.queueUpdate();
  }

  addEventListener() {}
  removeEventListener() {}
}

/**
 * A mutable element node in the fake DOM tree. It owns an immutable
 * Collection Node which is copied on write.
 */
export class ElementNode<T> extends BaseNode<T> {
  nodeType = 8; // COMMENT_NODE (we'd use ELEMENT_NODE but React DevTools will fail to get its dimensions)
  node: CollectionNode<T>;
  private _index: number = 0;
  hasSetProps = false;

  constructor(type: string, ownerDocument: Document<T, any>) {
    super(ownerDocument);
    this.node = new CollectionNode(type, `react-aria-${++ownerDocument.nodeId}`);
    // Start a transaction so that no updates are emitted from the collection
    // until the props for this node are set. We don't know the real id for the
    // node until then, so we need to avoid emitting collections in an inconsistent state.
    this.ownerDocument.startTransaction();
  }

  get index() {
    return this._index;
  }

  set index(index) {
    this._index = index;
    this.ownerDocument.markDirty(this);
  }

  get level(): number {
    if (this.parentNode instanceof ElementNode) {
      return this.parentNode.level + (this.node.type === 'item' ? 1 : 0);
    }

    return 0;
  }

  updateNode() {
    let node = this.ownerDocument.getMutableNode(this);
    node.index = this.index;
    node.level = this.level;
    node.parentKey = this.parentNode instanceof ElementNode ? this.parentNode.node.key : null;
    node.prevKey = this.previousSibling?.node.key ?? null;
    node.nextKey = this.nextSibling?.node.key ?? null;
    node.hasChildNodes = !!this.firstChild;
    node.firstChildKey = this.firstChild?.node.key ?? null;
    node.lastChildKey = this.lastChild?.node.key ?? null;
  }

  setProps<E extends Element>(obj: any, ref: ForwardedRef<E>, rendered?: any, render?: (node: Node<T>) => ReactElement) {
    let node = this.ownerDocument.getMutableNode(this);
    let {value, textValue, id, ...props} = obj;
    props.ref = ref;
    node.props = props;
    node.rendered = rendered;
    node.render = render;
    node.value = value;
    node.textValue = textValue || (typeof props.children === 'string' ? props.children : '') || obj['aria-label'] || '';
    if (id != null && id !== node.key) {
      if (this.hasSetProps) {
        throw new Error('Cannot change the id of an item');
      }
      node.key = id;
    }

    // If this is the first time props have been set, end the transaction started in the constructor
    // so this node can be emitted.
    if (!this.hasSetProps) {
      this.ownerDocument.addNode(this);
      this.ownerDocument.endTransaction();
      this.hasSetProps = true;
    }

    this.ownerDocument.queueUpdate();
  }

  get style() {
    return {};
  }

  hasAttribute() {}
  setAttribute() {}
  setAttributeNS() {}
  removeAttribute() {}
}

/**
 * A mutable Document in the fake DOM. It owns an immutable Collection instance,
 * which is lazily copied on write during updates.
 */
export class Document<T, C extends BaseCollection<T> = BaseCollection<T>> extends BaseNode<T> {
  nodeType = 11; // DOCUMENT_FRAGMENT_NODE
  ownerDocument = this;
  dirtyNodes: Set<BaseNode<T>> = new Set();
  isSSR = false;
  nodeId = 0;
  nodesByProps = new WeakMap<object, ElementNode<T>>();
  isMounted = true;
  private collection: C;
  private collectionMutated: boolean;
  private mutatedNodes: Set<ElementNode<T>> = new Set();
  private subscriptions: Set<() => void> = new Set();
  private transactionCount = 0;

  constructor(collection: C) {
    // @ts-ignore
    super(null);
    this.collection = collection;
    this.collectionMutated = true;
  }

  get isConnected() {
    return this.isMounted;
  }

  createElement(type: string) {
    return new ElementNode(type, this);
  }

  /**
   * Lazily gets a mutable instance of a Node. If the node has already
   * been cloned during this update cycle, it just returns the existing one.
   */
  getMutableNode(element: ElementNode<T>): Mutable<CollectionNode<T>> {
    let node = element.node;
    if (!this.mutatedNodes.has(element)) {
      node = element.node.clone();
      this.mutatedNodes.add(element);
      element.node = node;
    }
    this.markDirty(element);
    return node;
  }

  private getMutableCollection() {
    if (!this.isSSR && !this.collectionMutated) {
      this.collection = this.collection.clone();
      this.collectionMutated = true;
    }

    return this.collection;
  }

  markDirty(node: BaseNode<T>) {
    this.dirtyNodes.add(node);
  }

  startTransaction() {
    this.transactionCount++;
  }

  endTransaction() {
    this.transactionCount--;
  }

  addNode(element: ElementNode<T>) {
    let collection = this.getMutableCollection();
    if (!collection.getItem(element.node.key)) {
      collection.addNode(element.node);

      for (let child of element) {
        this.addNode(child);
      }
    }

    this.markDirty(element);
  }

  removeNode(node: ElementNode<T>) {
    for (let child of node) {
      this.removeNode(child);
    }

    let collection = this.getMutableCollection();
    collection.removeNode(node.node.key);
    this.markDirty(node);
  }

  /** Finalizes the collection update, updating all nodes and freezing the collection. */
  getCollection(): C {
    if (this.transactionCount > 0) {
      return this.collection;
    }

    this.updateCollection();
    return this.collection;
  }

  updateCollection() {
    for (let element of this.dirtyNodes) {
      if (element instanceof ElementNode && element.isConnected) {
        element.updateNode();
      }
    }

    this.dirtyNodes.clear();

    if (this.mutatedNodes.size || this.collectionMutated) {
      let collection = this.getMutableCollection();
      for (let element of this.mutatedNodes) {
        if (element.isConnected) {
          collection.addNode(element.node);
        }
      }

      collection.commit(this.firstChild?.node.key ?? null, this.lastChild?.node.key ?? null, this.isSSR);
      this.mutatedNodes.clear();
    }

    this.collectionMutated = false;
  }

  queueUpdate() {
    // Don't emit any updates if there is a transaction in progress.
    // queueUpdate should be called again after the transaction.
    if (this.dirtyNodes.size === 0 || this.transactionCount > 0) {
      return;
    }

    for (let fn of this.subscriptions) {
      fn();
    }
  }

  subscribe(fn: () => void) {
    this.subscriptions.add(fn);
    return () => this.subscriptions.delete(fn);
  }

  resetAfterSSR() {
    if (this.isSSR) {
      this.isSSR = false;
      this.firstChild = null;
      this.lastChild = null;
      this.nodeId = 0;
    }
  }
}
