import {GridCollection} from '@react-types/grid';
import {Key, useEffect, useMemo} from 'react';
import {MultipleSelection} from '@react-types/shared';
import {SelectionManager, useMultipleSelectionState} from '@react-stately/selection';

export interface GridState<T, C extends GridCollection<T>> {
  collection: C,
  /** A set of keys for rows that are disabled. */
  disabledKeys: Set<Key>,
  /** A selection manager to read and update row selection state. */
  selectionManager: SelectionManager
}

interface GridStateOptions<T, C extends GridCollection<T>> extends MultipleSelection {
  collection: C,
  disabledKeys?: Iterable<Key>,
  focusMode?: 'row' | 'cell'
}

/**
 * Provides state management for a grid component. Handles row selection and focusing a grid cell's focusable child if applicable.
 */
export function useGridState<T extends object, C extends GridCollection<T>>(props: GridStateOptions<T, C>): GridState<T, C> {
  let {collection, focusMode} = props;
  let selectionState = useMultipleSelectionState(props);
  let disabledKeys = useMemo(() =>
      props.disabledKeys ? new Set(props.disabledKeys) : new Set<Key>()
    , [props.disabledKeys]);

  let setFocusedKey = selectionState.setFocusedKey;
  selectionState.setFocusedKey = (key, child, callbackSet) => {
    // If focusMode is cell and an item is focused, focus a child cell instead.
    if (focusMode === 'cell' && key != null) {
      let item = collection.getItem(key);
      if (item?.type === 'item') {
        let children = [...item.childNodes];
        if (child === 'last') {
          key = children[children.length - 1]?.key;
        } else {
          key = children[0]?.key;
        }
      }
    }
    setFocusedKey(key, child, callbackSet);
  };

  // Reset focused key if that item is deleted from the collection.
  // TODO: this seems like it will have problems with the whole callback set business
  useEffect(() => {
    if (selectionState.focusedKey != null && !collection.getItem(selectionState.focusedKey)) {
      // TODO perhaps needs the callback set to be passed, but how do we get it?
      // Move the initialzation of selection manager up?
      selectionState.setFocusedKey(null);
    }
  }, [collection, selectionState.focusedKey]);

  let selectionManager = useMemo(() => {
    console.log('new selectionManager')
    return new SelectionManager(collection, selectionState)
  }, [collection, selectionState])

  return {
    collection,
    disabledKeys,
    selectionManager
  };
}
