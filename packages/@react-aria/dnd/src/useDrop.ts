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

import {CUSTOM_DRAG_TYPE, DROP_EFFECT_TO_DROP_OPERATION, DROP_OPERATION, DROP_OPERATION_ALLOWED, DROP_OPERATION_TO_DROP_EFFECT} from './constants';
import {DragEvent, HTMLAttributes, RefObject, useLayoutEffect, useRef, useState} from 'react';
import * as DragManager from './DragManager';
import {DropActivateEvent, DropEnterEvent, DropEvent, DropExitEvent, DropItem, DropMoveEvent, DropOperation} from '@react-types/shared';
import {useVirtualDrop} from './useVirtualDrop';

interface DropOptions {
  ref: RefObject<HTMLElement>,
  getDropOperation?: (types: Set<string>, allowedOperations: DropOperation[]) => DropOperation,
  getDropOperationForPoint?: (types: Set<string>, allowedOperations: DropOperation[], x: number, y: number) => DropOperation,
  onDropEnter?: (e: DropEnterEvent) => void,
  onDropMove?: (e: DropMoveEvent) => void,
  // When the user hovers over the drop target for a period of time.
  // typically opens that item. macOS/iOS call this "spring loading".
  onDropActivate?: (e: DropActivateEvent) => void,
  onDropExit?: (e: DropExitEvent) => void,
  onDrop?: (e: DropEvent) => void
}

interface DropResult {
  dropProps: HTMLAttributes<HTMLElement>,
  isDropTarget: boolean // (??) whether the element is currently an active drop target
}

const DROP_ACTIVATE_TIMEOUT = 800;

export function useDrop(options: DropOptions): DropResult {
  let [isDropTarget, setDropTarget] = useState(false);
  let state = useRef({
    x: 0,
    y: 0,
    dragEnterCount: 0,
    dropEffect: 'none',
    dropActivateTimer: null
  }).current;

  let onDragOver = (e: DragEvent) => {
    e.preventDefault();

    if (e.clientX === state.x && e.clientY === state.y) {
      e.dataTransfer.dropEffect = state.dropEffect;
      return;
    }

    state.x = e.clientX;
    state.y = e.clientY;

    if (typeof options.getDropOperationForPoint === 'function') {
      let allowedOperations = effectAllowedToOperations(e.dataTransfer.effectAllowed);
      let types = new Set(e.dataTransfer.types);
      let rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      let dropOperation = options.getDropOperationForPoint(types, allowedOperations, state.x - rect.x, state.y - rect.y);
      state.dropEffect = DROP_OPERATION_TO_DROP_EFFECT[dropOperation] || 'none';
    }

    e.dataTransfer.dropEffect = state.dropEffect;

    if (typeof options.onDropMove === 'function') {
      let rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      options.onDropMove({
        type: 'dropmove',
        x: state.x - rect.x,
        y: state.y - rect.y
      });
    }

    clearTimeout(state.dropActivateTimer);

    if (typeof options.onDropActivate === 'function' && state.dropEffect !== 'none') {
      let rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      state.dropActivateTimer = setTimeout(() => {
        options.onDropActivate({
          type: 'dropactivate',
          x: state.x - rect.x,
          y: state.y - rect.y
        });
      }, DROP_ACTIVATE_TIMEOUT);
    }
  };

  let onDragEnter = (e: DragEvent) => {
    state.dragEnterCount++;
    if (state.dragEnterCount > 1) {
      return;
    }

    let allowedOperations = effectAllowedToOperations(e.dataTransfer.effectAllowed);
    let dropOperation = allowedOperations[0];

    if (typeof options.getDropOperation === 'function') {
      let types = new Set(e.dataTransfer.types);
      dropOperation = options.getDropOperation(types, allowedOperations);
    }

    if (dropOperation !== 'cancel') {
      setDropTarget(true);
    }

    if (typeof options.getDropOperationForPoint === 'function') {
      let types = new Set(e.dataTransfer.types);
      let rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      dropOperation = options.getDropOperationForPoint(types, allowedOperations, e.clientX - rect.x, e.clientY - rect.y);
    }

    state.dropEffect = DROP_OPERATION_TO_DROP_EFFECT[dropOperation] || 'none';
    e.dataTransfer.dropEffect = state.dropEffect;

    if (typeof options.onDropEnter === 'function' && dropOperation !== 'cancel') {
      let rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      options.onDropEnter({
        type: 'dropenter',
        x: e.clientX - rect.x,
        y: e.clientY - rect.y
      });
    }

    state.x = e.clientX;
    state.y = e.clientY;
  };

  let onDragLeave = (e: DragEvent) => {
    state.dragEnterCount--;
    if (state.dragEnterCount > 0) {
      return;
    }

    if (typeof options.onDropExit === 'function' && state.dropEffect !== 'none') {
      let rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      options.onDropExit({
        type: 'dropexit',
        x: e.clientX - rect.x,
        y: e.clientY - rect.y
      });
    }

    setDropTarget(false);
    clearTimeout(state.dropActivateTimer);
  };

  let onDrop = (e: DragEvent) => {
    e.preventDefault();

    if (typeof options.onDrop === 'function') {
      let dropOperation = DROP_EFFECT_TO_DROP_OPERATION[state.dropEffect];
      let items: DropItem[] = [];

      // If our custom drag type is available, use that. This is a JSON serialized
      // representation of all items in the drag, set when there are multiple items
      // of the same type, or an individual item has multiple representations.
      let hasCustomType = false;
      if ([...e.dataTransfer.types].includes(CUSTOM_DRAG_TYPE)) {
        try {
          let data = e.dataTransfer.getData(CUSTOM_DRAG_TYPE);
          let parsed = JSON.parse(data);
          for (let item of parsed) {
            items.push({
              types: new Set(Object.keys(item)),
              getData: (type) => item[type]
            });
          }

          hasCustomType = true;
        } catch (e) {
          // ignore
        }
      }

      // Otherwise, map native drag items to items of a single representation.
      if (!hasCustomType) {
        for (let item of e.dataTransfer.items) {
          if (item.kind === 'string') {
            items.push({
              types: new Set([item.type]),
              getData: () => new Promise(resolve => item.getAsString(resolve))
            });
          } else if (item.kind === 'file') {
            // TODO: file support
            // items.push({
            //   types: new Set([item.type]),
            //   getData: () => Promise.resolve(item.getAsFile()) // ???
            // });
          }
        }
      }

      let rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      let event: DropEvent = {
        type: 'drop',
        x: e.clientX - rect.x,
        y: e.clientY - rect.y,
        items,
        dropOperation
      };

      // Wait a frame to dispatch the drop event so that we ensure the dragend event fires first.
      // Otherwise, if onDrop removes the original dragged element from the DOM, dragend will never be fired.
      // This behavior is consistent across browsers, but see this issue for details:
      // https://bugzilla.mozilla.org/show_bug.cgi?id=460801
      requestAnimationFrame(() => {
        options.onDrop(event);
      });
    }

    if (typeof options.onDropExit === 'function') {
      let rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      options.onDropExit({
        type: 'dropexit',
        x: e.clientX - rect.x,
        y: e.clientY - rect.y
      });
    }

    state.dragEnterCount = 0;
    setDropTarget(false);
    clearTimeout(state.dropActivateTimer);
  };

  let optionsRef = useRef(options);
  optionsRef.current = options;

  useLayoutEffect(() => DragManager.registerDropTarget({
    element: optionsRef.current.ref.current,
    getDropOperation: optionsRef.current.getDropOperation,
    onDropEnter(e) {
      setDropTarget(true);
      if (typeof optionsRef.current.onDropEnter === 'function') {
        optionsRef.current.onDropEnter(e);
      }
    },
    onDropExit(e) {
      setDropTarget(false);
      if (typeof optionsRef.current.onDropExit === 'function') {
        optionsRef.current.onDropExit(e);
      }
    },
    onDrop(e) {
      if (typeof optionsRef.current.onDrop === 'function') {
        optionsRef.current.onDrop(e);
      }
    },
    onDropActivate(e) {
      if (typeof optionsRef.current.onDropActivate === 'function') {
        optionsRef.current.onDropActivate(e);
      }
    }
  }), [optionsRef]);

  let {dropProps} = useVirtualDrop();

  return {
    dropProps: {
      ...dropProps,
      onDragEnter,
      onDragOver,
      onDragLeave,
      onDrop
    },
    isDropTarget
  };
}

function effectAllowedToOperations(effectAllowed: string) {
  let allowedOperationsBits = DROP_OPERATION_ALLOWED[effectAllowed];
  let allowedOperations = [];
  if (allowedOperationsBits & DROP_OPERATION.move) {
    allowedOperations.push('move');
  }

  if (allowedOperationsBits & DROP_OPERATION.copy) {
    allowedOperations.push('copy');
  }

  if (allowedOperationsBits & DROP_OPERATION.link) {
    allowedOperations.push('link');
  }

  return allowedOperations;
}
