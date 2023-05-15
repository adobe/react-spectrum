/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {CollectionBase} from '@react-types/shared';
import {createPortal} from 'react-dom';
import {DOMProps, RenderProps} from './utils';
import {Collection as ICollection, Node, SelectionBehavior, SelectionMode, ItemProps as SharedItemProps, SectionProps as SharedSectionProps} from 'react-stately';
import {mergeProps, useIsSSR} from 'react-aria';
import React, {cloneElement, createContext, Key, ReactElement, ReactNode, ReactPortal, useCallback, useContext, useMemo} from 'react';
import {useLayoutEffect} from '@react-aria/utils';
import {useSyncExternalStore} from 'use-sync-external-store/shim/index.js';

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

type Mutable<T> = {
  -readonly[P in keyof T]: T[P]
}

/** An immutable object representing a Node in a Collection. */
export class NodeValue<T> implements Node<T> {
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

  constructor(type: string, key: Key) {
    this.type = type;
    this.key = key;
  }

  get childNodes(): Iterable<Node<T>> {
    throw new Error('childNodes is not supported');
  }

  clone(): NodeValue<T> {
    let node: Mutable<NodeValue<T>> = new NodeValue(this.type, this.key);
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
    return node;
  }
}

/**
 * A mutable node in the fake DOM tree. When mutated, it marks itself as dirty
 * and queues an update with the owner document.
 */
class BaseNode<T> {
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
    this.ownerDocument.dirtyNodes.add(this);
  }

  get lastChild() {
    return this._lastChild;
  }

  set lastChild(lastChild) {
    this._lastChild = lastChild;
    this.ownerDocument.dirtyNodes.add(this);
  }

  get previousSibling() {
    return this._previousSibling;
  }

  set previousSibling(previousSibling) {
    this._previousSibling = previousSibling;
    this.ownerDocument.dirtyNodes.add(this);
  }

  get nextSibling() {
    return this._nextSibling;
  }

  set nextSibling(nextSibling) {
    this._nextSibling = nextSibling;
    this.ownerDocument.dirtyNodes.add(this);
  }

  get parentNode() {
    return this._parentNode;
  }

  set parentNode(parentNode) {
    this._parentNode = parentNode;
    this.ownerDocument.dirtyNodes.add(this);
  }

  appendChild(child: ElementNode<T>) {
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

    this.ownerDocument.dirtyNodes.add(this);
    this.ownerDocument.addNode(child);
  }

  insertBefore(newNode: ElementNode<T>, referenceNode: ElementNode<T>) {
    if (referenceNode == null) {
      return this.appendChild(newNode);
    }

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

    this.ownerDocument.addNode(newNode);
  }

  removeChild(child: ElementNode<T>) {
    if (child.parentNode !== this) {
      return;
    }

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
  }

  addEventListener() {}
  removeEventListener() {}
}

let id = 0;
const TYPE_MAP = {
  hr: 'separator',
  optgroup: 'section',
  option: 'item'
};

/**
 * A mutable element node in the fake DOM tree. It owns an immutable
 * Collection Node which is copied on write.
 */
export class ElementNode<T> extends BaseNode<T> {
  nodeType = 8; // COMMENT_NODE (we'd use ELEMENT_NODE but React DevTools will fail to get its dimensions)
  node: NodeValue<T>;
  private _index: number = 0;
  private hasSetProps = false;

  constructor(type: string, ownerDocument: Document<T, any>) {
    super(ownerDocument);
    this.node = new NodeValue(TYPE_MAP[type] || type, `react-aria-${++id}`);
  }

  get index() {
    return this._index;
  }

  set index(index) {
    this._index = index;
    this.ownerDocument.dirtyNodes.add(this);
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

  setProps(obj: any, rendered?: ReactNode) {
    let node = this.ownerDocument.getMutableNode(this);
    let {value, textValue, id, ...props} = obj;
    node.props = props;
    node.rendered = rendered;
    node.value = value;
    node.textValue = textValue || (typeof rendered === 'string' ? rendered : '') || obj['aria-label'] || '';
    if (id != null && id !== node.key) {
      if (this.hasSetProps) {
        throw new Error('Cannot change the id of an item');
      }
      node.key = id;
    }
    this.hasSetProps = true;
  }

  get style() {
    let node = this.ownerDocument.getMutableNode(this);
    if (!node.props.style) {
      node.props.style = {};
    }
    return node.props.style;
  }

  hasAttribute() {}
  setAttribute(key: string, value: string) {
    let node = this.ownerDocument.getMutableNode(this);
    if (key in node) {
      node[key] = value;
    }
  }

  setAttributeNS() {}
  removeAttribute() {}
}

/**
 * An immutable Collection implementation. Updates are only allowed
 * when it is not marked as frozen.
 */
export class BaseCollection<T> implements ICollection<Node<T>> {
  private keyMap: Map<Key, NodeValue<T>> = new Map();
  private firstKey: Key | null = null;
  private lastKey: Key | null = null;
  private frozen = false;

  get size() {
    return this.keyMap.size;
  }

  getKeys() {
    return this.keyMap.keys();
  }

  *[Symbol.iterator]() {
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

  getKeyBefore(key: Key) {
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

  getKeyAfter(key: Key) {
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

  getFirstKey() {
    return this.firstKey;
  }

  getLastKey() {
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
    return collection;
  }

  addNode(node: NodeValue<T>) {
    if (this.frozen) {
      throw new Error('Cannot add a node to a frozen collection');
    }

    this.keyMap.set(node.key, node);
  }

  removeNode(key: Key) {
    if (this.frozen) {
      throw new Error('Cannot remove a node to a frozen collection');
    }

    this.keyMap.delete(key);
  }

  commit(firstKey: Key | null, lastKey: Key | null) {
    if (this.frozen) {
      throw new Error('Cannot commit a frozen collection');
    }

    this.firstKey = firstKey;
    this.lastKey = lastKey;
    this.frozen = true;
  }
}

/**
 * A mutable Document in the fake DOM. It owns an immutable Collection instance,
 * which is lazily copied on write during updates.
 */
export class Document<T, C extends BaseCollection<T>> extends BaseNode<T> {
  nodeType = 11; // DOCUMENT_FRAGMENT_NODE
  ownerDocument = this;
  dirtyNodes: Set<BaseNode<T>> = new Set();
  private collection: C;
  private collectionMutated: boolean;
  private mutatedNodes: Set<ElementNode<T>> = new Set();
  private subscriptions: Set<() => void> = new Set();

  constructor(collection: C) {
    // @ts-ignore
    super(null);
    this.collection = collection;
    this.collectionMutated = true;
  }

  createElement(type: string) {
    return new ElementNode(type, this);
  }

  /**
   * Lazily gets a mutable instance of a Node. If the node has already
   * been cloned during this update cycle, it just returns the existing one.
   */
  getMutableNode(element: ElementNode<T>): Mutable<NodeValue<T>> {
    let node = element.node;
    if (!this.mutatedNodes.has(element)) {
      node = element.node.clone();
      this.mutatedNodes.add(element);
      element.node = node;
    }
    this.dirtyNodes.add(element);
    return node;
  }

  private getMutableCollection() {
    if (!this.collectionMutated) {
      this.collection = this.collection.clone();
      this.collectionMutated = true;
    }

    return this.collection;
  }

  addNode(element: ElementNode<T>) {
    let collection = this.getMutableCollection();
    if (!collection.getItem(element.node.key)) {
      collection.addNode(element.node);

      for (let child of element) {
        this.addNode(child);
      }
    }

    this.dirtyNodes.add(element);
  }

  removeNode(node: ElementNode<T>) {
    for (let child of node) {
      child.parentNode = null;
      this.removeNode(child);
    }

    let collection = this.getMutableCollection();
    collection.removeNode(node.node.key);
    this.dirtyNodes.add(node);
  }

  /** Finalizes the collection update, updating all nodes and freezing the collection. */
  getCollection(): C {
    for (let element of this.dirtyNodes) {
      if (element instanceof ElementNode && element.parentNode) {
        element.updateNode();
      }
    }

    this.dirtyNodes.clear();

    if (this.mutatedNodes.size) {
      let collection = this.getMutableCollection();
      for (let element of this.mutatedNodes) {
        if (element.parentNode) {
          collection.addNode(element.node);
        }
      }

      collection.commit(this.firstChild?.node.key ?? null, this.lastChild?.node.key ?? null);
      this.mutatedNodes.clear();
    }

    this.collectionMutated = false;
    return this.collection;
  }

  queueUpdate() {
    for (let fn of this.subscriptions) {
      fn();
    }
  }

  subscribe(fn: () => void) {
    this.subscriptions.add(fn);
    return () => this.subscriptions.delete(fn);
  }
}

export interface CollectionProps<T> extends Omit<CollectionBase<T>, 'children'> {
  /** The contents of the collection. */
  children?: ReactNode | ((item: T) => ReactElement)
}

interface CachedChildrenOptions<T> extends CollectionProps<T> {
  idScope?: Key,
  addIdAndValue?: boolean
}

export function useCachedChildren<T extends object>(props: CachedChildrenOptions<T>) {
  let {children, items, idScope, addIdAndValue} = props;
  let cache = useMemo(() => new WeakMap(), []);
  return useMemo(() => {
    if (items && typeof children === 'function') {
      let res: ReactElement[] = [];
      for (let item of items) {
        let rendered = cache.get(item);
        if (!rendered) {
          rendered = children(item);
          if (rendered.key == null) {
            // @ts-ignore
            let key = rendered.props.id ?? item.key ?? item.id;
            // eslint-disable-next-line max-depth
            if (key == null) {
              throw new Error('Could not determine key for item');
            }
            // eslint-disable-next-line max-depth
            if (idScope) {
              key = idScope + ':' + key;
            }
            // TODO: only works if wrapped Item passes through id...
            rendered = cloneElement(
              rendered,
              addIdAndValue ? {key, id: key, value: item} : {key}
            );
          }
          cache.set(item, rendered);
        }
        res.push(rendered);
      }
      return res;
    } else {
      return children;
    }
  }, [children, items, cache, idScope, addIdAndValue]);
}

export function useCollectionChildren<T extends object>(props: CachedChildrenOptions<T>) {
  return useCachedChildren({...props, addIdAndValue: true});
}

const ShallowRenderContext = createContext(false);

interface CollectionResult<C> {
  portal: ReactPortal | null,
  collection: C
}

export function useCollection<T extends object, C extends BaseCollection<T>>(props: CollectionProps<T>, initialCollection?: C): CollectionResult<C> {
  // The document instance is mutable, and should never change between renders.
  // useSyncExternalStore is used to subscribe to updates, which vends immutable Collection objects.
  let document = useMemo(() => new Document<T, C>(initialCollection || new BaseCollection() as C), [initialCollection]);
  let subscribe = useCallback((fn: () => void) => document.subscribe(fn), [document]);
  let getSnapshot = useCallback(() => document.getCollection(), [document]);
  let collection = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  let children = useCollectionChildren(props);
  let wrappedChildren = useMemo(() => (
    <ShallowRenderContext.Provider value>
      {children}
    </ShallowRenderContext.Provider>
  ), [children]);
  let portal = useIsSSR() ? null : createPortal(wrappedChildren, document as unknown as Element);

  useLayoutEffect(() => {
    if (document.dirtyNodes.size > 0) {
      document.queueUpdate();
    }
  });

  return {portal, collection};
}

/** Renders a DOM element (e.g. separator or header) shallowly when inside a collection. */
export function useShallowRender<T extends Element>(Element: string, props: React.HTMLAttributes<T>, ref: React.Ref<T>): ReactElement | null {
  let isShallow = useContext(ShallowRenderContext);
  props = useMemo(() => ({...props, ref}), [props, ref]);
  ref = useCollectionItemRef(props, props.children);
  if (isShallow) {
    // @ts-ignore
    return <Element ref={ref} />;
  }

  return null;
}

export interface ItemRenderProps {
  /**
   * Whether the item is currently hovered with a mouse.
   * @selector [data-hovered]
   */
  isHovered: boolean,
  /**
   * Whether the item is currently in a pressed state.
   * @selector [data-pressed]
   */
  isPressed: boolean,
  /**
   * Whether the item is currently selected.
   * @selector [aria-selected=true]
   */
  isSelected: boolean,
  /**
   * Whether the item is currently focused.
   * @selector [data-focused]
   */
  isFocused: boolean,
  /**
   * Whether the item is currently keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean,
  /**
   * Whether the item is non-interactive, i.e. both selection and actions are disabled and the item may
   * not be focused. Dependent on `disabledKeys` and `disabledBehavior`.
   * @selector [aria-disabled]
   */
  isDisabled: boolean,
  /** The type of selection that is allowed in the collection. */
  selectionMode: SelectionMode,
  /** The selection behavior for the collection. */
  selectionBehavior: SelectionBehavior,
  /**
   * Whether the item allows dragging.
   * @note This property is only available in collection components that support drag and drop.
   * @selector [draggable]
   */
  allowsDragging?: boolean,
  /**
   * Whether the item is currently being dragged.
   * @note This property is only available in collection components that support drag and drop.
   * @selector [data-dragging]
   */
  isDragging?: boolean,
  /**
   * Whether the item is currently an active drop target.
   * @note This property is only available in collection components that support drag and drop.
   * @selector [data-drop-target]
   */
  isDropTarget?: boolean
}

export function useCollectionItemRef(props: any, rendered?: ReactNode) {
  // Return a callback ref that sets the props object on the fake DOM node.
  return useCallback((element) => {
    element?.setProps(props, rendered);
  }, [props, rendered]);
}

export interface ItemProps<T = object> extends Omit<SharedItemProps<T>, 'children'>, RenderProps<ItemRenderProps> {
  /** The unique id of the item. */
  id?: Key,
  /** The object value that this item represents. When using dynamic collections, this is set automatically. */
  value?: T
}

export function Item<T extends object>(props: ItemProps<T>): JSX.Element {
  // @ts-ignore
  return <item ref={useCollectionItemRef(props, props.children)} />;
}

export interface SectionProps<T> extends Omit<SharedSectionProps<T>, 'children' | 'title'>, DOMProps {
  /** The unique id of the section. */
  id?: Key,
  /** The object value that this section represents. When using dynamic collections, this is set automatically. */
  value?: T,
  /** Static child items or a function to render children. */
  children?: ReactNode | ((item: T) => ReactElement)
}

export function Section<T extends object>(props: SectionProps<T>): JSX.Element {
  let children = useCollectionChildren(props);

  // @ts-ignore
  return <section ref={useCollectionItemRef(props)}>{children}</section>;
}

export const CollectionContext = createContext<CachedChildrenOptions<unknown> | null>(null);
export const CollectionRendererContext = createContext<CollectionProps<unknown>['children']>(null);

/** A Collection renders a list of items, automatically managing caching and keys. */
export function Collection<T extends object>(props: CollectionProps<T>): JSX.Element {
  let ctx = useContext(CollectionContext)!;
  props = mergeProps(ctx, props);
  let renderer = typeof props.children === 'function' ? props.children : null;
  return (
    <CollectionRendererContext.Provider value={renderer}>
      {useCollectionChildren(props)}
    </CollectionRendererContext.Provider>
  );
}
