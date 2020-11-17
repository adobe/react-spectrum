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

import * as DragManager from './DragManager';
import {DropActivateEvent, DropEnterEvent, DropEvent, DropExitEvent, DropMoveEvent, DropOperation, DropPosition, DropTarget} from './types';
import {HTMLAttributes, Key, RefObject, useEffect, useRef} from 'react';
import {KeyboardDelegate} from '@react-types/shared';
import {useDrop} from './useDrop';

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
  ref: RefObject<HTMLElement>,
  keyboardDelegate: KeyboardDelegate,
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
    options,
    target: null,
    nextTarget: null,
    dropOperation: null
  }).current;
  state.options = options;

  let {dropProps} = useDrop({
    ref: options.ref,
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
      if (state.nextTarget === state.target) {
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

      if (state.nextTarget && typeof options.onDropEnter === 'function') {
        options.onDropEnter({
          type: 'dropenter',
          x: e.x, // todo
          y: e.y,
          target: state.nextTarget
        });
      }

      state.target = state.nextTarget;
    },
    getDropOperationForPoint(types, allowedOperations, x, y) {
      let target = options.getDropTargetFromPoint(x, y);
      if (isEqualDropTarget(target, state.target)) {
        return state.dropOperation;
      }

      state.dropOperation = typeof options.getDropOperation === 'function'
        ? options.getDropOperation(target, types, allowedOperations)
        : allowedOperations[0];
      state.nextTarget = state.dropOperation === 'cancel' ? null : target;

      return state.dropOperation;
    },
    onDropExit(e) {
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

  useEffect(() => {
    let setTarget = (target: DropTarget) => {
      if (state.target && typeof state.options.onDropExit === 'function') {
        state.options.onDropExit({
          type: 'dropexit',
          x: 0, // todo
          y: 0,
          target: state.target
        });
      }

      state.target = target;

      if (state.target && typeof state.options.onDropEnter === 'function') {
        state.options.onDropEnter({
          type: 'dropenter',
          x: 0, // todo
          y: 0,
          target: state.target
        });
      }
    };

    let getAllowedDropPositions = (key: Key) => (
      typeof state.options.getAllowedDropPositions === 'function'
        ? state.options.getAllowedDropPositions(key)
        : ['before', 'on', 'after'] as DropPosition[]
    );

    let getNextTarget = (target: DropTarget) => {
      let {keyboardDelegate} = state.options;
      let nextKey = target != null
        ? keyboardDelegate.getKeyBelow(target.key)
        : keyboardDelegate.getFirstKey();

      if (target) {
        let allowedDropPositions = getAllowedDropPositions(target.key);
        let positionIndex = allowedDropPositions.indexOf(target.dropPosition);
        let nextDropPosition = allowedDropPositions[positionIndex + 1];
        if (positionIndex < allowedDropPositions.length - 1 && !(nextDropPosition === 'after' && nextKey != null && getAllowedDropPositions(nextKey).includes('before'))) {
          return {
            key: target.key,
            dropPosition: nextDropPosition
          };
        }
      }

      if (nextKey == null) {
        nextKey = keyboardDelegate.getFirstKey();
      }

      return {
        key: nextKey,
        dropPosition: getAllowedDropPositions(nextKey)[0] as any
      };
    };

    let getPreviousTarget = (target: DropTarget) => {
      let {keyboardDelegate} = state.options;
      let nextKey = target != null
        ? keyboardDelegate.getKeyAbove(target.key)
        : keyboardDelegate.getLastKey();

      if (target) {
        let allowedDropPositions = getAllowedDropPositions(target.key);
        let positionIndex = allowedDropPositions.indexOf(target.dropPosition);
        let nextDropPosition = allowedDropPositions[positionIndex - 1];
        if (positionIndex > 0 && nextDropPosition !== 'after') {
          return {
            key: target.key,
            dropPosition: nextDropPosition
          };
        }
      }

      if (nextKey == null) {
        nextKey = keyboardDelegate.getLastKey();
      }

      return {
        key: nextKey,
        dropPosition: 'on' as any
      };
    };

    DragManager.registerDropTarget({
      element: state.options.ref.current,
      getDropOperation(types, allowedOperations, target) {
        if (target || state.target) {
          return state.options.getDropOperation(target || state.target, types, allowedOperations);
        }

        // TODO: check if ANY of the options can accept a drop??
        return 'move';
      },
      onDropEnter(e, target) {
        let key = state.options.keyboardDelegate.getFirstKey();
        setTarget(target || {
          key,
          dropPosition: getAllowedDropPositions(key)[0]
        });
      },
      onDropExit() {
        setTarget(null);
      },
      onDropActivate(e) {
        if (state.target?.dropPosition === 'on' && typeof state.options.onDropActivate === 'function') {
          state.options.onDropActivate({
            type: 'dropactivate',
            x: e.x, // todo
            y: e.y,
            target: state.target
          });
        }
      },
      onDrop(e, target) {
        if (state.target && typeof state.options.onDrop === 'function') {
          state.options.onDrop({
            type: 'drop',
            x: e.x, // todo
            y: e.y,
            target: target || state.target,
            items: e.items,
            dropOperation: e.dropOperation
          });
        }
      },
      onKeyDown(e, drag) {
        let {keyboardDelegate, getDropOperation} = state.options;
        let types = drag.items.map(item => item.type);
        switch (e.key) {
          case 'ArrowDown': {
            if (keyboardDelegate.getKeyBelow) {
              let target = state.target;
              let operation: DropOperation;
              do {
                target = getNextTarget(target);
                operation = getDropOperation(target, types, drag.allowedDropOperations);
              } while (
                target &&
                operation === 'cancel' &&
                !(target.key === state.target.key && target.dropPosition === state.target.dropPosition)
              );

              setTarget(target);
              state.dropOperation = operation;
            }
            break;
          }
          case 'ArrowUp': {
            if (keyboardDelegate.getKeyAbove) {
              let target = state.target;
              let operation: DropOperation;
              do {
                target = getPreviousTarget(target);
                operation = getDropOperation(target, types, drag.allowedDropOperations);
              } while (
                target &&
                operation === 'cancel' &&
                !(target.key === state.target.key && target.dropPosition === state.target.dropPosition)
              );

              setTarget(target);
              state.dropOperation = operation;
            }
            break;
          }
        }
      }
    });
  }, [state]);

  return {
    collectionProps: {
      ...dropProps,
      'aria-describedby': undefined
    }
  };
}

function isEqualDropTarget(a: DropTarget, b: DropTarget) {
  return a?.key === b?.key && a?.dropPosition === b?.dropPosition;
}
