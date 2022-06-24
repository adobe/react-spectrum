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

import {DropOperation} from '@react-types/shared';
import {Key} from 'react';
import {useDragHooks} from './useDragHooks';
import {useDropHooks} from './useDropHooks';

export interface DnDOptions {
  // TODO: a getter that returns the drag type for a given key in the list
  // Limitations: returns a single type, don't think we should support multiple types per item in this utility
  // Maybe don't even need this, maybe just accept a "dragType" from user or make it a requirement that the "list"
  // contains the drag type information for each item
  getDragType?: (key) => string,
  // Array of accepted dragTypes, determines what items can be dropped into the collection. Defaults to 'all' which would allow anything?
  // TODO: perhaps this is better way to prevent or allow reordering
  // Maybe make this a function that returns true or false when passed a drag type, allows user to use regex and partial string matching
  acceptedDragTypes?: 'all' | Array<string>,
  // takes a list from useListData or useAsyncList, but should support an arbitrary list state tracker. That tracker will need the
  // same ".update", ".remove", "moveBefore", etc help methods which maybe a tall order. Perhaps do away with this and rely on the user to provide a
  // onDrop/handleDrop/handler that handles updating the collection when a drop happens?
  list: any,
  // Whether a root drop should add the items to the top or bottom of the collection
  rootDropOrder?: 'append' | 'prepend',
  // Whether the collection support reordering within itself (use this in getDropOperation to prevent reorder from being a valid drop operation)
  // TODO: unfortunately, doesn't seem to be a good way to do this in getDropOperation. Only way would be to either have the type of each dragItem identify
  // the source of the item OR to do something hacky via the drop event listeners that tracks the source of the items by searching for each item's existance in the list...
  // Unecessary, just expect user to provide unique drag types per collection to identify the source of the drag item
  // allowsReorder?: boolean,
  // Whether the collection allows dragging for its elements
  allowsDrag?: boolean,
  // Whether the collection allows drop operations. Note that this must be true if reordering is supported
  allowsDrop?: boolean,
  // TODO Same prop as in useDragHooks, preferably doesn't allow "link" cuz we don't provide onDragEnd?
  // Probably should always allow "cancel". This is specifically for dragging FROM the collection
  // Maybe this can just be an array instead of a function?
  getAllowedDropOperations?: () => DropOperation[],
  // TODO: some way for user to specify that the collection supports 'root', 'on', and/or 'between' drops.
  // This is specifically for drops into the collection
  allowedDropPositions?: Array<'root' | 'on' | 'between'>,
  // TODO: User provided list of valid drop "on" targets, used to further filter the list of droppable targets (e.g. if the user doesn't have write permissions for certain folders)
  // Is it weird to have this option in tandem with allowedDropOperations?
  validDropTargets?: Array<Key>
}

/*
 Assumptions made:
- user is using useListData, useAsyncList, or some kind of list state tracker with similar list manipulation utilities methods
- user is only interested in returning one drag type per item
- user is interested in making a list draggable, droppable, reorderable, or all at the same time.
- the keys of the collection are unique throughout the entire app (need this to check if a dropped item is a result of reordering or from a external source)
- that dragged data from an external source is structured in a similar way to the current collection (at the very least has the same fields)
- that the external drag source will handle updating itself on drop completion
- that items with childNodes are the only valid "on" drop targets (up for debate and the reason I've added validDropTargets to the options)
- that the first allowedOperation from the drag sourceis the desired one
*/


// TODO: rename this to something better. Essentially this is a basic draggable + droppable collection that supports "move" + "copy" operations
// TODO: add return types aka the drag and drop hooks
// TODO: Potenttially just have utility functions capture parts of the below logic instead. For instance, can take the isSameCollection logic handling for manipulating the list and
// make it a function that users call in their own onDrops. Another idea could be to do something similar for the getDropOperation cancel logic, provide a helper function
// that encapsulates that logic for others to use?
export function useDnDHooks(options: DnDOptions) {
  let {
    getDragType,
    acceptedDragTypes = 'all',
    list,
    rootDropOrder = 'append',
    allowsDrag,
    allowsDrop,
    allowedDropPositions = ['root', 'on', 'between'],
    getAllowedDropOperations
  } = options;

  // TODO: this feels fairly complicated and makes a fair number of assumptions, the alternative would be to have the user provide a function that handles
  // updating the various collections' contents on drop
  let handleDrop = (data, target) => {
    // Note: this makes the assumption on the data's structure and that id/keys are unique throughout the app
    // Only other way I can think to make this simpler is to force the user to attach a "source" identifier to the
    // dragged data
    let isSameCollection = list.getItem(data[0].key);
    let keys = data.map((item) => item.key);
    if (isSameCollection) {
      // Handle dragging within same list
      if (target.type === 'root') {
        if (rootDropOrder === 'append') {
          let lastKey = list.getKey(list.items.slice(-1)[0])
          // TODO: what if this is an async list? Perhaps it is ok that the root drop appends to the last visible item?
          // TODO: can't rely on id here, will need to use move and a for loop since moveAfter doesn't support an index
          list.moveAfter(lastKey, keys);
        } else {
          let firstKey = list.getKey(list.items[0].id);
          list.moveBefore(firstKey, keys);
        }
      } else if (target.dropPosition === 'before') {
        list.moveBefore(target.key, keys);
      } else if (target.dropPosition === 'after') {
        list.moveAfter(target.key, keys);
      }
    } else {
      // Handle drop from outside the list
      if (target.type === 'root') {
        // TODO: instead of grabbing the item from the sourceList (which we don't know since there could be a number of valid source collections from which this drop originates from),
        // we can perhaps just pass through the data given by getItems.
        // This assumes that the data extracted from the drag item matches the data format of the list though...
        if (rootDropOrder === 'append') {
          // TODO: what if this is an async list? Perhaps it is ok that the root drop appends to the last visible item?
          list.append(...data);
        } else {
          list.prepend(...data);
        }
      } else if (target.dropPosition === 'before') {
        list.insertBefore(target.key, ...data);
      } else if (target.dropPosition === 'after') {
        list.insertAfter(target.key, ...data);
      }
    }

    if (target.dropPosition === 'on') {
      let targetFolder = list.getItem(target.key);
      list.update(target.key, {...targetFolder, childNodes: [...targetFolder.childNodes, ...data]});
    }
  };

  let dragHooks = useDragHooks({
    getItems(keys) {
      return [...keys].map(key => {
        let item = list.getItem(key);
        // Add the key to the item's data in case it doesn't exist (e.g. a useListData with a getKey for generating the item's keys instead of having an id/key in the data already)
        item = {key, ...item};
        let dragType = getDragType(key);
        return {
          [`${dragType}`]: JSON.stringify(item)
        };
      });
    },
    onDragEnd: (e) => {
      // TODO: Don't need to do anything for cancel or copy(?) since those don't affect the current list
      // What about link? Perhaps we can treat link as an operation where the user shouldn't be using this hook
      // and instead should be using useDragHooks/useDropHooks directly
      // Alternative would be for the user to provide onDragEnd directly to the hook
      if (e.dropOperation === 'move') {
        let firstDraggedKey = e.keys.values().next().value;
        if (!list.getItem(firstDraggedKey)) {
          list.remove(...e.keys);
        }
      }
    },
    getAllowedDropOperations
  });

  let dropHooks = useDropHooks({
    async onDrop(e) {
      let dataList = [];
      for (let item of e.items) {
        for (let acceptedType of acceptedDragTypes) {
          if (item.kind === 'text' && item.types.has(acceptedType)) {
            let data = JSON.parse(await item.getText(acceptedType));
            dataList.push(data);
          }
        }
      }

      handleDrop(dataList, e.target);
    },
    getDropOperation(target, types, allowedOperations) {
      let typesSet = types.types ? types.types : types;
      let draggedTypes = [...typesSet.values()];
      // Cancel the drop operations if any of drag items aren't of the acceptedTypes, if the drop position isn't allowed
      // TODO make this cleaner, maybe make some util functions to detect if valid drop position
      // TODO prevent drops on disabled folders?
      // TODO allow for drops only on folders? what about collections that are droppable but allow a greater range of valid drop targets or don't have the concept of folders? Check if item has child nodes?
      // TODO prevent reordering, how to tell if the item is the same target (maybe the acceptedDragType check is sufficient if we assume the user will have a unique identifier in the type)
      // TODO perhaps also have the user provide a function that returns the keys for valid drop targets, to further filter down the list of droptarget options other than just all folders
      if (
        !draggedTypes.every(type => acceptedDragTypes.includes(type)) ||
        target.type === 'root' && !allowedDropPositions.includes('root') ||
        target.type === 'item' && target.dropPosition === 'on' && (!allowedDropPositions.includes('on') || !list.getItem(target.key).childNodes) ||
        target.type === 'item' && (target.dropPosition === 'before' || target.dropPosition === 'after') && !allowedDropPositions.includes('between')
      ) {
        return 'cancel';
      }
      // TODO: use allowedOperations to decide the operation to go with. How to decide between "move", "copy", and "link" if they are all allowed by the drag target?
      // Allow the user to specify this via something or make this hook pick the first only?
      return allowedOperations[0];
    }
  });


  return {
    dragHooks: allowsDrag ? dragHooks : undefined,
    dropHooks: allowsDrop ? dropHooks : undefined
  };
}
