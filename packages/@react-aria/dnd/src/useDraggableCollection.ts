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
import {RefObject} from 'react';

export interface DraggableCollectionOptions {}

export function useDraggableCollection(props: DraggableCollectionOptions, state: DraggableCollectionState, ref: RefObject<HTMLElement>) {
  // Update global DnD state if this keys within this collection are dragged
  let {draggingCollectionRef} = globalDndState;
  if  (state.draggingKeys.size > 0 && draggingCollectionRef?.current !== ref.current) {
    setDraggingCollectionRef(ref);
  }
}
