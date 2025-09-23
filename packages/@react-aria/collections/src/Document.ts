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
import {CollectionNodeClass} from './CollectionBuilder';
import {CSSProperties, ForwardedRef, ReactElement, ReactNode} from 'react';
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
  private _minInvalidChildIndex: ElementNode<T> | null = null;
  ownerDocument: Document<T, any>;

  constructor(ownerDocument: Document<T, any>) {
    this.ownerDocument = ownerDocument;
  }

  *[Symbol.iterator](): Iterator<ElementNode<T>> {
    let node = this.firstChild;
    while (node) {
      yield node;
      node = node.nextSibling;
    }
  }

  get firstChild(): ElementNode<T> | null {
    return this._firstChild;
  }

  set firstChild(firstChild: ElementNode<T> | null) {
    this._firstChild = firstChild;
    this.ownerDocument.markDirty(this);
  }

  get lastChild(): ElementNode<T> | null {
    return this._lastChild;
  }

  set lastChild(lastChild: ElementNode<T> | null) {
    this._lastChild = lastChild;
    this.ownerDocument.markDirty(this);
  }

  get previousSibling(): ElementNode<T> | null {
    return this._previousSibling;
  }

  set previousSibling(previousSibling: ElementNode<T> | null) {
    this._previousSibling = previousSibling;
    this.ownerDocument.markDirty(this);
  }

  get nextSibling(): ElementNode<T> | null {
    return this._nextSibling;
  }

  set nextSibling(nextSibling: ElementNode<T> | null) {
    this._nextSibling = nextSibling;
    this.ownerDocument.markDirty(this);
  }

  get parentNode(): BaseNode<T> | null {
    return this._parentNode;
  }

  set parentNode(parentNode: BaseNode<T> | null) {
    this._parentNode = parentNode;
    this.ownerDocument.markDirty(this);
  }

  get isConnected(): boolean {
    return this.parentNode?.isConnected || false;
  }

  private invalidateChildIndices(child: ElementNode<T>): void {
    if (this._minInvalidChildIndex == null || !this._minInvalidChildIndex.isConnected || child.index < this._minInvalidChildIndex.index) {
      this._minInvalidChildIndex = child;
      this.ownerDocument.markDirty(this);
    }
  }

  updateChildIndices(): void {
    let node = this._minInvalidChildIndex;
    while (node) {
      node.index = node.previousSibling ? node.previousSibling.index + 1 : 0;
      node = node.nextSibling;
    }
    this._minInvalidChildIndex = null;
  }

  appendChild(child: ElementNode<T>): void {
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
    if (this.isConnected) {
      this.ownerDocument.queueUpdate();
    }
  }

  insertBefore(newNode: ElementNode<T>, referenceNode: ElementNode<T>): void {
    if (referenceNode == null) {
      return this.appendChild(newNode);
    }

    if (newNode.parentNode) {
      newNode.parentNode.removeChild(newNode);
    }

    newNode.nextSibling = referenceNode;
    newNode.previousSibling = referenceNode.previousSibling;
    // Ensure that the newNode's index is less than that of the reference node so that
    // invalidateChildIndices will properly use the newNode as the _minInvalidChildIndex, thus making sure
    // we will properly update the indexes of all sibiling nodes after the newNode. The value here doesn't matter
    // since updateChildIndices should calculate the proper indexes.
    newNode.index = referenceNode.index - 1;
    if (this.firstChild === referenceNode) {
      this.firstChild = newNode;
    } else if (referenceNode.previousSibling) {
      referenceNode.previousSibling.nextSibling = newNode;
    }

    referenceNode.previousSibling = newNode;
    newNode.parentNode = referenceNode.parentNode;

    this.invalidateChildIndices(newNode);
    if (this.isConnected) {
      this.ownerDocument.queueUpdate();
    }
  }

  removeChild(child: ElementNode<T>): void {
    if (child.parentNode !== this) {
      return;
    }

    if (this._minInvalidChildIndex === child) {
      this._minInvalidChildIndex = null;
    }

    if (child.nextSibling) {
      this.invalidateChildIndices(child.nextSibling);
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

    this.ownerDocument.markDirty(child);
    if (this.isConnected) {
      this.ownerDocument.queueUpdate();
    }
  }

  addEventListener(): void {}
  removeEventListener(): void {}

  get previousVisibleSibling(): ElementNode<T> | null {
    let node = this.previousSibling;
    while (node && node.isHidden) {
      node = node.previousSibling;
    }
    return node;
  }

  get nextVisibleSibling(): ElementNode<T> | null {
    let node = this.nextSibling;
    while (node && node.isHidden) {
      node = node.nextSibling;
    }
    return node;
  }

  get firstVisibleChild(): ElementNode<T> | null {
    let node = this.firstChild;
    while (node && node.isHidden) {
      node = node.nextSibling;
    }
    return node;
  }

  get lastVisibleChild(): ElementNode<T> | null {
    let node = this.lastChild;
    while (node && node.isHidden) {
      node = node.previousSibling;
    }
    return node;
  }
}

/**
 * A mutable element node in the fake DOM tree. It owns an immutable
 * Collection Node which is copied on write.
 */
export class ElementNode<T> extends BaseNode<T> {
  nodeType = 8; // COMMENT_NODE (we'd use ELEMENT_NODE but React DevTools will fail to get its dimensions)
  node: CollectionNode<T> | null;
  isMutated = true;
  private _index: number = 0;
  isHidden = false;

  constructor(type: string, ownerDocument: Document<T, any>) {
    super(ownerDocument);
    this.node = null;
  }

  get index(): number {
    return this._index;
  }

  set index(index: number) {
    this._index = index;
    this.ownerDocument.markDirty(this);
  }

  get level(): number {
    if (this.parentNode instanceof ElementNode) {
      return this.parentNode.level + (this.node?.type === 'item' ? 1 : 0);
    }

    return 0;
  }

  /**
   * Lazily gets a mutable instance of a Node. If the node has already
   * been cloned during this update cycle, it just returns the existing one.
   */
  private getMutableNode(): Mutable<CollectionNode<T>> | null {
    if (this.node == null) {
      return null;
    }

    if (!this.isMutated) {
      this.node = this.node.clone();
      this.isMutated = true;
    }

    this.ownerDocument.markDirty(this);
    return this.node;
  }

  updateNode(): void {
    let nextSibling = this.nextVisibleSibling;
    let node = this.getMutableNode();
    if (node == null) {
      return;
    }

    node.index = this.index;
    node.level = this.level;
    node.parentKey = this.parentNode instanceof ElementNode ? this.parentNode.node?.key ?? null : null;
    node.prevKey = this.previousVisibleSibling?.node?.key ?? null;
    node.nextKey = nextSibling?.node?.key ?? null;
    node.hasChildNodes = !!this.firstChild;
    node.firstChildKey = this.firstVisibleChild?.node?.key ?? null;
    node.lastChildKey = this.lastVisibleChild?.node?.key ?? null;

    // Update the colIndex of sibling nodes if this node has a colSpan.
    if ((node.colSpan != null || node.colIndex != null) && nextSibling) {
      // This queues the next sibling for update, which means this happens recursively.
      let nextColIndex = (node.colIndex ?? node.index) + (node.colSpan ?? 1);
      if (nextSibling.node != null && nextColIndex !== nextSibling.node.colIndex) {
        let siblingNode = nextSibling.getMutableNode();
        siblingNode!.colIndex = nextColIndex;
      }
    }
  }

  setProps<E extends Element>(obj: {[key: string]: any}, ref: ForwardedRef<E>, CollectionNodeClass: CollectionNodeClass<any>, rendered?: ReactNode, render?: (node: Node<T>) => ReactElement): void {
    let node;
    let {value, textValue, id, ...props} = obj;
    if (this.node == null) {
      node = new CollectionNodeClass(id ?? `react-aria-${++this.ownerDocument.nodeId}`);
      this.node = node;
    } else {
      node = this.getMutableNode();
    }

    props.ref = ref;
    node.props = props;
    node.rendered = rendered;
    node.render = render;
    node.value = value;
    node.textValue = textValue || (typeof props.children === 'string' ? props.children : '') || obj['aria-label'] || '';
    if (id != null && id !== node.key) {
      throw new Error('Cannot change the id of an item');
    }

    if (props.colSpan != null) {
      node.colSpan = props.colSpan;
    }

    if (this.isConnected) {
      this.ownerDocument.queueUpdate();
    }
  }

  get style(): CSSProperties {
    // React sets display: none to hide elements during Suspense.
    // We'll handle this by setting the element to hidden and invalidating
    // its siblings/parent. Hidden elements remain in the Document, but
    // are removed from the Collection.
    let element = this;
    return {
      get display() {
        return element.isHidden ? 'none' : '';
      },
      set display(value) {
        let isHidden = value === 'none';
        if (element.isHidden !== isHidden) {
          // Mark parent node dirty if this element is currently the first or last visible child.
          if (element.parentNode?.firstVisibleChild === element || element.parentNode?.lastVisibleChild === element) {
            element.ownerDocument.markDirty(element.parentNode);
          }

          // Mark sibling visible elements dirty.
          let prev = element.previousVisibleSibling;
          let next = element.nextVisibleSibling;
          if (prev) {
            element.ownerDocument.markDirty(prev);
          }
          if (next) {
            element.ownerDocument.markDirty(next);
          }

          // Mark self dirty.
          element.isHidden = isHidden;
          element.ownerDocument.markDirty(element);
        }
      }
    };
  }

  hasAttribute(): void {}
  setAttribute(): void {}
  setAttributeNS(): void {}
  removeAttribute(): void {}
}

/**
 * A mutable Document in the fake DOM. It owns an immutable Collection instance,
 * which is lazily copied on write during updates.
 */
export class Document<T, C extends BaseCollection<T> = BaseCollection<T>> extends BaseNode<T> {
  nodeType = 11; // DOCUMENT_FRAGMENT_NODE
  ownerDocument: Document<T, C> = this;
  dirtyNodes: Set<BaseNode<T>> = new Set();
  isSSR = false;
  nodeId = 0;
  nodesByProps: WeakMap<object, ElementNode<T>> = new WeakMap<object, ElementNode<T>>();
  private collection: C;
  private nextCollection: C | null = null;
  private subscriptions: Set<() => void> = new Set();
  private queuedRender = false;
  private inSubscription = false;

  constructor(collection: C) {
    // @ts-ignore
    super(null);
    this.collection = collection;
    this.nextCollection = collection;
  }

  get isConnected(): boolean {
    return true;
  }

  createElement(type: string): ElementNode<T> {
    return new ElementNode(type, this);
  }

  private getMutableCollection() {
    if (!this.nextCollection) {
      this.nextCollection = this.collection.clone();
    }

    return this.nextCollection;
  }

  markDirty(node: BaseNode<T>): void {
    this.dirtyNodes.add(node);
  }

  private addNode(element: ElementNode<T>): void {
    if (element.isHidden || element.node == null) {
      return;
    }

    let collection = this.getMutableCollection();
    if (!collection.getItem(element.node.key)) {
      for (let child of element) {
        this.addNode(child);
      }
    }

    collection.addNode(element.node);
  }

  private removeNode(node: ElementNode<T>): void {
    for (let child of node) {
      this.removeNode(child);
    }

    if (node.node) {
      let collection = this.getMutableCollection();
      collection.removeNode(node.node.key);
    }
  }

  /** Finalizes the collection update, updating all nodes and freezing the collection. */
  getCollection(): C {
    // If in a subscription update, return a clone of the existing collection.
    // This ensures React will queue a render. React will call getCollection again
    // during render, at which point all the updates will be complete and we can return
    // the new collection.
    if (this.inSubscription) {
      return this.collection.clone();
    }

    // Reset queuedRender to false when getCollection is called during render.
    this.queuedRender = false;

    this.updateCollection();
    return this.collection;
  }

  updateCollection(): void {
    // First, remove disconnected nodes and update the indices of dirty element children.
    for (let element of this.dirtyNodes) {
      if (element instanceof ElementNode && (!element.isConnected || element.isHidden)) {
        this.removeNode(element);
      } else {
        element.updateChildIndices();
      }
    }

    // Next, update dirty collection nodes.
    for (let element of this.dirtyNodes) {
      if (element instanceof ElementNode) {
        if (element.isConnected && !element.isHidden) {
          element.updateNode();
          this.addNode(element);
        }

        if (element.node) {
          this.dirtyNodes.delete(element);
        }

        element.isMutated = false;
      } else {
        this.dirtyNodes.delete(element);
      }
    }

    // Finally, update the collection.
    if (this.nextCollection) {
      this.nextCollection.commit(this.firstVisibleChild?.node?.key ?? null, this.lastVisibleChild?.node?.key ?? null, this.isSSR);
      if (!this.isSSR) {
        this.collection = this.nextCollection;
        this.nextCollection = null;
      }
    }
  }

  queueUpdate(): void {
    if (this.dirtyNodes.size === 0 || this.queuedRender) {
      return;
    }

    // Only trigger subscriptions once during an update, when the first item changes.
    // React's useSyncExternalStore will call getCollection immediately, to check whether the snapshot changed.
    // If so, React will queue a render to happen after the current commit to our fake DOM finishes.
    // We track whether getCollection is called in a subscription, and once it is called during render,
    // we reset queuedRender back to false.
    this.queuedRender = true;
    this.inSubscription = true;
    for (let fn of this.subscriptions) {
      fn();
    }
    this.inSubscription = false;
  }

  subscribe(fn: () => void) {
    this.subscriptions.add(fn);
    return (): boolean => this.subscriptions.delete(fn);
  }

  resetAfterSSR(): void {
    if (this.isSSR) {
      this.isSSR = false;
      this.firstChild = null;
      this.lastChild = null;
      this.nodeId = 0;
    }
  }
}
