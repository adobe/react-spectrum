/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Collection, DragEndEvent, DraggableCollectionProps, DragItem, DragMoveEvent, DragPreviewRenderer, DragStartEvent, DropOperation, Node} from '@react-types/shared';
import {getDnDState, setDraggingKeys} from './utils';
import {Key, RefObject, useRef, useState} from 'react';
import {MultipleSelectionManager} from '@react-stately/selection';

export interface DraggableCollectionOptions extends DraggableCollectionProps {
  collection: Collection<Node<unknown>>,
  selectionManager: MultipleSelectionManager
}

export interface DraggableCollectionState {
  collection: Collection<Node<unknown>>,
  selectionManager: MultipleSelectionManager,
  draggedKey: Key | null,
  draggingKeys: Set<Key>,
  isDragging(key: Key): boolean,
  getKeysForDrag(key: Key): Set<Key>,
  getItems(key: Key): DragItem[],
  preview?: RefObject<DragPreviewRenderer>,
  getAllowedDropOperations?: () => DropOperation[],
  startDrag(key: Key, event: DragStartEvent): void,
  moveDrag(event: DragMoveEvent): void,
  endDrag(event: DragEndEvent): void
}

export function useDraggableCollectionState(props: DraggableCollectionOptions): DraggableCollectionState {
  let {
    getItems,
    collection,
    selectionManager,
    onDragStart,
    onDragMove,
    onDragEnd,
    preview,
    getAllowedDropOperations
  } = props;
  let [, setDragging] = useState(false);
  // TODO: maybe track draggedKey in global DnD state?
  let draggedKey = useRef(null);
  let getKeys = (key: Key) => {
    // The clicked item is always added to the drag. If it is selected, then all of the
    // other selected items are also dragged. If it is not selected, the only the clicked
    // item is dragged. This matches native macOS behavior.
    let keys = new Set(
      selectionManager.isSelected(key)
        ? new Set([...selectionManager.selectedKeys].filter(key => !!collection.getItem(key)))
        : []
    );

    keys.add(key);
    return keys;
  };

  return {
    collection,
    selectionManager,
    get draggedKey() {
      return draggedKey.current;
    },
    get draggingKeys() {
      return getDnDState().draggingKeys;
    },
    isDragging(key) {
      return getDnDState().draggingKeys.has(key);
    },
    getKeysForDrag: getKeys,
    getItems(key) {
      return getItems(getKeys(key));
    },
    preview,
    getAllowedDropOperations,
    startDrag(key, event) {
      setDragging(true);
      let keys = getKeys(key);
      // TODO: two sources of truth, one in the global DnD state and one tracked in here...
      // I think it is important for the state to still return draggingKeys and stuff, and tracking global drag is for the droppable collections
      setDraggingKeys(keys);
      draggedKey.current = key;
      if (typeof onDragStart === 'function') {
        onDragStart({
          ...event,
          keys
        });
      }
    },
    moveDrag(event) {
      if (typeof onDragMove === 'function') {
        onDragMove({
          ...event,
          keys: getDnDState().draggingKeys
        });
      }
    },
    endDrag(event) {
      if (typeof onDragEnd === 'function') {
        let {draggingCollection, droppedCollection, droppedTarget} = getDnDState();
        onDragEnd({
          ...event,
          keys: getDnDState().draggingKeys
        // TODO: the droppedTarget and (droppedCollection === draggingCollection) are mainly used to let the user differentiate
        // a drop outside the source collection (need to remove the item from the collection), a reorder drop inside the source collection (need to call a reorder operation),
        // or a drop into a folder in the source collection (need to remove the item and relocate it into the folder)
        // its kinda weird to return null as droppedTarget if the user is dropping on a non-collection target though, maybe call setDragTarget in useDrop?...
        // evaluate if I really need droppedTarget, perhaps it can be up to the user to figure out where the drop ended? Technically they could track this in their own state via their own
        // onDragStart (set the source collection) + onDrop/onItemDrop (set the destination collection/item)
        }, droppedTarget, droppedCollection === draggingCollection);
      }

      setDragging(false);
      draggedKey.current = null;
    }
  };
}
