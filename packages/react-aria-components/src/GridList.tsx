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
import {AriaGridListProps, DraggableItemResult, DragPreviewRenderer, DropIndicatorAria, DroppableCollectionResult, FocusScope, ListKeyboardDelegate, mergeProps, useFocusRing, useGridList, useGridListItem, useGridListSelectionCheckbox, useHover, useVisuallyHidden, VisuallyHidden} from 'react-aria';
import {ButtonContext} from './Button';
import {CheckboxContext} from './Checkbox';
import {CollectionProps, ItemProps, useCachedChildren, useCollection} from './Collection';
import {ContextValue, defaultSlot, forwardRefType, Provider, SlotProps, StyleRenderProps, useContextProps, useRenderProps} from './utils';
import {DragAndDropHooks, DropIndicator, DropIndicatorContext, DropIndicatorProps} from './useDragAndDrop';
import {DraggableCollectionState, DroppableCollectionState, ListState, Node, SelectionBehavior, useListState} from 'react-stately';
import {filterDOMProps, isIOS, isWebKit, useObjectRef} from '@react-aria/utils';
import React, {createContext, ForwardedRef, forwardRef, HTMLAttributes, ReactNode, RefObject, useContext, useEffect, useRef} from 'react';
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
  isDropTarget: boolean
}

export interface GridListProps<T> extends Omit<AriaGridListProps<T>, 'children'>, CollectionProps<T>, StyleRenderProps<GridListRenderProps>, SlotProps {
  /** How multiple selection should behave in the collection. */
  selectionBehavior?: SelectionBehavior,
  /** The drag and drop hooks returned by `useDragAndDrop` used to enable drag and drop behavior for the GridList. */
  dragAndDropHooks?: DragAndDropHooks,
  /** Provides content to display when there are no items in the list. */
  renderEmptyState?: () => ReactNode
}

interface InternalGridListContextValue {
  state: ListState<unknown>,
  dragAndDropHooks?: DragAndDropHooks,
  dragState?: DraggableCollectionState,
  dropState?: DroppableCollectionState
}

export const GridListContext = createContext<ContextValue<GridListProps<any>, HTMLDivElement>>(null);
const InternalGridListContext = createContext<InternalGridListContextValue | null>(null);

function GridList<T extends object>(props: GridListProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, GridListContext);
  let {dragAndDropHooks} = props;
  let {portal, collection} = useCollection(props);
  let state = useListState({
    ...props,
    collection,
    children: undefined
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

  let selectionManager = state.selectionManager;
  let isListDraggable = !!dragAndDropHooks?.useDraggableCollectionState;
  let isListDroppable = !!dragAndDropHooks?.useDroppableCollectionState;
  let dragHooksProvided = useRef(isListDraggable);
  let dropHooksProvided = useRef(isListDroppable);
  if (dragHooksProvided.current !== isListDraggable) {
    console.warn('Drag hooks were provided during one render, but not another. This should be avoided as it may produce unexpected behavior.');
  }
  if (dropHooksProvided.current !== isListDroppable) {
    console.warn('Drop hooks were provided during one render, but not another. This should be avoided as it may produce unexpected behavior.');
  }

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
    dragAndDropHooks.useDraggableCollection!({}, dragState, ref);

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

    let keyboardDelegate = new ListKeyboardDelegate(
      collection,
      selectionManager.disabledBehavior === 'selection' ? new Set() : selectionManager.disabledKeys,
      ref
    );
    let dropTargetDelegate = dragAndDropHooks.dropTargetDelegate || new dragAndDropHooks.ListDropTargetDelegate(collection, ref);
    droppableCollection = dragAndDropHooks.useDroppableCollection!({
      keyboardDelegate,
      dropTargetDelegate
    }, dropState, ref);

    isRootDropTarget = dropState.isDropTarget({type: 'root'});
  }

  let {focusProps, isFocused, isFocusVisible} = useFocusRing();
  let renderProps = useRenderProps({
    className: props.className,
    style: props.style,
    defaultClassName: 'react-aria-GridList',
    values: {
      isDropTarget: isRootDropTarget,
      isEmpty: state.collection.size === 0,
      isFocused,
      isFocusVisible
    }
  });

  let emptyState: ReactNode = null;
  let emptyStatePropOverrides: HTMLAttributes<HTMLElement> | null = null;
  if (state.collection.size === 0 && props.renderEmptyState) {
    // Ideally we'd use `display: contents` on the row and cell elements so that
    // they don't affect the layout of the children. However, WebKit currently has
    // a bug that makes grid elements with display: contents hidden to screen readers.
    // https://bugs.webkit.org/show_bug.cgi?id=239479
    let content = props.renderEmptyState();
    if (isWebKit()) {
      // For now, when in an empty state, swap the role to group in webkit.
      emptyStatePropOverrides = {
        role: 'group',
        'aria-multiselectable': undefined
      };

      if (isIOS()) {
        // iOS VoiceOver also doesn't announce the aria-label of group elements
        // so try to add a visually hidden label element as well.
        emptyState = (
          <>
            <VisuallyHidden>{gridProps['aria-label']}</VisuallyHidden>
            {content}
          </>
        );
      } else {
        emptyState = content;
      }
    } else {
      emptyState = (
        <div role="row" style={{display: 'contents'}}>
          <div role="gridcell" style={{display: 'contents'}}>
            {content}
          </div>
        </div>
      );
    }
  }

  return (
    <FocusScope>
      <div
        {...filterDOMProps(props)}
        {...renderProps}
        {...mergeProps(gridProps, focusProps, droppableCollection?.collectionProps, emptyStatePropOverrides)}
        ref={ref}
        slot={props.slot}
        data-drop-target={isRootDropTarget || undefined}
        data-empty={state.collection.size === 0 || undefined}
        data-focused={isFocused || undefined}
        data-focus-visible={isFocusVisible || undefined}>
        <Provider
          values={[
            [InternalGridListContext, {state, dragAndDropHooks, dragState, dropState}],
            [DropIndicatorContext, {render: GridListDropIndicator}]
          ]}>
          {isListDroppable && <RootDropIndicator />}
          {children}
        </Provider>
        {emptyState}
        {dragPreview}
        {portal}
      </div>
    </FocusScope>
  );
}

/**
 * A grid list displays a list of interactive items, with support for keyboard navigation,
 * single or multiple selection, and row actions.
 */
const _GridList = /*#__PURE__*/ (forwardRef as forwardRefType)(GridList);
export {_GridList as GridList};

function GridListItem({item}) {
  let {state, dragAndDropHooks, dragState, dropState} = useContext(InternalGridListContext)!;
  let ref = React.useRef<HTMLDivElement>(null);
  let {rowProps, gridCellProps, descriptionProps, ...states} = useGridListItem(
    {
      node: item,
      shouldSelectOnPressUp: !!dragState
    },
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

  let props: ItemProps<unknown> = item.props;
  let isDragging = dragState && dragState.isDragging(item.key);
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
      selectionBehavior: state.selectionManager.selectionBehavior,
      allowsDragging: !!dragState,
      isDragging,
      isDropTarget: dropIndicator?.isDropTarget
    }
  });

  let renderDropIndicator = dragAndDropHooks?.renderDropIndicator || (target => <DropIndicator target={target} />);
  let dragButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (dragState && !dragButtonRef.current) {
      console.warn('Draggable items in a GridList must contain a <Button slot="drag"> element so that keyboard and screen reader users can drag them.');
    }
  // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!item.textValue) {
      console.warn('A `textValue` prop is required for <Item> elements with non-plain text children in order to support accessibility features such as type to select.');
    }
  }, [item.textValue]);

  return (
    <>
      {dragAndDropHooks?.useDropIndicator &&
        renderDropIndicator({type: 'item', key: item.key, dropPosition: 'before'})
      }
      {dropIndicator && !dropIndicator.isHidden &&
        <div role="row" style={{position: 'absolute'}}>
          <div role="gridcell">
            <div role="button" {...visuallyHiddenProps} {...dropIndicator?.dropIndicatorProps} ref={dropIndicatorRef} />
          </div>
        </div>
      }
      <div
        {...mergeProps(rowProps, focusProps, hoverProps, draggableItem?.dragProps)}
        {...renderProps}
        ref={ref}
        data-hovered={isHovered || undefined}
        data-focused={states.isFocused || undefined}
        data-focus-visible={isFocusVisible || undefined}
        data-pressed={states.isPressed || undefined}
        data-dragging={isDragging || undefined}
        data-drop-target={dropIndicator?.isDropTarget || undefined}>
        <div {...gridCellProps}>
          <Provider
            values={[
              [CheckboxContext, checkboxProps],
              [ButtonContext, {
                slots: {
                  [defaultSlot]: {},
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
                  description: descriptionProps
                }
              }]
            ]}>
            {renderProps.children}
          </Provider>
        </div>
      </div>
      {dragAndDropHooks?.useDropIndicator && state.collection.getKeyAfter(item.key) == null &&
        renderDropIndicator({type: 'item', key: item.key, dropPosition: 'after'})
      }
    </>
  );
}

function GridListDropIndicator(props: DropIndicatorProps, ref: ForwardedRef<HTMLElement>) {
  ref = useObjectRef(ref);
  let {dragAndDropHooks, dropState} = useContext(InternalGridListContext)!;
  let buttonRef = useRef<HTMLDivElement>(null);
  let {dropIndicatorProps, isHidden, isDropTarget} = dragAndDropHooks!.useDropIndicator!(
    props,
    dropState!,
    buttonRef
  );

  let {visuallyHiddenProps} = useVisuallyHidden();

  if (isHidden) {
    return null;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-DropIndicator',
    values: {
      isDropTarget
    }
  });

  return (
    <div
      {...renderProps}
      role="row"
      ref={ref as RefObject<HTMLDivElement>}
      data-drop-target={isDropTarget || undefined}>
      <div role="gridcell">
        <div {...visuallyHiddenProps} role="button" {...dropIndicatorProps} ref={buttonRef} />
      </div>
    </div>
  );
}

function RootDropIndicator() {
  let {dragAndDropHooks, dropState} = useContext(InternalGridListContext)!;
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
