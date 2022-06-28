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

import {useDragHooks} from './useDragHooks';
import {useDropHooks} from './useDropHooks';

export interface ReorderableOptions {
  // TODO: a getter that returns the drag type for a given key in the list
  // Limitations: returns a single type, don't think we should support multiple types per item in this utility
  // Maybe don't even need this, maybe just accept a "dragType" from user or make it a requirement that the "list"
  // contains the drag type information
  getDragType: (key) => string,
  // Array of accepted DragTypes, mainly here to only allow reordering and reject drop operations from other sources
  // Defaults to all to allow all drag types, aka allowing drops from all sources, not just the reorderable list (kinda weird? this means we'll need to handle)?
  // IMO we shouldn't allow drops from outside sources with this hook, perhaps that is something the user should handle since it is a more complex case? It could work
  // if we force the user to provide a onMove in this case but it does increase the complexity
  acceptedDragTypes?: 'all' | Array<string>,
  // takes a list from useListData or useAsyncList, but should support an arbitrary list state tracker. That tracker will need the
  // same ".update", ".remove", "moveBefore", etc help methods. Perhaps do away with this and rely on the user to provide a
  // onMove or some kind of function that actually performs the list updates based on the dropped keys and the target.dropPosition?
  list: any
}

/*
FEEDBACK FROM MEETING
- it would be good to figure out how to make reorderable work with other hooks so we aren't just limited to the one (aka can do reorderable hook + droppable)
*/


/*
 Assumptions made:
- user is using useListData, useAsyncList, or some kind of list state tracker with similar list manipulation utilities
- user is only interested in returning one drag type per item
- user is only interested in making the list reorderable. This means dragging items out of the list to another collection and dropping items
  from a different collection aren't stictly supported at the moment. Up for debate on whether or not to allow this or not, IMO it feels like it complicates it more but I've added acceptedDragTypes for now
  If we want to restrict it so the list only accepts items from within this list, we can remove acceptedDragTypes entirely, and have getDropOperation check that the types are one of getDragType or just
  remove getDragType and acceptedDragTypes entirely (aka all items are reorderable)
- user allows moving items from the list into a folder within the list. "on" drops are limited strictly to folders aka items w/ childNodes
*/

// TODO: add return types aka the drag and drop hooks
export function useReorderable(options: ReorderableOptions) {
  let {
    getDragType,
    acceptedDragTypes = 'all',
    list
  } = options;

  // Update the list order based on the position of the drop and the set of rows that were dropped
  // TODO: perhaps have the user provide this function? But that would kinda defeat the purpose of this hook i.e. to reduce burden on
  // end user when enabling dnd
  let onMove = (keys, target) => {
    switch (target.dropPosition) {
      case 'before':
        // TODO: depending on whether or not we'll allow drops from any source aka not just the reorderable list,
        // we'll have to update the logic below to check if the keys exist within the reorderable list and perform a moveBefore or an append appropriately
        list.moveBefore(target.key, keys);
        break;
      case 'after':
        list.moveAfter(target.key, keys);
        break;
      // TODO: should dropping into a folder be a part of the standard reorderable case or should we only support reordering?
      // TODO: fix the case where the user can drag a folder into itself (drag a folder, move off the list, move back onto the folder and drop)
      case 'on': {
        let targetFolder = list.getItem(target.key);
        let draggedItems = keys.map((key) => list.getItem(key));
        list.update(target.key, {...targetFolder, childNodes: [...targetFolder.childNodes, ...draggedItems]});
        list.remove(...keys);
        break;
      }
    }
  };

  let dragHooks = useDragHooks({
    getItems(keys) {
      return [...keys].map(key => {
        let item = list.getItem(key);
        // Add the key to the item's data in case it doesn't exist (e.g. useListData with getKey to generate the item's keys)
        item = {key, ...item};
        let dragType = getDragType(key);
        return {
          [`${dragType}`]: JSON.stringify(item)
        };
      });
    }
  });

  let dropHooks = useDropHooks({
    async onDrop(e) {
      let keysToMove = [];
      // Only add the dropped item to the list of keys to move
      // if the dropped item has the expected types
      // TODO: refactor to make simpler like in dnd.mdx?
      for (let item of e.items) {
        for (let acceptedType of acceptedDragTypes) {
          if (item.kind === 'text' && item.types.has(acceptedType)) {
            let {key} = JSON.parse(await item.getText(acceptedType));
            keysToMove.push(key);
          }
        }
      }
      onMove(keysToMove, e.target);
    },
    getDropOperation(target, types) {
      let typesSet = types.types ? types.types : types;
      let draggedTypes = [...typesSet.values()];
      // Cancel the drop operations if any of drag items aren't of the acceptedTypes, if the drop target is root,
      // or if attempting to drop on a non-folder item
      // TODO: if acceptedDragType is "all", do a blanket accept for this first conditional?
      if (
        !draggedTypes.every(type => acceptedDragTypes.includes(type)) ||
        target.type === 'root' ||
        (target.type === 'item' && target.dropPosition === 'on' && !list.getItem(target.key).childNodes)
      ) {
        return 'cancel';
      }

      return 'move';
    }
  });

  return {
    dragHooks,
    dropHooks
  };
}
