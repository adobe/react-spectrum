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

import {DragEvent, HTMLAttributes, RefObject,  useRef, useState} from 'react';
import * as DragManager from './DragManager';
import {DragTypes, readFromDataTransfer} from './utils';
import {DROP_EFFECT_TO_DROP_OPERATION, DROP_OPERATION, DROP_OPERATION_ALLOWED, DROP_OPERATION_TO_DROP_EFFECT} from './constants';
import {DropActivateEvent, DropEnterEvent, DropEvent, DropExitEvent, DropMoveEvent, DropOperation, DragTypes as IDragTypes} from '@react-types/shared';
import {useLayoutEffect} from '@react-aria/utils';
import {useVirtualDrop} from './useVirtualDrop';

export interface DropOptions {
  ref: RefObject<HTMLElement>,
  /**
   * A function returning the drop operation to be performed when items matching the given types are dropped
   * on the drop target.
   */
  getDropOperation?: (types: IDragTypes, allowedOperations: DropOperation[]) => DropOperation,
  getDropOperationForPoint?: (types: IDragTypes, allowedOperations: DropOperation[], x: number, y: number) => DropOperation,
  /** Handler that is called when a valid drag enters the drop target. */
  onDropEnter?: (e: DropEnterEvent) => void,
  /** Handler that is called when a valid drag is moved within the drop target. */
  onDropMove?: (e: DropMoveEvent) => void,
  /**
   * Handler that is called after a valid drag is held over the drop target for a period of time.
   * This typically opens the item so that the user can drop within it.
   */
  onDropActivate?: (e: DropActivateEvent) => void,
  /** Handler that is called when a valid drag exits the drop target. */
  onDropExit?: (e: DropExitEvent) => void,
  /** Handler that is called when a valid drag is dropped on the drop target. */
  onDrop?: (e: DropEvent) => void
}

export interface DropResult {
  dropProps: HTMLAttributes<HTMLElement>,
  isDropTarget: boolean // (??) whether the element is currently an active drop target
}

const DROP_ACTIVATE_TIMEOUT = 800;

export function useDrop(options: DropOptions): DropResult {
  let [isDropTarget, setDropTarget] = useState(false);
  let state = useRef({
    x: 0,
    y: 0,
    dragOverElements: new Set<Element>(),
    dropEffect: 'none' as DataTransfer['dropEffect'],
    effectAllowed: 'none' as DataTransfer['effectAllowed'],
    dropActivateTimer: null
  }).current;

  let fireDropEnter = (e: DragEvent) => {
    setDropTarget(true);

    if (typeof options.onDropEnter === 'function') {
      let rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      options.onDropEnter({
        type: 'dropenter',
        x: e.clientX - rect.x,
        y: e.clientY - rect.y
      });
    }
  };

  let fireDropExit = (e: DragEvent) => {
    setDropTarget(false);

    if (typeof options.onDropExit === 'function') {
      let rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      options.onDropExit({
        type: 'dropexit',
        x: e.clientX - rect.x,
        y: e.clientY - rect.y
      });
    }
  };

  let onDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.clientX === state.x && e.clientY === state.y && e.dataTransfer.effectAllowed === state.effectAllowed) {
      e.dataTransfer.dropEffect = state.dropEffect;
      return;
    }

    state.x = e.clientX;
    state.y = e.clientY;

    let prevDropEffect = state.dropEffect;

    // Update drop effect if allowed drop operations changed (e.g. user pressed modifier key).
    if (e.dataTransfer.effectAllowed !== state.effectAllowed) {
      let allowedOperations = effectAllowedToOperations(e.dataTransfer.effectAllowed);
      let dropOperation = allowedOperations[0];
      if (typeof options.getDropOperation === 'function') {
        let types = new DragTypes(e.dataTransfer);
        dropOperation = getDropOperation(e.dataTransfer.effectAllowed, options.getDropOperation(types, allowedOperations));
      }

      state.dropEffect = DROP_OPERATION_TO_DROP_EFFECT[dropOperation] || 'none';
    }

    if (typeof options.getDropOperationForPoint === 'function') {
      let allowedOperations = effectAllowedToOperations(e.dataTransfer.effectAllowed);
      let types = new DragTypes(e.dataTransfer);
      let rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      let dropOperation = getDropOperation(
        e.dataTransfer.effectAllowed,
        options.getDropOperationForPoint(types, allowedOperations, state.x - rect.x, state.y - rect.y)
      );
      state.dropEffect = DROP_OPERATION_TO_DROP_EFFECT[dropOperation] || 'none';
    }

    state.effectAllowed = e.dataTransfer.effectAllowed;
    e.dataTransfer.dropEffect = state.dropEffect;

    // If the drop operation changes, update state and fire events appropriately.
    if (state.dropEffect === 'none' && prevDropEffect !== 'none') {
      fireDropExit(e);
    } else if (state.dropEffect !== 'none' && prevDropEffect === 'none') {
      fireDropEnter(e);
    }

    if (typeof options.onDropMove === 'function' && state.dropEffect !== 'none') {
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
    e.stopPropagation();
    state.dragOverElements.add(e.target as Element);
    if (state.dragOverElements.size > 1) {
      return;
    }

    let allowedOperations = effectAllowedToOperations(e.dataTransfer.effectAllowed);
    let dropOperation = allowedOperations[0];

    if (typeof options.getDropOperation === 'function') {
      let types = new DragTypes(e.dataTransfer);
      dropOperation = getDropOperation(e.dataTransfer.effectAllowed, options.getDropOperation(types, allowedOperations));
    }

    if (typeof options.getDropOperationForPoint === 'function') {
      let types = new DragTypes(e.dataTransfer);
      let rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      dropOperation = getDropOperation(
        e.dataTransfer.effectAllowed,
        options.getDropOperationForPoint(types, allowedOperations, e.clientX - rect.x, e.clientY - rect.y)
      );
    }

    state.x = e.clientX;
    state.y = e.clientY;
    state.effectAllowed = e.dataTransfer.effectAllowed;
    state.dropEffect = DROP_OPERATION_TO_DROP_EFFECT[dropOperation] || 'none';
    e.dataTransfer.dropEffect = state.dropEffect;

    if (dropOperation !== 'cancel') {
      fireDropEnter(e);
    }
  };

  let onDragLeave = (e: DragEvent) => {
    e.stopPropagation();

    // We would use e.relatedTarget to detect if the drag is still inside the drop target,
    // but it is always null in WebKit. https://bugs.webkit.org/show_bug.cgi?id=66547
    // Instead, we track all of the targets of dragenter events in a set, and remove them
    // in dragleave. When the set becomes empty, we've left the drop target completely.
    // We must also remove any elements that are no longer in the DOM, because dragleave
    // events will never be fired for these. This can happen, for example, with drop
    // indicators between items, which disappear when the drop target changes.

    state.dragOverElements.delete(e.target as Element);
    for (let element of state.dragOverElements) {
      if (!e.currentTarget.contains(element)) {
        state.dragOverElements.delete(element);
      }
    }

    if (state.dragOverElements.size > 0) {
      return;
    }

    if (state.dropEffect !== 'none') {
      fireDropExit(e);
    }

    clearTimeout(state.dropActivateTimer);
  };

  let onDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (typeof options.onDrop === 'function') {
      let dropOperation = DROP_EFFECT_TO_DROP_OPERATION[state.dropEffect];
      let items = readFromDataTransfer(e.dataTransfer);

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
      setTimeout(() => {
        options.onDrop(event);
      }, 0);
    }

    state.dragOverElements.clear();
    fireDropExit(e);
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

function getDropOperation(effectAllowed: string, operation: DropOperation) {
  let allowedOperationsBits = DROP_OPERATION_ALLOWED[effectAllowed];
  let op = DROP_OPERATION[operation];
  return allowedOperationsBits & op ? operation : 'cancel';
}
