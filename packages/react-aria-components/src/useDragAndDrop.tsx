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
  DraggableCollectionProps,
  DragItem,
  DroppableCollectionProps,
  DropTarget,
  DropTargetDelegate,
  Key
} from '@react-types/shared';
import {DragPreview} from 'react-aria/useDraggableCollection';
import {isVirtualDragging} from 'react-aria/private/dnd/DragManager';
import {JSX, useMemo} from 'react';
import {ListDropTargetDelegate} from 'react-aria/ListDropTargetDelegate';

export {DropIndicator, DropIndicatorContext, DragAndDropContext} from './DragAndDrop';
export type {DropIndicatorProps, DropIndicatorRenderProps} from './DragAndDrop';

export interface DragAndDropHooks extends DragAndDropOptions<any> {
  /** Whether the collection supports dragging. */
  isDraggable: boolean;
  /** Whether the collection supports dropping. */
  isDroppable: boolean;
  DragPreview?: typeof DragPreview;
  ListDropTargetDelegate?: typeof ListDropTargetDelegate;
  isVirtualDragging?: typeof isVirtualDragging;
}

export interface DragAndDrop<_T = object> {
  /** Drag and drop hooks for the collection element. */
  dragAndDropHooks: DragAndDropHooks;
}

export interface DragAndDropOptions<T = object>
  extends Omit<DraggableCollectionProps, 'preview' | 'getItems'>, DroppableCollectionProps {
  /**
   * A function that returns the items being dragged. If not specified, we assume that the
   * collection is not draggable.
   *
   * @default () => []
   */
  getItems?: (keys: Set<Key>, items: T[]) => DragItem[];
  /**
   * A function that renders a drag preview, which is shown under the user's cursor while dragging.
   * By default, a copy of the dragged element is rendered.
   */
  renderDragPreview?: (
    items: DragItem[]
  ) => JSX.Element | {element: JSX.Element; x: number; y: number};
  /**
   * A function that renders a drop indicator element between two items in a collection.
   * This should render a `<DropIndicator>` element. If this function is not provided, a
   * default DropIndicator is provided.
   */
  renderDropIndicator?: (target: DropTarget) => JSX.Element;
  /**
   * A custom delegate object that provides drop targets for pointer coordinates within the
   * collection.
   */
  dropTargetDelegate?: DropTargetDelegate;
  /** Whether the drag and drop events should be disabled. */
  isDisabled?: boolean;
}

/**
 * Provides the hooks required to enable drag and drop behavior for a drag and drop compatible
 * collection component.
 */
export function useDragAndDrop<T = object>(options: DragAndDropOptions<T>): DragAndDrop<T> {
  let dragAndDropHooks = useMemo((): DragAndDropHooks => {
    let isDraggable = !!options.getItems;
    let isDroppable = !!(
      options.onDrop ||
      options.onInsert ||
      options.onItemDrop ||
      options.onReorder ||
      options.onMove ||
      options.onRootDrop
    );

    return {
      ...options,
      isDraggable,
      isDroppable,
      DragPreview: isDraggable ? DragPreview : undefined,
      ListDropTargetDelegate: isDroppable ? ListDropTargetDelegate : undefined,
      isVirtualDragging: isDraggable ? isVirtualDragging : undefined
    };
  }, [options]);

  return {
    dragAndDropHooks
  };
}
