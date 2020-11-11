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
import {DropActivateEvent, DropEnterEvent, DropEvent, DropExitEvent, DropMoveEvent, DropOperation} from './types';
import {HTMLAttributes, Key, RefObject, useEffect, useRef} from 'react';
import {KeyboardDelegate} from '@react-types/shared';
import {mergeProps} from '@react-aria/utils';
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
  let {keyboardDelegate} = options;
  let state = useRef({
    target: null,
    dropOperation: null,
    targetChanged: false
  }).current;

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

  let setTarget = (target: DropTarget) => {
    if (state.target && typeof options.onDropExit === 'function') {
      options.onDropExit({
        type: 'dropexit',
        x: 0, // todo
        y: 0,
        target: state.target
      });
    }

    state.target = target;

    if (state.target && typeof options.onDropEnter === 'function') {
      options.onDropEnter({
        type: 'dropenter',
        x: 0, // todo
        y: 0,
        target: state.target
      });
    }
  };

  let getAllowedDropPositions = (key: Key) => typeof options.getAllowedDropPositions === 'function'
      ? options.getAllowedDropPositions(key)
      : ['before', 'on', 'after'] as DropPosition[];

  let onKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown': {
        if (keyboardDelegate.getKeyBelow) {
          e.preventDefault();

          let nextKey = state.target != null
            ? keyboardDelegate.getKeyBelow(state.target.key)
            : keyboardDelegate.getFirstKey();

          if (state.target) {
            let allowedDropPositions = getAllowedDropPositions(state.target.key);
            let positionIndex = allowedDropPositions.indexOf(state.target.dropPosition);
            let nextDropPosition = allowedDropPositions[positionIndex + 1];
            if (positionIndex < allowedDropPositions.length - 1 && !(nextDropPosition === 'after' && nextKey != null && getAllowedDropPositions(nextKey).includes('before'))) {
              setTarget({
                key: state.target.key,
                dropPosition: nextDropPosition
              });

              return;
            }
          }

          if (nextKey == null) {
            nextKey = keyboardDelegate.getFirstKey();
          }

          setTarget({
            key: nextKey,
            dropPosition: getAllowedDropPositions(nextKey)[0] as any
          });
        }
        break;
      }
      case 'ArrowUp': {
        if (keyboardDelegate.getKeyAbove) {
          e.preventDefault();

          let nextKey = state.target != null
            ? keyboardDelegate.getKeyAbove(state.target.key)
            : keyboardDelegate.getLastKey();

          if (state.target) {
            let allowedDropPositions = getAllowedDropPositions(state.target.key);
            let positionIndex = allowedDropPositions.indexOf(state.target.dropPosition);
            let nextDropPosition = allowedDropPositions[positionIndex - 1];
            if (positionIndex > 0 && nextDropPosition !== 'after') {
              setTarget({
                key: state.target.key,
                dropPosition: nextDropPosition
              });

              return;
            }
          }

          if (nextKey == null) {
            nextKey = keyboardDelegate.getLastKey();
          }

          setTarget({
            key: nextKey,
            dropPosition: 'on' as any
          });
        }
        break;
      }
    }
  };

  useEffect(() => DragManager.registerDropTarget({
    element: options.ref.current,
    // getDropOperation: optionsRef.current.getDropOperation,
    onDropEnter(e) {
      let key = keyboardDelegate.getFirstKey();
      setTarget({
        key,
        dropPosition: getAllowedDropPositions(key)[0]
      });
    },
    onDropExit(e) {
      setTarget(null);
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
    },
    onKeyDown
  }), []);

  return {
    collectionProps: dropProps
  };
}

function isEqualDropTarget(a: DropTarget, b: DropTarget) {
  return a?.key === b?.key && a?.dropPosition === b?.dropPosition;
}
