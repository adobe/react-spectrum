import {DraggableCollectionOptions, DraggableCollectionState, useDraggableCollectionState} from '@react-stately/dnd';
import {DraggableCollectionProps} from '@react-types/shared';
import {DraggableItemProps, DraggableItemResult, useDraggableItem} from '@react-aria/dnd';
import {useMemo} from 'react';

export interface DragHooks {
    useDraggableCollectionState(props: Omit<DraggableCollectionOptions, 'getItems'>): DraggableCollectionState,
    useDraggableItem(props: DraggableItemProps, state: DraggableCollectionState): DraggableItemResult
}

export function useDragHooks(options: DraggableCollectionProps): DragHooks {
  return useMemo(() => ({
    useDraggableCollectionState(props: DraggableCollectionOptions) {
      return useDraggableCollectionState({...props, ...options});
    },
    useDraggableItem
  }), [options]);
}
