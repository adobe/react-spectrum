'use client';
import {mergeProps} from 'react-aria/mergeProps';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useListBox, useOption, type AriaListBoxOptions} from 'react-aria/useListBox';
import {useListState, type ListProps, type ListState} from 'react-stately/useListState';
import {CollectionBuilder, createLeafComponent} from 'react-aria/CollectionBuilder';
import {Collection} from 'react-aria-components/Collection';
import {ItemNode} from 'react-aria/private/collections/BaseCollection';
import type {Collection as ICollection, Node} from '@react-types/shared';
import {useRef} from 'react';
import type {ReactNode} from 'react';
import './ListBox.css';

export interface ListBoxItemProps {
  id?: string;
  textValue?: string;
  children?: ReactNode;
}

export const ListBoxItem = createLeafComponent(
  ItemNode,
  function ListBoxItem(_props: ListBoxItemProps) {
    return null;
  }
);

export function ListBox(props: AriaListBoxOptions<object> & ListProps<object>) {
  return (
    <CollectionBuilder content={<Collection>{props.children}</Collection>}>
      {collection => <ListBoxInner {...props} collection={collection} />}
    </CollectionBuilder>
  );
}

function ListBoxInner({
  collection,
  ...props
}: AriaListBoxOptions<object> &
  Omit<ListProps<object>, 'children'> & {collection: ICollection<Node<object>>}) {
  /*- begin highlight -*/
  let state = useListState({...props, collection, children: undefined});
  let ref = useRef<HTMLDivElement>(null);
  let {listBoxProps} = useListBox(props, state, ref);
  /*- end highlight -*/

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
