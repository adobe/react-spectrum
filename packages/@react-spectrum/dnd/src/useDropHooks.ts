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

// TODO: remove this hook if we decide to go with useDnDHooks instead
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
