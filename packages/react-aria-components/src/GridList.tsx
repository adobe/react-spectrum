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
import {AriaGridListProps, DraggableItemResult, DragPreviewRenderer, DropIndicatorAria, DroppableCollectionResult, FocusScope, ListKeyboardDelegate, mergeProps, useCollator, useFocusRing, useGridList, useGridListItem, useGridListSection, useGridListSelectionCheckbox, useHover, useLocale, useVisuallyHidden} from 'react-aria';
import {ButtonContext} from './Button';
import {CheckboxContext, FieldInputContext, SelectableCollectionContext, SelectableCollectionContextValue} from './RSPContexts';
import {Collection, CollectionBuilder, createBranchComponent, createLeafComponent, HeaderNode, ItemNode, LoaderNode, SectionNode} from '@react-aria/collections';
import {CollectionProps, CollectionRendererContext, DefaultCollectionRenderer, ItemRenderProps, SectionProps} from './Collection';
import {ContextValue, DEFAULT_SLOT, Provider, RenderProps, SlotProps, StyleProps, StyleRenderProps, useContextProps, useRenderProps} from './utils';
import {DragAndDropContext, DropIndicatorContext, DropIndicatorProps, useDndPersistedKeys, useRenderDropIndicator} from './DragAndDrop';
import {DragAndDropHooks} from './useDragAndDrop';
import {DraggableCollectionState, DroppableCollectionState, Collection as ICollection, ListState, Node, SelectionBehavior, UNSTABLE_useFilteredListState, useListState} from 'react-stately';
import {filterDOMProps, inertValue, LoadMoreSentinelProps, useLoadMoreSentinel, useObjectRef} from '@react-aria/utils';
import {forwardRefType, GlobalDOMAttributes, HoverEvents, Key, LinkDOMProps, PressEvents, RefObject} from '@react-types/shared';
import {ListStateContext} from './ListBox';
import React, {createContext, ForwardedRef, forwardRef, HTMLAttributes, JSX, ReactNode, useContext, useEffect, useMemo, useRef} from 'react';
import {SelectionIndicatorContext} from './SelectionIndicator';
import {SharedElementTransition} from './SharedElementTransition';
import {TextContext} from './Text';

export interface GridListRenderProps {
  /**
   * Whether the list has no items and should display its empty state.
   * @selector [data-empty]
   */
  isEmpty: boolean,
  /**
   * Whether the grid list is currently focused.
   * @selector [data-focused]
   */
  isFocused: boolean,
  /**
   * Whether the grid list is currently keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean,
  /**
   * Whether the grid list is currently the active drop target.
   * @selector [data-drop-target]
   */
  isDropTarget: boolean,
  /**
   * Whether the items are arranged in a stack or grid.
   * @selector [data-layout="stack | grid"]
   */
  layout: 'stack' | 'grid',
  /**
   * State of the grid list.
   */
  state: ListState<unknown>
}

export interface GridListProps<T> extends Omit<AriaGridListProps<T>, 'children'>, CollectionProps<T>, StyleRenderProps<GridListRenderProps>, SlotProps, GlobalDOMAttributes<HTMLDivElement> {
  /**
   * Whether typeahead navigation is disabled.
   * @default false
   */
  disallowTypeAhead?: boolean,
  /**
   * How multiple selection should behave in the collection.
   * @default "toggle"
   */
  selectionBehavior?: SelectionBehavior,
  /** The drag and drop hooks returned by `useDragAndDrop` used to enable drag and drop behavior for the GridList. */
  dragAndDropHooks?: DragAndDropHooks<NoInfer<T>>,
  /** Provides content to display when there are no items in the list. */
  renderEmptyState?: (props: GridListRenderProps) => ReactNode,
  /**
   * Whether the items are arranged in a stack or grid.
   * @default 'stack'
   */
  layout?: 'stack' | 'grid'
}


export const GridListContext = createContext<ContextValue<GridListProps<any>, HTMLDivElement>>(null);

/**
 * A grid list displays a list of interactive items, with support for keyboard navigation,
 * single or multiple selection, and row actions.
 */
export const GridList = /*#__PURE__*/ (forwardRef as forwardRefType)(function GridList<T extends object>(props: GridListProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  // Render the portal first so that we have the collection by the time we render the DOM in SSR.
  [props, ref] = useContextProps(props, ref, GridListContext);

  return (
    <CollectionBuilder content={<Collection {...props} />}>
      {collection => <GridListInner props={props} collection={collection} gridListRef={ref} />}
    </CollectionBuilder>
  );
});

interface GridListInnerProps<T extends object> {
  props: GridListProps<T> & SelectableCollectionContextValue<T>,
  collection: ICollection<Node<object>>,
  gridListRef: RefObject<HTMLElement | null>
}

function GridListInner<T extends object>({props, collection, gridListRef: ref}: GridListInnerProps<T>) {
  [props, ref] = useContextProps(props, ref, SelectableCollectionContext);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let {shouldUseVirtualFocus, filter, disallowTypeAhead, ...DOMCollectionProps} = props;
  let {dragAndDropHooks, keyboardNavigationBehavior = 'arrow', layout = 'stack'} = props;
  let {CollectionRoot, isVirtualized, layoutDelegate, dropTargetDelegate: ctxDropTargetDelegate} = useContext(CollectionRendererContext);
  let gridlistState = useListState({
    ...DOMCollectionProps,
    collection,
    children: undefined,
    layoutDelegate
  });

  let filteredState = UNSTABLE_useFilteredListState(gridlistState as ListState<T>, filter);
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let {disabledBehavior, disabledKeys} = filteredState.selectionManager;
  let {direction} = useLocale();
  let keyboardDelegate = useMemo(() => (
    new ListKeyboardDelegate({
      collection: filteredState.collection,
      collator,
      ref,
      disabledKeys,
      disabledBehavior,
      layoutDelegate,
      layout,
      direction
    })
  ), [filteredState.collection, ref, layout, disabledKeys, disabledBehavior, layoutDelegate, collator, direction]);

  let {gridProps} = useGridList({
    ...DOMCollectionProps,
    keyboardDelegate,
    // Only tab navigation is supported in grid layout.
    keyboardNavigationBehavior: layout === 'grid' ? 'tab' : keyboardNavigationBehavior,
    isVirtualized,
    shouldSelectOnPressUp: props.shouldSelectOnPressUp
  }, filteredState, ref);

  let selectionManager = filteredState.selectionManager;
  let isListDraggable = !!dragAndDropHooks?.useDraggableCollectionState;
  let isListDroppable = !!dragAndDropHooks?.useDroppableCollectionState;
  let dragHooksProvided = useRef(isListDraggable);
  let dropHooksProvided = useRef(isListDroppable);
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      return;
    }
    if (dragHooksProvided.current !== isListDraggable) {
      console.warn('Drag hooks were provided during one render, but not another. This should be avoided as it may produce unexpected behavior.');
    }
    if (dropHooksProvided.current !== isListDroppable) {
      console.warn('Drop hooks were provided during one render, but not another. This should be avoided as it may produce unexpected behavior.');
    }
  }, [isListDraggable, isListDroppable]);

  let dragState: DraggableCollectionState | undefined = undefined;
  let dropState: DroppableCollectionState | undefined = undefined;
  let droppableCollection: DroppableCollectionResult | undefined = undefined;
  let isRootDropTarget = false;
  let dragPreview: JSX.Element | null = null;
  let preview = useRef<DragPreviewRenderer>(null);

  if (isListDraggable && dragAndDropHooks) {
    dragState = dragAndDropHooks.useDraggableCollectionState!({
      collection: filteredState.collection,
      selectionManager,
      preview: dragAndDropHooks.renderDragPreview ? preview : undefined
    });
    dragAndDropHooks.useDraggableCollection!({}, dragState, ref);

    let DragPreview = dragAndDropHooks.DragPreview!;
    dragPreview = dragAndDropHooks.renderDragPreview
      ? <DragPreview ref={preview}>{dragAndDropHooks.renderDragPreview}</DragPreview>
      : null;
  }

  if (isListDroppable && dragAndDropHooks) {
    dropState = dragAndDropHooks.useDroppableCollectionState!({
      collection: filteredState.collection,
      selectionManager
    });

    let keyboardDelegate = new ListKeyboardDelegate({
      collection: filteredState.collection,
      disabledKeys: selectionManager.disabledKeys,
      disabledBehavior: selectionManager.disabledBehavior,
      ref
    });
    let dropTargetDelegate = dragAndDropHooks.dropTargetDelegate || ctxDropTargetDelegate || new dragAndDropHooks.ListDropTargetDelegate(collection, ref, {layout, direction});
    droppableCollection = dragAndDropHooks.useDroppableCollection!({
      keyboardDelegate,
      dropTargetDelegate
    }, dropState, ref);

    isRootDropTarget = dropState.isDropTarget({type: 'root'});
  }

  let {focusProps, isFocused, isFocusVisible} = useFocusRing();
  let isEmpty = filteredState.collection.size === 0;
  let renderValues = {
    isDropTarget: isRootDropTarget,
    isEmpty,
    isFocused,
    isFocusVisible,
    layout,
    state: filteredState
  };
  let renderProps = useRenderProps({
    className: props.className,
    style: props.style,
    defaultClassName: 'react-aria-GridList',
    values: renderValues
  });

  let emptyState: ReactNode = null;
  let emptyStatePropOverrides: HTMLAttributes<HTMLElement> | null = null;

  if (isEmpty && props.renderEmptyState) {
    let content = props.renderEmptyState(renderValues);
    emptyState = (
      <div role="row" aria-rowindex={1} style={{display: 'contents'}}>
        <div role="gridcell" style={{display: 'contents'}}>
          {content}
        </div>
      </div>
    );
  }

  let DOMProps = filterDOMProps(props, {global: true});

  return (
    <FocusScope>
      <div
        {...mergeProps(DOMProps, renderProps, gridProps, focusProps, droppableCollection?.collectionProps, emptyStatePropOverrides)}
        ref={ref as RefObject<HTMLDivElement>}
        slot={props.slot || undefined}
        onScroll={props.onScroll}
        data-drop-target={isRootDropTarget || undefined}
        data-empty={isEmpty || undefined}
        data-focused={isFocused || undefined}
        data-focus-visible={isFocusVisible || undefined}
        data-layout={layout}>
        <Provider
          values={[
            [ListStateContext, filteredState],
            [DragAndDropContext, {dragAndDropHooks, dragState, dropState}],
            [DropIndicatorContext, {render: GridListDropIndicatorWrapper}]
          ]}>
          {isListDroppable && <RootDropIndicator />}
          <SharedElementTransition>
            <CollectionRoot
              collection={filteredState.collection}
              scrollRef={ref}
              persistedKeys={useDndPersistedKeys(selectionManager, dragAndDropHooks, dropState)}
              renderDropIndicator={useRenderDropIndicator(dragAndDropHooks, dropState)} />
          </SharedElementTransition>
        </Provider>
        {emptyState}
        {dragPreview}
      </div>
    </FocusScope>
  );
}

export interface GridListItemRenderProps extends ItemRenderProps {}

export interface GridListItemProps<T = object> extends RenderProps<GridListItemRenderProps>, LinkDOMProps, HoverEvents, PressEvents, Omit<GlobalDOMAttributes<HTMLDivElement>, 'onClick'> {
  /** The unique id of the item. */
  id?: Key,
  /** The object value that this item represents. When using dynamic collections, this is set automatically. */
  value?: T,
  /** A string representation of the item's contents, used for features like typeahead. */
  textValue?: string,
  /** Whether the item is disabled. */
  isDisabled?: boolean,
  /**
   * Handler that is called when a user performs an action on the item. The exact user event depends on
   * the collection's `selectionBehavior` prop and the interaction modality.
   */
  onAction?: () => void
}

/**
 * A GridListItem represents an individual item in a GridList.
 */
export const GridListItem = /*#__PURE__*/ createLeafComponent(ItemNode, function GridListItem<T extends object>(props: GridListItemProps<T>, forwardedRef: ForwardedRef<HTMLDivElement>, item: Node<T>) {
  let state = useContext(ListStateContext)!;
  let {dragAndDropHooks, dragState, dropState} = useContext(DragAndDropContext);
  let ref = useObjectRef<HTMLDivElement>(forwardedRef);
  let {isVirtualized} = useContext(CollectionRendererContext);
  let {rowProps, gridCellProps, descriptionProps, ...states} = useGridListItem(
    {
      node: item,
      shouldSelectOnPressUp: !!dragState,
      isVirtualized
    },
    state,
    ref
  );

  let {hoverProps, isHovered} = useHover({
    isDisabled: !states.allowsSelection && !states.hasAction,
    onHoverStart: item.props.onHoverStart,
    onHoverChange: item.props.onHoverChange,
    onHoverEnd: item.props.onHoverEnd
  });

  let {isFocusVisible, focusProps} = useFocusRing();
  let {checkboxProps} = useGridListSelectionCheckbox(
    {key: item.key},
    state
  );

  let buttonProps = state.selectionManager.disabledBehavior === 'all' && states.isDisabled ? {isDisabled: true} : {};

  let draggableItem: DraggableItemResult | null = null;
  if (dragState && dragAndDropHooks) {
    draggableItem = dragAndDropHooks.useDraggableItem!({key: item.key, hasDragButton: true}, dragState);
  }

  let dropIndicator: DropIndicatorAria | null = null;
  let dropIndicatorRef = useRef<HTMLDivElement>(null);
  let {visuallyHiddenProps} = useVisuallyHidden();
  if (dropState && dragAndDropHooks) {
    dropIndicator = dragAndDropHooks.useDropIndicator!({
      target: {type: 'item', key: item.key, dropPosition: 'on'}
    }, dropState, dropIndicatorRef);
  }

  let isDragging = dragState && dragState.isDragging(item.key);
  let renderProps = useRenderProps({
    ...props,
    id: undefined,
    children: item.rendered,
    defaultClassName: 'react-aria-GridListItem',
    values: {
      ...states,
      isHovered,
      isFocusVisible,
      selectionMode: state.selectionManager.selectionMode,
      selectionBehavior: state.selectionManager.selectionBehavior,
      allowsDragging: !!dragState,
      isDragging,
      isDropTarget: dropIndicator?.isDropTarget
    }
  });

  let dragButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (dragState && !dragButtonRef.current) {
      console.warn('Draggable items in a GridList must contain a <Button slot="drag"> element so that keyboard and screen reader users can drag them.');
    }
  // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!item.textValue && process.env.NODE_ENV !== 'production') {
      console.warn('A `textValue` prop is required for <GridListItem> elements with non-plain text children in order to support accessibility features such as type to select.');
    }
  }, [item.textValue]);

  let DOMProps = filterDOMProps(props as any, {global: true});
  delete DOMProps.id;
  delete DOMProps.onClick;

  return (
    <>
      {dropIndicator && !dropIndicator.isHidden &&
        <div role="row" style={{position: 'absolute'}}>
          <div role="gridcell">
            <div role="button" {...visuallyHiddenProps} {...dropIndicator?.dropIndicatorProps} ref={dropIndicatorRef} />
          </div>
        </div>
      }
      <div
        {...mergeProps(DOMProps, renderProps, rowProps, focusProps, hoverProps, draggableItem?.dragProps)}
        ref={ref}
        data-selected={states.isSelected || undefined}
        data-disabled={states.isDisabled || undefined}
        data-hovered={isHovered || undefined}
        data-focused={states.isFocused || undefined}
        data-focus-visible={isFocusVisible || undefined}
        data-pressed={states.isPressed || undefined}
        data-allows-dragging={!!dragState || undefined}
        data-dragging={isDragging || undefined}
        data-drop-target={dropIndicator?.isDropTarget || undefined}
        data-selection-mode={state.selectionManager.selectionMode === 'none' ? undefined : state.selectionManager.selectionMode}>
        <div {...gridCellProps} style={{display: 'contents'}}>
          <Provider
            values={[
              [CheckboxContext, {
                slots: {
                  [DEFAULT_SLOT]: {},
                  selection: checkboxProps
                }
              }],
              [ButtonContext, {
                slots: {
                  [DEFAULT_SLOT]: buttonProps,
                  drag: {
                    ...draggableItem?.dragButtonProps,
                    ref: dragButtonRef,
                    style: {
                      pointerEvents: 'none'
                    }
                  }
                }
              }],
              [TextContext, {
                slots: {
                  [DEFAULT_SLOT]: {},
                  description: descriptionProps
                }
              }],
              [CollectionRendererContext, DefaultCollectionRenderer],
              [ListStateContext, null],
              [SelectableCollectionContext, null],
              [FieldInputContext, null],
              [SelectionIndicatorContext, {isSelected: states.isSelected}]
            ]}>
            {renderProps.children}
          </Provider>
        </div>
      </div>
    </>
  );
});

function GridListDropIndicatorWrapper(props: DropIndicatorProps, ref: ForwardedRef<HTMLElement>) {
  ref = useObjectRef(ref);
  let {dragAndDropHooks, dropState} = useContext(DragAndDropContext);
  let buttonRef = useRef<HTMLDivElement>(null);
  let {dropIndicatorProps, isHidden, isDropTarget} = dragAndDropHooks!.useDropIndicator!(
    props,
    dropState!,
    buttonRef
  );

  if (isHidden) {
    return null;
  }

  return (
    <GridListDropIndicatorForwardRef {...props} dropIndicatorProps={dropIndicatorProps} isDropTarget={isDropTarget} buttonRef={buttonRef} ref={ref} />
  );
}

interface GridListDropIndicatorProps extends DropIndicatorProps {
  dropIndicatorProps: React.HTMLAttributes<HTMLElement>,
  isDropTarget: boolean,
  buttonRef: RefObject<HTMLDivElement | null>
}

function GridListDropIndicator(props: GridListDropIndicatorProps, ref: ForwardedRef<HTMLElement>) {
  let {
    dropIndicatorProps,
    isDropTarget,
    buttonRef,
    ...otherProps
  } = props;

  let {visuallyHiddenProps} = useVisuallyHidden();
  let renderProps = useRenderProps({
    ...otherProps,
    defaultClassName: 'react-aria-DropIndicator',
    values: {
      isDropTarget
    }
  });

  return (
    <div
      {...renderProps}
      role="row"
      ref={ref as RefObject<HTMLDivElement | null>}
      data-drop-target={isDropTarget || undefined}>
      <div role="gridcell">
        <div {...visuallyHiddenProps} role="button" {...dropIndicatorProps} ref={buttonRef} />
        {renderProps.children}
      </div>
    </div>
  );
}

const GridListDropIndicatorForwardRef = forwardRef(GridListDropIndicator);

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

export interface GridListLoadMoreItemProps extends Omit<LoadMoreSentinelProps, 'collection'>, StyleProps, GlobalDOMAttributes<HTMLDivElement> {
  /**
   * The load more spinner to render when loading additional items.
   */
  children?: ReactNode,
  /**
   * Whether or not the loading spinner should be rendered or not.
   */
  isLoading?: boolean
}

export const GridListLoadMoreItem = createLeafComponent(LoaderNode, function GridListLoadingIndicator(props: GridListLoadMoreItemProps, ref: ForwardedRef<HTMLDivElement>, item: Node<object>) {
  let state = useContext(ListStateContext)!;
  let {isVirtualized} = useContext(CollectionRendererContext);
  let {isLoading, onLoadMore, scrollOffset, ...otherProps} = props;

  let sentinelRef = useRef(null);
  let memoedLoadMoreProps = useMemo(() => ({
    onLoadMore,
    collection: state?.collection,
    sentinelRef,
    scrollOffset
  }), [onLoadMore, scrollOffset, state?.collection]);
  useLoadMoreSentinel(memoedLoadMoreProps, sentinelRef);

  let renderProps = useRenderProps({
    ...otherProps,
    id: undefined,
    children: item.rendered,
    defaultClassName: 'react-aria-GridListLoadingIndicator',
    values: null
  });
  // For now don't include aria-posinset and aria-setsize on loader since they aren't keyboard focusable
  // Arguably shouldn't include them ever since it might be confusing to the user to include the loaders as part of the
  // item count

  return (
    <>
      {/* Alway render the sentinel. For now onus is on the user for styling when using flex + gap (this would introduce a gap even though it doesn't take room) */}
      {/* @ts-ignore - compatibility with React < 19 */}
      <div style={{position: 'relative', width: 0, height: 0}} inert={inertValue(true)} >
        <div data-testid="loadMoreSentinel" ref={sentinelRef} style={{position: 'absolute', height: 1, width: 1}} />
      </div>
      {isLoading && renderProps.children && (
        <div
          {...renderProps}
          {...filterDOMProps(props, {global: true})}
          role="row"
          ref={ref}>
          <div
            aria-colindex={isVirtualized ? 1 : undefined}
            role="gridcell">
            {renderProps.children}
          </div>
        </div>
      )}
    </>
  );
});

export interface GridListSectionProps<T> extends SectionProps<T> {}

/**
 * A GridListSection represents a section within a GridList.
 */
export const GridListSection = /*#__PURE__*/ createBranchComponent(SectionNode, <T extends object>(props: GridListSectionProps<T>, ref: ForwardedRef<HTMLDivElement>, item: Node<T>) => {
  let state = useContext(ListStateContext)!;
  let {CollectionBranch} = useContext(CollectionRendererContext);
  let headingRef = useRef(null);
  ref = useObjectRef<HTMLDivElement>(ref);
  let {rowHeaderProps, rowProps, rowGroupProps} = useGridListSection({
    'aria-label': props['aria-label'] ?? undefined
  }, state, ref);
  let renderProps = useRenderProps({
    defaultClassName: 'react-aria-GridListSection',
    className: props.className,
    style: props.style,
    values: {}
  });

  let DOMProps = filterDOMProps(props as any, {global: true});
  delete DOMProps.id;

  return (
    <div
      {...mergeProps(DOMProps, renderProps, rowGroupProps)}
      ref={ref}>
      <Provider
        values={[
          [GridListHeaderContext, {...rowProps, ref: headingRef}],
          [GridListHeaderInnerContext, {...rowHeaderProps}]
        ]}>
        <CollectionBranch
          collection={state.collection}
          parent={item} />
      </Provider>
    </div>
  );
});

export const GridListHeaderContext = createContext<ContextValue<HTMLAttributes<HTMLDivElement>, HTMLDivElement>>({});
const GridListHeaderInnerContext = createContext<HTMLAttributes<HTMLElement> | null>(null);

export const GridListHeader = /*#__PURE__*/ createLeafComponent(HeaderNode, function Header(props: HTMLAttributes<HTMLElement>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, GridListHeaderContext);
  let rowHeaderProps = useContext(GridListHeaderInnerContext);

  return (
    <div className="react-aria-GridListHeader" ref={ref} {...props}>
      <div {...rowHeaderProps} style={{display: 'contents'}}>
        {props.children}
      </div>
    </div>
  );
});
