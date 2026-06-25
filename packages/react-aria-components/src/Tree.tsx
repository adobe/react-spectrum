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

import {AriaTreeItemOptions, useTreeItem} from 'react-aria/useTree';

import {AriaTreeProps, useTree} from 'react-aria/useTree';
import {
  BaseCollection,
  CollectionNode,
  LoaderNode,
  SectionNode
} from 'react-aria/private/collections/BaseCollection';
import {ButtonContext} from './Button';
import {CheckboxContext, CheckboxFieldContext} from './Checkbox';
import {
  ChildrenOrFunction,
  ClassNameOrFunction,
  ContextValue,
  DEFAULT_SLOT,
  dom,
  DOMRenderProps,
  Provider,
  RenderProps,
  SlotProps,
  StyleRenderProps,
  useContextProps,
  useRenderProps
} from './utils';
import {Collection} from 'react-aria/Collection';
import {
  CollectionBuilder,
  createBranchComponent,
  createLeafComponent
} from 'react-aria/CollectionBuilder';
import {
  CollectionDragDropState,
  CollectionDropIndicator,
  CollectionItemDragDrop,
  getItemDragDropMode
} from './collectionDragAndDrop';
import {
  CollectionProps,
  CollectionRendererContext,
  DefaultCollectionRenderer,
  ItemRenderProps,
  SectionProps
} from './Collection';
import {
  DisabledBehavior,
  Expandable,
  forwardRefType,
  GlobalDOMAttributes,
  HoverEvents,
  Key,
  LinkDOMProps,
  MultipleSelection,
  PressEvents,
  RefObject,
  SelectionMode
} from '@react-types/shared';
import {
  DragAndDropContext,
  DropIndicatorContext,
  useDndPersistedKeys,
  useRenderDropIndicator
} from './DragAndDrop';
import {DragAndDropHooks} from './useDragAndDrop';
import {DropIndicatorProps} from 'react-aria/useDroppableCollection';
import {DroppableCollectionState} from 'react-stately/useDroppableCollectionState';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import {FocusScope} from 'react-aria/FocusScope';
import {
  GridListHeader,
  GridListHeaderContext,
  GridListHeaderInnerContext,
  GridListHeaderProps
} from './GridList';
import {inertValue} from 'react-aria/private/utils/inertValue';
import {ListKeyboardDelegate} from 'react-aria/ListKeyboardDelegate';
import {
  LoadMoreSentinelProps,
  useLoadMoreSentinel
} from 'react-aria/private/utils/useLoadMoreSentinel';
import {mergeProps} from 'react-aria/mergeProps';
import {Node, SelectionBehavior} from '@react-types/shared';
import React, {
  createContext,
  ForwardedRef,
  forwardRef,
  JSX,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {SelectionIndicatorContext} from './SelectionIndicator';
import {SharedElementTransition} from './SharedElementTransition';
import {TreeDropTargetDelegate} from './TreeDropTargetDelegate';
import {TreeState, useTreeState} from 'react-stately/useTreeState';
import {useCachedChildren} from 'react-aria/private/collections/useCachedChildren';
import {useCollator} from 'react-aria/useCollator';
import {useControlledState} from 'react-stately/useControlledState';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useGridListSection, useGridListSelectionCheckbox} from 'react-aria/useGridList';
import {useHover} from 'react-aria/useHover';
import {useId} from 'react-aria/useId';
import {useLocale} from 'react-aria/I18nProvider';
import {useObjectRef} from 'react-aria/useObjectRef';
import {useVisuallyHidden} from 'react-aria/VisuallyHidden';

class TreeCollection<T> extends BaseCollection<T> {
  private expandedKeys: Set<Key> = new Set();

  withExpandedKeys(lastExpandedKeys: Set<Key>, expandedKeys: Set<Key>) {
    let collection = this.clone();
    collection.expandedKeys = expandedKeys;

    // Clone ancestor section nodes so React knows to re-render since the same item won't cause a new render but a clone creating a new object with the same value will
    // Without this change, the items won't expand and collapse when virtualized inside a section
    TreeCollection.cloneAncestorSections(expandedKeys, lastExpandedKeys, collection);
    TreeCollection.cloneAncestorSections(lastExpandedKeys, expandedKeys, collection);

    collection.frozen = this.frozen;
    return collection;
  }

  // diff lastExpandedKeys and expandedKeys so we only clone what has changed
  private static cloneAncestorSections<T>(
    keys: Iterable<Key>,
    excludeSet: Set<Key>,
    collection: TreeCollection<T>
  ) {
    for (let key of keys) {
      if (!excludeSet.has(key)) {
        let currentKey: Key | null = key;
        while (currentKey != null) {
          let item = collection.getItem(currentKey) as CollectionNode<T>;
          if (item?.type === 'section') {
            collection.keyMap.set(currentKey, item.clone());
            break;
          } else {
            currentKey = item?.parentKey ?? null;
          }
        }
      }
    }
  }

  *[Symbol.iterator]() {
    let firstKey = this.getFirstKey();
    let node: Node<T> | null = firstKey != null ? this.getItem(firstKey) : null;

    while (node) {
      yield node as Node<T>;
      if (node.type === 'section') {
        node = node.nextKey != null ? this.getItem(node.nextKey) : null;
      } else {
        // This will include both item and content nodes
        // We handle the content nodes in useCollectionRenderer and ListLayout
        let key = this.getKeyAfter(node.key);
        node = key != null ? this.getItem(key) : null;
      }
    }
  }

  getLastKey() {
    // Find the deepest expanded child. We don't use collection.getLastKey() here
    // because that will return the deepest child regardless of expandedKeys.
    // Instead, start from the last top-level key and walk down.
    let key = this.lastKey;
    if (key == null) {
      return null;
    }

    let node = this.getItem(key) as CollectionNode<T>;

    while (
      node?.lastChildKey != null &&
      (node.type !== 'item' || this.expandedKeys.has(node.key))
    ) {
      node = this.getItem(node.lastChildKey) as CollectionNode<T>;
    }

    return node?.key;
  }

  getKeyAfter(key: Key) {
    let node = this.getItem(key) as CollectionNode<T>;
    if (!node) {
      return null;
    }

    if ((this.expandedKeys.has(node.key) || node.type !== 'item') && node.firstChildKey != null) {
      return node.firstChildKey;
    }

    while (node) {
      if (node.nextKey != null) {
        return node.nextKey;
      }

      if (node.parentKey != null) {
        node = this.getItem(node.parentKey) as CollectionNode<T>;
      } else {
        return null;
      }
    }

    return null;
  }

  getKeyBefore(key: Key) {
    let node = this.getItem(key) as CollectionNode<T>;
    if (!node) {
      return null;
    }

    if (node.prevKey != null) {
      node = this.getItem(node.prevKey) as CollectionNode<T>;

      // If the lastChildKey is expanded, check its lastChildKey
      while (
        node &&
        (node.type !== 'item' || this.expandedKeys.has(node.key)) &&
        node.lastChildKey != null
      ) {
        node = this.getItem(node.lastChildKey) as CollectionNode<T>;
      }

      return node?.key ?? null;
    }

    return node.parentKey;
  }

  getChildren(key: Key): Iterable<Node<T>> {
    let self = this;
    return {
      *[Symbol.iterator]() {
        let parent = self.getItem(key) as CollectionNode<T> | null;
        let node =
          parent?.firstChildKey != null
            ? (self.getItem(parent.firstChildKey) as CollectionNode<T>)
            : null;
        if (parent && parent.type === 'section' && node) {
          // Stop once either the node is null or the node is the parent's sibling
          while (node && node.key !== parent.nextKey) {
            yield self.getItem(node.key)!;
            // This will include content nodes which we skip in ListLayout
            let key = self.getKeyAfter(node.key);
            node = key != null ? (self.getItem(key)! as CollectionNode<T>) : null;
          }
        } else {
          while (node) {
            yield node as Node<T>;
            node = node.nextKey != null ? (self.getItem(node.nextKey)! as CollectionNode<T>) : null;
          }
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
   *
   * @selector [data-empty]
   */
  isEmpty: boolean;
  /**
   * Whether the tree is currently focused.
   *
   * @selector [data-focused]
   */
  isFocused: boolean;
  /**
   * Whether the tree is currently keyboard focused.
   *
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean;
  /**
   * The type of selection that is allowed in the collection.
   *
   * @selector [data-selection-mode="single | multiple"]
   */
  selectionMode: SelectionMode;
  /**
   * Whether the tree allows dragging.
   *
   * @selector [data-allows-dragging]
   */
  allowsDragging: boolean;
  /**
   * Whether the tree is currently the active drop target.
   *
   * @selector [data-drop-target]
   */
  isDropTarget: boolean;
  /**
   * State of the tree.
   */
  state: TreeState<unknown>;
}

export interface TreeEmptyStateRenderProps extends Omit<TreeRenderProps, 'isEmpty'> {}

export interface TreeProps<T>
  extends
    Omit<AriaTreeProps<T>, 'children'>,
    MultipleSelection,
    CollectionProps<T>,
    StyleRenderProps<TreeRenderProps>,
    SlotProps,
    Expandable,
    GlobalDOMAttributes<HTMLDivElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-Tree'
   */
  className?: ClassNameOrFunction<TreeRenderProps>;
  /**
   * How multiple selection should behave in the tree.
   *
   * @default 'toggle'
   */
  selectionBehavior?: SelectionBehavior;
  /** Provides content to display when there are no items in the list. */
  renderEmptyState?: (props: TreeEmptyStateRenderProps) => ReactNode;
  /**
   * Whether `disabledKeys` applies to all interactions, or only selection.
   *
   * @default 'all'
   */
  disabledBehavior?: DisabledBehavior;
  /**
   * The drag and drop hooks returned by `useDragAndDrop` used to enable drag and drop behavior for
   * the Tree.
   */
  dragAndDropHooks?: DragAndDropHooks;
}

export const TreeContext = createContext<ContextValue<TreeProps<any>, HTMLDivElement>>(null);
export const TreeStateContext = createContext<TreeState<any> | null>(null);

/**
 * A tree provides users with a way to navigate nested hierarchical information, with support for
 * keyboard navigation and selection.
 */
export const Tree = /*#__PURE__*/ (forwardRef as forwardRefType)(function Tree<T>(
  propsArg: TreeProps<T>,
  refArg: ForwardedRef<HTMLDivElement>
) {
  let props = propsArg;
  let ref = refArg;
  // Render the portal first so that we have the collection by the time we render the DOM in SSR.
  [props, ref] = useContextProps(props, ref, TreeContext);

  return (
    <CollectionBuilder
      content={<Collection {...props} />}
      createCollection={() => new TreeCollection<T>()}>
      {collection => <TreeInner props={props} collection={collection} treeRef={ref} />}
    </CollectionBuilder>
  );
});

const EXPANSION_KEYS = {
  expand: {
    ltr: 'ArrowRight',
    rtl: 'ArrowLeft'
  },
  collapse: {
    ltr: 'ArrowLeft',
    rtl: 'ArrowRight'
  }
};

interface TreeInnerProps<T> {
  props: TreeProps<T>;
  collection: TreeCollection<T>;
  treeRef: RefObject<HTMLDivElement | null>;
}

interface TreeInnerViewProps<T> {
  props: TreeProps<T>;
  state: TreeState<T>;
  ref: RefObject<HTMLDivElement | null>;
  gridProps: ReturnType<typeof useTree>['gridProps'];
  focusProps: ReturnType<typeof useFocusRing>['focusProps'];
  isFocused: boolean;
  isFocusVisible: boolean;
  dragAndDropHooks?: DragAndDropHooks;
  dragState?: import('react-stately/useDraggableCollectionState').DraggableCollectionState;
  dropState?: DroppableCollectionState;
  droppableCollection?: import('react-aria/useDroppableCollection').DroppableCollectionResult;
  isRootDropTarget: boolean;
  dragPreview: JSX.Element | null;
  hasDragHooks: boolean;
  hasDropHooks: boolean;
}

function TreeInnerView<T>({
  props,
  state,
  ref,
  gridProps,
  focusProps,
  isFocused,
  isFocusVisible,
  dragAndDropHooks,
  dragState,
  dropState,
  droppableCollection,
  isRootDropTarget,
  dragPreview,
  hasDragHooks,
  hasDropHooks
}: TreeInnerViewProps<T>) {
  let {CollectionRoot} = useContext(CollectionRendererContext);
  let isTreeDraggable = !!(hasDragHooks && !dragState?.isDisabled);
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
    ...props,
    children: undefined,
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
        <dom.div
          {...mergeProps(
            DOMProps,
            renderProps,
            gridProps,
            focusProps,
            droppableCollection?.collectionProps
          )}
          ref={ref}
          slot={props.slot || undefined}
          data-empty={state.collection.size === 0 || undefined}
          data-focused={isFocused || undefined}
          data-drop-target={isRootDropTarget || undefined}
          data-focus-visible={isFocusVisible || undefined}
          data-selection-mode={
            state.selectionManager.selectionMode === 'none'
              ? undefined
              : state.selectionManager.selectionMode
          }
          data-allows-dragging={!!isTreeDraggable || undefined}>
          <Provider
            values={[
              [TreeStateContext, state],
              [DragAndDropContext, {dragAndDropHooks, dragState, dropState}],
              [DropIndicatorContext, {render: TreeDropIndicatorWrapper}]
            ]}>
            {hasDropHooks && dropState && <RootDropIndicator dropState={dropState} />}
            <SharedElementTransition>
              <CollectionRoot
                collection={state.collection}
                persistedKeys={useDndPersistedKeys(
                  state.selectionManager,
                  dragAndDropHooks,
                  dropState
                )}
                scrollRef={ref}
                renderDropIndicator={useRenderDropIndicator(dragAndDropHooks, dropState)}
              />
            </SharedElementTransition>
          </Provider>
          {emptyState}
        </dom.div>
      </FocusScope>
      {dragPreview}
    </>
  );
}

function TreeInner<T>({props, collection, treeRef: ref}: TreeInnerProps<T>) {
  const {dragAndDropHooks} = props;
  let {direction} = useLocale();
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let hasDragHooks = !!dragAndDropHooks?.isDraggable;
  let hasDropHooks = !!dragAndDropHooks?.isDroppable;
  let dragHooksProvided = useRef(hasDragHooks);
  let dropHooksProvided = useRef(hasDropHooks);

  useEffect(() => {
    if (dragHooksProvided.current !== hasDragHooks) {
      console.warn(
        'Drag hooks were provided during one render, but not another. This should be avoided as it may produce unexpected behavior.'
      );
    }
    if (dropHooksProvided.current !== hasDropHooks) {
      console.warn(
        'Drop hooks were provided during one render, but not another. This should be avoided as it may produce unexpected behavior.'
      );
    }
  }, [hasDragHooks, hasDropHooks]);
  let {
    selectionMode = 'none',
    expandedKeys: propExpandedKeys,
    defaultExpandedKeys: propDefaultExpandedKeys,
    onExpandedChange,
    disabledBehavior = 'all'
  } = props;
  let {
    isVirtualized,
    layoutDelegate,
    dropTargetDelegate: ctxDropTargetDelegate
  } = useContext(CollectionRendererContext);

  // Kinda annoying that we have to replicate this code here as well as in useTreeState, but don't want to add
  // flattenCollection stuff to useTreeState. Think about this later
  let [expandedKeys, setExpandedKeys] = useControlledState(
    propExpandedKeys ? new Set(propExpandedKeys) : undefined,
    propDefaultExpandedKeys ? new Set(propDefaultExpandedKeys) : new Set(),
    onExpandedChange
  );

  let [lastCollection, setLastCollection] = useState(collection);
  let [lastExpandedKeys, setLastExpandedKeys] = useState(expandedKeys);
  let [flattenedCollection, setFlattenedCollection] = useState(() =>
    collection.withExpandedKeys(lastExpandedKeys, expandedKeys)
  );

  // if the lastExpandedKeys is not the same as the currentExpandedKeys or the collection has changed, then run this
  if (!areSetsEqual(lastExpandedKeys, expandedKeys) || collection !== lastCollection) {
    setFlattenedCollection(collection.withExpandedKeys(lastExpandedKeys, expandedKeys));
    setLastCollection(collection);
    setLastExpandedKeys(expandedKeys);
  }

  let state = useTreeState({
    ...props,
    selectionMode,
    expandedKeys,
    onExpandedChange: setExpandedKeys,
    collection: flattenedCollection,
    children: undefined,
    disabledBehavior
  });

  let {gridProps} = useTree(
    {
      ...props,
      isVirtualized,
      layoutDelegate
    },
    state,
    ref
  );

  let keyboardDelegate = useMemo(
    () =>
      new ListKeyboardDelegate({
        collection: state.collection,
        collator,
        ref,
        disabledKeys: state.selectionManager.disabledKeys,
        disabledBehavior: state.selectionManager.disabledBehavior,
        direction,
        layoutDelegate
      }),
    [state.collection, collator, ref, state.selectionManager, direction, layoutDelegate]
  );

  let [treeDropTargetDelegate] = useState(() => new TreeDropTargetDelegate());
  let configureDropTargetDelegate = useCallback(
    (delegate: import('@react-types/shared').DropTargetDelegate) => {
      treeDropTargetDelegate.setup(delegate, state, direction);
      return treeDropTargetDelegate;
    },
    [treeDropTargetDelegate, state, direction]
  );

  let {focusProps, isFocused, isFocusVisible} = useFocusRing();

  return (
    <CollectionDragDropState
      dragAndDropHooks={dragAndDropHooks}
      collection={state.collection}
      selectionManager={state.selectionManager}
      ref={ref}
      keyboardDelegate={keyboardDelegate}
      direction={direction}
      ctxDropTargetDelegate={ctxDropTargetDelegate}
      configureDropTargetDelegate={configureDropTargetDelegate}
      droppableOptions={dropState => ({
        onDropActivate: e => {
          if (e.target.type === 'item') {
            let key = e.target.key;
            let item = state.collection.getItem(key);
            let isExpanded = expandedKeys.has(key);
            if (
              item &&
              item.hasChildNodes &&
              (!isExpanded || dragAndDropHooks?.isVirtualDragging?.())
            ) {
              state.toggleKey(key);
            }
          }
        },
        onKeyDown: e => {
          let target = dropState?.target;
          if (target && target.type === 'item' && target.dropPosition === 'on') {
            let item = state.collection.getItem(target.key);
            if (
              e.key === EXPANSION_KEYS['expand'][direction] &&
              item?.hasChildNodes &&
              !state.expandedKeys.has(target.key)
            ) {
              state.toggleKey(target.key);
            } else if (
              e.key === EXPANSION_KEYS['collapse'][direction] &&
              item?.hasChildNodes &&
              state.expandedKeys.has(target.key)
            ) {
              state.toggleKey(target.key);
            }
          }
        }
      })}>
      {({dragState, dropState, droppableCollection, isRootDropTarget, dragPreview}) => (
        <TreeInnerView
          props={props}
          state={state}
          ref={ref}
          gridProps={gridProps}
          focusProps={focusProps}
          isFocused={isFocused}
          isFocusVisible={isFocusVisible}
          dragAndDropHooks={dragAndDropHooks}
          dragState={dragState}
          dropState={dropState}
          droppableCollection={droppableCollection}
          isRootDropTarget={isRootDropTarget}
          dragPreview={dragPreview}
          hasDragHooks={hasDragHooks}
          hasDropHooks={hasDropHooks}
        />
      )}
    </CollectionDragDropState>
  );
}

// TODO: readd the rest of the render props when tree supports them
export interface TreeItemRenderProps extends ItemRenderProps {
  /**
   * Whether the tree item is expanded.
   *
   * @selector [data-expanded]
   */
  isExpanded: boolean;
  /**
   * Whether the tree item has child tree items.
   *
   * @selector [data-has-child-items]
   */
  hasChildItems: boolean;
  /**
   * What level the tree item has within the tree.
   *
   * @selector [data-level="number"]
   */
  level: number;
  /**
   * Whether the tree item's children have keyboard focus.
   *
   * @selector [data-focus-visible-within]
   */
  isFocusVisibleWithin: boolean;
  /** The state of the tree. */
  state: TreeState<unknown>;
  /** The unique id of the tree row. */
  id: Key;
}

export interface TreeItemContentRenderProps extends TreeItemRenderProps {}

// The TreeItemContent is the one that accepts RenderProps because we would get much more complicated logic in TreeItem otherwise since we'd
// need to do a bunch of check to figure out what is the Content and what are the actual collection elements (aka child rows) of the TreeItem
export interface TreeItemContentProps {
  /**
   * The children of the component. A function may be provided to alter the children based on
   * component state.
   */
  children: ChildrenOrFunction<TreeItemContentRenderProps>;
}

class TreeContentNode extends CollectionNode<any> {
  static readonly type = 'content';
}

export const TreeItemContent = /*#__PURE__*/ createLeafComponent(
  TreeContentNode,
  function TreeItemContent(props: TreeItemContentProps) {
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
  }
);

export const TreeItemContentContext = createContext<TreeItemContentRenderProps | null>(null);

export interface TreeItemProps<T = object>
  extends
    StyleRenderProps<TreeItemRenderProps>,
    LinkDOMProps,
    HoverEvents,
    PressEvents,
    Pick<AriaTreeItemOptions, 'hasChildItems'>,
    Omit<GlobalDOMAttributes<HTMLDivElement>, 'onClick'> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-TreeItem'
   */
  className?: ClassNameOrFunction<TreeItemRenderProps>;
  /** The unique id of the tree row. */
  id?: Key;
  /**
   * The object value that this tree item represents. When using dynamic collections, this is set
   * automatically.
   */
  value?: T;
  /** A string representation of the tree item's contents, used for features like typeahead. */
  textValue: string;
  /** An accessibility label for this tree item. */
  'aria-label'?: string;
  /**
   * The content of the tree item along with any nested children. Supports static nested tree items
   * or use of a Collection to dynamically render nested tree items.
   */
  children: ReactNode;
  /** Whether the item is disabled. */
  isDisabled?: boolean;
  /**
   * Handler that is called when a user performs an action on this tree item. The exact user event
   * depends on the collection's `selectionBehavior` prop and the interaction modality.
   */
  onAction?: () => void;
}

class TreeItemNode extends CollectionNode<any> {
  static readonly type = 'item';
}

/**
 * A TreeItem represents an individual item in a Tree.
 */
export const TreeItem = /*#__PURE__*/ createBranchComponent(
  TreeItemNode,
  <T extends any>(props: TreeItemProps<T>, refArg: ForwardedRef<HTMLDivElement>, item: Node<T>) => {
    let ref = refArg;
    let state = useContext(TreeStateContext)!;
    ref = useObjectRef<HTMLDivElement>(ref);
    let {dragState, dropState} = useContext(DragAndDropContext)!;
    let isDraggable =
      dragState && !(dragState.isDisabled || dragState.selectionManager.isDisabled(item.key));

    // TODO: remove this when we support description in tree row
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let {rowProps, gridCellProps, expandButtonProps, descriptionProps, ...states} = useTreeItem(
      {
        node: item,
        shouldSelectOnPressUp: !!dragState
      },
      state,
      ref
    );
    let isExpanded = rowProps['aria-expanded'] === true;
    let hasChildItems =
      props.hasChildItems || [...state.collection.getChildren!(item.key)]?.length > 1;
    let level = rowProps['aria-level'] || 1;

    let {hoverProps, isHovered} = useHover({
      // because of https://bugs.webkit.org/show_bug.cgi?id=214609, supporting hover styles when a item is ONLY isDraggable
      // results in hover styles sticking around after a reorder/drop operation...
      isDisabled: !states.allowsSelection && !states.hasAction && !isDraggable,
      onHoverStart: props.onHoverStart,
      onHoverChange: props.onHoverChange,
      onHoverEnd: props.onHoverEnd
    });

    let {isFocusVisible, focusProps} = useFocusRing();
    let {isFocusVisible: isFocusVisibleWithin, focusProps: focusWithinProps} = useFocusRing({
      within: true
    });
    let {checkboxProps} = useGridListSelectionCheckbox({key: item.key}, state);

    let itemDragDropMode = getItemDragDropMode(dragState, dropState);
    let expandButtonRef = useRef<HTMLButtonElement>(null);
    let dropIndicatorRef = useRef<HTMLDivElement>(null);
    let activateButtonRef = useRef<HTMLDivElement>(null);
    let {visuallyHiddenProps} = useVisuallyHidden();

    let isDragging = dragState && dragState.isDragging(item.key);
    let isDropTarget = false;

    let selectionMode = state.selectionManager.selectionMode;
    let selectionBehavior = state.selectionManager.selectionBehavior;
    let renderPropValues = React.useMemo<TreeItemContentRenderProps>(
      () => ({
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
      }),
      [
        states,
        isHovered,
        isFocusVisible,
        isExpanded,
        hasChildItems,
        level,
        isFocusVisibleWithin,
        state,
        item.key,
        dragState,
        isDragging,
        isDropTarget,
        selectionBehavior,
        selectionMode
      ]
    );

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
        console.warn(
          'A `textValue` prop is required for <TreeItem> elements in order to support accessibility features such as type to select.'
        );
      }
    }, [item.textValue]);

    useEffect(() => {
      if (hasChildItems && !expandButtonRef.current && process.env.NODE_ENV !== 'production') {
        console.warn(
          'Expandable tree items must contain a expand button so screen reader users can expand/collapse the item.'
        );
      }
      // eslint-disable-next-line
    }, []);

    let dragButtonRef = useRef<HTMLButtonElement>(null);
    useEffect(() => {
      if (dragState && !dragButtonRef.current && process.env.NODE_ENV !== 'production') {
        console.warn(
          'Draggable items in a Tree must contain a <Button slot="drag"> element so that keyboard and screen reader users can drag them.'
        );
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
      <CollectionItemDragDrop
        mode={itemDragDropMode}
        itemKey={item.key}
        hasDragButton
        dragState={dragState}
        dropState={dropState}
        ref={ref}>
        {({draggableItem}) =>
          dropState ? (
            <CollectionDropIndicator
              props={{
                target: {type: 'item', key: item.key, dropPosition: 'on'},
                activateButtonRef
              }}
              dropState={dropState}
              ref={dropIndicatorRef}>
              {({dropIndicatorProps, isHidden, isDropTarget: isItemDropTarget}) => (
                <>
                  {!isHidden && (
                    <div
                      role="row"
                      aria-level={rowProps['aria-level']}
                      aria-expanded={rowProps['aria-expanded']}
                      aria-label={dropIndicatorProps['aria-label']}>
                      <div role="gridcell" aria-colindex={1} style={{display: 'contents'}}>
                        <div
                          role="button"
                          {...visuallyHiddenProps}
                          {...dropIndicatorProps}
                          ref={dropIndicatorRef}
                        />
                        {rowProps['aria-expanded'] != null ? (
                          <div
                            role="button"
                            {...visuallyHiddenProps}
                            id={activateButtonId}
                            aria-label={expandButtonProps['aria-label']}
                            aria-labelledby={`${activateButtonId} ${rowProps.id}`}
                            tabIndex={-1}
                            ref={activateButtonRef}
                          />
                        ) : null}
                      </div>
                    </div>
                  )}
                  <dom.div
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
                    data-expanded={(hasChildItems && isExpanded) || undefined}
                    data-has-child-items={hasChildItems || undefined}
                    data-level={level}
                    data-selected={states.isSelected || undefined}
                    data-disabled={states.isDisabled || undefined}
                    data-hovered={isHovered || undefined}
                    data-focused={states.isFocused || undefined}
                    data-focus-visible={isFocusVisible || undefined}
                    data-pressed={states.isPressed || undefined}
                    data-selection-mode={
                      state.selectionManager.selectionMode === 'none'
                        ? undefined
                        : state.selectionManager.selectionMode
                    }
                    data-allows-dragging={!!dragState || undefined}
                    data-dragging={isDragging || undefined}
                    data-drop-target={isItemDropTarget || undefined}>
                    <div {...gridCellProps} style={{display: 'contents'}}>
                      <Provider
                        values={[
                          [CheckboxContext, {slots: {selection: checkboxProps}}],
                          [CheckboxFieldContext, {slots: {selection: checkboxProps}}],
                          [
                            ButtonContext,
                            {
                              slots: {
                                [DEFAULT_SLOT]: {},
                                chevron: {...expandButtonProps, ref: expandButtonRef},
                                drag: {
                                  ...draggableItem?.dragButtonProps,
                                  ref: dragButtonRef,
                                  style: {pointerEvents: 'none'}
                                }
                              }
                            }
                          ],
                          [TreeItemContentContext, {...renderPropValues}],
                          [SelectionIndicatorContext, {isSelected: states.isSelected}]
                        ]}>
                        {children}
                      </Provider>
                    </div>
                  </dom.div>
                </>
              )}
            </CollectionDropIndicator>
          ) : (
            <dom.div
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
              data-expanded={(hasChildItems && isExpanded) || undefined}
              data-has-child-items={hasChildItems || undefined}
              data-level={level}
              data-selected={states.isSelected || undefined}
              data-disabled={states.isDisabled || undefined}
              data-hovered={isHovered || undefined}
              data-focused={states.isFocused || undefined}
              data-focus-visible={isFocusVisible || undefined}
              data-pressed={states.isPressed || undefined}
              data-selection-mode={
                state.selectionManager.selectionMode === 'none'
                  ? undefined
                  : state.selectionManager.selectionMode
              }
              data-allows-dragging={!!dragState || undefined}
              data-dragging={isDragging || undefined}
              data-drop-target={isDropTarget || undefined}>
              <div {...gridCellProps} style={{display: 'contents'}}>
                <Provider
                  values={[
                    [CheckboxContext, {slots: {selection: checkboxProps}}],
                    [CheckboxFieldContext, {slots: {selection: checkboxProps}}],
                    [
                      ButtonContext,
                      {
                        slots: {
                          [DEFAULT_SLOT]: {},
                          chevron: {...expandButtonProps, ref: expandButtonRef},
                          drag: {
                            ...draggableItem?.dragButtonProps,
                            ref: dragButtonRef,
                            style: {pointerEvents: 'none'}
                          }
                        }
                      }
                    ],
                    [TreeItemContentContext, {...renderPropValues}],
                    [SelectionIndicatorContext, {isSelected: states.isSelected}]
                  ]}>
                  {children}
                </Provider>
              </div>
            </dom.div>
          )
        }
      </CollectionItemDragDrop>
    );
  }
);

export interface TreeLoadMoreItemRenderProps {
  /**
   * What level the tree item has within the tree.
   *
   * @selector [data-level]
   */
  level: number;
}

export interface TreeLoadMoreItemProps
  extends Omit<LoadMoreSentinelProps, 'collection'>, RenderProps<TreeLoadMoreItemRenderProps> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-TreeLoadMoreItem'
   */
  className?: ClassNameOrFunction<TreeLoadMoreItemRenderProps>;
  /**
   * The load more spinner to render when loading additional items.
   */
  children?: ChildrenOrFunction<TreeLoadMoreItemRenderProps>;
  /**
   * Whether or not the loading spinner should be rendered or not.
   */
  isLoading?: boolean;
}

export const TreeLoadMoreItem = createLeafComponent(LoaderNode, function TreeLoadingSentinel<
  T
>(props: TreeLoadMoreItemProps, refArg: ForwardedRef<HTMLDivElement>, item: Node<T>) {
  let ref = refArg;
  let {isVirtualized} = useContext(CollectionRendererContext);
  let state = useContext(TreeStateContext)!;
  let {isLoading, onLoadMore, scrollOffset, ...otherProps} = props;
  let sentinelRef = useRef(null);
  let memoedLoadMoreProps = useMemo(
    () => ({
      onLoadMore,
      // this collection will update anytime a row is expanded/collapsed becaused the flattenedRows will change.
      // This means onLoadMore will trigger but that might be ok cause the user should have logic to handle multiple loadMore calls
      collection: state?.collection,
      sentinelRef,
      scrollOffset
    }),
    [onLoadMore, scrollOffset, state?.collection]
  );
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
      <div style={{position: 'relative', width: 0, height: 0}} inert={inertValue(true)}>
        <div
          data-testid="loadMoreSentinel"
          ref={sentinelRef}
          style={{position: 'absolute', height: 1, width: 1}}
        />
      </div>
      {isLoading && renderProps.children && (
        <dom.div
          ref={ref}
          {...mergeProps(filterDOMProps(props as any), ariaProps)}
          {...renderProps}
          data-level={level}>
          <div {...gridCellProps} style={style}>
            {renderProps.children}
          </div>
        </dom.div>
      )}
    </>
  );
});

function TreeDropIndicatorWrapper(
  props: DropIndicatorProps,
  refArg: ForwardedRef<HTMLElement>
): JSX.Element | null {
  let ref = refArg;
  ref = useObjectRef(ref);
  let {dropState} = useContext(DragAndDropContext)!;
  let buttonRef = useRef<HTMLDivElement>(null);
  if (!dropState) {
    return null;
  }

  return (
    <CollectionDropIndicator props={props} dropState={dropState} ref={buttonRef}>
      {({dropIndicatorProps, isHidden, isDropTarget}) => {
        if (isHidden) {
          return null;
        }

        let level =
          props.target.type === 'item'
            ? (dropState.collection.getItem(props.target.key)?.level || 0) + 1
            : 1;
        return (
          <TreeDropIndicatorForwardRef
            {...props}
            dropIndicatorProps={dropIndicatorProps}
            isDropTarget={isDropTarget}
            ref={ref}
            buttonRef={buttonRef}
            level={level}
          />
        );
      }}
    </CollectionDropIndicator>
  );
}

interface TreeDropIndicatorProps extends DropIndicatorProps {
  dropIndicatorProps: React.HTMLAttributes<HTMLElement>;
  isDropTarget: boolean;
  buttonRef: RefObject<HTMLDivElement | null>;
  level: number;
}

function TreeDropIndicator(props: TreeDropIndicatorProps, ref: ForwardedRef<HTMLElement>) {
  let {dropIndicatorProps, isDropTarget, buttonRef, level, ...otherProps} = props;
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
    <dom.div
      {...renderProps}
      role="row"
      aria-level={level}
      ref={ref as RefObject<HTMLDivElement | null>}
      data-drop-target={isDropTarget || undefined}>
      <div role="gridcell">
        <div {...visuallyHiddenProps} role="button" {...dropIndicatorProps} ref={buttonRef} />
        {renderProps.children}
      </div>
    </dom.div>
  );
}

const TreeDropIndicatorForwardRef = forwardRef(TreeDropIndicator);

function RootDropIndicator({dropState}: {dropState: DroppableCollectionState}) {
  let ref = useRef<HTMLDivElement>(null);
  let {visuallyHiddenProps} = useVisuallyHidden();

  return (
    <CollectionDropIndicator props={{target: {type: 'root'}}} dropState={dropState} ref={ref}>
      {({dropIndicatorProps}) => {
        let isDropTarget = dropState.isDropTarget({type: 'root'});

        if (!isDropTarget && dropIndicatorProps['aria-hidden']) {
          return null;
        }

        return (
          <div
            role="row"
            aria-hidden={dropIndicatorProps['aria-hidden']}
            style={{position: 'absolute'}}>
            <div role="gridcell">
              <div role="button" {...visuallyHiddenProps} {...dropIndicatorProps} ref={ref} />
            </div>
          </div>
        );
      }}
    </CollectionDropIndicator>
  );
}

export interface GridListSectionProps<T>
  extends SectionProps<T>, DOMRenderProps<'div', undefined> {}

/**
 * A TreeSection represents a section within a Tree.
 */
export const TreeSection = /*#__PURE__*/ createBranchComponent(
  SectionNode,
  <T extends any>(
    props: GridListSectionProps<T>,
    refArg: ForwardedRef<HTMLDivElement>,
    item: Node<T>
  ) => {
    let ref = refArg;
    let state = useContext(TreeStateContext)!;
    let {CollectionBranch} = useContext(CollectionRendererContext);
    let headingRef = useRef(null);
    ref = useObjectRef<HTMLDivElement>(ref);
    let {rowHeaderProps, rowProps, rowGroupProps} = useGridListSection(
      {
        'aria-label': props['aria-label'] ?? undefined
      },
      state,
      ref
    );
    let renderProps = useRenderProps({
      ...props,
      id: undefined,
      children: undefined,
      defaultClassName: 'react-aria-TreeSection',
      values: undefined
    });

    let DOMProps = filterDOMProps(props as any, {global: true});
    delete DOMProps.id;

    return (
      <dom.div {...mergeProps(DOMProps, renderProps, rowGroupProps)} ref={ref}>
        <Provider
          values={[
            [GridListHeaderContext, {...rowProps, ref: headingRef}],
            [GridListHeaderInnerContext, {...rowHeaderProps}]
          ]}>
          <CollectionBranch collection={state.collection} parent={item} />
        </Provider>
      </dom.div>
    );
  }
);

export const TreeHeader = (props: GridListHeaderProps): ReactNode => {
  return (
    <GridListHeader className="react-aria-TreeHeader" {...props}>
      {props.children}
    </GridListHeader>
  );
};

function areSetsEqual<T>(a: Set<T>, b: Set<T>) {
  if (a.size !== b.size) {
    return false;
  }

  for (let item of a) {
    if (!b.has(item)) {
      return false;
    }
  }
  return true;
}
