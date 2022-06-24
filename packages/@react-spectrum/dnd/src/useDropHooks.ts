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
import {DroppableCollectionProps} from '@react-types/shared';
import {DroppableCollectionState, DroppableCollectionStateOptions, useDroppableCollectionState} from '@react-stately/dnd';
import {RefObject, useMemo} from 'react';

export interface DropHooks {
  useDroppableCollectionState(props: DroppableCollectionStateOptions): DroppableCollectionState,
  useDroppableCollection(props: DroppableCollectionOptions, state: DroppableCollectionState, ref: RefObject<HTMLElement>): DroppableCollectionResult,
  useDroppableItem(options: DroppableItemOptions, state: DroppableCollectionState, ref: RefObject<HTMLElement>): DroppableItemResult,
  useDropIndicator(props: DropIndicatorProps, state: DroppableCollectionState, ref: RefObject<HTMLElement>): DropIndicatorAria
}

// TODO: the below proposed changes are if we want to make the api simplification at the useDropHooks level rather than making
// a utility hook like useDroppable

// TODO: possible optimizations/simplifications:
// - A default getDropOperations. User could pass acceptedDragTypes (would be another new option, array of accepted types) and
// allowedDropOperations (new option, array of allowed drop positions) and we would use those to automatically determine if a drop operation
// should be canceled. Only do this if a getDropOperations isn't provided. Maybe also add a new option for getValidDropTargets which the user provides
// to return what items are valid drop "on" targets (e.g. if there are permissions involved which allows some folders to be edited )
// - a default onDrop. Maybe the user can pass in a handleDrop (new option that takes a list of data and the drop target and performs list updates accordingly)
// and we handle constucting the list of drag items by filtering based on acceptedDragTypes
export function useDropHooks(options: DroppableCollectionProps): DropHooks {
  return useMemo(() => ({
    useDroppableCollectionState(props) {
      return useDroppableCollectionState({...props, ...options});
    },
    useDroppableItem,
    useDroppableCollection(props, state, ref) {
      return useDroppableCollection({...props, ...options}, state, ref);
    },
    useDropIndicator
  }), [options]);
}
