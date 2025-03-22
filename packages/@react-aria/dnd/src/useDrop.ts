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

import {AriaButtonProps} from '@react-types/button';
import {DOMAttributes, DropActivateEvent, DropEnterEvent, DropEvent, DropExitEvent, DropMoveEvent, DropOperation, FocusableElement, DragTypes as IDragTypes, RefObject} from '@react-types/shared';
import {DragEvent, useRef, useState} from 'react';
import * as DragManager from './DragManager';
import {DragTypes, globalAllowedDropOperations, globalDndState, readFromDataTransfer, setGlobalDnDState, setGlobalDropEffect} from './utils';
import {DROP_EFFECT_TO_DROP_OPERATION, DROP_OPERATION, DROP_OPERATION_ALLOWED, DROP_OPERATION_TO_DROP_EFFECT} from './constants';
import {isIPad, isMac, useEffectEvent, useLayoutEffect} from '@react-aria/utils';
import {useVirtualDrop} from './useVirtualDrop';

export interface DropOptions {
  /** A ref for the droppable element. */
  ref: RefObject<FocusableElement | null>,
  /**
   * A function returning the drop operation to be performed when items matching the given types are dropped
   * on the drop target.
   */
  getDropOperation?: (types: IDragTypes, allowedOperations: DropOperation[]) => DropOperation,
  /** A function that returns the drop operation for a specific point within the target. */
  getDropOperationForPoint?: (types: IDragTypes, allowedOperations: DropOperation[], x: number, y: number) => DropOperation,
  /** Handler that is called when a valid drag enters the drop target. */
  onDropEnter?: (e: DropEnterEvent) => void,
  /** Handler that is called when a valid drag is moved within the drop target. */
  onDropMove?: (e: DropMoveEvent) => void,
  /**
   * Handler that is called after a valid drag is held over the drop target for a period of time.
   * This typically opens the item so that the user can drop within it.
   * @private
   */
  onDropActivate?: (e: DropActivateEvent) => void,
  /** Handler that is called when a valid drag exits the drop target. */
  onDropExit?: (e: DropExitEvent) => void,
  /** Handler that is called when a valid drag is dropped on the drop target. */
  onDrop?: (e: DropEvent) => void,
  /**
   * Whether the item has an explicit focusable drop affordance to initiate accessible drag and drop mode.
   * If true, the dropProps will omit these event handlers, and they will be applied to dropButtonProps instead.
   */
  hasDropButton?: boolean,
  /**
   * Whether the drop target is disabled. If true, the drop target will not accept any drops.
   */
  isDisabled?: boolean
}

export interface DropResult {
  /** Props for the droppable element. */
  dropProps: DOMAttributes,
  /** Whether the drop target is currently focused or hovered. */
  isDropTarget: boolean,
  /** Props for the explicit drop button affordance, if any. */
  dropButtonProps?: AriaButtonProps
}

const DROP_ACTIVATE_TIMEOUT = 800;

/**
 * Handles drop interactions for an element, with support for traditional mouse and touch
 * based drag and drop, in addition to full parity for keyboard and screen reader users.
 */
export function useDrop(options: DropOptions): DropResult {
  let {hasDropButton, isDisabled} = options;
  let [isDropTarget, setDropTarget] = useState(false);
  let state = useRef<{
    x: number,
    y: number,
    dragOverElements: Set<Element>,
    dropEffect: DataTransfer['dropEffect'],
    allowedOperations: DROP_OPERATION,
    dropActivateTimer: ReturnType<typeof setTimeout> | undefined
  }>({
    x: 0,
    y: 0,
    dragOverElements: new Set<Element>(),
    dropEffect: 'none',
    allowedOperations: DROP_OPERATION.all,
    dropActivateTimer: undefined
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

    let allowedOperations = getAllowedOperations(e);
    if (e.clientX === state.x && e.clientY === state.y && allowedOperations === state.allowedOperations) {
      e.dataTransfer.dropEffect = state.dropEffect;
      return;
    }

    state.x = e.clientX;
    state.y = e.clientY;

    let prevDropEffect = state.dropEffect;

    // Update drop effect if allowed drop operations changed (e.g. user pressed modifier key).
    if (allowedOperations !== state.allowedOperations) {
      let allowedOps = allowedOperationsToArray(allowedOperations);
      let dropOperation = allowedOps[0];
      if (typeof options.getDropOperation === 'function') {
        let types = new DragTypes(e.dataTransfer);
        dropOperation = getDropOperation(allowedOperations, options.getDropOperation(types, allowedOps));
      }
      state.dropEffect = DROP_OPERATION_TO_DROP_EFFECT[dropOperation] || 'none';
    }

    if (typeof options.getDropOperationForPoint === 'function') {
      let types = new DragTypes(e.dataTransfer);
      let rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      let dropOperation = getDropOperation(
        allowedOperations,
        options.getDropOperationForPoint(types, allowedOperationsToArray(allowedOperations), state.x - rect.x, state.y - rect.y)
      );
      state.dropEffect = DROP_OPERATION_TO_DROP_EFFECT[dropOperation] || 'none';
    }

    state.allowedOperations = allowedOperations;
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

    if (options.onDropActivate && typeof options.onDropActivate === 'function' && state.dropEffect !== 'none') {
      let onDropActivateOptions = options.onDropActivate;
      let rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      state.dropActivateTimer = setTimeout(() => {
        onDropActivateOptions({
          type: 'dropactivate',
          x: state.x - rect.x,
          y: state.y - rect.y
        });
      }, DROP_ACTIVATE_TIMEOUT);
    }
  };

  let onDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    state.dragOverElements.add(e.target as Element);
    if (state.dragOverElements.size > 1) {
      return;
    }

    let allowedOperationsBits = getAllowedOperations(e);
    let allowedOperations = allowedOperationsToArray(allowedOperationsBits);
    let dropOperation = allowedOperations[0];

    if (typeof options.getDropOperation === 'function') {
      let types = new DragTypes(e.dataTransfer);
      dropOperation = getDropOperation(allowedOperationsBits, options.getDropOperation(types, allowedOperations));
    }

    if (typeof options.getDropOperationForPoint === 'function') {
      let types = new DragTypes(e.dataTransfer);
      let rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      dropOperation = getDropOperation(
        allowedOperationsBits,
        options.getDropOperationForPoint(types, allowedOperations, e.clientX - rect.x, e.clientY - rect.y)
      );
    }

    state.x = e.clientX;
    state.y = e.clientY;
    state.allowedOperations = allowedOperationsBits;
    state.dropEffect = DROP_OPERATION_TO_DROP_EFFECT[dropOperation] || 'none';
    e.dataTransfer.dropEffect = state.dropEffect;

    if (dropOperation !== 'cancel') {
      fireDropEnter(e);
    }
  };

  let onDragLeave = (e: DragEvent) => {
    e.preventDefault();
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
    // Track drop effect in global state for Chrome Android. https://bugs.chromium.org/p/chromium/issues/detail?id=1353951
    // Android onDragEnd always returns "none" as its drop effect.
    setGlobalDropEffect(state.dropEffect);

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

      options.onDrop(event);
    }

    let dndStateSnapshot = {...globalDndState};
    state.dragOverElements.clear();
    fireDropExit(e);
    clearTimeout(state.dropActivateTimer);
    // If there wasn't a collection being tracked as a dragged collection, then we are in a case where a non RSP drag is dropped on a
    // RSP collection and thus we don't need to preserve the global drop effect
    if (dndStateSnapshot.draggingCollectionRef == null) {
      setGlobalDropEffect(undefined);
    } else {
      // Otherwise we need to preserve the global dnd state for onDragEnd's isInternal check.
      // At the moment fireDropExit may clear dropCollectionRef (i.e. useDroppableCollection's provided onDropExit, required to clear dropCollectionRef when exiting a valid drop target)
      setGlobalDnDState(dndStateSnapshot);
    }
  };

  let onDropEnter = useEffectEvent((e: DropEnterEvent) => {
    if (typeof options.onDropEnter === 'function') {
      options.onDropEnter(e);
    }
  });

  let onDropExit = useEffectEvent((e: DropExitEvent) => {
    if (typeof options.onDropExit === 'function') {
      options.onDropExit(e);
    }
  });

  let onDropActivate = useEffectEvent((e: DropActivateEvent) => {
    if (typeof options.onDropActivate === 'function') {
      options.onDropActivate(e);
    }
  });

  let onKeyboardDrop = useEffectEvent((e: DropEvent) => {
    if (typeof options.onDrop === 'function') {
      options.onDrop(e);
    }
  });

  let getDropOperationKeyboard = useEffectEvent((types: IDragTypes, allowedOperations: DropOperation[]) => {
    if (options.getDropOperation) {
      return options.getDropOperation(types, allowedOperations);
    }

    return allowedOperations[0];
  });

  let {ref} = options;
  useLayoutEffect(() => {
    if (isDisabled || !ref.current) {
      return;
    }
    return DragManager.registerDropTarget({
      element: ref.current,
      getDropOperation: getDropOperationKeyboard,
      onDropEnter(e) {
        setDropTarget(true);
        onDropEnter(e);
      },
      onDropExit(e) {
        setDropTarget(false);
        onDropExit(e);
      },
      onDrop: onKeyboardDrop,
      onDropActivate
    });
  }, [isDisabled, ref, getDropOperationKeyboard, onDropEnter, onDropExit, onKeyboardDrop, onDropActivate]);

  let {dropProps} = useVirtualDrop();
  if (isDisabled) {
    return {
      dropProps: {},
      dropButtonProps: {isDisabled: true},
      isDropTarget: false
    };
  }
  return {
    dropProps: {
      ...(!hasDropButton && dropProps),
      onDragEnter,
      onDragOver,
      onDragLeave,
      onDrop
    },
    dropButtonProps: {...(hasDropButton && dropProps)},
    isDropTarget
  };
}

function getAllowedOperations(e: DragEvent) {
  let allowedOperations = DROP_OPERATION_ALLOWED[e.dataTransfer.effectAllowed];

  // WebKit always sets effectAllowed to "copyMove" on macOS, and "all" on iOS, regardless of what was
  // set during the dragstart event: https://bugs.webkit.org/show_bug.cgi?id=178058
  //
  // Android Chrome also sets effectAllowed to "copyMove" in all cases: https://bugs.chromium.org/p/chromium/issues/detail?id=1359182
  //
  // If the drag started within the page, we can use a global variable to get the real allowed operations.
  // This needs to be intersected with the actual effectAllowed, which may have been filtered based on modifier keys.
  // Unfortunately, this means that link operations do not work at all in Safari.
  if (globalAllowedDropOperations) {
    allowedOperations &= globalAllowedDropOperations;
  }

  // Chrome and Safari on macOS will automatically filter effectAllowed when pressing modifier keys,
  // allowing the user to switch between move, link, and copy operations. Firefox on macOS and all
  // Windows browsers do not do this, so do it ourselves instead. The exact keys are platform dependent.
  // https://ux.stackexchange.com/questions/83748/what-are-the-most-common-modifier-keys-for-dragging-objects-with-a-mouse
  //
  // Note that none of these modifiers are ever set in WebKit due to a bug: https://bugs.webkit.org/show_bug.cgi?id=77465
  // However, Safari does update effectAllowed correctly, so we can just rely on that.
  let allowedModifiers = DROP_OPERATION.none;
  if (isMac()) {
    if (e.altKey) {
      allowedModifiers |= DROP_OPERATION.copy;
    }

    // Chrome and Safari both use the Control key for link, even though Finder uses Command + Option.
    // iPadOS doesn't support link operations and will not fire the drop event at all if dropEffect is set to link.
    // https://bugs.webkit.org/show_bug.cgi?id=244701
    if (e.ctrlKey && !isIPad()) {
      allowedModifiers |= DROP_OPERATION.link;
    }

    if (e.metaKey) {
      allowedModifiers |= DROP_OPERATION.move;
    }
  } else {
    if (e.altKey) {
      allowedModifiers |= DROP_OPERATION.link;
    }

    if (e.shiftKey) {
      allowedModifiers |= DROP_OPERATION.move;
    }

    if (e.ctrlKey) {
      allowedModifiers |= DROP_OPERATION.copy;
    }
  }

  if (allowedModifiers) {
    return allowedOperations & allowedModifiers;
  }

  return allowedOperations;
}

function allowedOperationsToArray(allowedOperationsBits: DROP_OPERATION) {
  let allowedOperations: Array<DropOperation> = [];
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

function getDropOperation(allowedOperations: DROP_OPERATION, operation: DropOperation) {
  let op = DROP_OPERATION[operation];
  return allowedOperations & op ? operation : 'cancel';
}
