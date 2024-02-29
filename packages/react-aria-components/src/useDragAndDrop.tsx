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
  DropIndicatorProps as AriaDropIndicatorProps,
  DraggableCollectionOptions,
  DraggableItemProps,
  DraggableItemResult,
  DragItem,
  DragPreview,
  DropIndicatorAria,
  DroppableCollectionOptions,
  DroppableCollectionResult,
  DroppableItemOptions,
  DroppableItemResult,
  DropTarget,
  DropTargetDelegate,
  ListDropTargetDelegate,
  useDraggableCollection,
  useDraggableItem,
  useDropIndicator,
  useDroppableCollection,
  useDroppableItem
} from 'react-aria';
import {DraggableCollectionProps, DroppableCollectionProps, Key} from '@react-types/shared';
import {
  DraggableCollectionState,
  DraggableCollectionStateOptions,
  DroppableCollectionState,
  DroppableCollectionStateOptions,
  useDraggableCollectionState,
  useDroppableCollectionState
} from 'react-stately';
import React, {createContext, ForwardedRef, forwardRef, JSX, ReactNode, RefObject, useContext, useMemo} from 'react';
import {RenderProps} from './utils';

interface DraggableCollectionStateOpts extends Omit<DraggableCollectionStateOptions, 'getItems'> {}

interface DragHooks {
  useDraggableCollectionState?: (props: DraggableCollectionStateOpts) => DraggableCollectionState,
  useDraggableCollection?: (props: DraggableCollectionOptions, state: DraggableCollectionState, ref: RefObject<HTMLElement>) => void,
  useDraggableItem?: (props: DraggableItemProps, state: DraggableCollectionState) => DraggableItemResult,
  DragPreview?: typeof DragPreview,
  renderDragPreview?: (items: DragItem[]) => JSX.Element
}

interface DropHooks {
  useDroppableCollectionState?: (props: DroppableCollectionStateOptions) => DroppableCollectionState,
  useDroppableCollection?: (props: DroppableCollectionOptions, state: DroppableCollectionState, ref: RefObject<HTMLElement>) => DroppableCollectionResult,
  useDroppableItem?: (options: DroppableItemOptions, state: DroppableCollectionState, ref: RefObject<HTMLElement>) => DroppableItemResult,
  useDropIndicator?: (props: AriaDropIndicatorProps, state: DroppableCollectionState, ref: RefObject<HTMLElement>) => DropIndicatorAria,
  renderDropIndicator?: (target: DropTarget) => JSX.Element,
  dropTargetDelegate?: DropTargetDelegate,
  ListDropTargetDelegate: typeof ListDropTargetDelegate
}

export type DragAndDropHooks = DragHooks & DropHooks

export interface DragAndDrop {
  /** Drag and drop hooks for the collection element.  */
  dragAndDropHooks: DragAndDropHooks
}

export interface DragAndDropOptions extends Omit<DraggableCollectionProps, 'preview' | 'getItems'>, DroppableCollectionProps {
  /**
   * A function that returns the items being dragged. If not specified, we assume that the collection is not draggable.
   * @default () => []
   */
  getItems?: (keys: Set<Key>) => DragItem[],
  /**
   * A function that renders a drag preview, which is shown under the user's cursor while dragging.
   * By default, a copy of the dragged element is rendered.
   */
  renderDragPreview?: (items: DragItem[]) => JSX.Element,
  /**
   * A function that renders a drop indicator element between two items in a collection.
   * This should render a `<DropIndicator>` element. If this function is not provided, a
   * default DropIndicator is provided.
   */
  renderDropIndicator?: (target: DropTarget) => JSX.Element,
  /** A custom delegate object that provides drop targets for pointer coordinates within the collection. */
  dropTargetDelegate?: DropTargetDelegate,
  /** Whether the drag and drop events should be disabled. */
  isDisabled?: boolean
}

/**
 * Provides the hooks required to enable drag and drop behavior for a drag and drop compatible collection component.
 */
export function useDragAndDrop(options: DragAndDropOptions): DragAndDrop {
  let dragAndDropHooks = useMemo(() => {
    let {
      onDrop,
      onInsert,
      onItemDrop,
      onReorder,
      onRootDrop,
      getItems,
      renderDragPreview,
      renderDropIndicator,
      dropTargetDelegate
    } = options;

    let isDraggable = !!getItems;
    let isDroppable = !!(onDrop || onInsert || onItemDrop || onReorder || onRootDrop);

    let hooks = {} as DragAndDropHooks;
    if (isDraggable) {
      hooks.useDraggableCollectionState = function useDraggableCollectionStateOverride(props: DraggableCollectionStateOpts) {
        return useDraggableCollectionState({...props, ...options} as DraggableCollectionStateOptions);
      };
      hooks.useDraggableCollection = useDraggableCollection;
      hooks.useDraggableItem = useDraggableItem;
      hooks.DragPreview = DragPreview;
      hooks.renderDragPreview = renderDragPreview;
    }

    if (isDroppable) {
      hooks.useDroppableCollectionState = function useDroppableCollectionStateOverride(props: DroppableCollectionStateOptions) {
        return useDroppableCollectionState({...props, ...options});
      };
      hooks.useDroppableItem = useDroppableItem;
      hooks.useDroppableCollection = function useDroppableCollectionOverride(props: DroppableCollectionOptions, state: DroppableCollectionState, ref: RefObject<HTMLElement>) {
        return useDroppableCollection({...props, ...options}, state, ref);
      };
      hooks.useDropIndicator = useDropIndicator;
      hooks.renderDropIndicator = renderDropIndicator;
      hooks.dropTargetDelegate = dropTargetDelegate;
      hooks.ListDropTargetDelegate = ListDropTargetDelegate;
    }

    return hooks;
  }, [options]);

  return {
    dragAndDropHooks
  };
}

export const DropIndicatorContext = createContext<DropIndicatorContextValue | null>(null);

export interface DropIndicatorRenderProps {
  /**
   * Whether the drop indicator is currently the active drop target.
   * @selector [data-drop-target]
   */
  isDropTarget: boolean
}

export interface DropIndicatorProps extends AriaDropIndicatorProps, RenderProps<DropIndicatorRenderProps> {}

interface DropIndicatorContextValue {
  render: (props: DropIndicatorProps, ref: ForwardedRef<HTMLElement>) => ReactNode
}

function DropIndicator(props: DropIndicatorProps, ref: ForwardedRef<HTMLElement>): JSX.Element {
  let {render} = useContext(DropIndicatorContext)!;
  return <>{render(props, ref)}</>;
}

/**
 * A DropIndicator is rendered between items in a collection to indicate where dropped data will be inserted.
 */
const _DropIndicator = forwardRef(DropIndicator);
export {_DropIndicator as DropIndicator};

export interface DragAndDropContextValue {
  dragAndDropHooks?: DragAndDropHooks,
  dragState?: DraggableCollectionState,
  dropState?: DroppableCollectionState
}

export const DragAndDropContext = createContext<DragAndDropContextValue>({});
