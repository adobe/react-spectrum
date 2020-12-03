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

import {DragItem, DropOperation, DroppableCollectionProps, DropPosition, DropTarget, KeyboardDelegate} from '@react-types/shared';
import * as DragManager from './DragManager';
import {DroppableCollectionState} from '@react-stately/dnd';
import {HTMLAttributes, Key, RefObject, useEffect, useRef} from 'react';
import {mergeProps} from '@react-aria/utils';
import {useAutoScroll} from './useAutoScroll';
import {useDrop} from './useDrop';
import {useDroppableCollectionId} from './utils';

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

  let autoScroll = useAutoScroll(ref);
  let {dropProps} = useDrop({
    ref,
    onDropEnter(e) {
      let target = props.getDropTargetFromPoint(e.x, e.y);
      state.setTarget(target);
    },
    onDropMove(e) {
      state.setTarget(localState.nextTarget);
      autoScroll.move(e.x, e.y);
    },
    getDropOperationForPoint(types, allowedOperations, x, y) {
      let target = props.getDropTargetFromPoint(x, y);
      if (!target) {
        localState.dropOperation = 'cancel';
        localState.nextTarget = null;
        return 'cancel';
      }

      if (state.isDropTarget(target)) {
        localState.nextTarget = target;
        return localState.dropOperation;
      }

      localState.dropOperation = state.getDropOperation(target, types, allowedOperations);

      // If the target doesn't accept the drop, see if the root accepts it instead.
      if (localState.dropOperation === 'cancel') {
        let rootTarget: DropTarget = {type: 'root'};
        let dropOperation = state.getDropOperation(rootTarget, types, allowedOperations);
        if (dropOperation !== 'cancel') {
          target = rootTarget;
          localState.dropOperation = dropOperation;
        }
      }

      localState.nextTarget = localState.dropOperation === 'cancel' ? null : target;
      return localState.dropOperation;
    },
    onDropExit() {
      state.setTarget(null);
      autoScroll.stop();
    },
    onDropActivate(e) {
      if (state.target?.type === 'item' && state.target?.dropPosition === 'on' && typeof props.onDropActivate === 'function') {
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

    let getNextTarget = (target: DropTarget): DropTarget => {
      if (!target) {
        return {
          type: 'root'
        };
      }

      let {keyboardDelegate} = localState.props;
      let nextKey = target.type === 'item'
        ? keyboardDelegate.getKeyBelow(target.key)
        : keyboardDelegate.getFirstKey();

      if (target.type === 'item') {
        let allowedDropPositions = getAllowedDropPositions(target.key);
        let positionIndex = allowedDropPositions.indexOf(target.dropPosition);
        let nextDropPosition = allowedDropPositions[positionIndex + 1];
        if (positionIndex < allowedDropPositions.length - 1 && !(nextDropPosition === 'after' && nextKey != null && getAllowedDropPositions(nextKey).includes('before'))) {
          return {
            type: 'item',
            key: target.key,
            dropPosition: nextDropPosition
          };
        }
      }

      if (nextKey == null) {
        return {
          type: 'root'
        };
      }

      return {
        type: 'item',
        key: nextKey,
        dropPosition: getAllowedDropPositions(nextKey)[0] as any
      };
    };

    let getPreviousTarget = (target: DropTarget): DropTarget => {
      let {keyboardDelegate} = localState.props;
      let nextKey = target?.type === 'item'
        ? keyboardDelegate.getKeyAbove(target.key)
        : keyboardDelegate.getLastKey();

      if (target?.type === 'item') {
        let allowedDropPositions = getAllowedDropPositions(target.key);
        let positionIndex = allowedDropPositions.indexOf(target.dropPosition);
        let nextDropPosition = allowedDropPositions[positionIndex - 1];
        if (positionIndex > 0 && nextDropPosition !== 'after') {
          return {
            type: 'item',
            key: target.key,
            dropPosition: nextDropPosition
          };
        }
      }

      if (nextKey == null) {
        return {
          type: 'root'
        };
      }

      return {
        type: 'item',
        key: nextKey,
        dropPosition: target?.type === 'root' ? 'after' : 'on'
      };
    };

    let nextValidTarget = (
      target: DropTarget,
      items: DragItem[],
      allowedDropOperations: DropOperation[],
      getNextTarget: (target: DropTarget) => DropTarget
    ): DropTarget => {
      let types = items.map(item => item.type);
      let operation: DropOperation;
      do {
        target = getNextTarget(target);
        operation = localState.state.getDropOperation(target, types, allowedDropOperations);
      } while (
        target &&
        operation === 'cancel' &&
        !localState.state.isDropTarget(target)
      );

      return target;
    };

    DragManager.registerDropTarget({
      element: ref.current,
      getDropOperation(types, allowedOperations) {
        if (localState.state.target) {
          return localState.state.getDropOperation(localState.state.target, types, allowedOperations);
        }

        // TODO: check if ANY of the options can accept a drop??
        return 'move';
      },
      onDropEnter(e, drag) {
        let target = nextValidTarget(null, drag.items, drag.allowedDropOperations, getNextTarget);
        localState.state.setTarget(target);
      },
      onDropExit() {
        localState.state.setTarget(null);
      },
      onDropTargetEnter(target) {
        localState.state.setTarget(target);
      },
      onDropActivate(e) {
        if (
          localState.state.target?.type === 'item' &&
          localState.state.target?.dropPosition === 'on' &&
          typeof localState.props.onDropActivate === 'function'
        ) {
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
        let {keyboardDelegate} = localState.props;
        switch (e.key) {
          case 'ArrowDown': {
            if (keyboardDelegate.getKeyBelow) {
              let target = nextValidTarget(localState.state.target, drag.items, drag.allowedDropOperations, getNextTarget);
              localState.state.setTarget(target);
            }
            break;
          }
          case 'ArrowUp': {
            if (keyboardDelegate.getKeyAbove) {
              let target = nextValidTarget(localState.state.target, drag.items, drag.allowedDropOperations, getPreviousTarget);
              localState.state.setTarget(target);
            }
            break;
          }
        }
      }
    });
  }, [localState, ref]);

  let id = useDroppableCollectionId(state);
  return {
    collectionProps: mergeProps(dropProps, {
      id,
      // Remove description from collection element. If dropping on the entire collection,
      // there should be a drop indicator that has this description, so no need to double announce.
      'aria-describedby': null
    })
  };
}
