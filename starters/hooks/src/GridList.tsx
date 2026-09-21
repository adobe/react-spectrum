'use client';
import {mergeProps} from 'react-aria/mergeProps';
import {useGridList, useGridListItem, type AriaGridListProps} from 'react-aria/useGridList';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useObjectRef} from 'react-aria/useObjectRef';
import {useListState, type ListProps, type ListState} from 'react-stately/useListState';
import {CollectionBuilder, createLeafComponent} from 'react-aria/CollectionBuilder';
import {Collection} from 'react-aria-components/Collection';
import {ItemNode} from 'react-aria/private/collections/BaseCollection';
import type {Collection as ICollection, Key, Node} from '@react-types/shared';
import {createContext, Fragment, useContext, useRef} from 'react';
import type {ForwardedRef, ReactNode} from 'react';
import {Text} from 'react-aria-components/Text';
import {Checkbox} from './Checkbox';
import './Checkbox.css';
import './GridList.css';

export interface GridListItemProps {
  id?: Key;
  textValue?: string;
  children?: ReactNode;
}

let ListStateContext = createContext<ListState<object> | null>(null);

export const GridListItem = createLeafComponent(
  ItemNode,
  function GridListItem(
    _props: GridListItemProps,
    forwardedRef: ForwardedRef<HTMLDivElement>,
    item: Node<object>
  ) {
    let state = useContext(ListStateContext)!;
    let ref = useObjectRef(forwardedRef);
    let {rowProps, gridCellProps, isSelected, isDisabled, isPressed} = useGridListItem(
      {node: item},
      state,
      ref
    );
    let {isFocusVisible, focusProps} = useFocusRing();

    return (
      <div
        {...mergeProps(rowProps, focusProps)}
        ref={ref}
        className="react-aria-GridListItem"
        data-selected={isSelected || undefined}
        data-selection-mode={
          state.selectionManager.selectionMode === 'none'
            ? undefined
            : state.selectionManager.selectionMode
        }
        data-disabled={isDisabled || undefined}
        data-pressed={isPressed || undefined}
        data-focus-visible={isFocusVisible || undefined}>
        <div {...gridCellProps} style={{display: 'contents'}}>
          {state.selectionManager.selectionMode === 'multiple' &&
            state.selectionManager.selectionBehavior === 'toggle' && (
              <Checkbox
                aria-label={`Select ${item.textValue}`}
                isSelected={isSelected}
                isDisabled={isDisabled}
                onChange={() => state.selectionManager.toggleSelection(item.key)}
              />
            )}
          {item.rendered}
        </div>
      </div>
    );
  }
);

export type GridListProps = AriaGridListProps<object> &
  ListProps<object> & {
    layout?: 'grid' | 'stack';
    orientation?: 'horizontal' | 'vertical';
  };

export function GridList({layout = 'grid', orientation = 'vertical', ...props}: GridListProps) {
  return (
    <CollectionBuilder content={<Collection {...props} />}>
      {collection => (
        <GridListInner
          {...props}
          collection={collection}
          layout={layout}
          orientation={orientation}
        />
      )}
    </CollectionBuilder>
  );
}

function GridListInner({
  collection,
  layout,
  orientation,
  ...props
}: Omit<GridListProps, 'children'> & {collection: ICollection<Node<object>>}) {
  /*- begin highlight -*/
  let state = useListState({...props, collection, children: undefined});
  let ref = useRef<HTMLDivElement>(null);
  let {gridProps} = useGridList(props, state, ref);
  /*- end highlight -*/

  return (
    <div
      {...gridProps}
      ref={ref}
      className="react-aria-GridList"
      data-layout={layout}
      data-orientation={orientation}>
      <ListStateContext.Provider value={state}>
        {[...state.collection].map(item => (
          <Fragment key={item.key}>{item.render!(item)}</Fragment>
        ))}
      </ListStateContext.Provider>
    </div>
  );
}

export {Text};
