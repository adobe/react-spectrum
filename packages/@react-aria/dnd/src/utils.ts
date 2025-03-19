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

import {CUSTOM_DRAG_TYPE, DROP_OPERATION, GENERIC_TYPE, NATIVE_DRAG_TYPES} from './constants';
import {DirectoryDropItem, DragItem, DropItem, FileDropItem, DragTypes as IDragTypes, Key, RefObject, TextDropItem} from '@react-types/shared';
import {DroppableCollectionState} from '@react-stately/dnd';
import {getInteractionModality, useInteractionModality} from '@react-aria/interactions';

interface DroppableCollectionMap {
  id: string,
  ref: RefObject<HTMLElement | null>
}

export const droppableCollectionMap = new WeakMap<DroppableCollectionState, DroppableCollectionMap>();
export const DIRECTORY_DRAG_TYPE = Symbol();

export function getDroppableCollectionId(state: DroppableCollectionState): string {
  let {id} = droppableCollectionMap.get(state) || {};
  if (!id) {
    throw new Error('Droppable item outside a droppable collection');
  }

  return id;
}

export function getDroppableCollectionRef(state: DroppableCollectionState): RefObject<HTMLElement | null> {
  let {ref} = droppableCollectionMap.get(state) || {};
  if (!ref) {
    throw new Error('Droppable item outside a droppable collection');
  }

  return ref;
}

export function getTypes(items: DragItem[]): Set<string> {
  let types = new Set<string>();
  for (let item of items) {
    for (let type of Object.keys(item)) {
      types.add(type);
    }
  }

  return types;
}

function mapModality(modality: string | null) {
  if (!modality) {
    modality = 'virtual';
  }

  if (modality === 'pointer') {
    modality = 'virtual';
  }

  if (modality === 'virtual' &&  (typeof window !== 'undefined' && 'ontouchstart' in window)) {
    modality = 'touch';
  }

  return modality;
}

export function useDragModality(): string {
  return mapModality(useInteractionModality());
}

export function getDragModality(): string {
  return mapModality(getInteractionModality());
}

export function writeToDataTransfer(dataTransfer: DataTransfer, items: DragItem[]): void {
  // The data transfer API doesn't support more than one item of a given type at once.
  // In addition, only a small set of types are supported natively for transfer between applications.
  // We allow for both multiple items, as well as multiple representations of a single item.
  // In order to make our API work with the native API, we serialize all items to JSON and
  // store as a single native item. We only need to do this if there is more than one item
  // of the same type, or if an item has more than one representation. Otherwise the native
  // API is sufficient.
  //
  // The DataTransferItemList API also theoretically supports adding files, which would enable
  // dragging binary data out of the browser onto the user's desktop for example. Unfortunately,
  // this does not currently work in any browser, so it is not currently supported by our API.
  // See e.g. https://bugs.chromium.org/p/chromium/issues/detail?id=438479.
  let groupedByType = new Map<string, string[]>();
  let needsCustomData = false;
  let customData: Array<{}> = [];
  for (let item of items) {
    let types = Object.keys(item);
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

      let data = item[type];
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

export class DragTypes implements IDragTypes {
  private types: Set<string>;
  private includesUnknownTypes: boolean;

  constructor(dataTransfer: DataTransfer) {
    this.types = new Set<string>();

    let hasFiles = false;
    for (let item of dataTransfer.items) {
      if (item.type !== CUSTOM_DRAG_TYPE) {
        if (item.kind === 'file') {
          hasFiles = true;
        }

        if (item.type) {
          this.types.add(item.type);
        } else {
          // Files with unknown types or extensions that don't map to a known mime type
          // are sometimes exposed as an empty string by the browser. Map to a generic
          // mime type instead. Note that this could also be a directory as there's no
          // way to determine if something is a file or directory until drop.
          this.types.add(GENERIC_TYPE);
        }
      }
    }

    // In Safari, when dragging files, the dataTransfer.items list is empty, but dataTransfer.types contains "Files".
    // Unfortunately, this doesn't tell us what types of files the user is dragging, so we need to assume that any
    // type the user checks for is included. See https://bugs.webkit.org/show_bug.cgi?id=223517.
    this.includesUnknownTypes = !hasFiles && dataTransfer.types.includes('Files');
  }

  has(type: string | symbol): boolean {
    if (this.includesUnknownTypes || (type === DIRECTORY_DRAG_TYPE && this.types.has(GENERIC_TYPE))) {
      return true;
    }

    return typeof type === 'string' && this.types.has(type);
  }
}

export function readFromDataTransfer(dataTransfer: DataTransfer): DropItem[] {
  let items: DropItem[] = [];
  if (!dataTransfer) {
    return items;
  }

  // If our custom drag type is available, use that. This is a JSON serialized
  // representation of all items in the drag, set when there are multiple items
  // of the same type, or an individual item has multiple representations.
  let hasCustomType = false;
  if (dataTransfer.types.includes(CUSTOM_DRAG_TYPE)) {
    try {
      let data = dataTransfer.getData(CUSTOM_DRAG_TYPE);
      let parsed = JSON.parse(data);
      for (let item of parsed) {
        items.push({
          kind: 'text',
          types: new Set(Object.keys(item)),
          getText: (type) => Promise.resolve(item[type])
        });
      }

      hasCustomType = true;
    } catch {
      // ignore
    }
  }

  // Otherwise, map native drag items to items of a single representation.
  if (!hasCustomType) {
    let stringItems = new Map();
    for (let item of dataTransfer.items) {
      if (item.kind === 'string') {
        // The data for all formats must be read here because the data transfer gets
        // cleared out after the event handler finishes. If the item has an empty string
        // as a type, the mime type is unknown. Map to a generic mime type instead.
        stringItems.set(item.type || GENERIC_TYPE, dataTransfer.getData(item.type));
      } else if (item.kind === 'file') {
        // Despite the name, webkitGetAsEntry is also implemented in Firefox and Edge.
        // In the future, we may use getAsFileSystemHandle instead, but that's currently
        // only implemented in Chrome.
        if (typeof item.webkitGetAsEntry === 'function') {
          let entry: FileSystemEntry | null = item.webkitGetAsEntry();
          // eslint-disable-next-line max-depth
          if (!entry) {
            // For some reason, Firefox includes an item with type image/png when copy
            // and pasting any file or directory (no matter the type), but returns `null` for both
            // item.getAsFile() and item.webkitGetAsEntry(). Safari works as expected. Ignore this
            // item if this happens. See https://bugzilla.mozilla.org/show_bug.cgi?id=1699743.
            // This was recently fixed in Chrome Canary: https://bugs.chromium.org/p/chromium/issues/detail?id=1175483.
            continue;
          }

          // eslint-disable-next-line max-depth
          if (entry.isFile) {
            items.push(createFileItem(item.getAsFile()));
          } else if (entry.isDirectory) {
            items.push(createDirectoryItem(entry));
          }
        } else {
          // Assume it's a file.
          items.push(createFileItem(item.getAsFile()));
        }
      }
    }

    // All string items are different representations of the same item. There's no way to have
    // multiple string items at once in the current DataTransfer API.
    if (stringItems.size > 0) {
      items.push({
        kind: 'text',
        types: new Set(stringItems.keys()),
        getText: (type) => Promise.resolve(stringItems.get(type))
      });
    }
  }

  return items;
}

function blobToString(blob: Blob): Promise<string> {
  if (typeof blob.text === 'function') {
    return blob.text();
  }

  // Safari doesn't have the Blob#text() method yet...
  return new Promise((resolve, reject) => {
    let reader = new FileReader;
    reader.onload = () => {
      resolve(reader.result as string);
    };

    reader.onerror = reject;
    reader.readAsText(blob);
  });
}

function createFileItem(file: File | null): FileDropItem {
  if (!file) {
    throw new Error('No file provided');
  }
  return {
    kind: 'file',
    type: file.type || GENERIC_TYPE,
    name: file.name,
    getText: () => blobToString(file),
    getFile: () => Promise.resolve(file)
  };
}

function createDirectoryItem(entry: any): DirectoryDropItem {
  return {
    kind: 'directory',
    name: entry.name,
    getEntries: () => getEntries(entry)
  };
}

async function *getEntries(item: FileSystemDirectoryEntry): AsyncIterable<FileDropItem | DirectoryDropItem> {
  let reader = item.createReader();

  // We must call readEntries repeatedly because there may be a limit to the
  // number of entries that are returned at once.
  let entries: FileSystemEntry[];
  do {
    entries = await new Promise((resolve, reject) => {
      reader.readEntries(resolve, reject);
    });

    for (let entry of entries) {
      if (entry.isFile) {
        let file = await getEntryFile(entry as FileSystemFileEntry);
        yield createFileItem(file);
      } else if (entry.isDirectory) {
        yield createDirectoryItem(entry);
      }
    }
  } while (entries.length > 0);
}

function getEntryFile(entry: FileSystemFileEntry): Promise<File> {
  return new Promise((resolve, reject) => entry.file(resolve, reject));
}

/** Returns whether a drop item contains text data. */
export function isTextDropItem(dropItem: DropItem): dropItem is TextDropItem {
  return dropItem.kind === 'text';
}

/** Returns whether a drop item is a file. */
export function isFileDropItem(dropItem: DropItem): dropItem is FileDropItem {
  return dropItem.kind === 'file';
}

/** Returns whether a drop item is a directory. */
export function isDirectoryDropItem(dropItem: DropItem): dropItem is DirectoryDropItem {
  return dropItem.kind === 'directory';
}

// Global DnD collection state tracker.
export interface DnDState {
  /** A ref for the  of the drag items in the current drag session if any. */
  draggingCollectionRef?: RefObject<HTMLElement | null>,
  /** The set of currently dragged keys. */
  draggingKeys: Set<Key>,
  /** A ref for the collection that is targeted for a drop operation, if any. */
  dropCollectionRef?: RefObject<HTMLElement | null>
}

export let globalDndState: DnDState = {draggingKeys: new Set()};

export function setDraggingCollectionRef(ref: RefObject<HTMLElement | null>): void {
  globalDndState.draggingCollectionRef = ref;
}

export function setDraggingKeys(keys: Set<Key>): void {
  globalDndState.draggingKeys = keys;
}

export function setDropCollectionRef(ref?: RefObject<HTMLElement | null>): void {
  globalDndState.dropCollectionRef = ref;
}

export function clearGlobalDnDState(): void {
  globalDndState = {draggingKeys: new Set()};
}

export function setGlobalDnDState(state: DnDState): void {
  globalDndState = state;
}

// Util function to check if the current dragging collection ref is the same as the current targeted droppable collection ref.
// Allows a droppable ref arg in case the global drop collection ref hasn't been set
export function isInternalDropOperation(ref?: RefObject<HTMLElement | null>): boolean {
  let {draggingCollectionRef, dropCollectionRef} = globalDndState;
  return draggingCollectionRef?.current != null && draggingCollectionRef.current === (ref?.current || dropCollectionRef?.current);
}

type DropEffect = 'none' | 'copy' | 'link' | 'move';
export let globalDropEffect: DropEffect | undefined;
export function setGlobalDropEffect(dropEffect: DropEffect | undefined): void {
  globalDropEffect = dropEffect;
}

export let globalAllowedDropOperations = DROP_OPERATION.none;
export function setGlobalAllowedDropOperations(o: DROP_OPERATION): void {
  globalAllowedDropOperations = o;
}
