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
import {useDragHooks} from './useDragHooks';

export interface DraggableOptions {
  // TODO: a getter that returns the drag type for a given key in the list
  // Limitations: returns a single type, don't think we should support multiple types per item in this utility
  // Maybe don't even need this, maybe just accept a "dragType" from user or make it a requirement that the "list"
  // contains the drag type information for each item
  getDragType?: (key) => string,
  // takes a list from useListData or useAsyncList, but should support an arbitrary list state tracker. That tracker will need the
  // same ".update", ".remove", "moveBefore", etc help methods which maybe a tall order. Perhaps do away with this and rely on the user to provide a
  // onDrop/handleDrop/handler that handles updating the collection when a drop happens?
  list: any,
  // TODO Same prop as in useDragHooks, preferably doesn't allow "link" cuz we don't provide onDragEnd?
  // Probably should always allow "cancel". This is specifically for dragging FROM the collection
  // Maybe this can just be an array instead of a function?
  getAllowedDropOperations?: () => DropOperation[]
  // TODO: add onDragStart/onDragEnd?
}

/*
FEEDBACK FROM MEETING
- using `list` with the assumption that it comes from useListData or useAsyncList is possibly too restrictive (people will be using other ways to track their collection). Additionally, performing the list updates
doesn't actually update the information on the server so handleDrop doesn't do enough
- users will probably have multiple drag types (at least plain/text) so we don't wanna only go with one
*/

/*
 Assumptions made:
- user is using useListData, useAsyncList, or some kind of list state tracker with similar list manipulation utilities methods
- user is only interested in returning one drag type per item
- the keys of the collection are unique throughout the entire app (need this to check if a dropped item is a result of reordering or from a external source)
*/

// TBH, useDraggable may not be super useful cuz the logic for a basic drag case is pretty simple and more complex cases
// would require the user to provide their own handlers anyways.
export function useDraggable(options: DraggableOptions) {
  let {
    getDragType,
    list,
    getAllowedDropOperations
  } = options;

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
      // Note that this will remove the item from the source list before the onDrop happens for a reorder case since onDragEnd happens before onDrop
      if (e.dropOperation === 'move') {
        list.remove(...e.keys);
      }

      // The below was an attempt to detect if a DnD event was a same list reordering event but it doesn't quite work
      // because it then doesn't remove the item from the list if it is dropped into a different list (no way to distinguish the two events).
      // The behavior seems to be different between mouse drag and keyboard drag too
      // It maybe a good idea to have drag events show what the source collection and target collection are

      // if (e.dropOperation === 'move') {
      //   let firstDraggedKey = e.keys.values().next().value;
      //   if (!list.getItem(firstDraggedKey)) {
      //     list.remove(...e.keys);
      //   }
      // }
    },
    getAllowedDropOperations
  });

  return {dragHooks};
}
