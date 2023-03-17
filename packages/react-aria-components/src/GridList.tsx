/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {AriaGridListProps, mergeProps, useFocusRing, useGridList, useGridListItem, useGridListSelectionCheckbox, useHover} from 'react-aria';
import {CheckboxContext} from './Checkbox';
import {CollectionProps, ItemProps, useCachedChildren, useCollection} from './Collection';
import {ContextValue, forwardRefType, Provider, SlotProps, StyleProps, useContextProps, useRenderProps} from './utils';
import {filterDOMProps} from '@react-aria/utils';
import {ListState, Node, SelectionBehavior, useListState} from 'react-stately';
import React, {createContext, ForwardedRef, forwardRef, useContext} from 'react';
import {TextContext} from './Text';

export interface GridListProps<T> extends Omit<AriaGridListProps<T>, 'children'>, CollectionProps<T>, StyleProps, SlotProps {
  /** How multiple selection should behave in the collection. */
  selectionBehavior?: SelectionBehavior
}

export const GridListContext = createContext<ContextValue<GridListProps<any>, HTMLUListElement>>(null);
const InternalGridListContext = createContext<ListState<unknown>>(null);

function GridList<T extends object>(props: GridListProps<T>, ref: ForwardedRef<HTMLUListElement>) {
  [props, ref] = useContextProps(props, ref, GridListContext);
  let {portal, collection} = useCollection(props);
  let state = useListState({
    ...props,
    collection,
    children: null
  });

  let {gridProps} = useGridList(props, state, ref);

  let children = useCachedChildren({
    items: collection,
    children: (item: Node<T>) => {
      switch (item.type) {
        case 'item':
          return <GridListItem item={item} />;
        default:
          throw new Error('Unsupported node type in GridList: ' + item.type);
      }
    }
  });

  return (
    <ul
      {...filterDOMProps(props)}
      {...gridProps}
      ref={ref}
      slot={props.slot}
      style={props.style}
      className={props.className ?? 'react-aria-GridList'}>
      <InternalGridListContext.Provider value={state}>
        {children}
      </InternalGridListContext.Provider>
      {portal}
    </ul>
  );
}

/**
 * A grid list displays a list of interactive items, with support for keyboard navigation,
 * single or multiple selection, and row actions.
 */
const _GridList = (forwardRef as forwardRefType)(GridList);
export {_GridList as GridList};

function GridListItem({item}) {
  let state = useContext(InternalGridListContext);
  let ref = React.useRef();
  let {rowProps, gridCellProps, descriptionProps, ...states} = useGridListItem(
    {node: item},
    state,
    ref
  );

  let {hoverProps, isHovered} = useHover({
    isDisabled: !states.allowsSelection && !states.hasAction
  });

  let {isFocusVisible, focusProps} = useFocusRing();
  let {checkboxProps} = useGridListSelectionCheckbox(
    {key: item.key},
    state
  );

  let props: ItemProps<unknown> = item.props;
  let renderProps = useRenderProps({
    ...props,
    id: undefined,
    children: item.rendered,
    defaultClassName: 'react-aria-Item',
    values: {
      ...states,
      isHovered,
      isFocusVisible,
      selectionMode: state.selectionManager.selectionMode,
      selectionBehavior: state.selectionManager.selectionBehavior
    }
  });

  return (
    <li
      {...mergeProps(rowProps, focusProps, hoverProps)}
      {...renderProps}
      ref={ref}
      data-hovered={isHovered || undefined}
      data-focused={states.isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-pressed={states.isPressed || undefined}>
      {/* TODO: hard to style this element... */}
      <div {...gridCellProps}>
        <Provider
          values={[
            [CheckboxContext, {
              slots: {
                selection: checkboxProps
              }
            }],
            [TextContext, {
              slots: {
                description: descriptionProps
              }
            }]
          ]}>
          {renderProps.children}
        </Provider>
      </div>
    </li>
  );
}
