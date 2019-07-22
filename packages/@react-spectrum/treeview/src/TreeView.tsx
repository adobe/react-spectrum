import React, { useRef } from 'react';
import {useTreeViewState} from '@react-stately/treeview';
import {EditableCollectionView, ListLayout} from '@adobe/collection-view';
import styles from '@adobe/spectrum-css-temp/components/treeview/vars.css';
import {classNames} from '@react-spectrum/utils';
import { Tree, Item } from '@react-stately/collections';

export function TreeView(props) {
  let {tree, setTree} = useTreeViewState(props);
  let layout = useRef(
    new ListLayout({
      rowHeight: 44,
      indentationForItem(tree: Tree, key) {
        let level = tree.getLevel(key);
        return 28 * level;
      }
    })
  );

  let onToggle = (item) => {
    setTree(tree.update(item.key, {isExpanded: !item.isExpanded}));
  };

  let delegate = {
    renderItemView(type, item) {
      return <TreeItem item={item} onToggle={() => onToggle(item)} />
    }
  };

  return (
    <EditableCollectionView
      className={classNames(styles, 'spectrum-TreeView')}
      layout={layout.current}
      data={tree}
      delegate={delegate}
      onChange={setTree} />
  );
}

interface TreeItemProps {
  item: Item
}

const TreeItem = React.forwardRef(({item, allowsSelection = true, focused, 'drop-target': isDropTarget, onToggle}: TreeItemProps, ref) => {
  let {
    value,
    hasChildren,
    isExpanded,
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
        {value}
      </div>
    </div>
  );
});

