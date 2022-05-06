import {DraggableCollectionOptions, DraggableCollectionState, useDraggableCollectionState} from '@react-stately/dnd';
import {DraggableItemProps, DraggableItemResult, DragPreview, useDraggableItem} from '@react-aria/dnd';
import {useMemo} from 'react';

export interface DragHooks {
  useDraggableCollectionState(props: Omit<DraggableCollectionOptions, 'getItems'>): DraggableCollectionState,
  useDraggableItem(props: DraggableItemProps, state: DraggableCollectionState): DraggableItemResult,
  DragPreview: typeof DragPreview
}

export type DragHookOptions = Omit<DraggableCollectionOptions, 'collection' | 'selectionManager' | 'isDragging' | 'getKeysForDrag'>

export function useDragHooks(options: DragHookOptions): DragHooks {
  return useMemo(() => ({
    useDraggableCollectionState(props: DraggableCollectionOptions) {
      let {
        collection,
        selectionManager,
        allowsDraggingItem,
        getItems,
        preview
      } = props;

      return useDraggableCollectionState({
        collection,
        selectionManager,
        allowsDraggingItem,
        getItems,
        preview,
        ...options
      });
    },
    useDraggableItem,
    DragPreview
  }), [options]);
}
