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
import {
  AriaGridListProps,
  useGridList,
  useGridListItem,
  useGridListSection,
  useGridListSelectionCheckbox
} from 'react-aria/useGridList';

import {ButtonContext} from './Button';
import {CheckboxContext, CheckboxFieldContext} from './Checkbox';
import {
  ClassNameOrFunction,
  ContextValue,
  DEFAULT_SLOT,
  dom,
  DOMProps,
  DOMRenderProps,
  Provider,
  RenderProps,
  SlotProps,
  StyleProps,
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
  DragAndDropContext,
  DropIndicatorContext,
  DropIndicatorProps,
  useDndPersistedKeys,
  useRenderDropIndicator
} from './DragAndDrop';
import {DragAndDropHooks} from './useDragAndDrop';
import {DraggableItemResult} from 'react-aria/useDraggableCollection';
import {
  FieldInputContext,
  SelectableCollectionContext,
  SelectableCollectionContextValue
} from './Autocomplete';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import {FocusScope} from 'react-aria/FocusScope';
import {
  forwardRefType,
  GlobalDOMAttributes,
  HoverEvents,
  Key,
  LinkDOMProps,
  Orientation,
  PressEvents,
  RefObject
} from '@react-types/shared';
import {
  HeaderNode,
  ItemNode,
  LoaderNode,
  SectionNode
} from 'react-aria/private/collections/BaseCollection';
import {Collection as ICollection, Node, SelectionBehavior} from '@react-types/shared';
import {inertValue} from 'react-aria/private/utils/inertValue';
import {ListKeyboardDelegate} from 'react-aria/ListKeyboardDelegate';
import {
  ListState,
  UNSTABLE_useFilteredListState as useFilteredListState,
  useListState
} from 'react-stately/useListState';
import {ListStateContext} from './ListBox';
import {
  LoadMoreSentinelProps,
  useLoadMoreSentinel
} from 'react-aria/private/utils/useLoadMoreSentinel';
import {mergeProps} from 'react-aria/mergeProps';
import React, {
  createContext,
  ForwardedRef,
  forwardRef,
  HTMLAttributes,
  JSX,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef
} from 'react';
import {SelectionIndicatorContext} from './SelectionIndicator';
import {SharedElementTransition} from './SharedElementTransition';
import {TextContext} from './Text';
import {useCollator} from 'react-aria/useCollator';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useHover} from 'react-aria/useHover';
import {useLocale} from 'react-aria/I18nProvider';
import {useObjectRef} from 'react-aria/useObjectRef';
import {useVisuallyHidden} from 'react-aria/VisuallyHidden';

export interface GridListRenderProps {
  /**
   * Whether the list has no items and should display its empty state.
   *
   * @selector [data-empty]
   */
  isEmpty: boolean;
  /**
   * Whether the grid list is currently focused.
   *
   * @selector [data-focused]
   */
  isFocused: boolean;
  /**
   * Whether the grid list is currently keyboard focused.
   *
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean;
  /**
   * Whether the grid list is currently the active drop target.
   *
   * @selector [data-drop-target]
   */
  isDropTarget: boolean;
  /**
   * Whether the items are arranged in a stack or grid.
   *
   * @selector [data-layout="stack | grid"]
   */
  layout: 'stack' | 'grid';
  /**
   * The primary orientation of the items.
   *
   * @selector [data-orientation="vertical | horizontal"]
   */
  orientation: Orientation;
  /**
   * State of the grid list.
   */
  state: ListState<unknown>;
}

export interface GridListProps<T>
  extends
    Omit<AriaGridListProps<T>, 'children'>,
    CollectionProps<T>,
    StyleRenderProps<GridListRenderProps>,
    SlotProps,
    GlobalDOMAttributes<HTMLDivElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-GridList'
   */
  className?: ClassNameOrFunction<GridListRenderProps>;
  /**
   * Whether typeahead navigation is disabled.
   *
   * @default false
   */
  disallowTypeAhead?: boolean;
  /**
   * How multiple selection should behave in the collection.
   *
   * @default 'toggle'
   */
  selectionBehavior?: SelectionBehavior;
  /**
   * The drag and drop hooks returned by `useDragAndDrop` used to enable drag and drop behavior for
   * the GridList.
   */
  dragAndDropHooks?: DragAndDropHooks;
  /** Provides content to display when there are no items in the list. */
  renderEmptyState?: (props: GridListRenderProps) => ReactNode;
  /**
   * Whether the items are arranged in a stack or grid.
   *
   * @default 'stack'
   */
  layout?: 'stack' | 'grid';
  /**
   * The primary orientation of the items. Usually this is the direction that the collection
   * scrolls.
   *
   * @default 'vertical'
   */
  orientation?: Orientation;
  /**
   * Which item in the collection to focus when tabbing into the collection. Overrides default
   * roving tab index like behavior.
   *
   * @private
   */
  UNSTABLE_focusOnEntry?: 'first' | 'last';
}

export const GridListContext =
  createContext<ContextValue<GridListProps<any>, HTMLDivElement>>(null);

/**
 * A grid list displays a list of interactive items, with support for keyboard navigation,
 * single or multiple selection, and row actions.
 */
export const GridList = /*#__PURE__*/ (forwardRef as forwardRefType)(function GridList<T>(
  propsArg: GridListProps<T>,
  refArg: ForwardedRef<HTMLDivElement>
) {
  let props = propsArg;
  let ref = refArg;
  // Render the portal first so that we have the collection by the time we render the DOM in SSR.
  [props, ref] = useContextProps(props, ref, GridListContext);

  return (
    <CollectionBuilder content={<Collection {...props} />}>
      {collection => <GridListInner props={props} collection={collection} gridListRef={ref} />}
    </CollectionBuilder>
  );
});

interface GridListInnerProps<T> {
  props: GridListProps<T> & SelectableCollectionContextValue<T>;
  collection: ICollection<Node<any>>;
  gridListRef: RefObject<HTMLElement | null>;
}

interface GridListInnerViewProps<T> {
  props: GridListProps<T> & SelectableCollectionContextValue<T>;
  gridListRef: RefObject<HTMLElement | null>;
  filteredState: ListState<T>;
  dragAndDropHooks?: DragAndDropHooks;
  dragState?: import('react-stately/useDraggableCollectionState').DraggableCollectionState;
  dropState?: import('react-stately/useDroppableCollectionState').DroppableCollectionState;
  droppableCollection?: import('react-aria/useDroppableCollection').DroppableCollectionResult;
  isRootDropTarget: boolean;
  dragPreview: JSX.Element | null;
  gridProps: ReturnType<typeof useGridList>['gridProps'];
  focusProps: ReturnType<typeof useFocusRing>['focusProps'];
  isFocused: boolean;
  isFocusVisible: boolean;
  layout: 'stack' | 'grid';
  orientation: Orientation;
  selectionManager: ListState<T>['selectionManager'];
}

function GridListInnerView<T>({
  props,
  gridListRef: ref,
  filteredState,
  dragAndDropHooks,
  dragState,
  dropState,
  droppableCollection,
  isRootDropTarget,
  dragPreview,
  gridProps,
  focusProps,
  isFocused,
  isFocusVisible,
  layout,
  orientation,
  selectionManager
}: GridListInnerViewProps<T>) {
  let {CollectionRoot} = useContext(CollectionRendererContext);
  let isListDroppable = !!dragAndDropHooks?.isDroppable;
  let isEmpty = filteredState.collection.size === 0;
  let renderValues = {
    isDropTarget: isRootDropTarget,
    orientation,
    isEmpty,
    isFocused,
    isFocusVisible,
    layout,
    state: filteredState
  };
  let renderProps = useRenderProps({
    ...props,
    children: undefined,
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
      <dom.div
        {...mergeProps(
          DOMProps,
          renderProps,
          gridProps,
          focusProps,
          droppableCollection?.collectionProps,
          emptyStatePropOverrides
        )}
        ref={ref as RefObject<HTMLDivElement>}
        slot={props.slot || undefined}
        onScroll={props.onScroll}
        data-drop-target={isRootDropTarget || undefined}
        data-empty={isEmpty || undefined}
        data-focused={isFocused || undefined}
        data-focus-visible={isFocusVisible || undefined}
        data-layout={layout}
        data-orientation={orientation}>
        <Provider
          values={[
            [ListStateContext, filteredState],
            [DragAndDropContext, {dragAndDropHooks, dragState, dropState}],
            [DropIndicatorContext, {render: GridListDropIndicatorWrapper}]
          ]}>
          {isListDroppable && dropState && <RootDropIndicator dropState={dropState} />}
          <SharedElementTransition>
            <CollectionRoot
              collection={filteredState.collection}
              scrollRef={ref}
              persistedKeys={useDndPersistedKeys(selectionManager, dragAndDropHooks, dropState)}
              renderDropIndicator={useRenderDropIndicator(dragAndDropHooks, dropState)}
            />
          </SharedElementTransition>
        </Provider>
        {emptyState}
        {dragPreview}
      </dom.div>
    </FocusScope>
  );
}

function GridListInner<T>({
  props: propsProp,
  collection,
  gridListRef: gridListRefProp
}: GridListInnerProps<T>) {
  let [props, ref] = useContextProps(propsProp, gridListRefProp, SelectableCollectionContext);
  let {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    shouldUseVirtualFocus,
    filter,
    disallowTypeAhead,
    UNSTABLE_focusOnEntry,
    ...DOMCollectionProps
  } = props;
  let {
    dragAndDropHooks,
    keyboardNavigationBehavior = 'arrow',
    layout = 'stack',
    orientation = 'vertical'
  } = props;
  let {
    isVirtualized,
    layoutDelegate,
    dropTargetDelegate: ctxDropTargetDelegate
  } = useContext(CollectionRendererContext);
  let gridlistState = useListState({
    ...DOMCollectionProps,
    collection,
    children: undefined,
    layoutDelegate
  });

  let filteredState = useFilteredListState(gridlistState as ListState<T>, filter);
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let {disabledBehavior, disabledKeys} = filteredState.selectionManager;
  let {direction} = useLocale();
  let keyboardDelegate = useMemo(
    () =>
      new ListKeyboardDelegate({
        collection: filteredState.collection,
        collator,
        ref,
        disabledKeys,
        disabledBehavior,
        layoutDelegate,
        layout,
        orientation,
        direction
      }),
    [
      filteredState.collection,
      ref,
      layout,
      orientation,
      disabledKeys,
      disabledBehavior,
      layoutDelegate,
      collator,
      direction
    ]
  );

  let {gridProps} = useGridList(
    {
      ...DOMCollectionProps,
      keyboardDelegate,
      // Only tab navigation is supported in grid layout.
      keyboardNavigationBehavior: layout === 'grid' ? 'tab' : keyboardNavigationBehavior,
      isVirtualized,
      shouldSelectOnPressUp: props.shouldSelectOnPressUp,
      disallowTypeAhead,
      UNSTABLE_focusOnEntry
    },
    filteredState,
    ref
  );

  let selectionManager = filteredState.selectionManager;
  let isListDraggable = !!dragAndDropHooks?.isDraggable;
  let isListDroppable = !!dragAndDropHooks?.isDroppable;
  let dragHooksProvided = useRef(isListDraggable);
  let dropHooksProvided = useRef(isListDroppable);
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      return;
    }
    if (dragHooksProvided.current !== isListDraggable) {
      console.warn(
        'Drag hooks were provided during one render, but not another. This should be avoided as it may produce unexpected behavior.'
      );
    }
    if (dropHooksProvided.current !== isListDroppable) {
      console.warn(
        'Drop hooks were provided during one render, but not another. This should be avoided as it may produce unexpected behavior.'
      );
    }
  }, [isListDraggable, isListDroppable]);

  let {focusProps, isFocused, isFocusVisible} = useFocusRing();

  return (
    <CollectionDragDropState
      dragAndDropHooks={dragAndDropHooks}
      collection={filteredState.collection}
      selectionManager={selectionManager}
      ref={ref}
      keyboardDelegate={keyboardDelegate}
      orientation={orientation}
      layout={layout}
      direction={direction}
      ctxDropTargetDelegate={ctxDropTargetDelegate}>
      {({dragState, dropState, droppableCollection, isRootDropTarget, dragPreview}) => (
        <GridListInnerView
          props={props}
          gridListRef={ref}
          filteredState={filteredState}
          dragAndDropHooks={dragAndDropHooks}
          dragState={dragState}
          dropState={dropState}
          droppableCollection={droppableCollection}
          isRootDropTarget={isRootDropTarget}
          dragPreview={dragPreview}
          gridProps={gridProps}
          focusProps={focusProps}
          isFocused={isFocused}
          isFocusVisible={isFocusVisible}
          layout={layout}
          orientation={orientation}
          selectionManager={selectionManager}
        />
      )}
    </CollectionDragDropState>
  );
}

export interface GridListItemRenderProps extends ItemRenderProps {
  /** The unique id of the item. */
  id?: Key;
  /**
   * Whether the item's children have keyboard focus.
   *
   * @selector [data-focus-visible-within]
   */
  isFocusVisibleWithin: boolean;
  /**
   * State of the grid list.
   */
  state: ListState<unknown>;
}

export interface GridListItemProps<T = object>
  extends
    RenderProps<GridListItemRenderProps>,
    LinkDOMProps,
    HoverEvents,
    PressEvents,
    Omit<GlobalDOMAttributes<HTMLDivElement>, 'onClick'> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-GridListItem'
   */
  className?: ClassNameOrFunction<GridListItemRenderProps>;
  /** The unique id of the item. */
  id?: Key;
  /**
   * The object value that this item represents. When using dynamic collections, this is set
   * automatically.
   */
  value?: T;
  /** A string representation of the item's contents, used for features like typeahead. */
  textValue?: string;
  /** Whether the item is disabled. */
  isDisabled?: boolean;
  /**
   * Handler that is called when a user performs an action on the item. The exact user event depends
   * on the collection's `selectionBehavior` prop and the interaction modality.
   */
  onAction?: () => void;
}

/**
 * A GridListItem represents an individual item in a GridList.
 */
export const GridListItem = /*#__PURE__*/ createLeafComponent(ItemNode, function GridListItem<
  T
>(props: GridListItemProps<T>, forwardedRef: ForwardedRef<HTMLDivElement>, item: Node<T>) {
  let state = useContext(ListStateContext)!;
  let {dragState, dropState} = useContext(DragAndDropContext);
  let ref = useObjectRef<HTMLDivElement>(forwardedRef);
  let {isVirtualized} = useContext(CollectionRendererContext);
  let isDraggable =
    dragState && !(dragState.isDisabled || dragState.selectionManager.isDisabled(item.key));
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
    // because of https://bugs.webkit.org/show_bug.cgi?id=214609, supporting hover styles when a item is ONLY isDraggable
    // results in hover styles sticking around after a reorder/drop operation...
    isDisabled: !states.allowsSelection && !states.hasAction && !isDraggable,
    onHoverStart: item.props.onHoverStart,
    onHoverChange: item.props.onHoverChange,
    onHoverEnd: item.props.onHoverEnd
  });

  let {isFocusVisible, focusProps} = useFocusRing();
  let {isFocusVisible: isFocusVisibleWithin, focusProps: focusWithinProps} = useFocusRing({
    within: true
  });
  let {checkboxProps} = useGridListSelectionCheckbox({key: item.key}, state);

  let buttonProps =
    state.selectionManager.disabledBehavior === 'all' && states.isDisabled
      ? {isDisabled: true}
      : {};

  let itemDragDropMode = getItemDragDropMode(dragState, dropState);
  let itemContentProps = {
    props,
    item,
    ref,
    state,
    dragState,
    rowProps,
    gridCellProps,
    descriptionProps,
    states,
    isHovered,
    hoverProps,
    isFocusVisible,
    focusProps,
    isFocusVisibleWithin,
    focusWithinProps,
    checkboxProps,
    buttonProps,
    dropState
  };

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
          <GridListItemDropIndicator
            itemKey={item.key}
            dropState={dropState}
            itemContentProps={
              itemContentProps as Omit<
                GridListItemContentProps<any>,
                'draggableItem' | 'isDropTarget'
              >
            }
            draggableItem={draggableItem}
          />
        ) : (
          <GridListItemContent
            {...itemContentProps}
            draggableItem={draggableItem}
            isDropTarget={false}
          />
        )
      }
    </CollectionItemDragDrop>
  );
});

interface GridListItemDropIndicatorProps<T> {
  itemKey: Key;
  dropState: import('react-stately/useDroppableCollectionState').DroppableCollectionState;
  itemContentProps: Omit<GridListItemContentProps<T>, 'draggableItem' | 'isDropTarget'>;
  draggableItem?: DraggableItemResult;
}

function GridListItemDropIndicator<T>({
  itemKey,
  dropState,
  itemContentProps,
  draggableItem
}: GridListItemDropIndicatorProps<T>) {
  let dropIndicatorRef = useRef<HTMLDivElement>(null);
  let {visuallyHiddenProps} = useVisuallyHidden();

  return (
    <CollectionDropIndicator
      props={{target: {type: 'item', key: itemKey, dropPosition: 'on'}}}
      dropState={dropState}
      ref={dropIndicatorRef}>
      {({dropIndicatorProps, isHidden, isDropTarget}) => (
        <>
          {!isHidden && (
            <div role="row" style={{position: 'absolute'}}>
              <div role="gridcell">
                <div
                  role="button"
                  {...visuallyHiddenProps}
                  {...dropIndicatorProps}
                  ref={dropIndicatorRef}
                />
              </div>
            </div>
          )}
          <GridListItemContent
            {...itemContentProps}
            draggableItem={draggableItem}
            isDropTarget={isDropTarget}
          />
        </>
      )}
    </CollectionDropIndicator>
  );
}

interface GridListItemContentProps<T> {
  props: GridListItemProps<T>;
  item: Node<T>;
  ref: RefObject<HTMLDivElement | null> | React.MutableRefObject<HTMLDivElement | null>;
  state: ListState<T>;
  dragState?: import('react-stately/useDraggableCollectionState').DraggableCollectionState;
  rowProps: ReturnType<typeof useGridListItem>['rowProps'];
  gridCellProps: ReturnType<typeof useGridListItem>['gridCellProps'];
  descriptionProps: ReturnType<typeof useGridListItem>['descriptionProps'];
  states: Omit<
    ReturnType<typeof useGridListItem>,
    'rowProps' | 'gridCellProps' | 'descriptionProps'
  >;
  isHovered: boolean;
  hoverProps: ReturnType<typeof useHover>['hoverProps'];
  isFocusVisible: boolean;
  focusProps: ReturnType<typeof useFocusRing>['focusProps'];
  isFocusVisibleWithin: boolean;
  focusWithinProps: ReturnType<typeof useFocusRing>['focusProps'];
  checkboxProps: ReturnType<typeof useGridListSelectionCheckbox>['checkboxProps'];
  buttonProps: {isDisabled?: boolean};
  dropState?: import('react-stately/useDroppableCollectionState').DroppableCollectionState;
  draggableItem?: DraggableItemResult;
  isDropTarget: boolean;
}

function GridListItemContent<T>({
  props,
  item,
  ref,
  state,
  dragState,
  rowProps,
  gridCellProps,
  descriptionProps,
  states,
  isHovered,
  hoverProps,
  isFocusVisible,
  focusProps,
  isFocusVisibleWithin,
  focusWithinProps,
  checkboxProps,
  buttonProps,
  draggableItem,
  isDropTarget
}: GridListItemContentProps<T>) {
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
      isFocusVisibleWithin,
      selectionMode: state.selectionManager.selectionMode,
      selectionBehavior: state.selectionManager.selectionBehavior,
      allowsDragging: !!dragState,
      isDragging,
      isDropTarget,
      id: item.key,
      state
    }
  });

  let dragButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (dragState && !dragButtonRef.current) {
      console.warn(
        'Draggable items in a GridList must contain a <Button slot="drag"> element so that keyboard and screen reader users can drag them.'
      );
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!item.textValue && process.env.NODE_ENV !== 'production') {
      console.warn(
        'A `textValue` prop is required for <GridListItem> elements with non-plain text children in order to support accessibility features such as type to select.'
      );
    }
  }, [item.textValue]);

  let DOMProps = filterDOMProps(props as any, {global: true});
  delete DOMProps.id;
  delete DOMProps.onClick;

  return (
    <dom.div
      {...mergeProps(
        DOMProps,
        renderProps,
        rowProps,
        focusProps,
        focusWithinProps,
        hoverProps,
        draggableItem?.dragProps
      )}
      ref={ref}
      data-selected={states.isSelected || undefined}
      data-disabled={states.isDisabled || undefined}
      data-hovered={isHovered || undefined}
      data-focused={states.isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-focus-visible-within={isFocusVisibleWithin || undefined}
      data-pressed={states.isPressed || undefined}
      data-allows-dragging={!!dragState || undefined}
      data-dragging={isDragging || undefined}
      data-drop-target={isDropTarget || undefined}
      data-selection-mode={
        state.selectionManager.selectionMode === 'none'
          ? undefined
          : state.selectionManager.selectionMode
      }>
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
            [
              ButtonContext,
              {
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
              }
            ],
            [
              TextContext,
              {
                slots: {
                  [DEFAULT_SLOT]: {},
                  description: descriptionProps
                }
              }
            ],
            [CollectionRendererContext, DefaultCollectionRenderer],
            [ListStateContext, null],
            [SelectableCollectionContext, null],
            [FieldInputContext, null],
            [SelectionIndicatorContext, {isSelected: states.isSelected}]
          ]}>
          {renderProps.children}
        </Provider>
      </div>
    </dom.div>
  );
}

function GridListDropIndicatorWrapper(
  props: DropIndicatorProps,
  refArg: ForwardedRef<HTMLElement>
) {
  let ref = refArg;
  ref = useObjectRef(ref);
  let {dropState} = useContext(DragAndDropContext);
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

        return (
          <GridListDropIndicatorForwardRef
            {...props}
            dropIndicatorProps={dropIndicatorProps}
            isDropTarget={isDropTarget}
            buttonRef={buttonRef}
            ref={ref}
          />
        );
      }}
    </CollectionDropIndicator>
  );
}

interface GridListDropIndicatorProps extends DropIndicatorProps {
  dropIndicatorProps: React.HTMLAttributes<HTMLElement>;
  isDropTarget: boolean;
  buttonRef: RefObject<HTMLDivElement | null>;
}

function GridListDropIndicator(props: GridListDropIndicatorProps, ref: ForwardedRef<HTMLElement>) {
  let {dropIndicatorProps, isDropTarget, buttonRef, ...otherProps} = props;

  let {visuallyHiddenProps} = useVisuallyHidden();
  let renderProps = useRenderProps({
    ...otherProps,
    defaultClassName: 'react-aria-DropIndicator',
    values: {
      isDropTarget
    }
  });

  return (
    <dom.div
      {...renderProps}
      role="row"
      ref={ref as RefObject<HTMLDivElement | null>}
      data-drop-target={isDropTarget || undefined}>
      <div role="gridcell">
        <div {...visuallyHiddenProps} role="button" {...dropIndicatorProps} ref={buttonRef} />
        {renderProps.children}
      </div>
    </dom.div>
  );
}

const GridListDropIndicatorForwardRef = forwardRef(GridListDropIndicator);

function RootDropIndicator({
  dropState
}: {
  dropState: import('react-stately/useDroppableCollectionState').DroppableCollectionState;
}) {
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

export interface GridListLoadMoreItemProps
  extends
    Omit<LoadMoreSentinelProps, 'collection'>,
    StyleProps,
    DOMRenderProps<'div', undefined>,
    GlobalDOMAttributes<HTMLDivElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element.
   *
   * @default 'react-aria-GridListLoadMoreItem'
   */
  className?: string;
  /**
   * The load more spinner to render when loading additional items.
   */
  children?: ReactNode;
  /**
   * Whether or not the loading spinner should be rendered or not.
   */
  isLoading?: boolean;
}

export const GridListLoadMoreItem = createLeafComponent(
  LoaderNode,
  function GridListLoadingIndicator(
    props: GridListLoadMoreItemProps,
    ref: ForwardedRef<HTMLDivElement>,
    item: Node<object>
  ) {
    let state = useContext(ListStateContext)!;
    let {isVirtualized} = useContext(CollectionRendererContext);
    let {isLoading, onLoadMore, scrollOffset, ...otherProps} = props;

    let sentinelRef = useRef(null);
    let memoedLoadMoreProps = useMemo(
      () => ({
        onLoadMore,
        collection: state?.collection,
        sentinelRef,
        scrollOffset
      }),
      [onLoadMore, scrollOffset, state?.collection]
    );
    useLoadMoreSentinel(memoedLoadMoreProps, sentinelRef);

    let renderProps = useRenderProps({
      ...otherProps,
      id: undefined,
      children: item.rendered,
      defaultClassName: 'react-aria-GridListLoadingIndicator',
      values: undefined
    });
    // For now don't include aria-posinset and aria-setsize on loader since they aren't keyboard focusable
    // Arguably shouldn't include them ever since it might be confusing to the user to include the loaders as part of the
    // item count

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
          <dom.div {...renderProps} {...filterDOMProps(props, {global: true})} role="row" ref={ref}>
            <div aria-colindex={isVirtualized ? 1 : undefined} role="gridcell">
              {renderProps.children}
            </div>
          </dom.div>
        )}
      </>
    );
  }
);

export interface GridListSectionProps<T> extends SectionProps<T>, DOMRenderProps<'div', undefined> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element.
   *
   * @default 'react-aria-GridListSection'
   */
  className?: string;
}

/**
 * A GridListSection represents a section within a GridList.
 */
export const GridListSection = /*#__PURE__*/ createBranchComponent(
  SectionNode,
  <T extends any>(
    props: GridListSectionProps<T>,
    refArg: ForwardedRef<HTMLDivElement>,
    item: Node<T>
  ) => {
    let ref = refArg;
    let state = useContext(ListStateContext)!;
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
      defaultClassName: 'react-aria-GridListSection',
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

export interface GridListHeaderProps
  extends DOMRenderProps<'div', undefined>, DOMProps, GlobalDOMAttributes<HTMLElement> {}

export const GridListHeaderContext = createContext<
  ContextValue<GridListHeaderProps, HTMLDivElement>
>({});
export const GridListHeaderInnerContext = createContext<HTMLAttributes<HTMLElement> | null>(null);

export const GridListHeader = /*#__PURE__*/ createLeafComponent(
  HeaderNode,
  function Header(propsArg: GridListHeaderProps, refArg: ForwardedRef<HTMLDivElement>) {
    let props = propsArg;
    let ref = refArg;
    [props, ref] = useContextProps(props, ref, GridListHeaderContext);
    let rowHeaderProps = useContext(GridListHeaderInnerContext);

    return (
      <dom.div render={props.render} className="react-aria-GridListHeader" ref={ref} {...props}>
        <div {...rowHeaderProps} style={{display: 'contents'}}>
          {props.children}
        </div>
      </dom.div>
    );
  }
);
