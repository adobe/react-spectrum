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

import {AriaTreeGridListProps, useTreeGridList, useTreeGridListItem} from '@react-aria/tree';
import {BaseCollection, CollectionProps, CollectionRendererContext, ItemRenderProps, NodeValue, useCachedChildren, useCollection, useCollectionChildren, useShallowRender, useSSRCollectionNode} from './Collection';
import {ContextValue, forwardRefType, Provider, RenderProps, ScrollableProps, SlotProps, StyleRenderProps, useContextProps, useRenderProps} from './utils';
import {Expandable, Key} from '@react-types/shared';
import {filterDOMProps, useObjectRef} from '@react-aria/utils';
import {FocusScope,  mergeProps, useFocusRing, useHover} from 'react-aria';
import {Collection as ICollection, Node, SelectionBehavior, TreeState, useTreeState} from 'react-stately';
import React, {createContext, ForwardedRef, forwardRef, HTMLAttributes, JSX, ReactElement, ReactNode, RefObject, useContext, useEffect, useMemo, useRef} from 'react';
import {TextContext} from './Text';
import {useControlledState} from '@react-stately/utils';

class TreeCollection<T> implements ICollection<Node<T>> {
  private flattenedRows: Node<T>[];
  private keyMap: Map<Key, NodeValue<T>> = new Map();

  constructor(opts) {
    let {collection, expandedKeys} = opts;
    let {flattenedRows, keyMap} = flattenTree<T>(collection, {expandedKeys});
    this.flattenedRows = flattenedRows;
    // Use generated keyMap because it contains the modified collection nodes (aka it adjusts the indexes so that they ignore the existence of the Content items)
    this.keyMap = keyMap;
  }

  // TODO: should this collection's getters reflect the flattened structure or the original structure
  // If we respresent the flattened structure, it is easier for the keyboard nav but harder to find all the nodes
  *[Symbol.iterator]() {
    yield* this.flattenedRows;
  }

  get size() {
    return this.flattenedRows.length;
  }

  getKeys() {
    return this.keyMap.keys();
  }

  getItem(key: Key) {
    return this.keyMap.get(key);
  }

  at(idx: number) {
    return this.flattenedRows[idx];
  }

  getFirstKey() {
    return this.flattenedRows[0]?.key;
  }

  getLastKey() {
    return this.flattenedRows[this.size - 1]?.key;
  }

  getKeyAfter(key: Key) {
    let index = this.flattenedRows.findIndex(row => row.key === key);
    return this.flattenedRows[index + 1]?.key;
  }

  getKeyBefore(key: Key) {
    let index = this.flattenedRows.findIndex(row => row.key === key);
    return this.flattenedRows[index - 1]?.key;
  }

  // Note that this will return Content nodes in addition to nested TreeItems
  getChildren(key: Key): Iterable<Node<T>> {
    let keyMap = this.keyMap;
    return {
      *[Symbol.iterator]() {
        let parent = keyMap.get(key);
        let node = parent?.firstChildKey != null ? keyMap.get(parent.firstChildKey) : null;
        while (node) {
          yield node as Node<T>;
          node = node.nextKey != null ? keyMap.get(node.nextKey) : undefined;
        }
      }
    };
  }

  getTextValue(key: Key): string {
    let item = this.getItem(key);
    return item ? item.textValue : '';
  }
}

// TODO what TreeRenderProps do we want?
// isEmpty
// isFocused,
// isFocusVisible,
// state
export interface TreeRenderProps {
}

// TODO: double check these props
export interface TreeProps<T> extends Omit<AriaTreeGridListProps<T>, 'children'>, CollectionProps<T>, StyleRenderProps<TreeRenderProps>, SlotProps, ScrollableProps<HTMLDivElement>, Expandable {
  /** How multiple selection should behave in the collection. */
  selectionBehavior?: SelectionBehavior,
  /** Provides content to display when there are no items in the list. */
  renderEmptyState?: (props: TreeRenderProps) => ReactNode
}


export const TreeContext = createContext<ContextValue<TreeProps<any>, HTMLDivElement>>(null);
export const TreeStateContext = createContext<TreeState<any> | null>(null);

function Tree<T extends object>(props: TreeProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  // Render the portal first so that we have the collection by the time we render the DOM in SSR.
  [props, ref] = useContextProps(props, ref, TreeContext);
  let {collection, portal} = useCollection(props);

  return (
    <>
      {portal}
      <TreeInner props={props} collection={collection} treeRef={ref} />
    </>
  );
}

interface TreeInnerProps<T extends object> {
  props: TreeProps<T>,
  collection: BaseCollection<T>,
  treeRef: RefObject<HTMLDivElement>
}

function TreeInner<T extends object>({props, collection, treeRef: ref}: TreeInnerProps<T>) {
  let {
    selectionMode = 'none',
    expandedKeys: propExpandedKeys,
    defaultExpandedKeys: propDefaultExpandedKeys,
    onExpandedChange
  } = props;

  // Kinda annoying that we have to replicate this code here as well as in useTreeState, but don't want to add
  // flattenCollection stuff to useTreeState. Think about this later
  let [expandedKeys, setExpandedKeys] = useControlledState(
    propExpandedKeys ? convertExpanded(propExpandedKeys) : undefined,
    propDefaultExpandedKeys ? convertExpanded(propDefaultExpandedKeys) : new Set(),
    onExpandedChange
  );

  let flattenedCollection = useMemo(() => {
    return new TreeCollection<object>({collection, expandedKeys});
  }, [collection, expandedKeys]);

  let state = useTreeState({
    ...props,
    selectionMode,
    expandedKeys,
    onExpandedChange: setExpandedKeys,
    collection: flattenedCollection,
    children: undefined
  });

  let {gridProps} = useTreeGridList(props, state, ref);

  let children = useCachedChildren({
    items: state.collection,
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


  // TODO: empty state for a empty tree? will need the proper aria props to reflect like in Tableveiw
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
            [TreeStateContext, state]
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
export interface TreeItemProps<T = object> extends StyleRenderProps<TreeItemRenderProps> {
  /** The unique id of the item. */
  id?: Key,
  /** The object value that this item represents. When using dynamic collections, this is set automatically. */
  value?: T,
  /** A string representation of the item's contents, used for features like typeahead. */
  textValue?: string,
  /** An accessibility label for this item. */
  'aria-label'?: string,
  // TODO: support child item, will need to figure out how to render that in the fake dom
  childItems?: Iterable<T>,
  /** The content of the tree row along with any nested children. Supports static items or a function for dynamic rendering. */
  children?: ReactNode | ((item: T) => ReactElement)
}

function TreeItem<T extends object>(props: TreeItemProps<T>, ref: ForwardedRef<HTMLDivElement>): JSX.Element | null {
  let {childItems} = props;
  let render = useContext(CollectionRendererContext);
  let childRows: ReactNode | ((item: T) => ReactNode);
  let rowContent: ReactNode;

  if (typeof render === 'function') {
    childRows = render;
    // Assumption here is that props.children[0] is Content
    rowContent = props.children[0];
  } else if (typeof props.children !== 'function') {
    childRows = props.children;
  }

  let children = useCollectionChildren({
    children: childRows,
    items: childItems
  });

  // Combine the renderChildren and children so both Content and nested TreeItems are properly added to fake DOM and thus added to the built collection
  return useSSRCollectionNode('item', props, ref, null, [rowContent, children]);
}

/**
 * A TreeItem represents an individual item in a Tree.
 */
const _TreeItem = /*#__PURE__*/ (forwardRef as forwardRefType)(TreeItem);
export {_TreeItem as TreeItem};

export interface TreeItemContentRenderProps extends ItemRenderProps {
  // Whether the Tree row is expanded.
  isExpanded: boolean
}

// The TreeItemContent is the one that accepts RenderProps because we would get much more complicated logic in TreeItem otherwise since we'd
// need to do a bunch of check to figure out what is the Content and what are the actual collection elements
export interface TreeItemContentProps extends Pick<RenderProps<TreeItemContentRenderProps>, 'children'> {}

// TODO does this need ref or context? Its only used to shallowly render the Content node... If it was a more generic collection component then I could see an argument for it
// having those
function TreeItemContent(props: TreeItemContentProps) {
  let ref = useRef(null);
  let shallow = useShallowRender('content', props, ref);
  if (shallow) {
    return shallow;
  }
}

const _TreeItemContent = forwardRef(TreeItemContent);
export {_TreeItemContent as TreeItemContent};

function TreeRow({item}) {
  let state = useContext(TreeStateContext)!;
  let ref = useObjectRef<HTMLDivElement>(item.props.ref);
  // TODO replace with useTreeListItem
  // Also depending on the item's information with index/level, we may need to add +1 to various attributes
  let {rowProps, gridCellProps, descriptionProps, ...states} = useTreeGridListItem(
    {
      node: item
    },
    state,
    ref
  );

  // TODO: vet all this other copy pastaed code
  // TODO: does this need onAction check?
  let {hoverProps, isHovered} = useHover({
    isDisabled: !states.allowsSelection
  });

  let {isFocusVisible, focusProps} = useFocusRing();
  let props: TreeItemProps<unknown> = item.props;
  let renderPropValues = React.useMemo(() => ({
    ...states,
    isHovered,
    isFocusVisible,
    // TODO: update the collection post processing to change item.hasChildNodes to false if the amount of children is less than 2 (aka an item doesn't have a nested row and only has content)
    // Maybe can walk through the types of children instead and check if any of the children is of type "item"
    isExpanded: [...state.collection.getChildren(item.key)].length > 1 ? state.expandedKeys === 'all' || state.expandedKeys.has(item.key) : undefined,
    selectionMode: state.selectionManager.selectionMode,
    selectionBehavior: state.selectionManager.selectionBehavior
  }), [states, isHovered, isFocusVisible, state.selectionManager, state.expandedKeys, state.collection, item.key]);

  let renderProps = useRenderProps({
    ...props,
    id: undefined,
    children: item.rendered,
    defaultClassName: 'react-aria-TreeItem',
    values: renderPropValues
  });

  useEffect(() => {
    if (!item.textValue) {
      console.warn('A `textValue` prop is required for <TreeItem> elements with non-plain text children in order to support accessibility features such as type to select.');
    }
  }, [item.textValue]);

  let children = useCachedChildren({
    items: state.collection.getChildren!(item.key),
    children: item => {
      switch (item.type) {
        case 'content': {
          return <TreeRowContent values={renderPropValues} item={item} />;
        }
        // Skip item since we don't render the nested rows as children of the parent row, the flattened collection
        // will render them each as siblings instead
        case 'item':
          return <></>;
        default:
          throw new Error('Unsupported element type in TreeRow: ' + item.type);
      }
    },
    // TODO: double check if this is the best way to go about making sure TreeRowContent's render props is always up to date
    dependencies: [renderPropValues]
  });

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
                //  TODO: update, will need to pass an id for aria-labelledy?
                slots: {
                  title: descriptionProps
                }
              }]
            ]}>
            {children}
          </Provider>
        </div>
      </div>
    </>
  );
}

// This is separate from TreeItemContent since it needs to call useRenderProps
function TreeRowContent({item, values}) {
  let renderProps = useRenderProps({
    children: item.rendered,
    values
  });
  return renderProps.children;
}

function convertExpanded(expanded: 'all' | Iterable<Key>): 'all' | Set<Key> {
  if (!expanded) {
    return new Set<Key>();
  }

  return expanded === 'all'
    ? 'all'
    : new Set(expanded);
}
interface TreeGridCollectionOptions {
  expandedKeys: 'all' | Set<Key>
}

// TODO: update name when we decide how much post processing we want to do
interface FlattenedTree<T> {
  flattenedRows: Node<T>[],
  keyMap: Map<Key, NodeValue<T>>
}

// TODO: Do we really need to modify the index values of each of the item nodes? I'm doing this so that the aria hooks don't assume that the collection's structure
// has to be the RAC structure (aka it has Content Nodes and Row node and thus the index calculated for each row is offset by 1 due to the Content Node). Instead, I'm making the processed Tree structure here only
// have the tree rows and discarding the content items since they aren't needed for expanding/collapsing or for calculating the relevant aria attributes
// This feels like it falls more inline with the existing Tree Collection structure anyways
function flattenTree<T>(collection, opts: TreeGridCollectionOptions): FlattenedTree<T> {
  let {
    expandedKeys = new Set()
  } = opts;
  let keyMap = new Map();
  let flattenedRows = [];

  let visitNode = (node: Node<T>) => {
    if (node.type === 'item') {
      let parentKey = node?.parentKey;
      let clone = {...node};
      if (parentKey != null) {
        // TODO: assumes that non item content node will be always placed before the child rows and that there is only 1. If we can't make this assumption then we can filter out
        // every non-item per level and assign indicies based off the node's position in said filtered array
        let hasContentNode = [...collection.getChildren(parentKey)][0].type !== 'item';
        if (hasContentNode) {
          clone.index = node.index - 1;
          keyMap.set(clone.key, clone);
        }
      } else {
        keyMap.set(node.key, node);
      }

      if (node.level === 0 || (expandedKeys === 'all' && node.type === 'item') || (expandedKeys !== 'all' && expandedKeys.has(parentKey) && flattenedRows.find(row => row.key === parentKey))) {
        // Grab the modified node from the key map so our flattened list and modified key map point to the same nodes
        flattenedRows.push(keyMap.get(node.key));
      }
    } else if (node.type !== null) {
      keyMap.set(node.key, node);
    }

    for (let child of collection.getChildren(node.key)) {
      visitNode(child);
    }
  };

  for (let node of collection) {
    visitNode(node);
  }

  return {
    flattenedRows,
    keyMap
  };
}
