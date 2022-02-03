import {DraggableCollectionOptions, DraggableCollectionState, useDraggableCollectionState} from '@react-stately/dnd';
import {useMemo} from 'react';

export interface DragHooks {
    useDraggableCollectionState(props: DraggableCollectionOptions): DraggableCollectionState
}

export type DragHookOptions = Omit<DraggableCollectionOptions, 'collection' | 'selectionManager' | 'isDragging' | 'getKeysForDrag'>

export function useDragHooks(options: DragHookOptions): DragHooks {
  return useMemo(() => ({
    useDraggableCollectionState(props: DraggableCollectionOptions) {
      return useDraggableCollectionState({
        collection: props.collection,
        selectionManager: props.selectionManager,
        itemAllowsDragging: props.itemAllowsDragging,
        getItems: props.getItems,
        renderPreview: props.renderPreview,
        ...options
      });
    }
  }), [options]);
}
