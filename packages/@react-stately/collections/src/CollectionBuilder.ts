import {CollectionBase, CollectionElement, ItemElement, ItemProps, ItemRenderer, SectionElement, SectionProps} from '@react-types/shared';
import {ItemStates, Node} from './types';
import React, {Key, ReactElement} from 'react';

export function Item<T>(props: ItemProps<T>): ReactElement { // eslint-disable-line @typescript-eslint/no-unused-vars
  return null;
}

export function Section<T>(props: SectionProps<T>): ReactElement { // eslint-disable-line @typescript-eslint/no-unused-vars
  return null;
}

// Wraps an iterator function as an iterable object.
function iterable<T>(iterator: () => IterableIterator<Node<T>>): Iterable<Node<T>> {
  return {
    [Symbol.iterator]: iterator
  };
}

function shallowEqual<T>(a: T, b: T) {
  for (let key in a) {
    if (a[key] !== b[key]) {
      return false;
    }
  }

  return true;
}

export class CollectionBuilder<T> {
  private itemKey: string;
  private cache: Map<T, Node<T>> = new Map();
  private getItemStates: (key: Key) => ItemStates;

  constructor(itemKey: string) {
    this.itemKey = itemKey;
  }

  build(props: CollectionBase<T>, getItemStates?: (key: Key) => ItemStates) {
    this.getItemStates = getItemStates || (() => ({}));
    return iterable(() => this.iterateCollection(props));
  }

  getKey(item: CollectionElement<T>, value: T, parentKey?: Key): Key {
    if (item.key) {
      return parentKey ? `${parentKey}${item.key}` : item.key;
    }
    
    if (this.itemKey && value[this.itemKey]) {
      console.log('value in get Key', value);
      return value[this.itemKey];
    }
  
    let v = value as any;
    let key = v.key || v.id;
    if (key == null) {
      throw new Error('No key found for item');
    }
    
    return key;
  }

  getNode(item: CollectionElement<T>, level: number, value: T, childNodes: Iterable<Node<T>>, parentKey?: Key): Node<T> {
    let key = this.getKey(item, value, parentKey);
    key = item.props.staticKey || key;
    let states = item.type === Section ? null : this.getItemStates(key);
    let node: Node<T> = {
      type: item.type === Section ? 'section' : 'item',
      key,
      value,
      level,
      hasChildNodes: item.type === Item ? this.hasChildItems(item.props) : true,
      childNodes,
      rendered: item.type === Item ? item.props.title || item.props.children : item.props.title,
      ...states
    };

    if (value) {
      this.cache.set(value, node);
    }

    return node;
  }

  getCached(item: T) {
    let node = this.cache.get(item);
    if (!node) {
      return;
    }

    if (node.type === 'section') {
      return node;
    }

    let states = this.getItemStates(node.key);
    if (shallowEqual(states, node)) {
      return node;
    }
  }
  
  *iterateCollection(props: CollectionBase<T>) {
    if (typeof props.children === 'function') {
      if (!props.items) {
        throw new Error('props.children was a function but props.items is missing');
      }
  
      for (let item of props.items) {
        let node = this.getCached(item);
        if (node) {
          yield node;
          continue;
        }
  
        let rendered = props.children(item);
        let childItems: Iterable<Node<T>>;
        if (rendered.type === Section) {
          childItems = iterable(() => this.iterateSection(rendered as SectionElement<T>));
        } else if (rendered.type === Item) {
          childItems = iterable(() => this.iterateItem(rendered as ItemElement<T>, 1, props.children as ItemRenderer<T>));
        } else {
          let name = typeof rendered.type === 'function' ? rendered.type.name : rendered.type;
          throw new Error(`Unknown type <${name}> returned by item renderer. Only <Section> or <Item> are supported.`);
        }
  
        yield this.getNode(rendered, 0, item, childItems);
      }
    } else {
      let items = React.Children.toArray(props.children);
      for (let item of items) {
        let childItems: Iterable<Node<T>>;
        if (item.type === Section) {
          childItems = iterable(() => this.iterateSection(item as SectionElement<T>));
        } else if (item.type === Item) {
          childItems = iterable(() => this.iterateItem(item as SectionElement<T>, 1, null));
        } else {
          let name = typeof item.type === 'function' ? item.type.name : item.type;
          throw new Error(`Unsupported item type <${name}>`);
        }
  
        yield this.getNode(item, 0, null, childItems);
      }
    }
  }

  *iterateSection(section: SectionElement<T>) {
    let {key, props: {children, items}} = section;
    if (typeof children === 'function') {
      if (!items) {
        throw new Error('props.children was a function but props.items is missing');
      }
  
      for (let item of items) {
        let node = this.getCached(item);
        if (node) {
          yield node;
          continue;
        }
  
        let rendered = children(item);
        if (rendered.type === Section) {
          throw new Error('Nested sections are not supported');
        }
  
        if (rendered.type !== Item) {
          let name = typeof rendered.type === 'function' ? rendered.type.name : rendered.type;
          throw new Error(`Unknown type <${name}> returned by section item renderer. Only <Item> is supported.`);
        }
  
        let childNodes = iterable(() => this.iterateItem(rendered, 1, children as ItemRenderer<T>));
        yield this.getNode(rendered, 0, item, childNodes);
      }
    } else {
      let items = React.Children.toArray(children);
      for (let item of items) {
        if (item.type === Section) {
          throw new Error('Nested sections are not supported');
        }
  
        if (item.type !== Item) {
          let name = typeof item.type === 'function' ? item.type.name : item.type;
          throw new Error(`Unknown child of type <${name}> in section. Only <Item> is supported.`);
        }
  
        let childNodes = iterable(() => this.iterateItem(item, 1, null, key));
        yield this.getNode(item, 0, null, childNodes, key);
      }
    }
  }

  *iterateItem(item: ItemElement<T>, level: number, renderer: ItemRenderer<T>, parentKey?: Key): IterableIterator<Node<T>> {
    let {key, props: {childItems, title, children}} = item;

    if (childItems) {
      if (!renderer) {
        throw new Error('props.childItems existed but there was no item renderer function');
      }

      for (let child of childItems) {
        let node = this.getCached(child);
        if (node) {
          yield node;
          continue;
        }

        let rendered = renderer(child);
        if (rendered.type !== Item) {
          let name = typeof rendered.type === 'function' ? rendered.type.name : rendered.type;
          throw new Error(`Unknown child of type <${name}> returned by item renderer. Only <Item> is supported.`);
        }

        let childNodes = iterable(() => this.iterateItem(rendered, level + 1, renderer));
        yield this.getNode(rendered, level, child, childNodes);
      }
    } else if (title) {
      let items = React.Children.toArray(children) as ItemElement<T>[];
      for (let child of items) {
        if (child.type !== Item) {
          let name = typeof child.type === 'function' ? child.type.name : child.type;
          throw new Error(`Unknown child of type <${name}> in item. Only <Item> is supported.`);
        }
  
        let childNodes = iterable(() => this.iterateItem(child, level + 1, null, parentKey ? `${parentKey}${key}` : key));
        yield this.getNode(child, level, null, childNodes, parentKey ? `${parentKey}${key}` : key);
      }
    }
  }

  hasChildItems(props: ItemProps<T>) {
    if (props.hasChildItems != null) {
      return props.hasChildItems;
    }

    if (props.childItems) {
      return true;
    }

    if (props.title && React.Children.count(props.children) > 0) {
      return true;
    }

    return false;
  }
}
