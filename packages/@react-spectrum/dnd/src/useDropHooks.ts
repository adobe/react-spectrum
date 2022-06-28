import {
  DropIndicatorAria,
  DropIndicatorProps,
  DroppableCollectionOptions,
  DroppableCollectionResult,
  DroppableItemOptions,
  DroppableItemResult,
  useDropIndicator,
  useDroppableCollection,
  useDroppableItem
} from '@react-aria/dnd';
import {DroppableCollectionProps, DropPosition} from '@react-types/shared';
import {DroppableCollectionState, DroppableCollectionStateOptions, useDroppableCollectionState} from '@react-stately/dnd';
import {Key, RefObject, useMemo} from 'react';

export interface DropHooks {
  useDroppableCollectionState(props: DroppableCollectionStateOptions): DroppableCollectionState,
  useDroppableCollection(props: DroppableCollectionOptions, state: DroppableCollectionState, ref: RefObject<HTMLElement>): DroppableCollectionResult,
  useDroppableItem(options: DroppableItemOptions, state: DroppableCollectionState, ref: RefObject<HTMLElement>): DroppableItemResult,
  useDropIndicator(props: DropIndicatorProps, state: DroppableCollectionState, ref: RefObject<HTMLElement>): DropIndicatorAria
}

export interface DropHookOptions extends DroppableCollectionProps {
  onInsert?: (items: Array<string>, insertionKey: Key, dropPosition: DropPosition) => void,
  onRootDrop?: (items: Array<string>) => void,
  onItemDrop?: (items: Array<string>, insertionKey: Key) => void,
  acceptedDragTypes?: 'all' | Array<string>
}

/*
FEEDBACK FROM MEETING
- consider adding onInsert, onRoot, onItemDrop options to useDropHooks. If user passes these, we can construct getDropOpeeration for them based on what
 handlers they provide
- think about adding onReorder and how to track when a dnd operation is a reorder operation. May need one wrapper hook around useDragHook and useDropHook so we can track if the collection is in a dragged state (via onDrag)
and compare it to if the collection is being dropped via onDrop to figure out if it is a reorder operation. Perhaps DragManager can track this and have the dnd event handlers access the DragManager?
- maybe have a second level of hooks that returns drop/drag handlers/options that then get passed to useDropHooks/useDragHooks. That way we can compose multiple things together (reorderable + droppable from outside sources)
*/



// TODO: the below proposed changes are if we want to make the api simplification at the useDropHooks level rather than making
// a utility hook like useDroppable

// TODO: possible optimizations/simplifications:
// - A default getDropOperations. User could pass acceptedDragTypes (would be another new option, array of accepted types) and
// allowedDropOperations (new option, array of allowed drop positions) and we would use those to automatically determine if a drop operation
// should be canceled. Only do this if a getDropOperations isn't provided. Maybe also add a new option for getValidDropTargets which the user provides
// to return what items are valid drop "on" targets (e.g. if there are permissions involved which allows some folders to be edited )
// - a default onDrop. Maybe the user can pass in a handleDrop (new option that takes a list of data and the drop target and performs list updates accordingly)
// and we handle constucting the list of drag items by filtering based on acceptedDragTypes
export function useDropHooks(options: DropHookOptions): DropHooks {
  let {
    onInsert,
    onRootDrop,
    onItemDrop,
    acceptedDragTypes,
    getDropOperation,
    onDrop
  } = options;

  if (!onDrop) {
    onDrop = async (e) => {
      let dataList = [];
      let {
        target
      } = e;
      for (let item of e.items) {
        for (let acceptedType of acceptedDragTypes) {
          // TODO: this assumes the item's kind and just pushes the data as is to the dataList
          // Perhaps we can also add item.kind === 'file' and 'directory' checks and push the results of getFile/getText/getEntries into dataList?
          // Or maybe we can just push the item as is to the user defined handlers?
          if (item.kind === 'text' && item.types.has(acceptedType)) {
            let data = await item.getText(acceptedType);
            dataList.push(data);
          }
        }
      }

      if (target.type === 'root') {
        onRootDrop(dataList);
      } else if (target.dropPosition === 'on') {
        onItemDrop(dataList, target.key);
      } else {
        // if it isn't a root drop or a drop on an item, then it is either an insert or a reorder operation
        // TODO: figure out how to distinguish between insert and reorder
        onInsert(dataList, target.key, target.dropPosition);
      }
    };
  }

  if (!getDropOperation) {
    getDropOperation = (target, types, allowedOperations) => {
      let typesSet = types.types ? types.types : types;
      let draggedTypes = [...typesSet.values()];

      if (
        (acceptedDragTypes !== 'all' || !draggedTypes.every(type => acceptedDragTypes.includes(type))) &&
        (onInsert && target.type === 'item' && (target.dropPosition === 'before' || target.dropPosition === 'after') ||
        onRootDrop && target.type === 'root' ||
        // TODO: how to detect if it is a drop on a folder? Do we need a option call getItemType(key)?
        onItemDrop && target.type === 'item' && target.dropPosition === 'on')
      ) {
        // TODO: how to determine the correct allowed operation
        return allowedOperations[0];
      }

      return 'cancel';
    };
  }


  return useMemo(() => ({
    useDroppableCollectionState(props) {
      return useDroppableCollectionState({...props, ...options, getDropOperation});
    },
    useDroppableItem,
    useDroppableCollection(props, state, ref) {
      return useDroppableCollection({...props, ...options}, state, ref);
    },
    useDropIndicator
  }), [options]);
}
