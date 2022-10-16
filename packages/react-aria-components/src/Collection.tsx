import {Collection, CollectionBase, Node, SelectionBehavior, SelectionMode, ItemProps as SharedItemProps, SectionProps as SharedSectionProps} from '@react-types/shared';
import {createPortal} from 'react-dom';
import {DOMProps, RenderProps} from './utils';
import React, {cloneElement, Key, ReactElement, ReactNode, ReactPortal, useMemo, useReducer, useRef} from 'react';
import {useLayoutEffect} from '@react-aria/utils';

class BaseNode<T> {
  firstChild: ElementNode<T> | null;
  lastChild: ElementNode<T> | null;
  previousSibling: ElementNode<T> | null;
  nextSibling: ElementNode<T> | null;
  parentNode: BaseNode<T> | null;
  ownerDocument: Root<T>;

  constructor(ownerDocument: Root<T>) {
    this.ownerDocument = ownerDocument;
  }

  *[Symbol.iterator]() {
    let node = this.firstChild;
    while (node) {
      yield node;
      node = node.nextSibling;
    }
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

    this.ownerDocument.addNode(child);
    this.ownerDocument.update();
  }

  insertBefore(newNode: ElementNode<T>, referenceNode: ElementNode<T>) {
    if (newNode.parentNode) {
      newNode.parentNode.removeChild(newNode);
    }

    let node = referenceNode;
    while (node) {
      node.index++;
      node = node.nextSibling;
    }

    newNode.nextSibling = referenceNode;
    newNode.previousSibling = referenceNode.previousSibling;
    newNode.index = referenceNode.index;

    if (this.firstChild === referenceNode) {
      this.firstChild = newNode;
    } else {
      referenceNode.previousSibling.nextSibling = newNode;
    }

    referenceNode.previousSibling = newNode;
    newNode.parentNode = referenceNode.parentNode;

    this.ownerDocument.addNode(newNode);
    this.ownerDocument.update();
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
    child.index = null;

    this.ownerDocument.removeNode(child);
    this.ownerDocument.update();
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

class ElementNode<T> extends BaseNode<T> implements Node<T> {
  nodeType = 8; // COMMENT_NODE (we'd use ELEMENT_NODE but React DevTools will fail to get its dimensions)
  type: string;
  key: Key;
  value: T;
  rendered: ReactNode;
  textValue: string;
  props: any;
  level: number;
  index: number;

  constructor(type, ownerDocument) {
    super(ownerDocument);
    this.type = TYPE_MAP[type];
    this.key = ++id; // TODO
    this.value = null;
    this.rendered = null;
    this.textValue = null;
    this.props = {};
    // this.props = {id: ++id};
  }

  get childNodes(): Iterable<ElementNode<T>> {
    return {
      [Symbol.iterator]: this[Symbol.iterator].bind(this)
    };
  }

  get hasChildNodes(): boolean {
    return !!this.firstChild;
  }

  get nextKey() {
    return this.nextSibling?.key;
  }

  get prevKey() {
    return this.previousSibling?.key;
  }

  get parentKey() {
    if (this.parentNode instanceof ElementNode) {
      return this.parentNode.key;
    }

    return null;
  }

  set multiple(value) {
    this.props = value;
    this.rendered = value.rendered;
    this.value = value.value;
    this.textValue = value.textValue || (typeof value.rendered === 'string' ? value.rendered : '') || value['aria-label'] || '';
    if (value.id != null && value.id !== this.key) {
      if (this.parentNode) {
        throw new Error('Cannot change the id of an item');
      }
      this.key = value.id;
    }
    this.ownerDocument.update();
  }

  get style() {
    if (!this.props.style) {
      this.props.style = {};
    }
    return this.props.style;
  }

  hasAttribute() {}
  setAttribute() {}
  setAttributeNS() {}
  removeAttribute() {}
}

class Root<T> extends BaseNode<T> implements Collection<Node<T>> {
  nodeType = 11; // DOCUMENT_FRAGMENT_NODE
  ownerDocument = this;
  keyMap: Map<Key, ElementNode<T>> = new Map();
  update: () => void;

  constructor(update: () => void) {
    super(null);
    this.update = update;
  }

  createElement(type) {
    if (type !== 'option' && type !== 'optgroup' && type !== 'hr') {
      throw new Error(`<${type}> is not allowed inside a ListBox. Please render an <Item> or <Section>.`);
    }

    return new ElementNode(type, this);
  }

  addNode(node: ElementNode<T>) {
    if (!this.keyMap.has(node.key)) {
      this.keyMap.set(node.key, node);

      for (let child of node) {
        this.addNode(child);
      }
    }
  }

  removeNode(node: ElementNode<T>) {
    for (let child of node) {
      this.removeNode(child);
    }

    this.keyMap.delete(node.key);
  }

  get size() {
    return this.keyMap.size;
  }

  getKeys() {
    return this.keyMap.keys();
  }

  getKeyBefore(key: Key) {
    let node = this.keyMap.get(key);
    if (!node) {
      return null;
    }

    if (node.previousSibling) {
      node = node.previousSibling;

      while (node.lastChild) {
        node = node.lastChild;
      }

      return node.key;
    }

    if (node.parentNode instanceof ElementNode) {
      return node.parentNode.key;
    }
  }

  getKeyAfter(key: Key) {
    let node = this.keyMap.get(key);
    if (!node) {
      return null;
    }

    if (node.firstChild) {
      return node.firstChild.key;
    }

    while (node) {
      if (node.nextSibling) {
        return node.nextSibling.key;
      }

      if (node.parentNode instanceof ElementNode) {
        node = node.parentNode;
      } else {
        return null;
      }
    }
  }

  getFirstKey() {
    return this.firstChild?.key;
  }

  getLastKey() {
    let node = this.lastChild;
    while (node?.lastChild) {
      node = node.lastChild;
    }

    return node?.key;
  }

  getItem(key: Key) {
    return this.keyMap.get(key);
  }

  at(): Node<T> {
    throw new Error('Not implemented');
  }
}

export interface CollectionProps<T> extends Omit<CollectionBase<T>, 'children'> {
  children?: ReactNode | ((item: T) => ReactElement)
}

export function useCachedChildren<T extends object>(props: CollectionProps<T>) {
  let {children, items} = props;
  let cache = useMemo(() => new WeakMap(), []);
  return useMemo(() => {
    if (items && typeof children === 'function') {
      let res = [];
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
            // TODO: only works if wrapped Item passes through id...
            rendered = cloneElement(rendered, {key, id: key});
          }
          cache.set(item, rendered);
        }
        res.push(rendered);
      }
      return res;
    } else {
      return children;
    }
  }, [children, items, cache]);
}

interface CollectionResult<T> {
  portal: ReactPortal,
  collection: Collection<Node<T>>
}

export function useCollection<T extends object>(props: CollectionProps<T>): CollectionResult<T> {
  let isMounted = useRef(false);
  let [, queueUpdate] = useReducer(c => c + 1, 0);

  useLayoutEffect(() => {
    if (isMounted.current) {
      return;
    }
    isMounted.current = true;
    queueUpdate();
  }, []);

  let children = useCachedChildren(props);
  let collection = useMemo(() => new Root<T>(() => {
    if (isMounted.current) {
      queueUpdate();
    }
  }), []);
  let portal = createPortal(children, collection as unknown as Element);
  return {portal, collection};
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
  selectionBehavior: SelectionBehavior
}

export interface ItemProps<T> extends Omit<SharedItemProps<T>, 'children'>, RenderProps<ItemRenderProps> {}

export function Item<T extends object>(props: ItemProps<T>) {
  // HACK: the `multiple` prop is special in that React will pass it through as a property rather
  // than converting to a string and using setAttribute. This allows our custom fake DOM to receive
  // the props as an object. Once React supports custom elements, we can switch to that instead.
  // https://github.com/facebook/react/issues/11347
  // https://github.com/facebook/react/blob/82c64e1a49239158c0daa7f0d603d2ad2ee667a9/packages/react-dom/src/shared/DOMProperty.js#L386
  // @ts-ignore
  return <option multiple={{...props, rendered: props.children}} />;
}

export interface SectionProps<T> extends Omit<SharedSectionProps<T>, 'children'>, DOMProps {}

export function Section<T extends object>(props: SectionProps<T>) {
  let children = useCachedChildren(props);

  // @ts-ignore
  return <optgroup multiple={{...props, rendered: props.title}}>{children}</optgroup>;
}
