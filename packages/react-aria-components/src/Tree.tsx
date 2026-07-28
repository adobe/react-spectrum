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
  CollectionProps,
  CollectionRendererContext,
  DefaultCollectionRenderer,
  ItemRenderProps,
  SectionProps
} from './Collection';
import {
  DisabledBehavior,
  DragPreviewRenderer,
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
import {DraggableCollectionState} from 'react-stately/useDraggableCollectionState';
import {DraggableItemResult} from 'react-aria/useDraggableCollection';
import {
  DropIndicatorAria,
  DropIndicatorProps,
  DroppableCollectionResult
} from 'react-aria/useDroppableCollection';
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
  MutableRefObject,
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
import {useAnimation, useEnterAnimation} from 'react-aria/private/utils/animation';
import {useCachedChildren} from 'react-aria/private/collections/useCachedChildren';
import {useCollator} from 'react-aria/useCollator';
import {useControlledState} from 'react-stately/useControlledState';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useGridListSection, useGridListSelectionCheckbox} from 'react-aria/useGridList';
import {useHover} from 'react-aria/useHover';
import {useId} from 'react-aria/useId';
import {useLayoutEffect} from 'react-aria/private/utils/useLayoutEffect';
import {useLocale} from 'react-aria/I18nProvider';
import {useObjectRef} from 'react-aria/useObjectRef';
import {useVisuallyHidden} from 'react-aria/VisuallyHidden';

const emptyKeySet: Set<Key> = new Set();

interface TreeAnimationContextValue {
  /** Keys of rows that have been collapsed but are still mounted while they animate out. */
  exitingKeys: Set<Key>;
  /**
   * Keys of rows that were just revealed by an expansion. Held in a ref rather than state because
   * rows read it once as they mount, which happens in the same commit that expands their parent.
   */
  enteringKeysRef: MutableRefObject<Set<Key>>;
  /** Called by a row once its exit animation has finished, to release it from the collection. */
  onExitComplete: (key: Key) => void;
}

const TreeAnimationContext = createContext<TreeAnimationContextValue | null>(null);

class TreeCollection<T> extends BaseCollection<T> {
  private expandedKeys: Set<Key> = new Set();
  // Superset of expandedKeys used only when producing the rendered rows. It additionally contains the
  // ancestors of rows that are animating out, so those rows stay mounted after their parent collapses.
  // Navigation, selection and the a11y tree deliberately continue to use expandedKeys, so a collapse is
  // reflected immediately and exiting rows are unreachable while they animate.
  private renderedExpandedKeys: Set<Key> = new Set();

  withExpandedKeys(
    lastExpandedKeys: Set<Key>,
    expandedKeys: Set<Key>,
    renderedExpandedKeys: Set<Key> = expandedKeys
  ) {
    let collection = this.clone();
    collection.expandedKeys = expandedKeys;
    collection.renderedExpandedKeys = renderedExpandedKeys;

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
        let key = this.getKeyAfterInternal(node.key, this.renderedExpandedKeys);
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
    return this.getKeyAfterInternal(key, this.expandedKeys);
  }

  private getKeyAfterInternal(key: Key, expandedKeys: Set<Key>) {
    let node = this.getItem(key) as CollectionNode<T>;
    if (!node) {
      return null;
    }

    if ((expandedKeys.has(node.key) || node.type !== 'item') && node.firstChildKey != null) {
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
            // Sections render their rows via CollectionBranch rather than the collection iterator, so this
            // walks the rendered set to keep exiting rows mounted inside a section as well.
            let key = self.getKeyAfterInternal(node.key, self.renderedExpandedKeys);
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
  dragAndDropHooks?: DragAndDropHooks<NoInfer<T>>;
}

export const TreeContext = createContext<ContextValue<TreeProps<any>, HTMLDivElement>>(null);
export const TreeStateContext = createContext<TreeState<any> | null>(null);

/**
 * A tree provides users with a way to navigate nested hierarchical information, with support for
 * keyboard navigation and selection.
 */
export const Tree = /*#__PURE__*/ (forwardRef as forwardRefType)(function Tree<T>(
  props: TreeProps<T>,
  ref: ForwardedRef<HTMLDivElement>
) {
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

function TreeInner<T>({props, collection, treeRef: ref}: TreeInnerProps<T>) {
  const {dragAndDropHooks} = props;
  let {direction} = useLocale();
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let hasDragHooks = !!dragAndDropHooks?.useDraggableCollectionState;
  let hasDropHooks = !!dragAndDropHooks?.useDroppableCollectionState;
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
    CollectionRoot,
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
  let [exitingKeys, setExitingKeys] = useState(emptyKeySet);
  let [lastExitingKeys, setLastExitingKeys] = useState(exitingKeys);
  let enteringKeysRef = useRef(emptyKeySet);
  let [flattenedCollection, setFlattenedCollection] = useState(() =>
    collection.withExpandedKeys(lastExpandedKeys, expandedKeys)
  );

  // Rows are removed from the collection as soon as their parent collapses, which gives them no chance to
  // animate out. Instead, keep them in the rendered part of the collection until their animations finish.
  // Keyboard navigation, selection and aria-expanded continue to use expandedKeys, so the collapse is
  // reflected immediately and only the DOM lags behind.
  let expandedKeysChanged = !areSetsEqual(lastExpandedKeys, expandedKeys);
  let nextExitingKeys = exitingKeys;
  if (expandedKeysChanged) {
    nextExitingKeys = getExitingKeys(collection, lastExpandedKeys, expandedKeys, exitingKeys);
    // Written during render alongside the collection so rows can read it as they mount in this same
    // commit. Same trade-off as the previous-size ref in TabPanels.
    // oxlint-disable-next-line react/react-compiler, rsp-rules/pure-render
    enteringKeysRef.current = getEnteringKeys(collection, lastExpandedKeys, expandedKeys);
  }

  // if the lastExpandedKeys is not the same as the currentExpandedKeys or the collection has changed, then run this
  if (
    expandedKeysChanged ||
    collection !== lastCollection ||
    !areSetsEqual(lastExitingKeys, nextExitingKeys)
  ) {
    setFlattenedCollection(
      collection.withExpandedKeys(
        lastExpandedKeys,
        expandedKeys,
        withExitingAncestors(collection, expandedKeys, nextExitingKeys)
      )
    );
    setLastCollection(collection);
    setLastExpandedKeys(expandedKeys);
    setLastExitingKeys(nextExitingKeys);
    if (nextExitingKeys !== exitingKeys) {
      setExitingKeys(nextExitingKeys);
    }
  }

  let onExitComplete = useCallback((key: Key) => {
    setExitingKeys(keys => {
      if (!keys.has(key)) {
        return keys;
      }
      let next = new Set(keys);
      next.delete(key);
      return next;
    });
  }, []);

  // Entering keys are only meaningful for the commit that revealed them. Clearing afterwards stops a row
  // that mounts later (e.g. scrolled into view in a virtualized tree) from replaying the enter animation.
  useLayoutEffect(() => {
    if (enteringKeysRef.current.size > 0) {
      enteringKeysRef.current = emptyKeySet;
    }
  });

  let animationContextValue = useMemo(
    () => ({exitingKeys: nextExitingKeys, enteringKeysRef, onExitComplete}),
    [nextExitingKeys, onExitComplete]
  );

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

  let dragState: DraggableCollectionState | undefined = undefined;
  let dropState: DroppableCollectionState | undefined = undefined;
  let droppableCollection: DroppableCollectionResult | undefined = undefined;
  let isRootDropTarget = false;
  let dragPreview: JSX.Element | null = null;
  let preview = useRef<DragPreviewRenderer>(null);

  if (hasDragHooks && dragAndDropHooks) {
    // oxlint-disable-next-line react/react-compiler
    dragState = dragAndDropHooks.useDraggableCollectionState!({
      collection: state.collection,
      selectionManager: state.selectionManager,
      preview: dragAndDropHooks.renderDragPreview ? preview : undefined
    });
    // oxlint-disable-next-line react/react-compiler
    dragAndDropHooks.useDraggableCollection!({}, dragState, ref);

    let DragPreview = dragAndDropHooks.DragPreview!;
    dragPreview = dragAndDropHooks.renderDragPreview ? (
      <DragPreview ref={preview}>{dragAndDropHooks.renderDragPreview}</DragPreview>
    ) : null;
  }

  let [treeDropTargetDelegate] = useState(() => new TreeDropTargetDelegate());
  if (hasDropHooks && dragAndDropHooks) {
    // oxlint-disable-next-line react/react-compiler
    dropState = dragAndDropHooks.useDroppableCollectionState!({
      collection: state.collection,
      selectionManager: state.selectionManager
    });
    let dropTargetDelegate =
      dragAndDropHooks.dropTargetDelegate ||
      ctxDropTargetDelegate ||
      new dragAndDropHooks.ListDropTargetDelegate(state.collection, ref, {direction});
    treeDropTargetDelegate.setup(dropTargetDelegate, state, direction);

    let keyboardDelegate = new ListKeyboardDelegate({
      collection: state.collection,
      collator,
      ref,
      disabledKeys: state.selectionManager.disabledKeys,
      disabledBehavior: state.selectionManager.disabledBehavior,
      direction,
      layoutDelegate
    });

    // oxlint-disable-next-line react/react-compiler
    droppableCollection = dragAndDropHooks.useDroppableCollection!(
      {
        keyboardDelegate,
        dropTargetDelegate: treeDropTargetDelegate,
        onDropActivate: e => {
          // Expand collapsed item when dragging over. For keyboard, allow collapsing.
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
      },
      dropState,
      ref
    );

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
              [TreeAnimationContext, animationContextValue],
              [DragAndDropContext, {dragAndDropHooks, dragState, dropState}],
              [DropIndicatorContext, {render: TreeDropIndicatorWrapper}]
            ]}>
            {hasDropHooks && <RootDropIndicator />}
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
  /**
   * Whether the tree item is currently entering, after its parent was expanded. Use this to apply
   * animations.
   *
   * @selector [data-entering]
   */
  isEntering: boolean;
  /**
   * Whether the tree item is currently exiting, after its parent was collapsed. The row remains in
   * the DOM until its animations complete, but is inert and excluded from keyboard navigation. Use
   * this to apply animations.
   *
   * @selector [data-exiting]
   */
  isExiting: boolean;
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
    Pick<AriaTreeItemOptions, 'hasChildItems' | 'focusMode' | 'allowsArrowNavigation'>,
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
  <T extends any>(props: TreeItemProps<T>, ref: ForwardedRef<HTMLDivElement>, item: Node<T>) => {
    let state = useContext(TreeStateContext)!;
    ref = useObjectRef<HTMLDivElement>(ref);
    let {dragAndDropHooks, dragState, dropState} = useContext(DragAndDropContext)!;
    let isDraggable =
      dragState && !(dragState.isDisabled || dragState.selectionManager.isDisabled(item.key));

    // TODO: remove this when we support description in tree row
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let {rowProps, gridCellProps, expandButtonProps, descriptionProps, ...states} = useTreeItem(
      {
        node: item,
        shouldSelectOnPressUp: !!dragState,
        focusMode: props.focusMode,
        allowsArrowNavigation: props.allowsArrowNavigation
      },
      state,
      ref
    );
    let isExpanded = rowProps['aria-expanded'] === true;
    let hasChildItems =
      props.hasChildItems || [...state.collection.getChildren!(item.key)]?.length > 1;
    let level = rowProps['aria-level'] || 1;

    let {exitingKeys, enteringKeysRef, onExitComplete} = useContext(TreeAnimationContext)!;
    let isExiting = exitingKeys.has(item.key);
    // Whether this row appeared because its parent was expanded, as opposed to being present on mount.
    // Captured once so that defaultExpandedKeys doesn't animate the initial rows in.
    let [didEnterViaExpansion] = useState(() => enteringKeysRef.current.has(item.key));
    let isEntering = useEnterAnimation(ref, didEnterViaExpansion) && !isExiting;
    useTreeItemHeight(ref, isEntering, isExiting);
    useAnimation(
      ref,
      isExiting,
      useCallback(() => onExitComplete(item.key), [onExitComplete, item.key])
    );

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

    let draggableItem: DraggableItemResult | null = null;
    if (dragState && dragAndDropHooks) {
      draggableItem = dragAndDropHooks.useDraggableItem!(
        {key: item.key, hasDragButton: true},
        dragState
      );
    }

    let dropIndicator: DropIndicatorAria | null = null;
    let expandButtonRef = useRef<HTMLButtonElement>(null);
    let dropIndicatorRef = useRef<HTMLDivElement>(null);
    let activateButtonRef = useRef<HTMLDivElement>(null);
    let {visuallyHiddenProps} = useVisuallyHidden();
    if (dropState && dragAndDropHooks) {
      dropIndicator = dragAndDropHooks.useDropIndicator!(
        {
          target: {type: 'item', key: item.key, dropPosition: 'on'},
          activateButtonRef
        },
        dropState,
        dropIndicatorRef
      );
    }

    let isDragging = dragState && dragState.isDragging(item.key);
    let isDropTarget = dropIndicator?.isDropTarget;

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
        isEntering,
        isExiting,
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
        isEntering,
        isExiting,
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
      <>
        {dropIndicator && !dropIndicator.isHidden && (
          <div
            role="row"
            aria-level={rowProps['aria-level']}
            aria-expanded={rowProps['aria-expanded']}
            aria-label={dropIndicator.dropIndicatorProps['aria-label']}>
            <div role="gridcell" aria-colindex={1} style={{display: 'contents'}}>
              <div
                role="button"
                {...visuallyHiddenProps}
                {...dropIndicator.dropIndicatorProps}
                ref={dropIndicatorRef}
              />
              {rowProps['aria-expanded'] != null ? (
                // Button to allow touch screen reader users to expand the item while dragging.
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
          data-entering={isEntering || undefined}
          data-exiting={isExiting || undefined}
          // Exiting rows are only still here so they can animate out. Keep them from being focused,
          // clicked or announced while they do.
          // @ts-ignore - compatibility with React < 19
          inert={inertValue(isExiting)}
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
                [
                  CheckboxContext,
                  {
                    slots: {
                      [DEFAULT_SLOT]: {},
                      selection: checkboxProps
                    }
                  }
                ],
                [
                  CheckboxFieldContext,
                  {
                    slots: {
                      [DEFAULT_SLOT]: {},
                      selection: checkboxProps
                    }
                  }
                ],
                // TODO: support description in the tree row
                // TODO: don't think I need to pass isExpanded to the button here since it can be sourced from the renderProps? Might be worthwhile passing it down?
                [
                  ButtonContext,
                  {
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
                  }
                ],
                [
                  TreeItemContentContext,
                  {
                    ...renderPropValues
                  }
                ],
                [SelectionIndicatorContext, {isSelected: states.isSelected}]
              ]}>
              {children}
            </Provider>
          </div>
        </dom.div>
      </>
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
  extends
    Omit<LoadMoreSentinelProps, 'collection' | 'direction'>,
    RenderProps<TreeLoadMoreItemRenderProps> {
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
>(props: TreeLoadMoreItemProps, ref: ForwardedRef<HTMLDivElement>, item: Node<T>) {
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
  ref: ForwardedRef<HTMLElement>
): JSX.Element | null {
  ref = useObjectRef(ref);
  let {dragAndDropHooks, dropState} = useContext(DragAndDropContext)!;
  let buttonRef = useRef<HTMLDivElement>(null);
  // oxlint-disable-next-line react/react-compiler
  let {dropIndicatorProps, isHidden, isDropTarget} = dragAndDropHooks!.useDropIndicator!(
    props,
    dropState!,
    buttonRef
  );

  if (isHidden) {
    return null;
  }

  let level =
    dropState && props.target.type === 'item'
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

function RootDropIndicator() {
  let {dragAndDropHooks, dropState} = useContext(DragAndDropContext);
  let ref = useRef<HTMLDivElement>(null);
  // oxlint-disable-next-line react/react-compiler
  let {dropIndicatorProps} = dragAndDropHooks!.useDropIndicator!(
    {
      target: {type: 'root'}
    },
    dropState!,
    ref
  );
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

export interface TreeSectionProps<T> extends SectionProps<T>, DOMRenderProps<'div', undefined> {}

/**
 * A TreeSection represents a section within a Tree.
 */
export const TreeSection = /*#__PURE__*/ createBranchComponent(
  SectionNode,
  <T extends any>(props: TreeSectionProps<T>, ref: ForwardedRef<HTMLDivElement>, item: Node<T>) => {
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

export interface TreeHeaderProps extends GridListHeaderProps {}

export const TreeHeader = (props: TreeHeaderProps): ReactNode => {
  return (
    <GridListHeader className="react-aria-TreeHeader" {...props}>
      {props.children}
    </GridListHeader>
  );
};

/**
 * The row's height as if it weren't animating. The entering and exiting states commonly override
 * the padding — a row can't shrink below it — and any height already applied here would clamp the
 * result, so both are lifted for the duration of the read. Transitions are suppressed alongside
 * them, or lifting an override would just start it animating and the read would return where it had
 * got to rather than where it was heading. This runs inside a layout effect, so nothing is painted
 * in between.
 *
 * Suppressing transitions cancels any that are in flight, so this must only be called while the row
 * is at rest.
 */
function measureRestingHeight(element: HTMLElement) {
  let entering = element.getAttribute('data-entering');
  let exiting = element.getAttribute('data-exiting');
  let height = element.style.getPropertyValue('--tree-item-height');
  let transition = element.style.transition;

  element.style.transition = 'none';
  if (entering != null) {
    element.removeAttribute('data-entering');
  }
  if (exiting != null) {
    element.removeAttribute('data-exiting');
  }
  if (height) {
    element.style.removeProperty('--tree-item-height');
  }

  let restingHeight = element.offsetHeight;

  if (entering != null) {
    element.setAttribute('data-entering', entering);
  }
  if (exiting != null) {
    element.setAttribute('data-exiting', exiting);
  }
  if (height) {
    element.style.setProperty('--tree-item-height', height);
  }

  // Settle the restored styles before transitions come back, so none of this animates.
  element.offsetHeight;
  element.style.transition = transition;

  return restingHeight;
}

/**
 * Publishes a row's intrinsic height as `--tree-item-height` while it animates in or out, so CSS
 * can interpolate between zero and a real height. `height: auto` isn't animatable, and requiring a
 * fixed row height would rule out rows that size to their content, so the value is measured here —
 * the same polyfill `useDisclosure` applies to its panel.
 *
 * Only runs when the row actually declares a height transition, since measuring forces a layout.
 */
function useTreeItemHeight(
  ref: RefObject<HTMLElement | null>,
  isEntering: boolean,
  isExiting: boolean
) {
  let hasHeightTransition = useRef<boolean | null>(null);
  let restingHeight = useRef<number | null>(null);
  let isSized = useRef(false);

  useLayoutEffect(() => {
    let element = ref.current;
    if (!element || typeof element.getAnimations !== 'function') {
      return;
    }

    if (hasHeightTransition.current == null) {
      hasHeightTransition.current = /height|block-size|all/.test(
        window.getComputedStyle(element).transition
      );
    }

    if (!hasHeightTransition.current) {
      return;
    }

    // `isSized` keeps this running for one more pass after an interrupted collapse, which leaves the row
    // holding a pixel height it needs to grow back out of.
    let isAtRest = !isEntering && !isExiting && !isSized.current;

    // At rest nothing is in flight, so this is the only point the row can be measured honestly. The first
    // pass of an entering row also qualifies: it has only just mounted, so its styles are its initial ones
    // and no transition has started from them yet.
    if (isAtRest || restingHeight.current == null) {
      restingHeight.current = measureRestingHeight(element);
    }

    if (isAtRest) {
      return;
    }

    let height = restingHeight.current + 'px';
    // An interrupted collapse animates from wherever it got to, so it doesn't get a starting value.
    let from = isExiting ? height : isEntering ? '0px' : null;
    if (from != null) {
      element.style.setProperty('--tree-item-height', from);

      // Force style re-calculation to trigger animations.
      window.getComputedStyle(element).height;
    }

    element.style.setProperty('--tree-item-height', isExiting ? '0px' : height);
    isSized.current = true;

    if (!isExiting) {
      // After the animations complete, switch back to auto so the row can resize with its content.
      Promise.all(element.getAnimations().map(a => a.finished))
        .then(() => {
          element.style.setProperty('--tree-item-height', 'auto');
          isSized.current = false;
        })
        .catch(() => {});
    }
  }, [ref, isEntering, isExiting]);
}

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

/** Adds every row that would be rendered beneath `key` for the given expanded set. */
function addRenderedDescendants<T>(
  collection: BaseCollection<T>,
  key: Key,
  expandedKeys: Set<Key>,
  keys: Set<Key>
) {
  let node = collection.getItem(key) as CollectionNode<T> | null;
  let childKey = node?.firstChildKey ?? null;
  while (childKey != null) {
    let child = collection.getItem(childKey) as CollectionNode<T> | null;
    if (!child) {
      break;
    }

    // Content nodes render inside their parent row rather than as rows of their own.
    if (child.type !== 'content') {
      keys.add(child.key);
      if (child.type !== 'item' || expandedKeys.has(child.key)) {
        addRenderedDescendants(collection, child.key, expandedKeys, keys);
      }
    }

    childKey = child.nextKey;
  }
}

/**
 * Whether every ancestor of `key` is expanded, i.e. the row is part of the collapsed-aware
 * collection.
 */
function isRowVisible<T>(collection: BaseCollection<T>, key: Key, expandedKeys: Set<Key>) {
  let parentKey = collection.getItem(key)?.parentKey ?? null;
  while (parentKey != null) {
    let parent = collection.getItem(parentKey);
    if (!parent) {
      return false;
    }

    if (parent.type === 'item' && !expandedKeys.has(parent.key)) {
      return false;
    }

    parentKey = parent.parentKey ?? null;
  }

  return true;
}

/**
 * The rows that should keep rendering after a collapse. Rows revealed again by an interrupted
 * collapse, and rows that have left the collection entirely, are dropped so they don't linger.
 */
function getExitingKeys<T>(
  collection: BaseCollection<T>,
  lastExpandedKeys: Set<Key>,
  expandedKeys: Set<Key>,
  exitingKeys: Set<Key>
): Set<Key> {
  let next = new Set(exitingKeys);
  for (let key of lastExpandedKeys) {
    if (!expandedKeys.has(key) && collection.getItem(key)) {
      addRenderedDescendants(collection, key, lastExpandedKeys, next);
    }
  }

  for (let key of next) {
    if (!collection.getItem(key) || isRowVisible(collection, key, expandedKeys)) {
      next.delete(key);
    }
  }

  return next.size === 0 ? emptyKeySet : next;
}

/** The rows that a just-applied expansion revealed. */
function getEnteringKeys<T>(
  collection: BaseCollection<T>,
  lastExpandedKeys: Set<Key>,
  expandedKeys: Set<Key>
): Set<Key> {
  let keys = new Set<Key>();
  for (let key of expandedKeys) {
    if (!lastExpandedKeys.has(key) && collection.getItem(key)) {
      addRenderedDescendants(collection, key, expandedKeys, keys);
    }
  }

  return keys.size === 0 ? emptyKeySet : keys;
}

/**
 * Expanded keys widened with the parents of every exiting row, so the render traversal can still
 * reach them while they animate. Returns `expandedKeys` untouched when nothing is exiting.
 */
function withExitingAncestors<T>(
  collection: BaseCollection<T>,
  expandedKeys: Set<Key>,
  exitingKeys: Set<Key>
): Set<Key> {
  if (exitingKeys.size === 0) {
    return expandedKeys;
  }

  let keys = new Set(expandedKeys);
  for (let key of exitingKeys) {
    let parentKey = collection.getItem(key)?.parentKey;
    if (parentKey != null) {
      keys.add(parentKey);
    }
  }

  return keys;
}
