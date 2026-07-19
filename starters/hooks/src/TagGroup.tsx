'use client';
import {mergeProps} from 'react-aria/mergeProps';
import {useTagGroup, useTag, type AriaTagGroupProps} from 'react-aria/useTagGroup';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useObjectRef} from 'react-aria/useObjectRef';
import {useListState, type ListProps, type ListState} from 'react-stately/useListState';
import {CollectionBuilder, createLeafComponent} from 'react-aria/CollectionBuilder';
import {Collection} from 'react-aria-components/Collection';
import {ItemNode} from 'react-aria/private/collections/BaseCollection';
import type {Collection as ICollection, Key, Node} from '@react-types/shared';
import {createContext, Fragment, useContext, useRef} from 'react';
import type {ForwardedRef, ReactNode} from 'react';
import {Button} from 'react-aria-components/TagGroup';
import {X} from 'lucide-react';
import './TagGroup.css';

let ListStateContext = createContext<ListState<object> | null>(null);

export interface TagProps {
  id?: Key;
  textValue?: string;
  children?: ReactNode;
}

export const Tag = createLeafComponent(
  ItemNode,
  function Tag(_props: TagProps, forwardedRef: ForwardedRef<HTMLDivElement>, item: Node<object>) {
    let state = useContext(ListStateContext)!;
    let ref = useObjectRef(forwardedRef);
    let {focusProps, isFocusVisible} = useFocusRing();
    let {
      rowProps,
      gridCellProps,
      removeButtonProps,
      allowsRemoving,
      isSelected,
      isDisabled,
      isPressed
    } = useTag({item}, state, ref);

    return (
      <div
        {...mergeProps(rowProps, focusProps)}
        ref={ref}
        className="react-aria-Tag button-base"
        data-selected={isSelected || undefined}
        data-disabled={isDisabled || undefined}
        data-pressed={isPressed || undefined}
        data-focus-visible={isFocusVisible || undefined}>
        <div {...gridCellProps} style={{display: 'contents'}}>
          {item.rendered}
          {allowsRemoving && (
            <Button {...removeButtonProps} slot="remove" className="remove-button">
              <X />
            </Button>
          )}
        </div>
      </div>
    );
  }
);

export function TagGroup(
  props: AriaTagGroupProps<object> & ListProps<object> & {label?: ReactNode}
) {
  return (
    <CollectionBuilder content={<Collection {...props} />}>
      {collection => <TagGroupInner {...props} collection={collection} />}
    </CollectionBuilder>
  );
}

function TagGroupInner({
  collection,
  ...props
}: AriaTagGroupProps<object> &
  Omit<ListProps<object>, 'children'> & {
    label?: ReactNode;
    collection: ICollection<Node<object>>;
  }) {
  let ref = useRef<HTMLDivElement>(null);
  let state = useListState({...props, collection, children: undefined});
  /*- begin highlight -*/
  let {gridProps, labelProps} = useTagGroup(props, state, ref);
  /*- end highlight -*/

  return (
    <div className="react-aria-TagGroup">
      {props.label && (
        <span {...labelProps} className="react-aria-Label">
          {props.label}
        </span>
      )}
      <div {...gridProps} ref={ref} className="react-aria-TagList">
        <ListStateContext.Provider value={state}>
          {[...state.collection].map(item => (
            <Fragment key={item.key}>{item.render!(item)}</Fragment>
          ))}
        </ListStateContext.Provider>
      </div>
    </div>
  );
}
