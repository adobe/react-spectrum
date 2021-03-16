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

import {DragItem} from '@react-types/shared';
import {DroppableCollectionState} from '@react-stately/dnd';
import {getInteractionModality, useInteractionModality} from '@react-aria/interactions';
import {useId} from '@react-aria/utils';

const droppableCollectionIds = new WeakMap<DroppableCollectionState, string>();

export function useDroppableCollectionId(state: DroppableCollectionState) {
  let id = useId();
  droppableCollectionIds.set(state, id);
  return id;
}

export function getDroppableCollectionId(state: DroppableCollectionState) {
  let id = droppableCollectionIds.get(state);
  if (!id) {
    throw new Error('Droppable item outside a droppable collection');
  }

  return id;
}

export function getTypes(items: DragItem[]): Set<string> {
  let types = new Set<string>();
  for (let item of items) {
    for (let type of item.types) {
      types.add(type);
    }
  }

  return types;
}

function mapModality(modality: string) {
  if (!modality) {
    modality = 'virtual';
  }

  if (modality === 'pointer') {
    modality = 'virtual';
  }

  if (modality === 'virtual' && 'ontouchstart' in window) {
    modality = 'touch';
  }

  return modality;
}

export function useDragModality() {
  return mapModality(useInteractionModality());
}

export function getDragModality() {
  return mapModality(getInteractionModality());
}
