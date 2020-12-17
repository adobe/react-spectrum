import {
  CollectionBase,
  MultipleSelection
} from '@react-types/shared';
import {GridCollection} from '@react-types/grid';
import {Key, useEffect, useMemo} from 'react';
import {SelectionManager, useMultipleSelectionState} from '@react-stately/selection';

export interface GridState<T> {
  collection: GridCollection<T>,
  disabledKeys: Set<Key>,
  selectionManager: SelectionManager
}

interface GridStateOptions<T> extends CollectionBase<T>, MultipleSelection {
  collection: GridCollection<T>
}

export function useGridState<T extends object>(props: GridStateOptions<T>): GridState<T> {
  let {collection} = props;
  let selectionState = useMultipleSelectionState(props);
  let disabledKeys = useMemo(() =>
      props.disabledKeys ? new Set(props.disabledKeys) : new Set<Key>()
    , [props.disabledKeys]);

  // Reset focused key if that item is deleted from the collection.
  useEffect(() => {
    if (selectionState.focusedKey != null && !collection.getItem(selectionState.focusedKey)) {
      selectionState.setFocusedKey(null);
    }
  }, [collection, selectionState.focusedKey]);

  return {
    collection,
    disabledKeys,
    selectionManager: new SelectionManager(collection, selectionState)
  };
}
