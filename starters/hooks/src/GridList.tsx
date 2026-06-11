'use client';
import {mergeProps} from 'react-aria/mergeProps';
import {useGridList, useGridListItem, type AriaGridListProps} from 'react-aria/useGridList';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useListState, type ListProps, type ListState} from 'react-stately/useListState';
import type {Node} from '@react-types/shared';
import {useRef} from 'react';
import './GridList.css';

export function GridList(props: AriaGridListProps<object> & ListProps<object>) {
  let state = useListState(props);
  let ref = useRef<HTMLUListElement>(null);
  let {gridProps} = useGridList(props, state, ref);

  return (
    <ul
      {...gridProps}
      ref={ref}
      style={{
        padding: 0,
        margin: 0,
        listStyle: 'none',
        width: 280,
        border: '1px solid var(--gray-300)',
        borderRadius: 8,
        overflow: 'hidden',
        color: 'var(--text-color)'
      }}>
      {[...state.collection].map(item => (
        <ListItem key={item.key} item={item} state={state} />
      ))}
    </ul>
  );
}

function ListItem({item, state}: {item: Node<object>; state: ListState<object>}) {
  let ref = useRef<HTMLLIElement>(null);
  let {rowProps, gridCellProps} = useGridListItem({node: item}, state, ref);
  let {isFocusVisible, focusProps} = useFocusRing();
  let isSelected = state.selectionManager.isSelected(item.key);

  return (
    <li
      {...mergeProps(rowProps, focusProps)}
      ref={ref}
      style={{
        cursor: 'default',
        background: isSelected ? 'var(--highlight-background)' : 'transparent',
        color: isSelected ? 'var(--highlight-foreground)' : 'var(--text-color)',
        outline: isFocusVisible ? '2px solid var(--focus-ring-color)' : 'none',
        outlineOffset: -2
      }}>
      <div
        {...gridCellProps}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          padding: '8px 12px'
        }}>
        {item.rendered}
      </div>
    </li>
  );
}
