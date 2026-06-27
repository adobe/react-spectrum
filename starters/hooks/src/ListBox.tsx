'use client';
import {mergeProps} from 'react-aria/mergeProps';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useListBox, useOption, type AriaListBoxOptions} from 'react-aria/useListBox';
import {useListState, type ListProps, type ListState} from 'react-stately/useListState';
import type {Node} from '@react-types/shared';
import {useRef} from 'react';
import './ListBox.css';

export function ListBox(props: AriaListBoxOptions<object> & ListProps<object>) {
  let state = useListState(props);
  let ref = useRef<HTMLDivElement>(null);
  let {listBoxProps} = useListBox(props, state, ref);

  return (
    <div
      {...listBoxProps}
      ref={ref}
      className="react-aria-ListBox"
      data-layout="stack"
      data-orientation="vertical">
      {[...state.collection].map(item => (
        <Option key={item.key} item={item} state={state} />
      ))}
    </div>
  );
}

function Option({item, state}: {item: Node<object>; state: ListState<object>}) {
  let ref = useRef<HTMLDivElement>(null);
  let {optionProps, isSelected, isDisabled, isPressed} = useOption({key: item.key}, state, ref);
  let {focusProps, isFocusVisible} = useFocusRing();

  return (
    <div
      {...mergeProps(optionProps, focusProps)}
      ref={ref}
      className="react-aria-ListBoxItem"
      data-selected={isSelected || undefined}
      data-disabled={isDisabled || undefined}
      data-pressed={isPressed || undefined}
      data-focus-visible={isFocusVisible || undefined}>
      {item.rendered}
    </div>
  );
}
