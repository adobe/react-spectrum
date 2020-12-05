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
import {DroppableCollectionState} from '@react-stately/dnd';
import {DropTarget} from '@react-types/shared';
import {getTypes} from './utils';
import {HTMLAttributes, RefObject, useEffect} from 'react';
import {useVirtualDrop} from './useVirtualDrop';

interface DroppableItemOptions {
  target: DropTarget
}

interface DroppableItemResult {
  dropProps: HTMLAttributes<HTMLElement>
}

export function useDroppableItem(options: DroppableItemOptions, state: DroppableCollectionState, ref: RefObject<HTMLElement>): DroppableItemResult {
  let {dropProps} = useVirtualDrop();

  useEffect(() => {
    if (ref.current) {
      return DragManager.registerDropItem({
        element: ref.current,
        target: options.target,
        getDropOperation(types, allowedOperations) {
          return state.getDropOperation(
            options.target,
            types,
            allowedOperations
          );
        }
      });
    }
  }, [ref, options.target, state]);

  let dragSession = DragManager.useDragSession();
  let isValidDropTarget = dragSession && state.getDropOperation(
    options.target,
    getTypes(dragSession.dragTarget.items),
    dragSession.dragTarget.allowedDropOperations
  ) !== 'cancel';

  let isDropTarget = state.isDropTarget(options.target);
  useEffect(() => {
    if (dragSession && isDropTarget && ref.current) {
      ref.current.focus();
    }
  }, [isDropTarget, dragSession, ref]);

  return {
    dropProps: {
      ...dropProps,
      'aria-hidden': !dragSession || isValidDropTarget ? undefined : 'true'
    }
  };
}
