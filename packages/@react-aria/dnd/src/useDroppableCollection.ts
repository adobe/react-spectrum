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
import {getTypes} from './utils';
import {HTMLAttributes, RefObject, useEffect, useRef} from 'react';
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

const DROP_POSITIONS: DropPosition[] = ['before', 'on', 'after'];

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
    let getNextTarget = (target: DropTarget, wrap = true): DropTarget => {
      if (!target) {
        return {
          type: 'root'
        };
      }

      let {keyboardDelegate} = localState.props;
      let nextKey = target.type === 'item'
        ? keyboardDelegate.getKeyBelow(target.key)
        : keyboardDelegate.getFirstKey();
      let dropPosition: DropPosition = 'before';

      if (target.type === 'item') {
        let positionIndex = DROP_POSITIONS.indexOf(target.dropPosition);
        let nextDropPosition = DROP_POSITIONS[positionIndex + 1];
        if (positionIndex < DROP_POSITIONS.length - 1 && !(nextDropPosition === 'after' && nextKey != null)) {
          return {
            type: 'item',
            key: target.key,
            dropPosition: nextDropPosition
          };
        }

        // If the last drop position was 'after', then 'before' on the next key is equivalent.
        // Switch to 'on' instead.
        if (target.dropPosition === 'after') {
          dropPosition = 'on';
        }
      }

      if (nextKey == null) {
        if (wrap) {
          return {
            type: 'root'
          };
        }

        return null;
      }

      return {
        type: 'item',
        key: nextKey,
        dropPosition
      };
    };

    let getPreviousTarget = (target: DropTarget, wrap = true): DropTarget => {
      let {keyboardDelegate} = localState.props;
      let nextKey = target?.type === 'item'
        ? keyboardDelegate.getKeyAbove(target.key)
        : keyboardDelegate.getLastKey();
      let dropPosition: DropPosition = !target || target.type === 'root' ? 'after' : 'on';

      if (target?.type === 'item') {
        let positionIndex = DROP_POSITIONS.indexOf(target.dropPosition);
        let nextDropPosition = DROP_POSITIONS[positionIndex - 1];
        if (positionIndex > 0 && nextDropPosition !== 'after') {
          return {
            type: 'item',
            key: target.key,
            dropPosition: nextDropPosition
          };
        }

        // If the last drop position was 'before', then 'after' on the previous key is equivalent.
        // Switch to 'on' instead.
        if (target.dropPosition === 'before') {
          dropPosition = 'on';
        }
      }

      if (nextKey == null) {
        if (wrap) {
          return {
            type: 'root'
          };
        }

        return null;
      }

      return {
        type: 'item',
        key: nextKey,
        dropPosition
      };
    };

    let nextValidTarget = (
      target: DropTarget,
      types: Set<string>,
      allowedDropOperations: DropOperation[],
      getNextTarget: (target: DropTarget, wrap: boolean) => DropTarget,
      wrap = true
    ): DropTarget => {
      let seenRoot = 0;
      let operation: DropOperation;
      do {
        let nextTarget = getNextTarget(target, wrap);
        if (!nextTarget) {
          return null;
        }
        target = nextTarget;
        operation = localState.state.getDropOperation(nextTarget, types, allowedDropOperations);
        if (target.type === 'root') {
          seenRoot++;
        }
      } while (
        operation === 'cancel' &&
        !localState.state.isDropTarget(target) &&
        seenRoot < 2
      );

      if (operation === 'cancel') {
        return null;
      }

      return target;
    };

    return DragManager.registerDropTarget({
      element: ref.current,
      getDropOperation(types, allowedOperations) {
        if (localState.state.target) {
          return localState.state.getDropOperation(localState.state.target, types, allowedOperations);
        }

        // Check if any of the targets accept the drop.
        // TODO: should we have a faster way of doing this or e.g. for pagination?
        let target = nextValidTarget(null, types, allowedOperations, getNextTarget);
        return target ? 'move' : 'cancel';
      },
      onDropEnter(e, drag) {
        let types = getTypes(drag.items);
        let selectionManager = localState.state.selectionManager;
        let target: DropTarget;

        // When entering the droppable collection for the first time, the default drop target
        // is after the focused key.
        let key = selectionManager.focusedKey;
        let dropPosition: DropPosition = 'after';

        // If the focused key is a cell, get the parent item instead.
        // For now, we assume that individual cells cannot be dropped on.
        let item = localState.state.collection.getItem(key);
        if (item?.type === 'cell') {
          key = item.parentKey;
        }

        // If the focused item is also selected, the default drop target is after the last selected item.
        // But if the focused key is the first selected item, then default to before the first selected item.
        // This is to make reordering lists slightly easier. If you select top down, we assume you want to
        // move the items down. If you select bottom up, we assume you want to move the items up.
        if (selectionManager.isSelected(key)) {
          if (selectionManager.selectedKeys.size > 1 && selectionManager.firstSelectedKey === key) {
            dropPosition = 'before';
          } else {
            key = selectionManager.lastSelectedKey;
          }
        }

        if (key != null) {
          target = {
            type: 'item',
            key,
            dropPosition
          };

          // If the default target is not valid, find the next one that is.
          if (localState.state.getDropOperation(target, types, drag.allowedDropOperations) === 'cancel') {
            target = nextValidTarget(target, types, drag.allowedDropOperations, getNextTarget, false)
              ?? nextValidTarget(target, types, drag.allowedDropOperations, getPreviousTarget, false);
          }
        }

        // If no focused key, then start from the root.
        if (!target) {
          target = nextValidTarget(null, types, drag.allowedDropOperations, getNextTarget);
        }

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
        let types = getTypes(drag.items);
        switch (e.key) {
          case 'ArrowDown': {
            if (keyboardDelegate.getKeyBelow) {
              let target = nextValidTarget(localState.state.target, types, drag.allowedDropOperations, getNextTarget);
              localState.state.setTarget(target);
            }
            break;
          }
          case 'ArrowUp': {
            if (keyboardDelegate.getKeyAbove) {
              let target = nextValidTarget(localState.state.target, types, drag.allowedDropOperations, getPreviousTarget);
              localState.state.setTarget(target);
            }
            break;
          }
          case 'Home': {
            if (keyboardDelegate.getFirstKey) {
              let target = nextValidTarget(null, types, drag.allowedDropOperations, getNextTarget);
              localState.state.setTarget(target);
            }
            break;
          }
          case 'End': {
            if (keyboardDelegate.getLastKey) {
              let target = nextValidTarget(null, types, drag.allowedDropOperations, getPreviousTarget);
              localState.state.setTarget(target);
            }
            break;
          }
          case 'PageDown': {
            if (keyboardDelegate.getKeyPageBelow) {
              let target = localState.state.target;
              if (!target) {
                target = nextValidTarget(null, types, drag.allowedDropOperations, getNextTarget);
              } else {
                // If on the root, go to the item a page below the top. Otherwise a page below the current item.
                let nextKey = keyboardDelegate.getKeyPageBelow(
                  target.type === 'item'
                    ? target.key
                    : keyboardDelegate.getFirstKey()
                );
                let dropPosition = target.type === 'item' ? target.dropPosition : 'after';

                // If there is no next key, or we are starting on the last key, jump to the last possible position.
                if (nextKey == null || (target.type === 'item' && target.key === keyboardDelegate.getLastKey())) {
                  nextKey = keyboardDelegate.getLastKey();
                  dropPosition = 'after';
                }

                target = {
                  type: 'item',
                  key: nextKey,
                  dropPosition
                };

                // If the target does not accept the drop, find the next valid target.
                // If no next valid target, find the previous valid target.
                let operation = localState.state.getDropOperation(target, types, drag.allowedDropOperations);
                if (operation === 'cancel') {
                  target = nextValidTarget(target, types, drag.allowedDropOperations, getNextTarget, false)
                    ?? nextValidTarget(target, types, drag.allowedDropOperations, getPreviousTarget, false);
                }
              }

              localState.state.setTarget(target ?? localState.state.target);
            }
            break;
          }
          case 'PageUp': {
            if (!keyboardDelegate.getKeyPageAbove) {
              break;
            }

            let target = localState.state.target;
            if (!target) {
              target = nextValidTarget(null, types, drag.allowedDropOperations, getPreviousTarget);
            } else if (target.type === 'item') {
              // If at the top already, switch to the root. Otherwise navigate a page up.
              if (target.key === keyboardDelegate.getFirstKey()) {
                target = {
                  type: 'root'
                };
              } else {
                let nextKey = keyboardDelegate.getKeyPageAbove(target.key);
                let dropPosition = target.dropPosition;
                if (nextKey == null) {
                  nextKey = keyboardDelegate.getFirstKey();
                  dropPosition = 'before';
                }

                target = {
                  type: 'item',
                  key: nextKey,
                  dropPosition
                };
              }

              // If the target does not accept the drop, find the previous valid target.
              // If no next valid target, find the next valid target.
              let operation = localState.state.getDropOperation(target, types, drag.allowedDropOperations);
              if (operation === 'cancel') {
                target = nextValidTarget(target, types, drag.allowedDropOperations, getPreviousTarget, false)
                  ?? nextValidTarget(target, types, drag.allowedDropOperations, getNextTarget, false);
              }
            }

            localState.state.setTarget(target ?? localState.state.target);
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
