import {CollectionBase, Expandable, MultipleSelection} from '@react-types/shared';
import {CollectionBuilder, Node, TreeCollection} from '@react-stately/collections';
import {Key, useMemo, useState} from 'react';
import {useControlledState} from '@react-stately/utils';

export function useTreeState<T>(props: CollectionBase<T> & Expandable & MultipleSelection) {
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

  let [disabledKeys] = useState(
    props.disabledKeys ? new Set(props.disabledKeys) : new Set()
  );

  let builder = useMemo(() => new CollectionBuilder<T>(props.itemKey), [props.itemKey]);
  let tree = useMemo(() => {
    let nodes = builder.build(props, (key, item) => ({
      isExpanded: expandedKeys.has(key) || (item && item.props && item.props.isExpanded),
      isSelected: selectedKeys.has(key) || (item && item.props && item.props.isSelected),
      isDisabled: disabledKeys.has(key) || (item && item.props && item.props.isDisabled)
    }));

    return new TreeCollection(nodes);
  }, [builder, props, expandedKeys, selectedKeys, disabledKeys]);

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
    disabledKeys,
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
