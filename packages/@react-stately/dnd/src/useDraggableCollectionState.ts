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

import {Collection, DraggableCollectionEndEvent, DraggableCollectionProps, DragItem, DragMoveEvent, DragPreviewRenderer, DragStartEvent, DropOperation, Node} from '@react-types/shared';
import {Key, RefObject, useRef, useState} from 'react';
import {MultipleSelectionManager} from '@react-stately/selection';

export interface DraggableCollectionStateOptions extends DraggableCollectionProps {
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
  endDrag(event: DraggableCollectionEndEvent): void
}

export function useDraggableCollectionState(props: DraggableCollectionStateOptions): DraggableCollectionState {
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
  let draggingKeys = useRef(new Set<Key>());
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
      return draggingKeys.current;
    },
    isDragging(key) {
      return draggingKeys.current.has(key);
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
      draggingKeys.current = keys;
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
          keys: draggingKeys.current
        });
      }
    },
    endDrag(event) {
      let {
        isInternalDrop
      } = event;

      if (typeof onDragEnd === 'function') {
        onDragEnd({
          ...event,
          keys: draggingKeys.current,
          isInternalDrop
        });
      }

      setDragging(false);
      draggingKeys.current = new Set();
      draggedKey.current = null;
    }
  };
}
