import {CollectionBase, Expandable, MultipleSelection} from '@react-types/shared';
import {CollectionBuilder, TreeCollection} from '@react-stately/collections';
import {Key, useMemo, useState} from 'react';
import {SelectionManager, useMultipleSelectionState} from '@react-stately/selection';
import {useControlledState} from '@react-stately/utils';

export interface TreeState<T> {
  tree: TreeCollection<T>,
  expandedKeys: Set<Key>,
  disabledKeys: Set<Key>,
  toggleKey: (key: Key) => void,
  selectionManager: SelectionManager
}

export function useTreeState<T>(props: CollectionBase<T> & Expandable & MultipleSelection): TreeState<T> {
  let [expandedKeys, setExpandedKeys] = useControlledState(
    props.expandedKeys ? new Set(props.expandedKeys) : undefined,
    props.defaultExpandedKeys ? new Set(props.defaultExpandedKeys) : new Set(),
    props.onExpandedChange
  );

  let selectionState = useMultipleSelectionState(props);

  let [disabledKeys] = useState(
    props.disabledKeys ? new Set(props.disabledKeys) : new Set<Key>()
  );

  let builder = useMemo(() => new CollectionBuilder<T>(props.itemKey), [props.itemKey]);
  let tree = useMemo(() => {
    let nodes = builder.build(props, (key) => ({
      isExpanded: expandedKeys.has(key),
      isSelected: selectionState.selectedKeys.has(key),
      isDisabled: disabledKeys.has(key),
      isFocused: key === selectionState.focusedKey
    }));

    return new TreeCollection(nodes);
  }, [builder, props, expandedKeys, selectionState.selectedKeys, selectionState.focusedKey, disabledKeys]);

  let onToggle = (key: Key) => {
    setExpandedKeys(expandedKeys => toggleKey(expandedKeys, key));
  };

  return {
    tree,
    expandedKeys,
    disabledKeys,
    toggleKey: onToggle,
    selectionManager: new SelectionManager(tree, selectionState)
  };
}

function toggleKey(set: Set<Key>, key: Key): Set<Key> {
  let res = new Set(set);
  if (res.has(key)) {
    res.delete(key);
  } else {
    res.add(key);
  }

  return res;
}
