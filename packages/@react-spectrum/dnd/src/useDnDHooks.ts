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
  DraggableCollectionState,
  DroppableCollectionState,
  DroppableCollectionStateOptions,
  useDraggableCollectionState,
  useDroppableCollectionState
} from '@react-stately/dnd';
import {DraggableCollectionProps, DragItem} from '@react-types/shared';
import {
  DraggableItemProps,
  DraggableItemResult,
  DragPreview,
  DropIndicatorAria,
  DropIndicatorProps,
  DroppableCollectionOptions,
  DroppableCollectionResult,
  DroppableItemOptions,
  DroppableItemResult,
  useDraggableItem,
  useDropIndicator,
  useDroppableCollection,
  useDroppableItem
} from '@react-aria/dnd';
import {DroppableCollectionProps} from '@react-types/shared';
import {Key, RefObject, useMemo} from 'react';

export interface DragHooks {
  useDraggableCollectionState(props: Omit<DraggableCollectionOptions, 'getItems'>): DraggableCollectionState,
  useDraggableItem(props: DraggableItemProps, state: DraggableCollectionState): DraggableItemResult,
  DragPreview: typeof DragPreview
}

export interface DropHooks {
  useDroppableCollectionState(props: DroppableCollectionStateOptions): DroppableCollectionState,
  useDroppableCollection(props: DroppableCollectionOptions, state: DroppableCollectionState, ref: RefObject<HTMLElement>): DroppableCollectionResult,
  useDroppableItem(options: DroppableItemOptions, state: DroppableCollectionState, ref: RefObject<HTMLElement>): DroppableItemResult,
  useDropIndicator(props: DropIndicatorProps, state: DroppableCollectionState, ref: RefObject<HTMLElement>): DropIndicatorAria
}

export interface DnDHooks {
  dragHooks: DragHooks,
  dropHooks: DropHooks
}

// TODO: make getItems and getDropOperation optional? If they aren't provided then we add default functions that essentially make the collection non draggable/droppable
// TODO: adjust DraggableCollectionProps to have getItems be optional instead? Or maybe skip the default for getItems and getDropOperations and just return null for dragHooks and dropHooks
export interface DnDOptions extends Omit<DraggableCollectionProps, 'preview' | 'getItems'>, DroppableCollectionProps {
  /**
   * A function that returns the items being dragged. If not specified, assumes that the collection is not draggable.
   * @default () => []
   */
  getItems?: (keys: Set<Key>) => DragItem[]
  // Tentative prop. Handles converting the items from the drop operation's dataTransfer to the actual data format that the user can use
  // itemProcessor?: (data: any) => any
}

// This hook is essentially useDropHooks and useDragHooks combined. By providing onInsert, onRootDrop, onItemDrop, onReorder, acceptedDragTypes the user doesn't have to
// provide onDrop and getDropOperation since we'll handle that for them. Kinda feels non-intuative still...
// TODO: potential issues/scenarios:
// handling TextItem, FileItem, DirectoryItem in the premade onDrop (directoryItem doesn't have type, do we need to getEntries and check the type? or do we just accept directoryItems?)
// handling internal drops where the user opens a internal (in collection) folder via hover and does a insert that way? Is `isDragging` inaccurate in that case since it could be the same ListView, just with different contents due to a collection update?
// what if onDrop fires after onDragEnd? Then we can't determine if it is an internal drop event in onDrop because isDragging would get updated by onDragEnd. Perhaps we should track the collection ref or create a id for each draggable collection?
export function useDnDHooks(options: DnDOptions): DnDHooks {
  let dragHooks = useMemo(() => ({
    useDraggableCollectionState(props: DraggableCollectionOptions) {
      return useDraggableCollectionState({
        getItems: () => [],
        ...props,
        ...options
      });
    },
    useDraggableItem,
    DragPreview
  }), [options]);

  let dropHooks = useMemo(() => ({
    useDroppableCollectionState(props) {
      return useDroppableCollectionState({...props, ...options});
    },
    useDroppableItem,
    useDroppableCollection(props, state, ref) {
      return useDroppableCollection({...props, ...options}, state, ref);
    },
    useDropIndicator
  }), [options]);


  // If the user doesn't want their collection to be draggable/droppable, they can just not pass dragHooks/dropHooks to their collection
  return {
    dragHooks,
    dropHooks
  };
}
