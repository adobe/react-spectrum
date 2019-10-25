import React, {Key, useMemo } from 'react';
import {CollectionView} from '@react-aria/collections'
import styles from '@adobe/spectrum-css-temp/components/treeview/vars.css';
import {classNames} from '@react-spectrum/utils';
import {CollectionBase, Expandable, MultipleSelection} from '@react-types/shared';
import {useControlledState} from '@react-stately/utils';
import ChevronRightMedium from '@spectrum-icons/ui/ChevronRightMedium';
import {Item, Section, CollectionBuilder, Node, Tree, ListLayout} from '@react-stately/collections';

export {Item, Section};

export function TreeView<T>(props: CollectionBase<T> & Expandable & MultipleSelection) {
  // let {tree, setTree} = useTreeViewState(props);
  let [expandedKeys, setExpandedKeys] = useControlledState(
    props.expandedKeys ? new Set(props.expandedKeys) : undefined,
    props.defaultExpandedKeys ? new Set(props.defaultExpandedKeys) : new Set(),
    props.onExpandedChange
  );

  let [selectedKeys, setSelectedKeys] = useControlledState(
    props.selectedKeys ? new Set(props.selectedKeys) : undefined,
    props.defaultSelectedKeys ? new Set(props.defaultSelectedKeys) : new Set(),
    props.onSelectionChange
  );

  let builder = useMemo(() => new CollectionBuilder<T>(props.itemKey), [props.itemKey]);
  let tree = useMemo(() => {
    let nodes = builder.build(props, key => ({
      isExpanded: expandedKeys.has(key),
      isSelected: selectedKeys.has(key)
    }));

    return new Tree(nodes);
  }, [builder, props.items, typeof props.children === 'function' ? null : props.children, expandedKeys, selectedKeys]);

  let layout = useMemo(() => 
    new ListLayout({
      rowHeight: 44,
      indentationForItem(tree: Tree<T>, key: Key) {
        let level = tree.getItem(key).level;
        return 28 * level;
      }
    })
  , []);

  let onToggle = (item: Node<T>) => {
    setExpandedKeys(expandedKeys => {
      let expanded = new Set(expandedKeys);
      if (expanded.has(item.key)) {
        expanded.delete(item.key);
      } else {
        expanded.add(item.key);
      }
  
      return expanded;
    });
  };

  let onSelectToggle = (item: Node<T>) => {
    setSelectedKeys(selectedKeys => {
      let selected = new Set(selectedKeys);
      if (selected.has(item.key)) {
        selected.delete(item.key);
      } else {
        selected.add(item.key);
      }
  
      return selected;
    })
  };

  return (
    <CollectionView
      className={classNames(styles, 'spectrum-TreeView')}
      layout={layout}
      collection={tree}>
      {(type, item) => {
        if (type === 'section') {
          return <TreeHeading item={item} />
        }

        return (
          <TreeItem 
            item={item} 
            onToggle={() => onToggle(item)} 
            onSelectToggle={() => onSelectToggle(item)} />
        );
      }}
    </CollectionView>
  );
}

interface TreeItemProps<T> {
  item: Node<T>,
  onToggle: (item: Node<T>) => void,
  onSelectToggle: (item: Node<T>) => void
}

function TreeItem<T>({item, onToggle, onSelectToggle}: TreeItemProps<T>) {
  let {
    rendered,
    hasChildNodes,
    isExpanded,
    isSelected
  } = item;
  
  let itemClassName = classNames(styles, 'spectrum-TreeView-item', {
    'is-open': isExpanded
  });

  let linkClassName = classNames(styles, 'spectrum-TreeView-itemLink', {
    'is-selected': isSelected,
    // 'is-focused': focused,
    // 'is-drop-target': isDropTarget
  });

  // console.log('RENDER', item, isExpanded, isSelected)
  
  return (
    <div className={itemClassName} role="presentation" onMouseDown={() => onSelectToggle(item)}>
      <div className={linkClassName}>
        {hasChildNodes &&
          <ChevronRightMedium
            className={classNames(styles, 'spectrum-TreeView-indicator')}
            onMouseDown={e => e.stopPropagation()}
            onClick={onToggle}
            size={null} />
        }
        {rendered}
      </div>
    </div>
  );
}

function TreeHeading({item}) {
  return (
    <div className={classNames(styles, 'spectrum-TreeView-heading')}>{item.rendered}</div>
  );
}
