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
import {DraggableCollectionProps, DragItem, DragTypes,  DropOperation, DroppableCollectionDropEvent, DropTarget} from '@react-types/shared';
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
import {DroppableCollectionProps, DropPosition} from '@react-types/shared';
import {Key, RefObject, useCallback, useMemo, useRef} from 'react';

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
  getItems?: (keys: Set<Key>) => DragItem[],
  /**
   * Handler called when external items are dropped "between" the droppable collection's items. TODO: need better typing for the items since it won't be an Array<string> for FileItem/DirectoryItems
   */
  onInsert?: (items: Array<string>, targetKey: Key, dropPosition: DropPosition, isInternalDrop: boolean) => void,
  /**
   * Handler called when external items are dropped on the droppable collection's root.
   */
  onRootDrop?: (items: Array<string>, isInternalDrop: boolean) => void,
  /**
   * Handler called when items are dropped "on" a droppable collection's item.
   */
  onItemDrop?: (items: Array<string>, targetKey: Key) => void,
  /**
   * The drag item types that the droppable collection accepts.
   * TODO: this assumes that the
   */
  acceptedDragTypes?: 'all' | Array<string>,
  /**
   * A function returning the drop operation to be performed when items matching the given types are dropped
   * on the drop target. If not specified, we infer the desired drop operations from the other options provided (onInsert, onRootDrop, onItemDrop, ).
   */
  getDropOperation?: (target: DropTarget, types: DragTypes, allowedOperations: DropOperation[]) => DropOperation
}

/*
FEEDBACK FROM MEETING
- consider adding onInsert, onRoot, onItemDrop options to useDropHooks. If user passes these, we can construct getDropOpeeration for them based on what
 handlers they provide
- think about adding onReorder and how to track when a dnd operation is a reorder operation. May need one wrapper hook around useDragHook and useDropHook so we can track if the collection is in a dragged state (via onDrag)
and compare it to if the collection is being dropped via onDrop to figure out if it is a reorder operation. Perhaps DragManager can track this and have the dnd event handlers access the DragManager?
- maybe have a second level of hooks that returns drop/drag handlers/options that then get passed to useDropHooks/useDragHooks. That way we can compose multiple things together (reorderable + droppable from outside sources)
*/


// This hook is essentially useDropHooks and useDragHooks combined. By providing onInsert, onRootDrop, onItemDrop, onReorder, acceptedDragTypes the user doesn't have to
// provide onDrop and getDropOperation since we'll handle that for them. Kinda feels non-intuative still...
// TODO: potential issues/scenarios:
// handling TextItem, FileItem, DirectoryItem in the premade onDrop (directoryItem doesn't have type, do we need to getEntries and check the type? or do we just accept directoryItems?)
// handling internal drops where the user opens a internal (in collection) folder via hover and does a insert that way? Is `isDragging` inaccurate in that case since it could be the same ListView, just with different contents due to a collection update?
// what if onDrop fires after onDragEnd? Then we can't determine if it is an internal drop event in onDrop because isDragging would get updated by onDragEnd. Perhaps we should track the collection ref or create a id for each draggable collection?
export function useDnDHooks(options: DnDOptions): DnDHooks {
  let {
    onInsert,
    onRootDrop,
    onItemDrop,
    acceptedDragTypes,
    onDrop: onDropProp
  } = options;
  let isDragging = useRef(false);
  let isInternalDropRef = useRef(false);

  let dragHooks = useMemo(() => ({
    useDraggableCollectionState(props: DraggableCollectionOptions) {
      return useDraggableCollectionState({
        getItems: () => [],
        ...props,
        ...options,
        onDragStart(e) {
          isDragging.current = true;
          if (options.onDragStart) {
            options.onDragStart(e);
          }
        },
        onDragEnd(e) {
          isDragging.current = false;
          if (options.onDragEnd) {
            // TODO: may need to provide isReorder to the onDragend args so users can prevent a list.remove or something similar
            // Perhaps add 'reorder' or 'internal' as a new DropEvent?
            console.log('isInternalDropRef', isInternalDropRef.current);
            options.onDragEnd(e, isInternalDropRef.current);
          }
          isInternalDropRef.current = false;
        }
      });
    },
    useDraggableItem,
    DragPreview
  }), [options]);


  let onDrop = useCallback(async (e: DroppableCollectionDropEvent) => {
    // Track if this is an internal drop in a separate var from the isInternalDrop ref since onDrop might happen after onDragEnd due to its async nature
    let isInternalDrop = isDragging.current;
    isInternalDropRef.current = isDragging.current;

    if (onDropProp) {
      onDropProp(e);
    } else {
      let dataList = [];
      let {
        target
      } = e;
      for (let item of e.items) {
        for (let acceptedType of acceptedDragTypes) {
          // TODO: this assumes the item's kind is text and just pushes the data as is to the dataList
          // Perhaps we can also add item.kind === 'file' and 'directory' checks and push the results of getFile/getText/getEntries into dataList? Not entirely sure
          // when the item.kind would be a file/directory
          // Or maybe we can just push the item as is to the user defined handlers?
          // TBH this feels pretty unwieldy still since its all on the user to properly JSON.parse or w/e
          if (item.kind === 'text' && item.types.has(acceptedType)) {
            // TODO: perhaps we should add a "processor" prop that the user provides so that our onDrop can handle processing the
            let data = await item.getText(acceptedType);
            dataList.push(data);
          }
        }
      }

      if (target.type === 'root') {
        onRootDrop(dataList, isInternalDrop);
      } else if (target.dropPosition === 'on') {
        onItemDrop(dataList, target.key);
      } else {
        onInsert(dataList, target.key, target.dropPosition, isInternalDrop);
      }
    }
  }, [onDropProp, acceptedDragTypes, onRootDrop, onItemDrop, onInsert]);

  // Default getDropOperation function if one isn't provided
  // TODO: do we really want this? Maybe overkill, just have user provide this?
  let getDropOperation = useCallback((target, types, allowedOperations) => {
    let typesSet = types.types ? types.types : types;
    let draggedTypes = [...typesSet.values()];
    if (
      // TODO: check the acceptedDragTypes logic
      (acceptedDragTypes === 'all' || draggedTypes.every(type => acceptedDragTypes.includes(type))) &&
      (
        onInsert && target.type === 'item' && (target.dropPosition === 'before' || target.dropPosition === 'after') ||
        onRootDrop && target.type === 'root' ||
        // TODO: how to detect if it is a drop on a folder? Perhaps we have an option that the user provides to control this (e.g. droppableItems)?
        onItemDrop && target.type === 'item' && target.dropPosition === 'on'
      )
    ) {
      // TODO: how to determine the correct allowed operation
      return allowedOperations[0];
    }

    return 'cancel';
  }, [acceptedDragTypes, onInsert, onRootDrop, onItemDrop]);


  let dropHooks = useMemo(() => ({
    useDroppableCollectionState(props) {
      return useDroppableCollectionState({getDropOperation, ...props, ...options, onDrop});
    },
    useDroppableItem,
    useDroppableCollection(props, state, ref) {
      return useDroppableCollection({...props, ...options, onDrop}, state, ref);
    },
    useDropIndicator
  }), [options, onDrop, getDropOperation]);


  // If the user doesn't want their collection to be draggable/droppable, they can just not pass dragHooks/dropHooks to their collection
  return {
    dragHooks,
    dropHooks
  };
}
