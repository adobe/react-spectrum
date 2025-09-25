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

import {AriaTreeItemOptions, AriaTreeProps, DraggableItemResult, DropIndicatorAria, DropIndicatorProps, DroppableCollectionResult, FocusScope, ListKeyboardDelegate, mergeProps, useCollator, useFocusRing,  useGridListSelectionCheckbox, useHover, useId, useLocale, useTree, useTreeItem, useVisuallyHidden} from 'react-aria';
import {ButtonContext} from './Button';
import {CheckboxContext} from './RSPContexts';
import {ChildrenOrFunction, ContextValue, DEFAULT_SLOT, Provider, RenderProps, SlotProps, StyleRenderProps, useContextProps, useRenderProps} from './utils';
import {Collection, CollectionBuilder, CollectionNode, createBranchComponent, createLeafComponent, LoaderNode, useCachedChildren} from '@react-aria/collections';
import {CollectionProps, CollectionRendererContext, DefaultCollectionRenderer, ItemRenderProps} from './Collection';
import {DisabledBehavior, DragPreviewRenderer, Expandable, forwardRefType, GlobalDOMAttributes, HoverEvents, Key, LinkDOMProps, MultipleSelection, PressEvents, RefObject, SelectionMode} from '@react-types/shared';
import {DragAndDropContext, DropIndicatorContext, useDndPersistedKeys, useRenderDropIndicator} from './DragAndDrop';
import {DragAndDropHooks} from './useDragAndDrop';
import {DraggableCollectionState, DroppableCollectionState, Collection as ICollection, Node, SelectionBehavior, TreeState, useTreeState} from 'react-stately';
import {filterDOMProps, inertValue, LoadMoreSentinelProps, useLoadMoreSentinel, useObjectRef} from '@react-aria/utils';
import React, {createContext, ForwardedRef, forwardRef, JSX, ReactNode, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {SelectionIndicatorContext} from './SelectionIndicator';
import {SharedElementTransition} from './SharedElementTransition';
import {TreeDropTargetDelegate} from './TreeDropTargetDelegate';
import {useControlledState} from '@react-stately/utils';

class TreeCollection<T> implements ICollection<Node<T>> {
  private flattenedRows: Node<T>[];
  private keyMap: Map<Key, CollectionNode<T>> = new Map();
  private itemCount: number = 0;

  constructor(opts) {
    let {collection, expandedKeys} = opts;
    let {flattenedRows, keyMap, itemCount} = flattenTree<T>(collection, {expandedKeys});
    this.flattenedRows = flattenedRows;
    // Use generated keyMap because it contains the modified collection nodes (aka it adjusts the indexes so that they ignore the existence of the Content items)
    this.keyMap = keyMap;
    this.itemCount = itemCount;
  }

  // TODO: should this collection's getters reflect the flattened structure or the original structure
  // If we respresent the flattened structure, it is easier for the keyboard nav but harder to find all the nodes
  *[Symbol.iterator]() {
    yield* this.flattenedRows;
  }

  get size() {
    return this.itemCount;
  }

  getKeys() {
    return this.keyMap.keys();
  }

  getItem(key: Key): Node<T> | null {
    return this.keyMap.get(key) || null;
  }

  at(idx: number) {
    return this.flattenedRows[idx];
  }

  getFirstKey() {
    return this.flattenedRows[0]?.key;
  }

  getLastKey() {
    return this.flattenedRows[this.flattenedRows.length - 1]?.key;
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

export interface TreeRenderProps {
  /**
   * Whether the tree has no items and should display its empty state.
   * @selector [data-empty]
   */
  isEmpty: boolean,
  /**
   * Whether the tree is currently focused.
   * @selector [data-focused]
   */
  isFocused: boolean,
  /**
   * Whether the tree is currently keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean,
  /**
   * The type of selection that is allowed in the collection.
   * @selector [data-selection-mode="single | multiple"]
   */
  selectionMode: SelectionMode,
  /**
   * Whether the tree allows dragging.
   * @selector [data-allows-dragging]
   */
  allowsDragging: boolean,
  /**
   * State of the tree.
   */
  state: TreeState<unknown>
}

export interface TreeEmptyStateRenderProps extends Omit<TreeRenderProps, 'isEmpty'> {}

export interface TreeProps<T> extends Omit<AriaTreeProps<T>, 'children'>, MultipleSelection, CollectionProps<T>, StyleRenderProps<TreeRenderProps>, SlotProps, Expandable, GlobalDOMAttributes<HTMLDivElement> {
  /**
   * How multiple selection should behave in the tree.
   * @default "toggle"
   */
  selectionBehavior?: SelectionBehavior,
  /** Provides content to display when there are no items in the list. */
  renderEmptyState?: (props: TreeEmptyStateRenderProps) => ReactNode,
  /**
   * Whether `disabledKeys` applies to all interactions, or only selection.
   * @default 'all'
   */
  disabledBehavior?: DisabledBehavior,
  /** The drag and drop hooks returned by `useDragAndDrop` used to enable drag and drop behavior for the Tree. */
  dragAndDropHooks?: DragAndDropHooks<NoInfer<T>>
}


export const TreeContext = createContext<ContextValue<TreeProps<any>, HTMLDivElement>>(null);
export const TreeStateContext = createContext<TreeState<any> | null>(null);

/**
 * A tree provides users with a way to navigate nested hierarchical information, with support for keyboard navigation
 * and selection.
 */
export const Tree = /*#__PURE__*/ (forwardRef as forwardRefType)(function Tree<T extends object>(props: TreeProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  // Render the portal first so that we have the collection by the time we render the DOM in SSR.
  [props, ref] = useContextProps(props, ref, TreeContext);

  return (
    <CollectionBuilder content={<Collection {...props} />}>
      {collection => <TreeInner props={props} collection={collection} treeRef={ref} />}
    </CollectionBuilder>
  );
});

const EXPANSION_KEYS = {
  'expand': {
    ltr: 'ArrowRight',
    rtl: 'ArrowLeft'
  },
  'collapse': {
    ltr: 'ArrowLeft',
    rtl: 'ArrowRight'
  }
};

interface TreeInnerProps<T extends object> {
  props: TreeProps<T>,
  collection: ICollection<unknown>,
  treeRef: RefObject<HTMLDivElement | null>
}

function TreeInner<T extends object>({props, collection, treeRef: ref}: TreeInnerProps<T>) {
  const {dragAndDropHooks} = props;
  let {direction} = useLocale();
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let hasDragHooks = !!dragAndDropHooks?.useDraggableCollectionState;
  let hasDropHooks = !!dragAndDropHooks?.useDroppableCollectionState;
  let dragHooksProvided = useRef(hasDragHooks);
  let dropHooksProvided = useRef(hasDropHooks);

  useEffect(() => {
    if (dragHooksProvided.current !== hasDragHooks) {
      console.warn('Drag hooks were provided during one render, but not another. This should be avoided as it may produce unexpected behavior.');
    }
    if (dropHooksProvided.current !== hasDropHooks) {
      console.warn('Drop hooks were provided during one render, but not another. This should be avoided as it may produce unexpected behavior.');
    }
  }, [hasDragHooks, hasDropHooks]);
  let {
    selectionMode = 'none',
    expandedKeys: propExpandedKeys,
    defaultExpandedKeys: propDefaultExpandedKeys,
    onExpandedChange,
    disabledBehavior = 'all'
  } = props;
  let {CollectionRoot, isVirtualized, layoutDelegate,  dropTargetDelegate: ctxDropTargetDelegate} = useContext(CollectionRendererContext);

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
    children: undefined,
    disabledBehavior
  });

  let {gridProps} = useTree({
    ...props,
    isVirtualized,
    layoutDelegate
  }, state, ref);

  let dragState: DraggableCollectionState | undefined = undefined;
  let dropState: DroppableCollectionState | undefined = undefined;
  let droppableCollection: DroppableCollectionResult | undefined = undefined;
  let isRootDropTarget = false;
  let dragPreview: JSX.Element | null = null;
  let preview = useRef<DragPreviewRenderer>(null);

  if (hasDragHooks && dragAndDropHooks) {
    dragState = dragAndDropHooks.useDraggableCollectionState!({
      collection: state.collection,
      selectionManager: state.selectionManager,
      preview: dragAndDropHooks.renderDragPreview ? preview : undefined
    });
    dragAndDropHooks.useDraggableCollection!({}, dragState, ref);

    let DragPreview = dragAndDropHooks.DragPreview!;
    dragPreview = dragAndDropHooks.renderDragPreview
      ? <DragPreview ref={preview}>{dragAndDropHooks.renderDragPreview}</DragPreview>
      : null;
  }

  let [treeDropTargetDelegate] = useState(() => new TreeDropTargetDelegate());
  if (hasDropHooks && dragAndDropHooks) {
    dropState = dragAndDropHooks.useDroppableCollectionState!({
      collection: state.collection,
      selectionManager: state.selectionManager
    });
    let dropTargetDelegate = dragAndDropHooks.dropTargetDelegate || ctxDropTargetDelegate || new dragAndDropHooks.ListDropTargetDelegate(state.collection, ref, {direction});
    treeDropTargetDelegate.setup(dropTargetDelegate, state, direction);

    let keyboardDelegate =
      new ListKeyboardDelegate({
        collection: state.collection,
        collator,
        ref,
        disabledKeys: state.selectionManager.disabledKeys,
        disabledBehavior: state.selectionManager.disabledBehavior,
        direction,
        layoutDelegate
      });
    droppableCollection = dragAndDropHooks.useDroppableCollection!(
      {
        keyboardDelegate,
        dropTargetDelegate: treeDropTargetDelegate,
        onDropActivate: (e) => {
          // Expand collapsed item when dragging over. For keyboard, allow collapsing.
          if (e.target.type === 'item') {
            let key = e.target.key;
            let item = state.collection.getItem(key);
            let isExpanded = expandedKeys !== 'all' && expandedKeys.has(key);
            if (item && item.hasChildNodes && (!isExpanded || dragAndDropHooks?.isVirtualDragging?.())) {
              state.toggleKey(key);
            }
          }
        },
        onKeyDown: e => {
          let target = dropState?.target;
          if (target && target.type === 'item' && target.dropPosition === 'on') {
            let item = state.collection.getItem(target.key);
            if ((e.key === EXPANSION_KEYS['expand'][direction]) && item?.hasChildNodes && !state.expandedKeys.has(target.key)) {
              state.toggleKey(target.key);
            } else if ((e.key === EXPANSION_KEYS['collapse'][direction]) && item?.hasChildNodes && state.expandedKeys.has(target.key)) {
              state.toggleKey(target.key);
            }
          }
        }
      },
      dropState,
      ref
    );

    // Prevent dropping items onto themselves or their descendants
    let originalGetDropOperation = dropState.getDropOperation;
    dropState.getDropOperation = (options) => {
      let {target, isInternal} = options;
      let currentDraggingKeys = dragState?.draggingKeys ?? new Set();

      if (isInternal && target.type === 'item' && currentDraggingKeys.size > 0) {
        if (currentDraggingKeys.has(target.key) && target.dropPosition === 'on') {
          return 'cancel';
        }

        let currentKey: Key | null = target.key;
        while (currentKey != null) {
          let item = state.collection.getItem(currentKey);
          let parentKey = item?.parentKey;
          if (parentKey != null && currentDraggingKeys.has(parentKey)) {
            return 'cancel';
          }
          currentKey = parentKey ?? null;
        }
      }

      return originalGetDropOperation(options);
    };

    isRootDropTarget = dropState.isDropTarget({type: 'root'});
  }

  let isTreeDraggable = !!(hasDragHooks && !dragState?.isDisabled);

  let {focusProps, isFocused, isFocusVisible} = useFocusRing();
  let renderValues = {
    isEmpty: state.collection.size === 0,
    isFocused,
    isFocusVisible,
    isDropTarget: isRootDropTarget,
    selectionMode: state.selectionManager.selectionMode,
    allowsDragging: !!isTreeDraggable,
    state
  };

  let renderProps = useRenderProps({
    className: props.className,
    style: props.style,
    defaultClassName: 'react-aria-Tree',
    values: renderValues
  });

  let emptyState: ReactNode = null;
  if (state.collection.size === 0 && props.renderEmptyState) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let {isEmpty, ...values} = renderValues;
    let content = props.renderEmptyState({...values});
    let treeGridRowProps = {
      'aria-level': 1
    };

    emptyState = (
      <div role="row" style={{display: 'contents'}} {...treeGridRowProps}>
        <div role="gridcell" style={{display: 'contents'}}>
          {content}
        </div>
      </div>
    );
  }

  let DOMProps = filterDOMProps(props, {global: true});

  return (
    <>
      <FocusScope>
        <div
          {...mergeProps(DOMProps, renderProps, gridProps, focusProps, droppableCollection?.collectionProps)}
          ref={ref}
          slot={props.slot || undefined}
          data-empty={state.collection.size === 0 || undefined}
          data-focused={isFocused || undefined}
          data-drop-target={isRootDropTarget || undefined}
          data-focus-visible={isFocusVisible || undefined}
          data-selection-mode={state.selectionManager.selectionMode === 'none' ? undefined : state.selectionManager.selectionMode}
          data-allows-dragging={!!isTreeDraggable || undefined}>
          <Provider
            values={[
              [TreeStateContext, state],
              [DragAndDropContext, {dragAndDropHooks, dragState, dropState}],
              [DropIndicatorContext, {render: TreeDropIndicatorWrapper}]
            ]}>
            {hasDropHooks && <RootDropIndicator />}
            <SharedElementTransition>
              <CollectionRoot
                collection={state.collection}
                persistedKeys={useDndPersistedKeys(state.selectionManager, dragAndDropHooks, dropState)}
                scrollRef={ref}
                renderDropIndicator={useRenderDropIndicator(dragAndDropHooks, dropState)} />
            </SharedElementTransition>
          </Provider>
          {emptyState}
        </div>
      </FocusScope>
      {dragPreview}
    </>
  );
}

// TODO: readd the rest of the render props when tree supports them
export interface TreeItemRenderProps extends ItemRenderProps {
  /**
   * Whether the tree item is expanded.
   * @selector [data-expanded]
   */
  isExpanded: boolean,
  /**
   * Whether the tree item has child tree items.
   * @selector [data-has-child-items]
   */
  hasChildItems: boolean,
  /**
   * What level the tree item has within the tree.
   * @selector [data-level="number"]
   */
  level: number,
  /**
   * Whether the tree item's children have keyboard focus.
   * @selector [data-focus-visible-within]
   */
  isFocusVisibleWithin: boolean,
  /** The state of the tree. */
  state: TreeState<unknown>,
  /** The unique id of the tree row. */
  id: Key
}

export interface TreeItemContentRenderProps extends TreeItemRenderProps {}

// The TreeItemContent is the one that accepts RenderProps because we would get much more complicated logic in TreeItem otherwise since we'd
// need to do a bunch of check to figure out what is the Content and what are the actual collection elements (aka child rows) of the TreeItem
export interface TreeItemContentProps extends Pick<RenderProps<TreeItemContentRenderProps>, 'children'> {}

class TreeContentNode extends CollectionNode<any> {
  static readonly type = 'content';
}

export const TreeItemContent = /*#__PURE__*/ createLeafComponent(TreeContentNode, function TreeItemContent(props: TreeItemContentProps) {
  let values = useContext(TreeItemContentContext)!;
  let renderProps = useRenderProps({
    children: props.children,
    values
  });
  return (
    <CollectionRendererContext.Provider value={DefaultCollectionRenderer}>
      {renderProps.children}
    </CollectionRendererContext.Provider>
  );
});

export const TreeItemContentContext = createContext<TreeItemContentRenderProps | null>(null);

export interface TreeItemProps<T = object> extends StyleRenderProps<TreeItemRenderProps>, LinkDOMProps, HoverEvents, PressEvents, Pick<AriaTreeItemOptions, 'hasChildItems'>, Omit<GlobalDOMAttributes<HTMLDivElement>, 'onClick'> {
  /** The unique id of the tree row. */
  id?: Key,
  /** The object value that this tree item represents. When using dynamic collections, this is set automatically. */
  value?: T,
  /** A string representation of the tree item's contents, used for features like typeahead. */
  textValue: string,
  /** An accessibility label for this tree item. */
  'aria-label'?: string,
  /** The content of the tree item along with any nested children. Supports static nested tree items or use of a Collection to dynamically render nested tree items. */
  children: ReactNode,
  /** Whether the item is disabled. */
  isDisabled?: boolean,
  /**
   * Handler that is called when a user performs an action on this tree item. The exact user event depends on
   * the collection's `selectionBehavior` prop and the interaction modality.
   */
  onAction?: () => void
}

class TreeItemNode extends CollectionNode<any> {
  static readonly type = 'item';
}

/**
 * A TreeItem represents an individual item in a Tree.
 */
export const TreeItem = /*#__PURE__*/ createBranchComponent(TreeItemNode, <T extends object>(props: TreeItemProps<T>, ref: ForwardedRef<HTMLDivElement>, item: Node<T>) => {
  let state = useContext(TreeStateContext)!;
  ref = useObjectRef<HTMLDivElement>(ref);
  let {dragAndDropHooks, dragState, dropState} = useContext(DragAndDropContext)!;

  // TODO: remove this when we support description in tree row
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let {rowProps, gridCellProps, expandButtonProps, descriptionProps, ...states} = useTreeItem({
    node: item,
    shouldSelectOnPressUp: !!dragState
  }, state, ref);
  let isExpanded = rowProps['aria-expanded'] === true;
  let hasChildItems = props.hasChildItems || [...state.collection.getChildren!(item.key)]?.length > 1;
  let level = rowProps['aria-level'] || 1;

  let {hoverProps, isHovered} = useHover({
    isDisabled: !states.allowsSelection && !states.hasAction,
    onHoverStart: props.onHoverStart,
    onHoverChange: props.onHoverChange,
    onHoverEnd: props.onHoverEnd
  });

  let {isFocusVisible, focusProps} = useFocusRing();
  let {
    isFocusVisible: isFocusVisibleWithin,
    focusProps: focusWithinProps
  } = useFocusRing({within: true});
  let {checkboxProps} = useGridListSelectionCheckbox(
    {key: item.key},
    state
  );

  let draggableItem: DraggableItemResult | null = null;
  if (dragState && dragAndDropHooks) {
    draggableItem = dragAndDropHooks.useDraggableItem!({key: item.key, hasDragButton: true}, dragState);
  }

  let dropIndicator: DropIndicatorAria | null = null;
  let expandButtonRef = useRef<HTMLButtonElement>(null);
  let dropIndicatorRef = useRef<HTMLDivElement>(null);
  let activateButtonRef = useRef<HTMLDivElement>(null);
  let {visuallyHiddenProps} = useVisuallyHidden();
  if (dropState && dragAndDropHooks) {
    dropIndicator = dragAndDropHooks.useDropIndicator!({
      target: {type: 'item', key: item.key, dropPosition: 'on'},
      activateButtonRef
    }, dropState, dropIndicatorRef);
  }

  let isDragging = dragState && dragState.isDragging(item.key);
  let isDropTarget = dropIndicator?.isDropTarget;

  let selectionMode = state.selectionManager.selectionMode;
  let selectionBehavior = state.selectionManager.selectionBehavior;
  let renderPropValues = React.useMemo<TreeItemContentRenderProps>(() => ({
    ...states,
    isHovered,
    isFocusVisible,
    isExpanded,
    hasChildItems,
    level,
    selectionMode,
    selectionBehavior,
    isFocusVisibleWithin,
    state,
    id: item.key,
    allowsDragging: !!dragState,
    isDragging,
    isDropTarget
  }), [states, isHovered, isFocusVisible, isExpanded, hasChildItems, level, isFocusVisibleWithin, state, item.key, dragState, isDragging, isDropTarget, selectionBehavior, selectionMode]);

  let renderProps = useRenderProps({
    ...props,
    id: undefined,
    children: item.rendered,
    defaultClassName: 'react-aria-TreeItem',
    defaultStyle: {
      // @ts-ignore
      '--tree-item-level': level
    },
    values: renderPropValues
  });

  useEffect(() => {
    if (!item.textValue && process.env.NODE_ENV !== 'production') {
      console.warn('A `textValue` prop is required for <TreeItem> elements in order to support accessibility features such as type to select.');
    }
  }, [item.textValue]);

  useEffect(() => {
    if (hasChildItems && !expandButtonRef.current && process.env.NODE_ENV !== 'production') {
      console.warn('Expandable tree items must contain a expand button so screen reader users can expand/collapse the item.');
    }
  // eslint-disable-next-line
  }, []);

  let dragButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (dragState && !dragButtonRef.current && process.env.NODE_ENV !== 'production') {
      console.warn('Draggable items in a Tree must contain a <Button slot="drag"> element so that keyboard and screen reader users can drag them.');
    }
  // eslint-disable-next-line
  }, []);

  let children = useCachedChildren({
    items: state.collection.getChildren!(item.key),
    children: item => {
      switch (item.type) {
        case 'content': {
          return item.render!(item);
        }
        // Skip item since we don't render the nested rows as children of the parent row, the flattened collection
        // will render them each as siblings instead
        case 'loader':
        case 'item':
          return <></>;
        default:
          throw new Error('Unsupported element type in TreeRow: ' + item.type);
      }
    }
  });

  let activateButtonId = useId();
  let DOMProps = filterDOMProps(props as any, {global: true});
  delete DOMProps.id;
  delete DOMProps.onClick;

  return (
    <>
      {dropIndicator && !dropIndicator.isHidden && (
        <div
          role="row"
          aria-level={rowProps['aria-level']}
          aria-expanded={rowProps['aria-expanded']}
          aria-label={dropIndicator.dropIndicatorProps['aria-label']}>
          <div role="gridcell" aria-colindex={1} style={{display: 'contents'}}>
            <div role="button" {...visuallyHiddenProps} {...dropIndicator.dropIndicatorProps} ref={dropIndicatorRef} />
            {rowProps['aria-expanded'] != null ? (
              // Button to allow touch screen reader users to expand the item while dragging.
              <div
                role="button"
                {...visuallyHiddenProps}
                id={activateButtonId}
                aria-label={expandButtonProps['aria-label']}
                aria-labelledby={`${activateButtonId} ${rowProps.id}`}
                tabIndex={-1}
                ref={activateButtonRef} />
            ) : null}
          </div>
        </div>
      )}
      <div
        {...mergeProps(
          DOMProps,
          rowProps,
          focusProps,
          hoverProps,
          focusWithinProps,
          draggableItem?.dragProps
        )}
        {...renderProps}
        ref={ref}
        // TODO: missing selectionBehavior, hasAction and allowsSelection data attribute equivalents (available in renderProps). Do we want those?
        data-expanded={(hasChildItems && isExpanded) || undefined}
        data-has-child-items={hasChildItems || undefined}
        data-level={level}
        data-selected={states.isSelected || undefined}
        data-disabled={states.isDisabled || undefined}
        data-hovered={isHovered || undefined}
        data-focused={states.isFocused || undefined}
        data-focus-visible={isFocusVisible || undefined}
        data-pressed={states.isPressed || undefined}
        data-selection-mode={state.selectionManager.selectionMode === 'none' ? undefined : state.selectionManager.selectionMode}
        data-allows-dragging={!!dragState || undefined}
        data-dragging={isDragging || undefined}
        data-drop-target={isDropTarget || undefined}>
        <div {...gridCellProps} style={{display: 'contents'}}>
          <Provider
            values={[
              [CheckboxContext, {
                slots: {
                  selection: checkboxProps
                }
              }],
              // TODO: support description in the tree row
              // TODO: don't think I need to pass isExpanded to the button here since it can be sourced from the renderProps? Might be worthwhile passing it down?
              [ButtonContext, {
                slots: {
                  [DEFAULT_SLOT]: {},
                  chevron: {
                    ...expandButtonProps,
                    ref: expandButtonRef
                  },
                  drag: {
                    ...draggableItem?.dragButtonProps,
                    ref: dragButtonRef,
                    style: {
                      pointerEvents: 'none'
                    }
                  }
                }
              }],
              [TreeItemContentContext, {
                ...renderPropValues
              }],
              [SelectionIndicatorContext, {isSelected: states.isSelected}]
            ]}>
            {children}
          </Provider>
        </div>
      </div>
    </>
  );
});

export interface TreeLoadMoreItemRenderProps {
  /**
   * What level the tree item has within the tree.
   * @selector [data-level]
   */
  level: number
}

export interface TreeLoadMoreItemProps extends Omit<LoadMoreSentinelProps, 'collection'>, RenderProps<TreeLoadMoreItemRenderProps> {
  /**
   * The load more spinner to render when loading additional items.
   */
  children?: ChildrenOrFunction<TreeLoadMoreItemRenderProps>,
  /**
   * Whether or not the loading spinner should be rendered or not.
   */
  isLoading?: boolean
}

export const TreeLoadMoreItem = createLeafComponent(LoaderNode, function TreeLoadingSentinel<T extends object>(props: TreeLoadMoreItemProps,  ref: ForwardedRef<HTMLDivElement>, item: Node<T>) {
  let {isVirtualized} = useContext(CollectionRendererContext);
  let state = useContext(TreeStateContext)!;
  let {isLoading, onLoadMore, scrollOffset, ...otherProps} = props;
  let sentinelRef = useRef(null);
  let memoedLoadMoreProps = useMemo(() => ({
    onLoadMore,
    // this collection will update anytime a row is expanded/collapsed becaused the flattenedRows will change.
    // This means onLoadMore will trigger but that might be ok cause the user should have logic to handle multiple loadMore calls
    collection: state?.collection,
    sentinelRef,
    scrollOffset
  }), [onLoadMore, scrollOffset, state?.collection]);
  useLoadMoreSentinel(memoedLoadMoreProps, sentinelRef);

  ref = useObjectRef<HTMLDivElement>(ref);
  let {rowProps, gridCellProps} = useTreeItem({node: item}, state, ref);
  let level = rowProps['aria-level'] || 1;

  // For now don't include aria-posinset and aria-setsize on loader since they aren't keyboard focusable
  // Arguably shouldn't include them ever since it might be confusing to the user to include the loaders as part of the
  // item count
  let ariaProps = {
    role: 'row',
    'aria-level': rowProps['aria-level']
  };

  let renderProps = useRenderProps({
    ...otherProps,
    id: undefined,
    children: item.rendered,
    defaultClassName: 'react-aria-TreeLoader',
    values: {
      level
    }
  });
  let style = {};

  if (isVirtualized) {
    style = {display: 'contents'};
  }

  return (
    <>
      {/* Alway render the sentinel. For now onus is on the user for styling when using flex + gap (this would introduce a gap even though it doesn't take room) */}
      {/* @ts-ignore - compatibility with React < 19 */}
      <div style={{position: 'relative', width: 0, height: 0}} inert={inertValue(true)} >
        <div data-testid="loadMoreSentinel" ref={sentinelRef} style={{position: 'absolute', height: 1, width: 1}} />
      </div>
      {isLoading && renderProps.children && (
        <div
          ref={ref}
          {...mergeProps(filterDOMProps(props as any), ariaProps)}
          {...renderProps}
          data-level={level}>
          <div {...gridCellProps} style={style}>
            {renderProps.children}
          </div>
        </div>
      )}
    </>
  );
});

function convertExpanded(expanded: 'all' | Iterable<Key>): 'all' | Set<Key> {
  if (!expanded) {
    return new Set<Key>();
  }

  return expanded === 'all'
    ? 'all'
    : new Set(expanded);
}
interface TreeGridCollectionOptions {
  expandedKeys: Set<Key>
}

interface FlattenedTree<T> {
  flattenedRows: Node<T>[],
  keyMap: Map<Key, CollectionNode<T>>,
  itemCount: number
}

function flattenTree<T>(collection: TreeCollection<T>, opts: TreeGridCollectionOptions): FlattenedTree<T> {
  let {
    expandedKeys = new Set()
  } = opts;
  let keyMap: Map<Key, CollectionNode<T>> = new Map();
  let flattenedRows: Node<T>[] = [];
  // Need to count the items here because BaseCollection will return the full item count regardless if items are hidden via collapsed rows
  let itemCount = 0;
  let parentLookup: Map<Key, boolean> = new Map();

  let visitNode = (node: Node<T>) => {
    if (node.type === 'item' || node.type === 'loader') {
      let parentKey = node?.parentKey;
      let clone = {...node};
      if (parentKey != null) {
        // TODO: assumes that non item content node (aka TreeItemContent always placed before Collection) will be always placed before the child rows. If we can't make this assumption then we can filter out
        // every non-item per level and assign indicies based off the node's position in said filtered array
        let hasContentNode = [...collection.getChildren(parentKey)][0].type !== 'item';
        if (hasContentNode) {
          clone.index = node?.index != null ? node?.index - 1 : 0;
        }

        // For loader nodes that have a parent (aka non-root level loaders), these need their levels incremented by 1 for parity with their sibiling rows
        // (Collection only increments the level if it is a "item" type node).
        if (node.type === 'loader') {
          clone.level = node.level + 1;
        }

        keyMap.set(clone.key, clone as CollectionNode<T>);
      } else {
        keyMap.set(node.key, node as CollectionNode<T>);
      }

      // Grab the modified node from the key map so our flattened list and modified key map point to the same nodes
      let modifiedNode = keyMap.get(node.key) || node;
      if (modifiedNode.level === 0 || (modifiedNode.parentKey != null && expandedKeys.has(modifiedNode.parentKey) && parentLookup.get(modifiedNode.parentKey))) {
        if (modifiedNode.type === 'item') {
          itemCount++;
        }

        flattenedRows.push(modifiedNode);
        parentLookup.set(modifiedNode.key, true);
      }
    } else if (node.type !== null) {
      keyMap.set(node.key, node as CollectionNode<T>);
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
    keyMap,
    itemCount
  };
}

function TreeDropIndicatorWrapper(props: DropIndicatorProps, ref: ForwardedRef<HTMLElement>): JSX.Element | null {
  ref = useObjectRef(ref);
  let {dragAndDropHooks, dropState} = useContext(DragAndDropContext)!;
  let buttonRef = useRef<HTMLDivElement>(null);
  let {dropIndicatorProps, isHidden, isDropTarget} = dragAndDropHooks!.useDropIndicator!(
    props,
    dropState!,
    buttonRef
  );

  if (isHidden) {
    return null;
  }

  let level = dropState && props.target.type === 'item' ? (dropState.collection.getItem(props.target.key)?.level || 0) + 1 : 1;
  return (
    <TreeDropIndicatorForwardRef
      {...props}
      dropIndicatorProps={dropIndicatorProps}
      isDropTarget={isDropTarget}
      ref={ref}
      buttonRef={buttonRef}
      level={level} />
  );
}

interface TreeDropIndicatorProps extends DropIndicatorProps {
  dropIndicatorProps: React.HTMLAttributes<HTMLElement>,
  isDropTarget: boolean,
  buttonRef: RefObject<HTMLDivElement | null>,
  level: number
}

function TreeDropIndicator(props: TreeDropIndicatorProps, ref: ForwardedRef<HTMLElement>) {
  let {
    dropIndicatorProps,
    isDropTarget,
    buttonRef,
    level,
    ...otherProps
  } = props;
  let {visuallyHiddenProps} = useVisuallyHidden();
  let renderProps = useRenderProps({
    ...otherProps,
    defaultClassName: 'react-aria-DropIndicator',
    defaultStyle: {
      position: 'relative',
      // @ts-ignore
      '--tree-item-level': level
    },
    values: {
      isDropTarget
    }
  });

  return (
    <div
      {...renderProps}
      role="row"
      aria-level={level}
      ref={ref as RefObject<HTMLDivElement | null>}
      data-drop-target={isDropTarget || undefined}>
      <div role="gridcell">
        <div {...visuallyHiddenProps} role="button" {...dropIndicatorProps} ref={buttonRef} />
        {renderProps.children}
      </div>
    </div>
  );
}

const TreeDropIndicatorForwardRef = forwardRef(TreeDropIndicator);

function RootDropIndicator() {
  let {dragAndDropHooks, dropState} = useContext(DragAndDropContext);
  let ref = useRef<HTMLDivElement>(null);
  let {dropIndicatorProps} = dragAndDropHooks!.useDropIndicator!({
    target: {type: 'root'}
  }, dropState!, ref);
  let isDropTarget = dropState!.isDropTarget({type: 'root'});
  let {visuallyHiddenProps} = useVisuallyHidden();

  if (!isDropTarget && dropIndicatorProps['aria-hidden']) {
    return null;
  }

  return (
    <div role="row" aria-hidden={dropIndicatorProps['aria-hidden']} style={{position: 'absolute'}}>
      <div role="gridcell">
        <div role="button" {...visuallyHiddenProps} {...dropIndicatorProps} ref={ref} />
      </div>
    </div>
  );
}
