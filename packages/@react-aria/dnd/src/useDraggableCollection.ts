/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {DraggableCollectionState} from '@react-stately/dnd';
import {globalDndState, setDraggingCollectionRef} from './utils';
import {RefObject} from '@react-types/shared';

export interface DraggableCollectionOptions {}

/**
 * Handles drag interactions for a collection component, with support for traditional mouse and touch
 * based drag and drop, in addition to full parity for keyboard and screen reader users.
 */
export function useDraggableCollection(props: DraggableCollectionOptions, state: DraggableCollectionState, ref: RefObject<HTMLElement | null>): void {
  // Update global DnD state if this keys within this collection are dragged
  let {draggingCollectionRef} = globalDndState;
  if  (state.draggingKeys.size > 0 && draggingCollectionRef?.current !== ref.current) {
    setDraggingCollectionRef(ref);
  }
}
