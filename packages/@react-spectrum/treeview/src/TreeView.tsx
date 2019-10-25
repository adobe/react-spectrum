import React, {Key, useMemo } from 'react';
import {CollectionView} from '@react-aria/collections'
import styles from '@adobe/spectrum-css-temp/components/treeview/vars.css';
import {classNames} from '@react-spectrum/utils';
import {CollectionBase, Expandable, MultipleSelection} from '@react-types/shared';
import ChevronRightMedium from '@spectrum-icons/ui/ChevronRightMedium';
import {Item, Section, Node, Tree, ListLayout} from '@react-stately/collections';
import {useTreeViewState} from '@react-stately/treeview';

export {Item, Section};

export function TreeView<T>(props: CollectionBase<T> & Expandable & MultipleSelection) {
  let {
    tree,
    onToggle,
    onSelectToggle
  } = useTreeViewState(props);

  let layout = useMemo(() => 
    new ListLayout({
      rowHeight: 44,
      indentationForItem(tree: Tree<T>, key: Key) {
        let level = tree.getItem(key).level;
        return 28 * level;
      }
    })
  , []);

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
