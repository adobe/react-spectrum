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
import {AriaGridListProps, DraggableItemResult, DropIndicatorAria, DroppableCollectionResult, mergeProps, useFocusRing, useGridList, useGridListItem, useGridListSelectionCheckbox, useHover, useVisuallyHidden} from 'react-aria';
import {ButtonContext} from './Button';
import {CheckboxContext} from './Checkbox';
import {CollectionProps, ItemProps, useCachedChildren, useCollection} from './Collection';
import {ContextValue, defaultSlot, Provider, SlotProps, StyleRenderProps, useContextProps, useRenderProps} from './utils';
import {DragAndDropHooks, DropIndicatorProps} from './useDragAndDrop';
import {DraggableCollectionState, DroppableCollectionState, ListState, useListState} from 'react-stately';
import {filterDOMProps, useObjectRef} from '@react-aria/utils';
import {ListKeyboardDelegate} from '@react-aria/selection';
import {Node} from '@react-types/shared';
import React, {createContext, ForwardedRef, forwardRef, RefObject, useContext, useEffect, useRef} from 'react';
import {TextContext} from './Text';

export interface GridListRenderProps {
  /**
   * Whether the grid list root is currently the active drop target.
   * @selector [data-drop-target]
   */
  isDropTarget?: boolean
}

export interface GridListProps<T> extends Omit<AriaGridListProps<T>, 'children'>, CollectionProps<T>, StyleRenderProps<GridListRenderProps>, SlotProps {
  /** The drag and drop hooks returned by `useDragAndDrop` used to enable drag and drop behavior for the ListBox. */
  dragAndDropHooks?: DragAndDropHooks
}

interface InternalGridListContextValue {
  state: ListState<unknown>,
  dragAndDropHooks?: DragAndDropHooks,
  dragState?: DraggableCollectionState,
  dropState?: DroppableCollectionState
}

export const GridListContext = createContext<ContextValue<GridListProps<any>, HTMLUListElement>>(null);
const InternalGridListContext = createContext<InternalGridListContextValue>(null);

function GridList<T extends object>(props: GridListProps<T>, ref: ForwardedRef<HTMLUListElement>) {
  [props, ref] = useContextProps(props, ref, GridListContext);
  let {dragAndDropHooks} = props;
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

  let dragState: DraggableCollectionState;
  let dropState: DroppableCollectionState;
  let droppableCollection: DroppableCollectionResult;
  let isRootDropTarget: boolean;
  let dragPreview: JSX.Element;
  let preview = useRef(null);

  if (isListDraggable) {
    dragState = dragAndDropHooks.useDraggableCollectionState({
      collection,
      selectionManager,
      preview: dragAndDropHooks.renderDragPreview ? preview : null
    });
    dragAndDropHooks.useDraggableCollection({}, dragState, ref);

    dragPreview = dragAndDropHooks.renderDragPreview
      ? <dragAndDropHooks.DragPreview ref={preview}>{dragAndDropHooks.renderDragPreview}</dragAndDropHooks.DragPreview>
      : null;
  }

  if (isListDroppable) {
    dropState = dragAndDropHooks.useDroppableCollectionState({
      collection,
      selectionManager
    });

    let keyboardDelegate = new ListKeyboardDelegate(
      collection,
      selectionManager.disabledBehavior === 'selection' ? new Set() : selectionManager.disabledKeys,
      ref
    );
    let dropTargetDelegate = dragAndDropHooks.dropTargetDelegate || new dragAndDropHooks.ListDropTargetDelegate(collection, ref);
    droppableCollection = dragAndDropHooks.useDroppableCollection({
      keyboardDelegate,
      dropTargetDelegate
    }, dropState, ref);

    isRootDropTarget = dropState.isDropTarget({type: 'root'});
  }

  let renderProps = useRenderProps({
    className: props.className,
    style: props.style,
    defaultClassName: 'react-aria-GridList',
    values: {
      isDropTarget: isRootDropTarget
    }
  });

  return (
    <ul
      {...filterDOMProps(props)}
      {...renderProps}
      {...mergeProps(gridProps, droppableCollection?.collectionProps)}
      ref={ref}
      slot={props.slot}
      data-drop-target={isRootDropTarget || undefined}>
      <InternalGridListContext.Provider value={{state, dragAndDropHooks, dragState, dropState}}>
        {children}
      </InternalGridListContext.Provider>
      {dragPreview}
      {portal}
    </ul>
  );
}

/**
 * A grid list displays a list of interactive items, with support for keyboard navigation,
 * single or multiple selection, and row actions.
 */
const _GridList = forwardRef(GridList);
export {_GridList as GridList};

function GridListItem({item}) {
  let {state, dragAndDropHooks, dragState, dropState} = useContext(InternalGridListContext);
  let ref = React.useRef();
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

  let draggableItem: DraggableItemResult;
  if (dragState) {
    draggableItem = dragAndDropHooks.useDraggableItem({key: item.key, hasDragButton: true}, dragState);
  }

  let dropIndicator: DropIndicatorAria;
  let dropIndicatorRef = useRef(null);
  let {visuallyHiddenProps} = useVisuallyHidden();
  if (dropState) {
    dropIndicator = dragAndDropHooks.useDropIndicator({
      target: {type: 'item', key: item.key, dropPosition: 'on'}
    }, dropState, dropIndicatorRef);
  }

  let props: ItemProps<unknown> = item.props;
  let isDragging = dragState && dragState.isDragging(item.key);
  let renderProps = useRenderProps({
    ...props,
    children: item.rendered,
    defaultClassName: 'react-aria-Item',
    values: {
      ...states,
      isHovered,
      isFocusVisible,
      selectionMode: state.selectionManager.selectionMode,
      selectionBehavior: state.selectionManager.selectionBehavior,
      isDraggable: !!dragState,
      isDragging,
      isDropTarget: dropIndicator?.isDropTarget
    }
  });

  let renderDropIndicator = dragAndDropHooks?.renderDropIndicator || (target => <GridListDropIndicator target={target} />);
  let dragButtonRef = useRef(null);
  useEffect(() => {
    if (dragState && !dragButtonRef.current) {
      console.warn('Draggable items in a GridList must contain a <Button slot="drag"> element so that keyboard and screen reader users can drag them.');
    }
  // eslint-disable-next-line
  }, []);

  return (
    <>
      {dragAndDropHooks?.useDropIndicator &&
        renderDropIndicator({type: 'item', key: item.key, dropPosition: 'before'})
      }
      <li
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
          {dropIndicator && !dropIndicator.isHidden &&
            <div role="button" {...visuallyHiddenProps} {...dropIndicator?.dropIndicatorProps} ref={dropIndicatorRef} />
          }
          <Provider
            values={[
              [CheckboxContext, checkboxProps],
              [ButtonContext, {
                slots: {
                  [defaultSlot]: {},
                  drag: {
                    ...draggableItem?.dragButtonProps,
                    isDraggable: true,
                    ref: dragButtonRef
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
      </li>
      {dragAndDropHooks?.useDropIndicator && state.collection.getKeyAfter(item.key) == null &&
        renderDropIndicator({type: 'item', key: item.key, dropPosition: 'after'})
      }
    </>
  );
}

function GridListDropIndicator(props: DropIndicatorProps, ref: ForwardedRef<HTMLElement>) {
  ref = useObjectRef(ref);
  let {dragAndDropHooks, dropState} = useContext(InternalGridListContext);
  let buttonRef = useRef(null);
  let {dropIndicatorProps, isHidden, isDropTarget} = dragAndDropHooks.useDropIndicator(
    props,
    dropState,
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
    <li
      {...renderProps}
      role="row"
      ref={ref as RefObject<HTMLLIElement>}
      data-drop-target={isDropTarget || undefined}>
      <div role="gridcell">
        <div {...visuallyHiddenProps} role="button" {...dropIndicatorProps} ref={buttonRef} />
      </div>
    </li>
  );
}
