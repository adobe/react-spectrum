import {DraggableCollectionOptions, DraggableCollectionState, useDraggableCollectionState} from '@react-stately/dnd';
import {useDraggableItem} from '@react-aria/dnd';
import {useMemo} from 'react';

export interface DragHooks {
    useDraggableCollectionState(props: DraggableCollectionOptions): DraggableCollectionState
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
        renderPreview
      } = props;
      
      return useDraggableCollectionState({
        collection,
        selectionManager,
        allowsDraggingItem,
        getItems,
        renderPreview,
        ...options
      });
    },
    useDraggableItem
  }), [options]);
}
