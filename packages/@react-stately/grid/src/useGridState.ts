import {
  CollectionBase,
  MultipleSelection
} from '@react-types/shared';
import {GridCollection} from '@react-types/grid';
import {Key, useEffect, useMemo} from 'react';
import {SelectionManager, useMultipleSelectionState} from '@react-stately/selection';

export interface GridState<T, C extends GridCollection<T>> {
  collection: C,
  disabledKeys: Set<Key>,
  selectionManager: SelectionManager
}

interface GridStateOptions<T, C extends GridCollection<T>> extends CollectionBase<T>, MultipleSelection {
  collection: C
}

export function useGridState<T extends object, C extends GridCollection<T>>(props: GridStateOptions<T, C>): GridState<T, C> {
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
