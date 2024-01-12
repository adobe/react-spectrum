/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaGridListProps, FocusScope,  mergeProps, useFocusRing, useGridList, useGridListItem, useHover} from 'react-aria';
import {BaseCollection, Collection, CollectionProps, ItemRenderProps, useCachedChildren, useCollection, useSSRCollectionNode} from './Collection';
import {Collection as CollectionType, ListState, Node, SelectionBehavior, useListState} from 'react-stately';
import {ContextValue, forwardRefType, Provider, RenderProps, ScrollableProps, SlotProps, StyleRenderProps, useContextProps, useRenderProps} from './utils';
import {filterDOMProps, useObjectRef} from '@react-aria/utils';
import {Key, LinkDOMProps} from '@react-types/shared';
import {ListStateContext} from './ListBox';
import React, {createContext, ForwardedRef, forwardRef, HTMLAttributes, JSX, ReactNode, RefObject, useContext, useEffect} from 'react';
import {TextContext} from './Text';

// TODO: Figure out what we want in this. It should be like useTreeGridState perhaps where we
// generate a flattened collection which is all the expanded/visible tree rows. The nodes themselves should have
// the proper parent - child information along with what level and position in set it is. When a row is expanded the collection should update
// and return the new version of the flattened collection. I guess the fake DOM would reflect the fully expanded tree state so that we get the
// proper information per node.
// TODO: do we need columns? Just setup a single column automatically?
// Maybe fake the collection for now. See what GridList and Table's collections look like right now
class TreeCollection<T> extends BaseCollection<T> {
  // TODO: fill in
}

// TODO: all of below is just from GridList as scaffolding and renamed to Tree

export interface TreeRenderProps {
}

// TODO: double check these props, get rid of AriaGridListProps later
export interface TreeProps<T> extends Omit<AriaGridListProps<T>, 'children'>, CollectionProps<T>, StyleRenderProps<TreeRenderProps>, SlotProps, ScrollableProps<HTMLDivElement> {
  /** How multiple selection should behave in the collection. */
  selectionBehavior?: SelectionBehavior,
  /** Provides content to display when there are no items in the list. */
  renderEmptyState?: (props: TreeRenderProps) => ReactNode
}


export const TreeContext = createContext<ContextValue<TreeProps<any>, HTMLDivElement>>(null);
const RenderFuncContext = createContext<{renderFunc:(item: any) => React.ReactNode}>({renderFunc: null});

function Tree<T extends object>(props: TreeProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  // Render the portal first so that we have the collection by the time we render the DOM in SSR.
  [props, ref] = useContextProps(props, ref, TreeContext);
  let {collection, portal} = useCollection(props);
  return (
    <>
      {/* TODO: is this the proper way we want to pass the renderFunc from  */}
      <RenderFuncContext.Provider value={{renderFunc: typeof props.children === 'function' ? props.children : null}}>
        {portal}
      </RenderFuncContext.Provider>
      <TreeInner props={props} collection={collection} treeRef={ref} />
    </>
  );
}

interface TreeInnerProps<T extends object> {
  props: TreeProps<T>,
  collection: CollectionType<Node<T>>,
  treeRef: RefObject<HTMLDivElement>
}

function TreeInner<T extends object>({props, collection, treeRef: ref}: TreeInnerProps<T>) {
  console.log('collection', collection)
  // TODO: call useTreeState, but may need to modify it so that it has some of the same stuff as useTreeGridState?
  // Don't think I need a layout since this is non virtualized, will get a keyboard delegate from useGrid
  let state = useListState({
    ...props,
    collection,
    children: undefined
  });

  // TODO: replace with useGrid, will need to update useGrid to have treegrid specific things
  let {gridProps} = useGridList(props, state, ref);

  let children = useCachedChildren({
    // TODO: this would the flatted rows from the collection
    items: collection,
    children: (item: Node<T>) => {
      switch (item.type) {
        case 'item':
          return <TreeRow item={item} />;
        default:
          throw new Error('Unsupported node type in Tree: ' + item.type);
      }
    }
  });

  let {focusProps, isFocused, isFocusVisible} = useFocusRing();
  let renderValues = {
    isEmpty: state.collection.size === 0,
    isFocused,
    isFocusVisible,
    state
  };

  // TODO: double check what other render props should exist
  let renderProps = useRenderProps({
    className: props.className,
    style: props.style,
    defaultClassName: 'react-aria-Tree',
    values: renderValues
  });


  // TODO: empty state for a empty tree?
  let emptyState: ReactNode = null;
  let emptyStatePropOverrides: HTMLAttributes<HTMLElement> | null = null;
  if (state.collection.size === 0 && props.renderEmptyState) {
    let content = props.renderEmptyState(renderValues);
    emptyState = (
      <div role="row" style={{display: 'contents'}}>
        <div role="gridcell" style={{display: 'contents'}}>
          {content}
        </div>
      </div>
    );
  }

  return (
    <FocusScope>
      <div
        {...filterDOMProps(props)}
        {...renderProps}
        {...mergeProps(gridProps, focusProps, emptyStatePropOverrides)}
        ref={ref}
        slot={props.slot || undefined}
        onScroll={props.onScroll}
        data-empty={state.collection.size === 0 || undefined}
        data-focused={isFocused || undefined}
        data-focus-visible={isFocusVisible || undefined}>
        <Provider
          values={[
            [ListStateContext, state]
          ]}>
          {children}
        </Provider>
        {emptyState}
      </div>
    </FocusScope>
  );
}

/**
 * A tree provides users with a way to navigate nested hierarchical information, with support for keyboard navigation
 * and selection.
 */
const _Tree = /*#__PURE__*/ (forwardRef as forwardRefType)(Tree);
export {_Tree as Tree};

export interface TreeItemRenderProps extends ItemRenderProps {
  // Whether the Tree row is expanded.
  isExpanded: boolean
}

// TODO: will it need to support LinkProps?
export interface TreeItemProps<T = object> extends RenderProps<TreeItemRenderProps> {
  /** The unique id of the item. */
  id?: Key,
  /** The object value that this item represents. When using dynamic collections, this is set automatically. */
  value?: T,
  /** A string representation of the item's contents, used for features like typeahead. */
  textValue?: string,
  /** An accessibility label for this item. */
  'aria-label'?: string,
  // TODO: support child item, will need to figure out how to render that in the fake dom
  childItems?: Iterable<T>
}

// TODO TreeItem here would need to know how to render nested TreeItems based off of its children (aka static) or for the dynamic case (check childItems existance and reuse the render func provided to Tree)
function TreeItem<T extends object>(props: TreeItemProps<T>, ref: ForwardedRef<HTMLDivElement>): JSX.Element | null {
  let {childItems, children} = props;
  let {renderFunc} = useContext(RenderFuncContext);
  // TODO: what is the best way to create the nested children? Do I use useCachedChildren (feels like that is only for the inner components)?
  // What about Collecton?
  // let nestedChildren;
  // if (childItems && props) {
  //   nestedChildren = [];
  //   for (let item of childItems) {
  //     nestedChildren.push(renderFunc(item));
  //   }
  // }
  // let nestedChildren = useCachedChildren({
  //   items: childItems,
  //   children: (item) => renderFunc(item)
  // });

  let nestedChildren;
  if (childItems) {
    // TODO: the assumption here is that either the Tree was passed a render function aka dynamic case
    nestedChildren = (
      <Collection items={childItems}>
        {renderFunc}
      </Collection>
    );
  }

  return useSSRCollectionNode('item', props, ref, children, nestedChildren);
}

/**
 * A TreeItem represents an individual item in a Tree.
 */
const _TreeItem = /*#__PURE__*/ (forwardRef as forwardRefType)(TreeItem);
export {_TreeItem as TreeItem};

// TODO: I think TreeRow wouldn't need any useCachedChildren or anything since it should theoretically used the flattened structure
// Probably would just render the children? Will need to see what item has in its .rendered
function TreeRow({item}) {
  let state = useContext(ListStateContext)!;
  let ref = useObjectRef<HTMLDivElement>(item.props.ref);
  // TODO replace with useGridRow perhaps. Wonder if I could use something like useGridListItem instead since it is technically a
  // single column single cell setup. Double check what differences between useGridListItem and useGridRow/useGridCell exist
  // since that might affect it (I think there used to be some weirdness with single column useGridRow).
  let {rowProps, gridCellProps, descriptionProps, ...states} = useGridListItem(
    {
      node: item
    },
    state,
    ref
  );

  let {hoverProps, isHovered} = useHover({
    isDisabled: !states.allowsSelection && !states.hasAction
  });

  let {isFocusVisible, focusProps} = useFocusRing();

  let props: TreeItemProps<unknown> = item.props;
  let renderProps = useRenderProps({
    ...props,
    id: undefined,
    children: item.rendered,
    defaultClassName: 'react-aria-TreeItem',
    values: {
      ...states,
      isHovered,
      isFocusVisible,
      // TODO: grab expanded rows from tree state
      isExpanded: true,
      selectionMode: state.selectionManager.selectionMode,
      selectionBehavior: state.selectionManager.selectionBehavior
    }
  });


  useEffect(() => {
    if (!item.textValue) {
      console.warn('A `textValue` prop is required for <TreeItem> elements with non-plain text children in order to support accessibility features such as type to select.');
    }
  }, [item.textValue]);

  return (
    <>
      <div
        {...mergeProps(filterDOMProps(props as any), rowProps, focusProps, hoverProps)}
        {...renderProps}
        ref={ref}
        data-selected={states.isSelected || undefined}
        data-disabled={states.isDisabled || undefined}
        data-hovered={isHovered || undefined}
        data-focused={states.isFocused || undefined}
        data-focus-visible={isFocusVisible || undefined}
        data-pressed={states.isPressed || undefined}
        data-selection-mode={state.selectionManager.selectionMode === 'none' ? undefined : state.selectionManager.selectionMode}>
        <div {...gridCellProps} style={{display: 'contents'}}>
          <Provider
            values={[
              [TextContext, {
                slots: {
                  description: descriptionProps
                }
              }]
            ]}>
            {renderProps.children}
          </Provider>
        </div>
      </div>
    </>
  );
}
