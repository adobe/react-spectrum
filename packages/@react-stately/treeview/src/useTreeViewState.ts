import {useControlledState} from '@react-stately/utils';
import { useEffect, useRef } from 'react';
import {Tree} from '@react-stately/collections';
import TreeDataSource from '@react/react-spectrum/TreeDataSource';
import {TreeViewDataSource} from '@react/react-spectrum/TreeView';

interface TreeViewProps {
  tree?: Tree,
  defaultTree?: Tree,
  onChange?: (tree: Tree) => void
}

export function useTreeViewState(props: TreeViewProps) {
  let [tree, setTree] = useControlledState(props.tree, props.defaultTree, props.onChange);
  // let dataSourceRef = useRef<TreeViewDataSource>();
  // useEffect(() => {
  //   dataSourceRef.current = new TreeViewDataSource(new V3TreeViewDataSource(tree));
  // }, []);
  // let dataSource = dataSourceRef.current;

  // useEffect(() => {
  //   if (tree.changes.length > 0) {
  //     dataSource.dataSource.applyChanges(tree);
  //   }
  // });

  return {
    tree,
    setTree,
    // dataSource
  };
}

class V3TreeViewDataSource extends TreeDataSource {
  constructor(tree: Tree) {
    super();

    this.tree = tree;
    this.items = new Map();
  }

  getChildren(item) {
    let items = item ? item.children : this.tree.children;
    for (let item of items) {
      this.items.set(item.key, item);
    }

    return items;
  }

  hasChildren(item) {
    return item.hasChildren;
  }

  applyChanges(tree) {
    console.log(tree.changes)
    for (let change of tree.changes) {
      switch (change.type) {
        case 'update':
          this.applyUpdate(change);
          break;
      }
    }
  }

  applyUpdate(change) {
    let item = this.items.get(change.key);
    if (change.changes.isExpanded != null) {
      item.isExpanded = change.changes.isExpanded;
      if (change.changes.isExpanded) {
        this.emit('expandItem', item);
      }else {
        this.emit('collapseItem', item);
      }
    }
  }
}
