import {CollectionBase, Expandable, MultipleSelection} from '@react-types/shared';
import {CollectionBuilder, Node, Tree} from '@react-stately/collections';
import {Key, useMemo} from 'react';
import {useControlledState} from '@react-stately/utils';

export function useTreeViewState<T>(props: CollectionBase<T> & Expandable & MultipleSelection) {
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
  }, [builder, props, expandedKeys, selectedKeys]);

  let onToggle = (item: Node<T>) => {
    setExpandedKeys(expandedKeys => toggleKey(expandedKeys, item.key));
  };

  let onSelectToggle = (item: Node<T>) => {
    setSelectedKeys(selectedKeys => toggleKey(selectedKeys, item.key));
  };

  return {
    tree,
    expandedKeys,
    selectedKeys,
    onToggle,
    onSelectToggle // TODO: replace with general selection hook
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
