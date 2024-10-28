import {classNames} from '@react-spectrum/utils';
import dndStyles from './dnd.css';
import {mergeProps} from '@react-aria/utils';
import React from 'react';
import {useDraggableCollection, useDraggableItem} from '@react-aria/dnd';
import {useDraggableCollectionState} from '@react-stately/dnd';
import {useFocusRing} from '@react-aria/focus';
import {useListBox, useOption} from '@react-aria/listbox';
import {useListState} from '@react-stately/list';

export function DraggableListBox(props) {
  let state = useListState(props);
  let ref = React.useRef<HTMLUListElement | null>(null);
  let {listBoxProps} = useListBox(
    {
      ...props,
      shouldSelectOnPressUp: true
    },
    state,
    ref
  );

  let dragState = useDraggableCollectionState({
    ...props,
    collection: state.collection,
    selectionManager: state.selectionManager,
    getItems: props.getItems || ((keys) => (
      [...keys].map((key) => {
        let item = state.collection.getItem(key);
        if (!item) {
          return null;
        }

        return {
          'text/plain': item.textValue
        };
      })
    ))
  });
  useDraggableCollection({}, dragState, ref);

  return (
    <ul {...listBoxProps} ref={ref} className={dndStyles['draggable-listbox']} aria-label="example draggable listbox">
      {[...state.collection].map((item) => (
        <Option
          key={item.key}
          item={item}
          state={state}
          dragState={dragState} />
      ))}
    </ul>
  );
}

function Option({item, state, dragState}) {
  let ref = React.useRef<HTMLLIElement | null>(null);
  let {optionProps, isPressed, hasAction} = useOption(
    {key: item.key},
    state,
    ref
  );
  let {isFocusVisible, focusProps} = useFocusRing();

  let {dragProps} = useDraggableItem({
    key: item.key,
    hasAction
  }, dragState);

  return (
    <li
      {...mergeProps(dragProps, optionProps, focusProps)}
      ref={ref}
      className={classNames(dndStyles, 'option', {'focus-visible': isFocusVisible, 'pressed': isPressed})}>
      {item.rendered}
    </li>
  );
}
