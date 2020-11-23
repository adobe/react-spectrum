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
import {DropOperation, DroppableCollectionProps, DropPosition, DropTarget, KeyboardDelegate} from '@react-types/shared';
import {DroppableCollectionState} from '@react-stately/dnd';
import {HTMLAttributes, Key, RefObject, useEffect, useRef} from 'react';
import {useDrop} from './useDrop';

interface DroppableCollectionOptions extends DroppableCollectionProps {
  keyboardDelegate: KeyboardDelegate,
  getDropTargetFromPoint: (x: number, y: number) => DropTarget | null
}

interface DroppableCollectionResult {
  collectionProps: HTMLAttributes<HTMLElement>
}

export function useDroppableCollection(props: DroppableCollectionOptions, state: DroppableCollectionState, ref: RefObject<HTMLElement>): DroppableCollectionResult {
  let localState = useRef({
    props,
    state,
    nextTarget: null,
    dropOperation: null
  }).current;
  localState.props = props;
  localState.state = state;

  let {dropProps} = useDrop({
    ref,
    onDropEnter(e) {
      let target = props.getDropTargetFromPoint(e.x, e.y);
      state.setTarget(target);
    },
    onDropMove(e) {
      state.setTarget(localState.nextTarget);
    },
    getDropOperationForPoint(types, allowedOperations, x, y) {
      let target = props.getDropTargetFromPoint(x, y);
      if (isEqualDropTarget(target, state.target)) {
        return localState.dropOperation;
      }

      localState.dropOperation = typeof props.getDropOperation === 'function'
        ? props.getDropOperation(target, types, allowedOperations)
        : allowedOperations[0];
      localState.nextTarget = localState.dropOperation === 'cancel' ? null : target;

      return localState.dropOperation;
    },
    onDropExit(e) {
      state.setTarget(null);
    },
    onDropActivate(e) {
      if (state.target?.dropPosition === 'on' && typeof props.onDropActivate === 'function') {
        props.onDropActivate({
          type: 'dropactivate',
          x: e.x, // todo
          y: e.y,
          target: state.target
        });
      }
    },
    onDrop(e) {
      if (state.target && typeof props.onDrop === 'function') {
        props.onDrop({
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
    let getAllowedDropPositions = (key: Key) => (
      typeof localState.props.getAllowedDropPositions === 'function'
        ? localState.props.getAllowedDropPositions(key)
        : ['before', 'on', 'after'] as DropPosition[]
    );

    let getNextTarget = (target: DropTarget) => {
      let {keyboardDelegate} = localState.props;
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
      let {keyboardDelegate} = localState.props;
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
      element: ref.current,
      getDropOperation(types, allowedOperations, target) {
        if (target || localState.state.target) {
          return localState.props.getDropOperation(target || localState.state.target, types, allowedOperations);
        }

        // TODO: check if ANY of the options can accept a drop??
        return 'move';
      },
      onDropEnter(e, target) {
        let key = localState.props.keyboardDelegate.getFirstKey();
        localState.state.setTarget(target || {
          key,
          dropPosition: getAllowedDropPositions(key)[0]
        });
      },
      onDropExit() {
        localState.state.setTarget(null);
      },
      onDropActivate(e) {
        if (localState.state.target?.dropPosition === 'on' && typeof localState.props.onDropActivate === 'function') {
          localState.props.onDropActivate({
            type: 'dropactivate',
            x: e.x, // todo
            y: e.y,
            target: localState.state.target
          });
        }
      },
      onDrop(e, target) {
        if (localState.state.target && typeof localState.props.onDrop === 'function') {
          localState.props.onDrop({
            type: 'drop',
            x: e.x, // todo
            y: e.y,
            target: target || localState.state.target,
            items: e.items,
            dropOperation: e.dropOperation
          });
        }
      },
      onKeyDown(e, drag) {
        let {keyboardDelegate, getDropOperation} = localState.props;
        let types = drag.items.map(item => item.type);
        switch (e.key) {
          case 'ArrowDown': {
            if (keyboardDelegate.getKeyBelow) {
              let target = localState.state.target;
              let operation: DropOperation;
              do {
                target = getNextTarget(target);
                operation = getDropOperation(target, types, drag.allowedDropOperations);
              } while (
                target &&
                operation === 'cancel' &&
                !(target.key === localState.state.target.key && target.dropPosition === localState.state.target.dropPosition)
              );

              localState.state.setTarget(target);
              localState.dropOperation = operation;
            }
            break;
          }
          case 'ArrowUp': {
            if (keyboardDelegate.getKeyAbove) {
              let target = localState.state.target;
              let operation: DropOperation;
              do {
                target = getPreviousTarget(target);
                operation = getDropOperation(target, types, drag.allowedDropOperations);
              } while (
                target &&
                operation === 'cancel' &&
                !(target.key === localState.state.target.key && target.dropPosition === localState.state.target.dropPosition)
              );

              localState.state.setTarget(target);
              localState.dropOperation = operation;
            }
            break;
          }
        }
      }
    });
  }, [localState]);

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
