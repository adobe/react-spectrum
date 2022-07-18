import {DraggableCollectionOptions, DraggableCollectionState, useDraggableCollectionState} from '@react-stately/dnd';
import {DraggableCollectionProps} from '@react-types/shared';
import {DraggableItemProps, DraggableItemResult, DragPreview, useDraggableItem} from '@react-aria/dnd';
import {useMemo} from 'react';

export interface DragHooks {
  useDraggableCollectionState(props: Omit<DraggableCollectionOptions, 'getItems'>): DraggableCollectionState,
  useDraggableItem(props: DraggableItemProps, state: DraggableCollectionState): DraggableItemResult,
  DragPreview: typeof DragPreview
}

export interface DragHookOptions extends Omit<DraggableCollectionProps, 'preview'> {}

export function useDragHooks(options: DragHookOptions): DragHooks {
  return useMemo(() => ({
    useDraggableCollectionState(props: DraggableCollectionOptions) {
      return useDraggableCollectionState({...props, ...options});
    },
    useDraggableItem,
    DragPreview
  }), [options]);
}
