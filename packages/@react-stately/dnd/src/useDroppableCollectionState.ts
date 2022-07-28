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

import {Collection, DragTypes, DropOperation, DroppableCollectionProps, DropTarget, ItemDropTarget, Node} from '@react-types/shared';
import {getDnDState} from './utils';
import {MultipleSelectionManager} from '@react-stately/selection';
import {useCallback, useState} from 'react';

export interface DroppableCollectionStateOptions extends DroppableCollectionProps {
  collection: Collection<Node<unknown>>,
  selectionManager: MultipleSelectionManager
}

export interface DroppableCollectionState {
  collection: Collection<Node<unknown>>,
  selectionManager: MultipleSelectionManager,
  target: DropTarget,
  setTarget(target: DropTarget): void,
  isDropTarget(target: DropTarget): boolean,
  getDropOperation(target: DropTarget, types: DragTypes, allowedOperations: DropOperation[]): DropOperation
}

export function useDroppableCollectionState(props: DroppableCollectionStateOptions): DroppableCollectionState  {
  let {
    acceptedDragTypes = 'all',
    onInsert,
    onRootDrop,
    onItemDrop,
    onReorder,
    isValidDropTarget,
    collection,
    selectionManager,
    onDropExit,
    onDropEnter,
    getDropOperation
  } = props;
  let [target, setTarget] = useState<DropTarget>(null);

  let getOppositeTarget = (target: ItemDropTarget): ItemDropTarget => {
    if (target.dropPosition === 'before') {
      let key = collection.getKeyBefore(target.key);
      return key != null ? {type: 'item', key, dropPosition: 'after'} : null;
    } else if (target.dropPosition === 'after') {
      let key = collection.getKeyAfter(target.key);
      return key != null ? {type: 'item', key, dropPosition: 'before'} : null;
    }
  };

  let defaultGetDropOperation = useCallback((target, types, allowedOperations) => {
    let typesSet = types.types ? types.types : types;
    let draggedTypes = [...typesSet.values()];
    let {draggedCollection} = getDnDState();
    let isInternalDrop = draggedCollection === collection;

    if (
      (acceptedDragTypes === 'all' || draggedTypes.every(type => acceptedDragTypes.includes(type))) &&
      (
        onInsert && target.type === 'item' && !isInternalDrop && (target.dropPosition === 'before' || target.dropPosition === 'after') ||
        onReorder && target.type === 'item' && isInternalDrop && (target.dropPosition === 'before' || target.dropPosition === 'after') ||
        // Feedback was that internal root drop was weird so preventing that from happening
        onRootDrop && target.type === 'root' && !isInternalDrop ||
        // TODO: how to detect if it is a drop on a folder? Perhaps we have an option that the user provides to control this (e.g. droppableItems)?
        // Also would be nice to prevent a folder from being dropped into itself but we don't have draggedKeys available here, maybe look into making that info available
        onItemDrop && target.type === 'item' && target.dropPosition === 'on' && (!isValidDropTarget || isValidDropTarget(target.key))
      )
    ) {
      return allowedOperations[0];
    }

    return 'cancel';
  }, [acceptedDragTypes, onInsert, onRootDrop, onItemDrop, isValidDropTarget, onReorder, collection]);

  return {
    collection,
    selectionManager,
    target,
    setTarget(newTarget) {
      if (this.isDropTarget(newTarget)) {
        return;
      }

      if (target && typeof onDropExit === 'function') {
        onDropExit({
          type: 'dropexit',
          x: 0, // todo
          y: 0,
          target
        });
      }

      if (newTarget && typeof onDropEnter === 'function') {
        onDropEnter({
          type: 'dropenter',
          x: 0, // todo
          y: 0,
          target: newTarget
        });
      }

      setTarget(newTarget);
    },
    isDropTarget(dropTarget) {
      if (isEqualDropTarget(dropTarget, target)) {
        return true;
      }

      // Check if the targets point at the same point between two items, one referring before, and the other after.
      if (
        dropTarget?.type === 'item' &&
        target?.type === 'item' &&
        dropTarget.key !== target.key &&
        dropTarget.dropPosition !== target.dropPosition &&
        dropTarget.dropPosition !== 'on' &&
        target.dropPosition !== 'on'
      ) {
        return isEqualDropTarget(getOppositeTarget(dropTarget), target) ||
          isEqualDropTarget(dropTarget, getOppositeTarget(target));
      }

      return false;
    },
    getDropOperation(target, types, allowedOperations) {
      return typeof getDropOperation === 'function'
        ? getDropOperation(target, types, allowedOperations)
        : defaultGetDropOperation(target, types, allowedOperations);
    }
  };
}

function isEqualDropTarget(a: DropTarget, b: DropTarget) {
  if (!a) {
    return !b;
  }

  switch (a.type) {
    case 'root':
      return b?.type === 'root';
    case 'item':
      return b?.type === 'item' && b?.key === a.key && b?.dropPosition === a.dropPosition;
  }
}
