import {
  AsyncLoadable,
  CollectionBase,
  MultipleSelection,
  Node,
  SelectionBehavior
} from '@react-types/shared';
import {ListState, useListState} from '@react-stately/list';
import React, {useRef} from 'react';
import {useSelectableItem, useSelectableList} from '@react-aria-nutrient/selection';

function ListItem<T>({item, state}: {item: Node<T>, state: ListState<T>}) {
  const ref = useRef(null);
  const {itemProps} = useSelectableItem({
    key: item.key,
    ref,
    selectionManager: state.selectionManager
  });
  const selected = state.selectionManager.isSelected(item.key);
  return (
    <li
      role="option"
      ref={ref}
      {...itemProps}
      style={{
        background: selected ? 'dodgerblue' : undefined,
        color: selected ? '#fff' : undefined
      }}
      aria-selected={selected ? 'true' : undefined}>
      {item.rendered}
    </li>
  );
}

export function List<T extends object>(props: ListProps<T>) {
  const ref = useRef<HTMLUListElement>(null);
  const state = useListState(props);
  const {listProps} = useSelectableList({
    ...props,
    selectionManager: state.selectionManager,
    collection: state.collection,
    disabledKeys: state.disabledKeys,
    selectOnFocus: true,
    ref
  });

  return (
    <ul ref={ref} {...listProps} role="listbox" aria-label={props['aria-label'] ?? 'test listbox'}>
      {[...state.collection].map((item) => (
        <ListItem key={item.key} item={item} state={state} />
      ))}
    </ul>
  );
}

export interface ListProps<T>
  extends CollectionBase<T>,
    AsyncLoadable,
    MultipleSelection {
      selectionBehavior?: SelectionBehavior
    }
