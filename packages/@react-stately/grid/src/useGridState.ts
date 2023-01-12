import {GridCollection, GridNode} from '@react-types/grid';
import {Key, useEffect, useMemo, useRef} from 'react';
import {MultipleSelectionStateProps, SelectionManager, useMultipleSelectionState} from '@react-stately/selection';

export interface GridState<T, C extends GridCollection<T>> {
  collection: C,
  /** A set of keys for rows that are disabled. */
  disabledKeys: Set<Key>,
  /** A selection manager to read and update row selection state. */
  selectionManager: SelectionManager,
  /** Whether keyboard navigation is disabled, such as when the arrow keys should be handled by a component within a cell. */
  isKeyboardNavigationDisabled: boolean
}

export interface GridStateOptions<T, C extends GridCollection<T>> extends MultipleSelectionStateProps {
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
  selectionState.setFocusedKey = (key, child) => {
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

    setFocusedKey(key, child);
  };

  let selectionManager = useMemo(() =>
    new SelectionManager(collection, selectionState)
    , [collection, selectionState]
  );

  // Reset focused key if that item is deleted from the collection.
  const cachedCollection = useRef(null);
  useEffect(() => {
    if (selectionState.focusedKey != null && !collection.getItem(selectionState.focusedKey)) {
      const node = cachedCollection.current.getItem(selectionState.focusedKey);
      const parentNode =
        node.parentKey != null && (node.type === 'cell' || node.type === 'rowheader' || node.type === 'column') ?
        cachedCollection.current.getItem(node.parentKey) :
        node;
      const rows = collection.rows;
      let index = parentNode.index;
      let newRow:GridNode<T>;
      if (index < rows.length) {
        while (index >= 0) {
          if (!selectionManager.isDisabled(rows[index].key)) {
            newRow = rows[index];
            break;
          }
          index--;
        }
      } else {
        index = rows.length - 1;
        while (index >= 0) {
          if (!selectionManager.isDisabled(rows[index].key)) {
            newRow = rows[index];
            break;
          }
          index--;
        }
      }
      if (newRow) {
        const keyToFocus =
          newRow.hasChildNodes && parentNode !== node ?
          [...newRow.childNodes][node.index].key :
          newRow.key;
        selectionState.setFocusedKey(keyToFocus);
      } else {
        selectionState.setFocusedKey(null);
      }
    }
    cachedCollection.current = collection;
  }, [collection, selectionManager, selectionState, selectionState.focusedKey]);

  return {
    collection,
    disabledKeys,
    isKeyboardNavigationDisabled: false,
    selectionManager
  };
}
