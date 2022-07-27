import { Collection, CollectionBase, Node } from "@react-types/shared";
import React, { cloneElement, Key, ReactNode, useLayoutEffect, useMemo, useReducer, useRef } from "react";
import { createPortal } from "react-dom";

class BaseNode {
  firstChild: ElementNode | null;
  lastChild: ElementNode | null;
  previousSibling: ElementNode | null;
  nextSibling: ElementNode | null;
  ownerDocument: Root;

  constructor(ownerDocument: Root) {
    this.ownerDocument = ownerDocument;
  }

  *[Symbol.iterator]() {
    let node = this.firstChild;
    while (node) {
      yield node;
      node = node.nextSibling;
    }
  }

  appendChild(child: ElementNode) {
    if (this.firstChild == null) {
      this.firstChild = child;
    }

    if (this.lastChild) {
      this.lastChild.nextSibling = child;
      child.previousSibling = this.lastChild;
    } else {
      child.previousSibling = null;
    }
    child.nextSibling = null;
    this.lastChild = child;

    this.ownerDocument.addNode(child);
    this.ownerDocument.update();
  }

  insertBefore(newNode: ElementNode, referenceNode: ElementNode) {
    newNode.nextSibling = referenceNode;
    newNode.previousSibling = referenceNode.previousSibling;

    if (this.firstChild === referenceNode) {
      this.firstChild = newNode;
    } else {
      referenceNode.previousSibling.nextSibling = newNode;
    }

    referenceNode.previousSibling = newNode;

    this.ownerDocument.addNode(newNode);
    this.ownerDocument.update();
  }

  removeChild(child: ElementNode) {
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

    this.ownerDocument.removeNode(child);
    this.ownerDocument.update();
  }

  addEventListener() {}
  removeEventListener() {}
}

let id = 0;

class ElementNode extends BaseNode implements Node<unknown> {
  nodeType = 1; // ELEMENT_NODE;
  type: string;
  key: Key;
  value: unknown;
  rendered: ReactNode;
  textValue: string;
  props: any;
  level: number;
  hasChildNodes: boolean;
  
  constructor(type, ownerDocument) {
    super(ownerDocument);
    this.type = type === 'optgroup' ? 'section' : 'item';
    this.key = ++id; // TODO
    this.value = null;
    this.rendered = null;
    this.textValue = null;
    this.props = {};
    // this.props = {id: ++id};
  }

  get childNodes(): Iterable<ElementNode> {
    return {
      [Symbol.iterator]: this[Symbol.iterator].bind(this)
    };
  }

  set multiple(value) {
    // this.props = {...this.props, ...value};
    this.props = value;
    this.rendered = value.rendered;
    this.value = value.value;
    this.textValue = value.textValue || (typeof value.rendered === 'string' ? value.rendered : '') || value['aria-label'] || '';
    this.ownerDocument.update();
  }

  hasAttribute() {}
  setAttribute() {}
  setAttributeNS() {}
  removeAttribute() {}
}

class Root extends BaseNode implements Collection<unknown> {
  nodeType = 11; // DOCUMENT_FRAGMENT_NODE
  ownerDocument = this;
  keyMap: Map<Key, BaseNode> = new Map();
  update: () => void;

  constructor(update: () => void) {
    super(null);
    this.update = update;
  }

  createElement(type) {
    if (type !== 'option' && type !== 'optgroup') {
      throw new Error(`<${type}> is not allowed inside a ListBox. Please render an <Item> or <Section>.`);
    }

    return new ElementNode(type, this);
  }

  addEventListener() {}
  removeEventListener() {}

  addNode(node: ElementNode) {
    if (!this.keyMap.has(node.key)) {
      this.keyMap.set(node.key, node);

      for (let child of node) {
        this.addNode(child);
      }
    }
  }

  removeNode(node: ElementNode) {
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
    return node ? node.previousSibling?.key : null;
  }

  getKeyAfter(key: Key) {
    let node = this.keyMap.get(key);
    return node ? node.nextSibling?.key : null;
  }

  getFirstKey() {
    return this.firstChild?.key;
  }

  getLastKey() {
    return this.lastChild?.key;
  }

  getItem(key: Key) {
    return this.keyMap.get(key);
  }

  at() {
    throw new Error('Not implemented');
  }
}

export function useCachedChildren<T extends object>(props: CollectionBase<T>) {
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
            let key = item.key ?? item.id;
            if (key == null) {
              throw new Error('Could not determine key for item');
            }
            rendered = cloneElement(rendered, {key});
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

export function useCollection<T extends object>(props: CollectionBase<T>) {
  let isMounted = useRef(false);
  let [, queueUpdate] = useReducer(c => c + 1, 0);
  let update = () => {
    if (isMounted.current) {
      queueUpdate();
    }
  };

  useLayoutEffect(() => {
    if (isMounted.current) {
      return;
    }
    isMounted.current = true;
    queueUpdate();
  }, []);

  let children = useCachedChildren(props);
  let collection = useMemo(() => new Root(update), []);
  let portal = createPortal(children, collection as unknown as Element);
  return {portal, collection};
}

export function Item(props) {
  // HACK: the `multiple` prop is special in that React will pass it through as a property rather
  // than converting to a string and using setAttribute. This allows our custom fake DOM to receive
  // the props as an object. Once React supports custom elements, we can switch to that instead.
  // https://github.com/facebook/react/issues/11347
  // https://github.com/facebook/react/blob/82c64e1a49239158c0daa7f0d603d2ad2ee667a9/packages/react-dom/src/shared/DOMProperty.js#L386
  // @ts-ignore
  return <option multiple={{...props, rendered: props.children}} />;
}
