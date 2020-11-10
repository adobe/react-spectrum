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

import {DropActivateEvent, DropEnterEvent, DropEvent, DropExitEvent, DropMoveEvent, DropOperation} from './types';
import {HTMLAttributes, Key, useRef} from 'react';
import {KeyboardDelegate} from '@react-types/shared';
import {useDrop} from './useDrop';

type DropPosition = 'on' | 'before' | 'after';
interface DropTarget {
  key: Key,
  dropPosition: DropPosition
}

interface DroppableCollectionEnterEvent extends DropEnterEvent {
  target: DropTarget
}

interface DroppableCollectionMoveEvent extends DropMoveEvent {
  target: DropTarget
}

interface DroppableCollectionActivateEvent extends DropActivateEvent {
  target: DropTarget
}

interface DroppableCollectionExitEvent extends DropExitEvent {
  target: DropTarget
}

interface DroppableCollectionDropEvent extends DropEvent {
  target: DropTarget
}

interface DroppableCollectionOptions {
  // keyboardDelegate: KeyboardDelegate,
  getDropTargetFromPoint: (x: number, y: number) => DropTarget | null,
  getAllowedDropPositions?: (key: Key) => DropPosition[],
  getDropOperation?: (target: DropTarget, types: string[], allowedOperations: DropOperation[]) => DropOperation,
  onDropEnter?: (e: DroppableCollectionEnterEvent) => void,
  onDropMove?: (e: DroppableCollectionMoveEvent) => void,
  onDropActivate?: (e: DroppableCollectionActivateEvent) => void,
  onDropExit?: (e: DroppableCollectionExitEvent) => void,
  onDrop?: (e: DroppableCollectionDropEvent) => void
}

interface DroppableCollectionResult {
  collectionProps: HTMLAttributes<HTMLElement>
}

export function useDroppableCollection(options: DroppableCollectionOptions): DroppableCollectionResult {
  let state = useRef({
    target: null,
    dropOperation: null,
    targetChanged: false
  }).current;

  let {dropProps} = useDrop({
    onDropEnter(e) {
      state.target = options.getDropTargetFromPoint(e.x, e.y);
      if (state.target && typeof options.onDropEnter === 'function') {
        options.onDropEnter({
          type: 'dropenter',
          x: e.x, // todo
          y: e.y,
          target: state.target
        });
      }
    },
    onDropMove(e) {
      let target = options.getDropTargetFromPoint(e.x, e.y);
      if (isEqualDropTarget(target, state.target)) {
        return;
      }

      if (state.target && typeof options.onDropExit === 'function') {
        options.onDropExit({
          type: 'dropexit',
          x: e.x, // todo
          y: e.y,
          target: state.target
        });
      }

      if (target && typeof options.onDropEnter === 'function') {
        options.onDropEnter({
          type: 'dropenter',
          x: e.x, // todo
          y: e.y,
          target
        });
      }

      state.target = target;
      state.targetChanged = true;
    },
    getDropOperationForPoint(types, allowedOperations, x, y) {
      if (state.targetChanged) {
        state.dropOperation = typeof options.getDropOperation === 'function'
          ? options.getDropOperation(state.target, types, allowedOperations)
          : allowedOperations[0];
        state.targetChanged = false;
      }

      return state.dropOperation;
    },
    onDropExit(e) {
      console.log(e);
      if (state.target && typeof options.onDropExit === 'function') {
        options.onDropExit({
          type: 'dropexit',
          x: e.x, // todo
          y: e.y,
          target: state.target
        });
      }

      state.target = null;
    },
    onDropActivate(e) {
      if (state.target?.dropPosition === 'on' && typeof options.onDropActivate === 'function') {
        options.onDropActivate({
          type: 'dropactivate',
          x: e.x, // todo
          y: e.y,
          target: state.target
        });
      }
    },
    onDrop(e) {
      if (state.target && typeof options.onDrop === 'function') {
        options.onDrop({
          type: 'drop',
          x: e.x, // todo
          y: e.y,
          target: state.target,
          items: e.items,
          dropOperation: e.dropOperation
        });
      }
    }
  });

  return {
    collectionProps: {
      ...dropProps
    }
  };
}

function isEqualDropTarget(a: DropTarget, b: DropTarget) {
  return a?.key === b?.key && a?.dropPosition === b?.dropPosition;
}
