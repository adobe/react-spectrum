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

import {Collection, DragEndEvent, DraggableCollectionProps, DragItem, DragMoveEvent, DragStartEvent, Node} from '@react-types/shared';
import {Key, useState} from 'react';
import {MultipleSelectionManager} from '@react-stately/selection';

interface DraggableCollectionOptions extends DraggableCollectionProps {
  collection: Collection<Node<unknown>>,
  selectionManager: MultipleSelectionManager
}

export interface DraggableCollectionState {
  collection: Collection<Node<unknown>>,
  selectionManager: MultipleSelectionManager,
  isDragging(key: Key): boolean,
  getKeysForDrag(key: Key): Set<Key>,
  getItems(key: Key): DragItem[],
  renderPreview(key: Key): JSX.Element,
  startDrag(key: Key, event: DragStartEvent): void,
  moveDrag(event: DragMoveEvent): void,
  endDrag(event: DragEndEvent): void
}

export function useDraggableCollectionState(props: DraggableCollectionOptions): DraggableCollectionState {
  let [draggingKeys, setDraggingKeys] = useState(new Set<Key>());
  let getKeys = (key: Key) => {
    // The clicked item is always added to the drag. If it is selected, then all of the
    // other selected items are also dragged. If it is not selected, the only the clicked
    // item is dragged. This matches native macOS behavior.
    let keys = new Set(
      props.selectionManager.isSelected(key)
        ? props.selectionManager.selectedKeys
        : []
    );

    keys.add(key);
    return keys;
  };

  return {
    collection: props.collection,
    selectionManager: props.selectionManager,
    isDragging(key) {
      return draggingKeys.has(key);
    },
    getKeysForDrag: getKeys,
    getItems(key) {
      return props.getItems(getKeys(key));
    },
    renderPreview(key) {
      if (typeof props.renderPreview === 'function') {
        return props.renderPreview(getKeys(key), key);
      }

      return null;
    },
    startDrag(key, event) {
      let keys = getKeys(key);
      setDraggingKeys(keys);

      if (typeof props.onDragStart === 'function') {
        props.onDragStart({
          ...event,
          keys
        });
      }
    },
    moveDrag(event) {
      if (typeof props.onDragMove === 'function') {
        props.onDragMove({
          ...event,
          keys: draggingKeys
        });
      }
    },
    endDrag(event) {
      if (typeof props.onDragEnd === 'function') {
        props.onDragEnd({
          ...event,
          keys: draggingKeys
        });
      }

      setDraggingKeys(new Set());
    }
  };
}
