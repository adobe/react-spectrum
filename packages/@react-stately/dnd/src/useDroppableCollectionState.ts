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
import {Key, useCallback, useRef, useState} from 'react';
import {MultipleSelectionManager} from '@react-stately/selection';

interface DropOperationEvent {
  target: DropTarget,
  types: DragTypes,
  allowedOperations: DropOperation[],
  isInternalDrop: boolean,
  draggingKeys: Set<Key>
}

export interface DroppableCollectionStateOptions extends Omit<DroppableCollectionProps, 'onDropMove' | 'onDropActivate'> {
  collection: Collection<Node<unknown>>,
  selectionManager: MultipleSelectionManager
}

export interface DroppableCollectionState {
  collection: Collection<Node<unknown>>,
  selectionManager: MultipleSelectionManager,
  target: DropTarget,
  setTarget(target: DropTarget): void,
  isDropTarget(target: DropTarget): boolean,
  getDropOperation(e: DropOperationEvent): DropOperation
}

export function useDroppableCollectionState(props: DroppableCollectionStateOptions): DroppableCollectionState  {
  let {
    acceptedDragTypes,
    onInsert,
    onRootDrop,
    onItemDrop,
    onReorder,
    shouldAcceptItemDrop,
    collection,
    selectionManager,
    onDropEnter,
    getDropOperation,
    onDrop
  } = props;
  let [target, setTarget] = useState<DropTarget>(null);
  let targetRef = useRef<DropTarget>(null);

  let getOppositeTarget = (target: ItemDropTarget): ItemDropTarget => {
    if (target.dropPosition === 'before') {
      let key = collection.getKeyBefore(target.key);
      return key != null ? {type: 'item', key, dropPosition: 'after'} : null;
    } else if (target.dropPosition === 'after') {
      let key = collection.getKeyAfter(target.key);
      return key != null ? {type: 'item', key, dropPosition: 'before'} : null;
    }
  };

  let defaultGetDropOperation = useCallback((e: DropOperationEvent) => {
    let {
      target,
      types,
      allowedOperations,
      isInternalDrop,
      draggingKeys
    } = e;

    if (acceptedDragTypes === 'all' || acceptedDragTypes.some(type => types.has(type))) {
      let isValidInsert = onInsert && target.type === 'item' && !isInternalDrop && (target.dropPosition === 'before' || target.dropPosition === 'after');
      let isValidReorder = onReorder && target.type === 'item' && isInternalDrop && (target.dropPosition === 'before' || target.dropPosition === 'after');
      // Feedback was that internal root drop was weird so preventing that from happening
      let isValidRootDrop = onRootDrop && target.type === 'root' && !isInternalDrop;
      // Automatically prevent items (i.e. folders) from being dropped on themselves.
      let isValidOnItemDrop = onItemDrop && target.type === 'item' && target.dropPosition === 'on' && !(isInternalDrop && draggingKeys.has(target.key)) && (!shouldAcceptItemDrop || shouldAcceptItemDrop(target, types));

      if (onDrop || isValidInsert || isValidReorder || isValidRootDrop || isValidOnItemDrop) {
        return allowedOperations[0];
      }
    }

    return 'cancel';
  }, [acceptedDragTypes, onInsert, onRootDrop, onItemDrop, shouldAcceptItemDrop, onReorder, onDrop]);

  return {
    collection,
    selectionManager,
    target,
    setTarget(newTarget) {
      if (this.isDropTarget(newTarget)) {
        return;
      }

      let target = targetRef.current;
      if (target && typeof props.onDropExit === 'function') {
        props.onDropExit({
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
      targetRef.current = newTarget;
    },
    isDropTarget(dropTarget) {
      let target = targetRef.current;
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
    getDropOperation(e) {
      let {target, types, allowedOperations} = e;
      return typeof getDropOperation === 'function'
        ? getDropOperation(target, types, allowedOperations)
        : defaultGetDropOperation(e);
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
