import {DraggableCollectionOptions, DraggableCollectionState, useDraggableCollectionState} from '@react-stately/dnd';
import {DraggableCollectionProps} from '@react-types/shared';
import {DraggableItemProps, DraggableItemResult, DragPreview, useDraggableItem} from '@react-aria/dnd';
import {useMemo} from 'react';

export interface DragHooks {
  useDraggableCollectionState(props: Omit<DraggableCollectionOptions, 'getItems'>): DraggableCollectionState,
  useDraggableItem(props: DraggableItemProps, state: DraggableCollectionState): DraggableItemResult,
  DragPreview: typeof DragPreview
}

// TODO: the below changes are if we want to make the api simplification at the useDragHooks level rather than making
// a utility hook like useDraggable
export interface DragHookOptions extends Omit<DraggableCollectionProps, 'preview'> {
  // The below two props honestly feel unecessary tbh since getItems doesn't feel that complex
  // and this approach might be more confusing
  // TODO: Tentative, if provided and getItems isn't provided, then we create a default getItems
  // Will be dependent on the user providing both of the below
  getDragType?: (key) => string,
  // TODO: returns the data associated with a drag key for use in getItems
  getItemData?: (key) => object
}

export function useDragHooks(options: DragHookOptions): DragHooks {
  let {
    getDragType,
    getItemData,
    getItems
  } = options;

  // TODO: if we think this is a worthy change, will need to add a error throw if getItems is undef
  // and getDragType and getItemData is missing.
  // Also will need to useCallback getItems and add it to the useMemo deps
  if (!getItems && getDragType && getItemData) {
    getItems = (keys) => [...keys].map(key => {
      let item = getItemData(key);
      // TODO: add the below to all the docs examples since it feels like a case that may happen to users
      // Add the key to the item's data in case it doesn't exist (e.g. useListData with getKey to generate the item's keys)
      item = {key, ...item};
      let dragType = getDragType(key);
      return {
        [`${dragType}`]: JSON.stringify(item)
      };
    });
  }

  return useMemo(() => ({
    useDraggableCollectionState(props: DraggableCollectionOptions) {
      // TODO: add getItems to the args passed to useDraggableCollectionState if we wanna go ahead with thi
      return useDraggableCollectionState({...props, ...options});
    },
    useDraggableItem,
    DragPreview
  }), [options]);
}
