import React, { useRef, Key, ReactElement, ReactNode } from 'react';
import {useTreeViewState} from '@react-stately/treeview';
import {CollectionView, EditableCollectionView, ListLayout} from '@adobe/collection-view';
import {ReactCollectionView} from '@adobe/collection-view/src/ReactCollectionView'
import styles from '@adobe/spectrum-css-temp/components/treeview/vars.css';
import {classNames} from '@react-spectrum/utils';
// import { Tree, Item } from '@react-stately/collections';
import { CollectionElement, CollectionChildren, CollectionBase, ItemProps, SectionProps, ItemRenderer, Expandable } from '@react-types/shared';
import { useControlledState } from '@react-stately/utils';

export function Item<T>(props: ItemProps<T>): ReactElement {
  return null;
}

export function Section<T>(props: SectionProps<T>): ReactElement {
  return null;
}

type NodeChildren<T> = () => IterableIterator<Node<T>>;
interface Node<T> {
  type: 'section' | 'item',
  key: Key,
  value: T,
  level: number,
  children: Iterable<Node<T>>,
  rendered: ReactNode
}

function getKey<T>(item: CollectionElement<T>, value: T, itemKey?: string): Key {
  if (item.key) {
    return item.key;
  }

  if (itemKey && value[itemKey]) {
    return value[itemKey];
  }

  let key = value.key || value.id;
  if (key == null) {
    throw new Error('No key found for item');
  }
  
  return key;
}

function getNode<T>(item: CollectionElement<T>, level: number, value: T, itemKey: string, children: NodeChildren<T>): Node<T> {
  let key = getKey(item, value, itemKey);
  return {
    type: item.type === Section ? 'section' : 'item',
    key,
    value,
    level,
    children: {
      [Symbol.iterator]: children
    },
    rendered: item.type === Item ? item.props.children : null
  };
}

function *iterateCollection<T>(props: CollectionBase<T>) {
  if (typeof props.children === 'function') {
    if (!props.items) {
      throw new Error('props.children was a function but props.items is missing');
    }

    for (let item of props.items) {
      let rendered = props.children(item);

      let children: NodeChildren<T>;
      if (rendered.type === Section) {
        children = () => iterateSection(rendered.props as SectionProps<T>, props.itemKey);
      } else {
        children = () => iterateItem(rendered.props as ItemProps<T>, 1, props.children, props.itemKey);
      }

      yield getNode(rendered, 0, item, props.itemKey, children);
    }
  } else {
    let items = React.Children.toArray(props.children);
    for (let item of items) {
      let children: NodeChildren<T>;
      if (item.type === Section) {
        children = () => iterateSection(item.props as SectionProps<T>);
      } else if (item.type === Item) {
        // yield* iterateItem(item.props as ItemProps);
      } else {
        let name = typeof item === 'function' ? item.name : item;
        throw new Error(`Unsupported item type ${name}`);
      }

      yield getNode(item, 0, item, null, children);
    }
  }
}

function *iterateSection<T>(props: SectionProps<T>, itemKey?: string) {
  if (typeof props.children === 'function') {
    if (!props.items) {
      throw new Error('props.children was a function but props.items is missing');
    }

    for (let item of props.items) {
      let rendered = props.children(item);
      if (rendered.type === Section) {
        throw new Error('Nested sections not supported');
      }

      if (rendered.type !== Item) {
        throw new Error('Unknown type returned by section item renderer. Only <Item> is supported.')
      }

      let children = () => iterateItem(rendered.props, 0, props.children, itemKey);
      yield getNode(rendered, 0, item, itemKey, children);
    }
  } else {
    let items = React.Children.toArray(props.children);
    for (let item of items) {
      if (item.type === Section) {
        throw new Error('Nested sections not supported');
      }

      if (item.type !== Item) {
        throw new Error('Unknown child in section. Only <Item> is supported.')
      }

      let children = () => iterateItem(item.props, 0, props.children);
      yield getNode(item, 0, item, null, children);
    }
  }
}

function *iterateItem<T>(props: ItemProps<T>, level: number, renderer: ItemRenderer<T>, itemKey?: string): IterableIterator<Node<T>> {
  if (props.childItems) {
    for (let item of props.childItems) {
      let rendered = renderer(item);

      if (rendered.type !== Item) {
        throw new Error('Unknown child returned by item renderer. Only <Item> is supported.')
      }

      let children = () => iterateItem(rendered.props, level + 1, renderer, itemKey);
      yield getNode(rendered, level, item, itemKey, children);
    }
  }
}

class Tree<T> {
  private keyMap: Map<Key, Node<T>> = new Map();

  constructor(nodes: Iterable<Node<T>>, expandedKeys: Set<Key> = new Set()) {
    let visit = (node: Node<T>) => {
      if (node.type === 'item') {
        this.keyMap.set(node.key, node);
      }

      if (node.children && (node.type === 'section' || expandedKeys.has(node.key))) {
        for (let child of node.children) {
          visit(child);
        }
      }
    };

    for (let node of nodes) {
      visit(node);
    }
  }

  getKeys() {
    return this.keyMap.keys();
  }

  getKeyBefore(key: Key) {
    let keyArray = Array.from(this.keyMap.keys());
    let index = keyArray.indexOf(key);
    if (index > 0) {
      return keyArray[index - 1];
    }

    return null;
  }

  getKeyAfter(key: Key) {
    let keyArray = Array.from(this.keyMap.keys());
    let index = keyArray.indexOf(key);
    if (index + 1 < keyArray.length) {
      return keyArray[index + 1];
    }

    return null;
  }
  
  getItem(key: Key) {
    return this.keyMap.get(key);
  }
}

export function TreeView<T>(props: CollectionBase<T> & Expandable) {
  // let {tree, setTree} = useTreeViewState(props);
  let [expandedKeys, setExpandedKeys] = useControlledState(
    props.expandedKeys ? new Set(props.expandedKeys) : undefined,
    props.defaultExpandedKeys ? new Set(props.defaultExpandedKeys) : new Set(),
    props.onExpandedChange
  );

  let tree = new Tree(iterateCollection(props), expandedKeys);
  console.log(tree, expandedKeys);
  let layout = useRef(
    new ListLayout({
      rowHeight: 44,
      indentationForItem(tree: Tree, key) {
        let level = tree.getItem(key).level;
        return 28 * level;
      }
    })
  );

  let onToggle = (item) => {
    setExpandedKeys(expandedKeys => {
      let expanded = new Set(expandedKeys);
      if (expanded.has(item.key)) {
        expanded.delete(item.key);
      } else {
        expanded.add(item.key);
      }
  
      console.log(expanded, expandedKeys)
      return expanded;
    });
    // setTree(tree.update(item.key, {isExpanded: !item.isExpanded}));
  };

  let delegate = {
    renderItemView(type, item) {
      // console.log('RENDER ITEM', item)
      return <TreeItem item={item} isExpanded={expandedKeys.has(item)} onToggle={() => onToggle(item)} />
    }
  };

  return (
    <ReactCollectionView
      className={classNames(styles, 'spectrum-TreeView')}
      layout={layout.current}
      data={tree}
      renderItem={delegate.renderItemView} />
  );
}

interface TreeItemProps {
  item: Item
}

const TreeItem = React.forwardRef(({item, allowsSelection = true, focused, 'drop-target': isExpanded, isDropTarget, onToggle}: TreeItemProps, ref) => {
  let {
    rendered,
    hasChildren = true,
    isSelected
  } = item;
  
  let itemClassName = classNames(styles, 'spectrum-TreeView-item', {
    'is-open': isExpanded
  });

  let linkClassName = classNames(styles, 'spectrum-TreeView-itemLink', {
    'is-selected': (allowsSelection && isSelected),
    'is-focused': focused,
    'is-drop-target': isDropTarget
  });
  
  return (
    <div className={itemClassName} role="presentation" ref={ref}>
      <div className={linkClassName}>
        {hasChildren &&
          <span onMouseDown={e => e.stopPropagation()} onClick={onToggle}>{isExpanded ? '🔽' : '▶️'}</span>
        }
        {rendered}
      </div>
    </div>
  );
});

