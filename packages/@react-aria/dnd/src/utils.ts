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

import {CUSTOM_DRAG_TYPE, NATIVE_DRAG_TYPES} from './constants';
import {DragItem, DropItem} from '@react-types/shared';
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

export function writeToDataTransfer(dataTransfer: DataTransfer, items: DragItem[]) {
  // The data transfer API doesn't support more than one item of a given type at once.
  // In addition, only a small set of types are supported natively for transfer between applications.
  // We allow for both multiple items, as well as multiple representations of a single item.
  // In order to make our API work with the native API, we serialize all items to JSON and
  // store as a single native item. We only need to do this if there is more than one item
  // of the same type, or if an item has more than one representation. Otherwise the native
  // API is sufficient.
  let groupedByType = new Map<string, string[]>();
  let needsCustomData = false;
  let customData = [];
  for (let item of items) {
    let types = [...item.types];
    if (types.length > 1) {
      needsCustomData = true;
    }

    let dataByType = {};
    for (let type of types) {
      let typeItems = groupedByType.get(type);
      if (!typeItems) {
        typeItems = [];
        groupedByType.set(type, typeItems);
      } else {
        needsCustomData = true;
      }

      let data = item.getData(type);
      dataByType[type] = data;
      typeItems.push(data);
    }

    customData.push(dataByType);
  }

  for (let [type, items] of groupedByType) {
    if (NATIVE_DRAG_TYPES.has(type)) {
      // Only one item of a given type can be set on a data transfer.
      // Join all of the items together separated by newlines.
      let data = items.join('\n');
      dataTransfer.items.add(data, type);
    } else {
      // Set data to the first item so we have access to the list of types.
      dataTransfer.items.add(items[0], type);
    }
  }

  if (needsCustomData) {
    let data = JSON.stringify(customData);
    dataTransfer.items.add(data, CUSTOM_DRAG_TYPE);
  }
}

export function readFromDataTransfer(dataTransfer: DataTransfer) {
  let items: DropItem[] = [];

  // If our custom drag type is available, use that. This is a JSON serialized
  // representation of all items in the drag, set when there are multiple items
  // of the same type, or an individual item has multiple representations.
  let hasCustomType = false;
  if ([...dataTransfer.types].includes(CUSTOM_DRAG_TYPE)) {
    try {
      let data = dataTransfer.getData(CUSTOM_DRAG_TYPE);
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
    for (let item of dataTransfer.items) {
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

  return items;
}
