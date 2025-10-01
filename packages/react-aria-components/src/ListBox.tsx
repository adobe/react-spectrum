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

import {AriaListBoxOptions, AriaListBoxProps, DraggableItemResult, DragPreviewRenderer, DroppableCollectionResult, DroppableItemResult, FocusScope, ListKeyboardDelegate, mergeProps, useCollator, useFocusRing, useHover, useListBox, useListBoxSection, useLocale, useOption} from 'react-aria';
import {Collection, CollectionBuilder, createBranchComponent, createLeafComponent, ItemNode, LoaderNode, SectionNode} from '@react-aria/collections';
import {CollectionProps, CollectionRendererContext, ItemRenderProps, SectionContext, SectionProps} from './Collection';
import {ContextValue, DEFAULT_SLOT, Provider, RenderProps, SlotProps, StyleProps, StyleRenderProps, useContextProps, useRenderProps, useSlot} from './utils';
import {DragAndDropContext, DropIndicatorContext, DropIndicatorProps, useDndPersistedKeys, useRenderDropIndicator} from './DragAndDrop';
import {DragAndDropHooks} from './useDragAndDrop';
import {DraggableCollectionState, DroppableCollectionState, ListState, Node, Orientation, SelectionBehavior, UNSTABLE_useFilteredListState, useListState} from 'react-stately';
import {filterDOMProps, inertValue, LoadMoreSentinelProps, useLoadMoreSentinel, useObjectRef} from '@react-aria/utils';
import {forwardRefType, GlobalDOMAttributes, HoverEvents, Key, LinkDOMProps, PressEvents, RefObject} from '@react-types/shared';
import {HeaderContext} from './Header';
import React, {createContext, ForwardedRef, forwardRef, JSX, ReactNode, useContext, useEffect, useMemo, useRef} from 'react';
import {SelectableCollectionContext, SelectableCollectionContextValue} from './RSPContexts';
import {SelectionIndicatorContext} from './SelectionIndicator';
import {SeparatorContext} from './Separator';
import {SharedElementTransition} from './SharedElementTransition';
import {TextContext} from './Text';

export interface ListBoxRenderProps {
  /**
   * Whether the listbox has no items and should display its empty state.
   * @selector [data-empty]
   */
  isEmpty: boolean,
  /**
   * Whether the listbox is currently focused.
   * @selector [data-focused]
   */
  isFocused: boolean,
  /**
   * Whether the listbox is currently keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean,
  /**
   * Whether the listbox is currently the active drop target.
   * @selector [data-drop-target]
   */
  isDropTarget: boolean,
  /**
   * Whether the items are arranged in a stack or grid.
   * @selector [data-layout="stack | grid"]
   */
  layout: 'stack' | 'grid',
  /**
   * State of the listbox.
   */
  state: ListState<unknown>
}

export interface ListBoxProps<T> extends Omit<AriaListBoxProps<T>, 'children' | 'label'>, CollectionProps<T>, StyleRenderProps<ListBoxRenderProps>, SlotProps, GlobalDOMAttributes<HTMLDivElement> {
  /**
   * How multiple selection should behave in the collection.
   * @default "toggle"
   */
  selectionBehavior?: SelectionBehavior,
  /** The drag and drop hooks returned by `useDragAndDrop` used to enable drag and drop behavior for the ListBox. */
  dragAndDropHooks?: DragAndDropHooks<NoInfer<T>>,
  /** Provides content to display when there are no items in the list. */
  renderEmptyState?: (props: ListBoxRenderProps) => ReactNode,
  /**
   * Whether the items are arranged in a stack or grid.
   * @default 'stack'
   */
  layout?: 'stack' | 'grid',
  /**
   * The primary orientation of the items. Usually this is the
   * direction that the collection scrolls.
   * @default 'vertical'
   */
  orientation?: Orientation
}

export const ListBoxContext = createContext<ContextValue<ListBoxProps<any>, HTMLDivElement>>(null);
export const ListStateContext = createContext<ListState<any> | null>(null);

/**
 * A listbox displays a list of options and allows a user to select one or more of them.
 */
export const ListBox = /*#__PURE__*/ (forwardRef as forwardRefType)(function ListBox<T extends object>(props: ListBoxProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, ListBoxContext);
  let state = useContext(ListStateContext);

  // The structure of ListBox is a bit strange because it needs to work inside other components like ComboBox and Select.
  // Those components render two copies of their children so that the collection can be built even when the popover is closed.
  // The first copy sends a collection document via context which we render the collection portal into.
  // The second copy sends a ListState object via context which we use to render the ListBox without rebuilding the state.
  // Otherwise, we have a standalone ListBox, so we need to create a collection and state ourselves.
  if (state) {
    return <ListBoxInner state={state} props={props} listBoxRef={ref} />;
  }

  return (
    <CollectionBuilder content={<Collection {...props} />}>
      {collection => <StandaloneListBox props={props} listBoxRef={ref} collection={collection} />}
    </CollectionBuilder>
  );
});

function StandaloneListBox({props, listBoxRef, collection}) {
  props = {...props, collection, children: null, items: null};
  let {layoutDelegate} = useContext(CollectionRendererContext);
  let state = useListState({...props, layoutDelegate});
  return <ListBoxInner state={state} props={props} listBoxRef={listBoxRef} />;
}

interface ListBoxInnerProps<T> {
  state: ListState<T>,
  props: ListBoxProps<T> & AriaListBoxOptions<T> & {filter?: SelectableCollectionContextValue<T>['filter']},
  listBoxRef: RefObject<HTMLElement | null>
}

function ListBoxInner<T extends object>({state: inputState, props, listBoxRef}: ListBoxInnerProps<T>) {
  [props, listBoxRef] = useContextProps(props, listBoxRef, SelectableCollectionContext);
  let {dragAndDropHooks, layout = 'stack', orientation = 'vertical', filter} = props;
  let state = UNSTABLE_useFilteredListState(inputState, filter);
  let {collection, selectionManager} = state;
  let isListDraggable = !!dragAndDropHooks?.useDraggableCollectionState;
  let isListDroppable = !!dragAndDropHooks?.useDroppableCollectionState;
  let {direction} = useLocale();
  let {disabledBehavior, disabledKeys} = selectionManager;
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let {isVirtualized, layoutDelegate, dropTargetDelegate: ctxDropTargetDelegate, CollectionRoot} = useContext(CollectionRendererContext);
  let keyboardDelegate = useMemo(() => (
    props.keyboardDelegate || new ListKeyboardDelegate({
      collection,
      collator,
      ref: listBoxRef,
      disabledKeys,
      disabledBehavior,
      layout,
      orientation,
      direction,
      layoutDelegate
    })
  ), [collection, collator, listBoxRef, disabledBehavior, disabledKeys, orientation, direction, props.keyboardDelegate, layout, layoutDelegate]);

  let {listBoxProps} = useListBox({
    ...props,
    shouldSelectOnPressUp: isListDraggable || props.shouldSelectOnPressUp,
    keyboardDelegate,
    isVirtualized
  }, state, listBoxRef);

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
      collection,
      selectionManager,
      preview: dragAndDropHooks.renderDragPreview ? preview : undefined
    });
    dragAndDropHooks.useDraggableCollection!({}, dragState, listBoxRef);

    let DragPreview = dragAndDropHooks.DragPreview!;
    dragPreview = dragAndDropHooks.renderDragPreview
      ? <DragPreview ref={preview}>{dragAndDropHooks.renderDragPreview}</DragPreview>
      : null;
  }

  if (isListDroppable && dragAndDropHooks) {
    dropState = dragAndDropHooks.useDroppableCollectionState!({
      collection,
      selectionManager
    });

    let dropTargetDelegate = dragAndDropHooks.dropTargetDelegate || ctxDropTargetDelegate || new dragAndDropHooks.ListDropTargetDelegate(collection, listBoxRef, {orientation, layout, direction});
    droppableCollection = dragAndDropHooks.useDroppableCollection!({
      keyboardDelegate,
      dropTargetDelegate
    }, dropState, listBoxRef);

    isRootDropTarget = dropState.isDropTarget({type: 'root'});
  }

  let {focusProps, isFocused, isFocusVisible} = useFocusRing();
  let isEmpty = state.collection.size === 0;
  let renderValues = {
    isDropTarget: isRootDropTarget,
    isEmpty,
    isFocused,
    isFocusVisible,
    layout: props.layout || 'stack',
    state
  };
  let renderProps = useRenderProps({
    className: props.className,
    style: props.style,
    defaultClassName: 'react-aria-ListBox',
    values: renderValues
  });

  let emptyState: JSX.Element | null = null;
  if (isEmpty && props.renderEmptyState) {
    emptyState = (
      <div
        // eslint-disable-next-line
        role="option"
        style={{display: 'contents'}}>
        {props.renderEmptyState(renderValues)}
      </div>
    );
  }

  let DOMProps = filterDOMProps(props, {global: true});

  return (
    <FocusScope>
      <div
        {...mergeProps(DOMProps, renderProps, listBoxProps, focusProps, droppableCollection?.collectionProps)}
        ref={listBoxRef as RefObject<HTMLDivElement>}
        slot={props.slot || undefined}
        onScroll={props.onScroll}
        data-drop-target={isRootDropTarget || undefined}
        data-empty={isEmpty || undefined}
        data-focused={isFocused || undefined}
        data-focus-visible={isFocusVisible || undefined}
        data-layout={props.layout || 'stack'}
        data-orientation={props.orientation || 'vertical'}>
        <Provider
          values={[
            [ListBoxContext, props],
            [ListStateContext, state],
            [DragAndDropContext, {dragAndDropHooks, dragState, dropState}],
            [SeparatorContext, {elementType: 'div'}],
            [DropIndicatorContext, {render: ListBoxDropIndicatorWrapper}],
            [SectionContext, {name: 'ListBoxSection', render: ListBoxSectionInner}]
          ]}>
          <SharedElementTransition>
            <CollectionRoot
              collection={collection}
              scrollRef={listBoxRef}
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

export interface ListBoxSectionProps<T> extends SectionProps<T> {}

function ListBoxSectionInner<T extends object>(props: ListBoxSectionProps<T>, ref: ForwardedRef<HTMLElement>, section: Node<T>, className = 'react-aria-ListBoxSection') {
  let state = useContext(ListStateContext)!;
  let {dragAndDropHooks, dropState} = useContext(DragAndDropContext)!;
  let {CollectionBranch} = useContext(CollectionRendererContext);
  let [headingRef, heading] = useSlot();
  let {headingProps, groupProps} = useListBoxSection({
    heading,
    'aria-label': props['aria-label'] ?? undefined
  });
  let renderProps = useRenderProps({
    defaultClassName: className,
    className: props.className,
    style: props.style,
    values: {}
  });

  let DOMProps = filterDOMProps(props as any, {global: true});
  delete DOMProps.id;

  return (
    <section
      {...mergeProps(DOMProps, renderProps, groupProps)}
      ref={ref}>
      <HeaderContext.Provider value={{...headingProps, ref: headingRef}}>
        <CollectionBranch
          collection={state.collection}
          parent={section}
          renderDropIndicator={useRenderDropIndicator(dragAndDropHooks, dropState)} />
      </HeaderContext.Provider>
    </section>
  );
}

/**
 * A ListBoxSection represents a section within a ListBox.
 */
export const ListBoxSection = /*#__PURE__*/ createBranchComponent(SectionNode, ListBoxSectionInner);

export interface ListBoxItemRenderProps extends ItemRenderProps {}

export interface ListBoxItemProps<T = object> extends RenderProps<ListBoxItemRenderProps>, LinkDOMProps, HoverEvents, PressEvents, Omit<GlobalDOMAttributes<HTMLDivElement>, 'onClick'> {
  /** The unique id of the item. */
  id?: Key,
  /** The object value that this item represents. When using dynamic collections, this is set automatically. */
  value?: T,
  /** A string representation of the item's contents, used for features like typeahead. */
  textValue?: string,
  /** An accessibility label for this item. */
  'aria-label'?: string,
  /** Whether the item is disabled. */
  isDisabled?: boolean,
  /**
   * Handler that is called when a user performs an action on the item. The exact user event depends on
   * the collection's `selectionBehavior` prop and the interaction modality.
   */
  onAction?: () => void
}

/**
 * A ListBoxItem represents an individual option in a ListBox.
 */
export const ListBoxItem = /*#__PURE__*/ createLeafComponent(ItemNode, function ListBoxItem<T extends object>(props: ListBoxItemProps<T>, forwardedRef: ForwardedRef<HTMLDivElement>, item: Node<T>) {
  let ref = useObjectRef<any>(forwardedRef);
  let state = useContext(ListStateContext)!;
  let {dragAndDropHooks, dragState, dropState} = useContext(DragAndDropContext)!;
  let {optionProps, labelProps, descriptionProps, ...states} = useOption(
    {key: item.key, 'aria-label': props?.['aria-label']},
    state,
    ref
  );

  let {hoverProps, isHovered} = useHover({
    isDisabled: !states.allowsSelection && !states.hasAction,
    onHoverStart: item.props.onHoverStart,
    onHoverChange: item.props.onHoverChange,
    onHoverEnd: item.props.onHoverEnd
  });

  let draggableItem: DraggableItemResult | null = null;
  if (dragState && dragAndDropHooks) {
    draggableItem = dragAndDropHooks.useDraggableItem!({key: item.key}, dragState);
  }

  let droppableItem: DroppableItemResult | null = null;
  if (dropState && dragAndDropHooks) {
    droppableItem = dragAndDropHooks.useDroppableItem!({
      target: {type: 'item', key: item.key, dropPosition: 'on'}
    }, dropState, ref);
  }

  let isDragging = dragState && dragState.isDragging(item.key);
  let renderProps = useRenderProps({
    ...props,
    id: undefined,
    children: props.children,
    defaultClassName: 'react-aria-ListBoxItem',
    values: {
      ...states,
      isHovered,
      selectionMode: state.selectionManager.selectionMode,
      selectionBehavior: state.selectionManager.selectionBehavior,
      allowsDragging: !!dragState,
      isDragging,
      isDropTarget: droppableItem?.isDropTarget
    }
  });

  useEffect(() => {
    if (!item.textValue && process.env.NODE_ENV !== 'production') {
      console.warn('A `textValue` prop is required for <ListBoxItem> elements with non-plain text children in order to support accessibility features such as type to select.');
    }
  }, [item.textValue]);

  let ElementType: React.ElementType = props.href ? 'a' : 'div';

  let DOMProps = filterDOMProps(props as any, {global: true});
  delete DOMProps.id;
  delete DOMProps.onClick;

  return (
    <ElementType
      {...mergeProps(DOMProps, renderProps, optionProps, hoverProps, draggableItem?.dragProps, droppableItem?.dropProps)}
      ref={ref}
      data-allows-dragging={!!dragState || undefined}
      data-selected={states.isSelected || undefined}
      data-disabled={states.isDisabled || undefined}
      data-hovered={isHovered || undefined}
      data-focused={states.isFocused || undefined}
      data-focus-visible={states.isFocusVisible || undefined}
      data-pressed={states.isPressed || undefined}
      data-dragging={isDragging || undefined}
      data-drop-target={droppableItem?.isDropTarget || undefined}
      data-selection-mode={state.selectionManager.selectionMode === 'none' ? undefined : state.selectionManager.selectionMode}>
      <Provider
        values={[
          [TextContext, {
            slots: {
              [DEFAULT_SLOT]: labelProps,
              label: labelProps,
              description: descriptionProps
            }
          }],
          [SelectionIndicatorContext, {isSelected: states.isSelected}]
        ]}>
        {renderProps.children}
      </Provider>
    </ElementType>
  );
});

function ListBoxDropIndicatorWrapper(props: DropIndicatorProps, ref: ForwardedRef<HTMLElement>) {
  ref = useObjectRef(ref);
  let {dragAndDropHooks, dropState} = useContext(DragAndDropContext)!;
  let {dropIndicatorProps, isHidden, isDropTarget} = dragAndDropHooks!.useDropIndicator!(
    props,
    dropState!,
    ref
  );

  if (isHidden) {
    return null;
  }

  return (
    <ListBoxDropIndicatorForwardRef {...props} dropIndicatorProps={dropIndicatorProps} isDropTarget={isDropTarget} ref={ref} />
  );
}

interface ListBoxDropIndicatorProps extends DropIndicatorProps {
  dropIndicatorProps: React.HTMLAttributes<HTMLElement>,
  isDropTarget: boolean
}

function ListBoxDropIndicator(props: ListBoxDropIndicatorProps, ref: ForwardedRef<HTMLElement>) {
  let {
    dropIndicatorProps,
    isDropTarget,
    ...otherProps
  } = props;

  let renderProps = useRenderProps({
    ...otherProps,
    defaultClassName: 'react-aria-DropIndicator',
    values: {
      isDropTarget
    }
  });

  return (
    <div
      {...dropIndicatorProps}
      {...renderProps}
      // eslint-disable-next-line
      role="option"
      ref={ref as RefObject<HTMLDivElement | null>}
      data-drop-target={isDropTarget || undefined} />
  );
}

const ListBoxDropIndicatorForwardRef = forwardRef(ListBoxDropIndicator);

export interface ListBoxLoadMoreItemProps extends Omit<LoadMoreSentinelProps, 'collection'>, StyleProps, GlobalDOMAttributes<HTMLDivElement> {
  /**
   * The load more spinner to render when loading additional items.
   */
  children?: ReactNode,
  /**
   * Whether or not the loading spinner should be rendered or not.
   */
  isLoading?: boolean
}

export const ListBoxLoadMoreItem = createLeafComponent(LoaderNode, function ListBoxLoadingIndicator(props: ListBoxLoadMoreItemProps, ref: ForwardedRef<HTMLDivElement>, item: Node<object>) {
  let state = useContext(ListStateContext)!;
  let {isLoading, onLoadMore, scrollOffset, ...otherProps} = props;

  let sentinelRef = useRef<HTMLDivElement>(null);
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
    defaultClassName: 'react-aria-ListBoxLoadingIndicator',
    values: null
  });

  let optionProps = {
    // For Android talkback
    tabIndex: -1
    // For now don't include aria-posinset and aria-setsize on loader since they aren't keyboard focusable
    // Arguably shouldn't include them ever since it might be confusing to the user to include the loaders as part of the
    // item count
  };

  return (
    <>
      {/* Alway render the sentinel. For now onus is on the user for styling when using flex + gap (this would introduce a gap even though it doesn't take room) */}
      {/* @ts-ignore - compatibility with React < 19 */}
      <div style={{position: 'relative', width: 0, height: 0}} inert={inertValue(true)} >
        <div data-testid="loadMoreSentinel" ref={sentinelRef} style={{position: 'absolute', height: 1, width: 1}} />
      </div>
      {isLoading && renderProps.children && (
        <div
          {...mergeProps(filterDOMProps(props, {global: true}), optionProps)}
          {...renderProps}
          // aria-selected isn't needed here since this option is not selectable.
          // eslint-disable-next-line jsx-a11y/role-has-required-aria-props
          role="option"
          ref={ref as ForwardedRef<HTMLDivElement>}>
          {renderProps.children}
        </div>
      )}
    </>
  );
});
