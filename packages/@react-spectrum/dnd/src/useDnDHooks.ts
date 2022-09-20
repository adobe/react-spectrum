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
  DraggableCollectionOptions,
  DraggableItemProps,
  DraggableItemResult,
  DragPreview,
  DropIndicatorAria,
  DropIndicatorProps,
  DroppableCollectionOptions,
  DroppableCollectionResult,
  DroppableItemOptions,
  DroppableItemResult,
  isVirtualDragging,
  useDraggableCollection,
  useDraggableItem,
  useDropIndicator,
  useDroppableCollection,
  useDroppableItem
} from '@react-aria/dnd';
import {DraggableCollectionProps, DragItem} from '@react-types/shared';
import {
  DraggableCollectionState,
  DraggableCollectionStateOptions,
  DroppableCollectionState,
  DroppableCollectionStateOptions,
  useDraggableCollectionState,
  useDroppableCollectionState
} from '@react-stately/dnd';

import {DroppableCollectionProps} from '@react-types/shared';
import {Key, RefObject, useMemo} from 'react';

interface DragHooks {
  useDraggableCollectionState?: (props: Omit<DraggableCollectionStateOptions, 'getItems'>) => DraggableCollectionState,
  useDraggableCollection?: (props: DraggableCollectionOptions, state: DraggableCollectionState, ref: RefObject<HTMLElement>) => void,
  useDraggableItem?: (props: DraggableItemProps, state: DraggableCollectionState) => DraggableItemResult,
  DragPreview?: typeof DragPreview
}

interface DropHooks {
  useDroppableCollectionState?: (props: DroppableCollectionStateOptions) => DroppableCollectionState,
  useDroppableCollection?: (props: DroppableCollectionOptions, state: DroppableCollectionState, ref: RefObject<HTMLElement>) => DroppableCollectionResult,
  useDroppableItem?: (options: DroppableItemOptions, state: DroppableCollectionState, ref: RefObject<HTMLElement>) => DroppableItemResult,
  useDropIndicator?: (props: DropIndicatorProps, state: DroppableCollectionState, ref: RefObject<HTMLElement>) => DropIndicatorAria
}

export interface DnDHooks {
  dndHooks: DragHooks & DropHooks & {isVirtualDragging?: () => boolean}
}

export interface DnDOptions extends Omit<DraggableCollectionProps, 'preview' | 'getItems'>, DroppableCollectionProps {
  /**
   * A function that returns the items being dragged. If not specified, we assume that the collection is not draggable.
   * @default () => []
   */
  getItems?: (keys: Set<Key>) => DragItem[]
}

export function useDnDHooks(options: DnDOptions): DnDHooks {
  let {
    onDrop,
    onInsert,
    onItemDrop,
    onReorder,
    onRootDrop,
    getItems
   } = options;

  let dragHooks: DragHooks = useMemo(() => ({
    useDraggableCollectionState(props: DraggableCollectionStateOptions) {
      return useDraggableCollectionState({...props, ...options});
    },
    useDraggableCollection,
    useDraggableItem,
    DragPreview
  }), [options]);

  let dropHooks: DropHooks = useMemo(() => ({
    useDroppableCollectionState(props) {
      return useDroppableCollectionState({...props, ...options});
    },
    useDroppableItem,
    useDroppableCollection(props, state, ref) {
      return useDroppableCollection({...props, ...options}, state, ref);
    },
    useDropIndicator
  }), [options]);

  let isDraggable = !!getItems;
  let isDroppable = !!(onDrop || onInsert || onItemDrop || onReorder || onRootDrop);

  let mergedHooks = {
    ...(isDraggable ? dragHooks : {}),
    ...(isDroppable ? dropHooks : {}),
    ...(isDraggable || isDroppable ? {isVirtualDragging} : {})
  };

  return {
    dndHooks: mergedHooks
  };
}
