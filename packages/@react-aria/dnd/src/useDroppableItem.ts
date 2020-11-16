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

import {DropOperation, DropTarget} from './types';
import {HTMLAttributes, RefObject, useEffect, useLayoutEffect} from 'react';
import * as DragManager from './DragManager';
import {useVirtualDrop} from './useVirtualDrop';

interface DroppableItemOptions {
  ref: RefObject<HTMLElement>,
  target: DropTarget,
  getDropOperation?: (target: DropTarget, types: string[], allowedOperations: DropOperation[]) => DropOperation
}

interface DroppableItemResult {
  dropProps: HTMLAttributes<HTMLElement>
}

export function useDroppableItem(options: DroppableItemOptions): DroppableItemResult {
  let {dropProps} = useVirtualDrop();

  useEffect(() => {
    if (options.target) {
      DragManager.registerDropItem({
        element: options.ref.current,
        target: options.target
      });
    }
  }, []);

  let dragSession = DragManager.useDragSession();
  let isValidDropTarget = dragSession && typeof options.getDropOperation === 'function'
    ? options.getDropOperation(
        options.target,
        dragSession.dragTarget.items.map(i => i.type),
        dragSession.dragTarget.allowedDropOperations
      ) !== 'cancel'
    : true;

  return {
    dropProps: {
      ...dropProps,
      'aria-hidden': isValidDropTarget ? undefined : 'true'
    }
  };
}
