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

import {DropOperation, DroppableCollectionProps, DropTarget} from '@react-types/shared';
import {useState} from 'react';

export interface DroppableCollectionState {
  target: DropTarget,
  setTarget(target: DropTarget): void,
  isDropTarget(target: DropTarget): boolean,
  getDropOperation(target: DropTarget, types: string[], allowedOperations: DropOperation[]): DropOperation
}

export function useDroppableCollectionState(props: DroppableCollectionProps): DroppableCollectionState  {
  let [target, setTarget] = useState<DropTarget>(null);

  return {
    target,
    setTarget(newTarget) {
      if (target && typeof props.onDropExit === 'function') {
        props.onDropExit({
          type: 'dropexit',
          x: 0, // todo
          y: 0,
          target
        });
      }

      if (newTarget && typeof props.onDropEnter === 'function') {
        props.onDropEnter({
          type: 'dropenter',
          x: 0, // todo
          y: 0,
          target: newTarget
        });
      }

      setTarget(newTarget);
    },
    isDropTarget(dropTarget) {
      switch (dropTarget.type) {
        case 'root':
          return target?.type === 'root';
        case 'item':
          return target?.type === 'item' && target?.key === dropTarget.key && target?.dropPosition === dropTarget.dropPosition;
      }
    },
    getDropOperation(target, types, allowedOperations) {
      return typeof props.getDropOperation === 'function'
        ? props.getDropOperation(target, types, allowedOperations)
        : allowedOperations[0];
    }
  };
}
