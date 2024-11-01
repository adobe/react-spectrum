import {getChildNodes, getFirstItem, getLastItem} from '@react-stately/collections';
import {GridCollection, GridNode} from '@react-types/grid';
import {Key} from '@react-types/shared';
import {MultipleSelectionState, MultipleSelectionStateProps, SelectionManager, useMultipleSelectionState} from '@react-stately/selection';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

export interface GridState<T, C extends GridCollection<T>> {
  collection: C,
  /** The key of the cell that is currently being edited. */
  editingKey: Key | null,
  /** Set the key of the cell that is currently being edited. */
  setEditingKey: (key: Key | null) => void,
  /** Whether the grid is read only. */
  isReadOnly: boolean,
  /** A set of keys for rows that are disabled. */
  disabledKeys: Set<Key>,
  /** A selection manager to read and update row selection state. */
  selectionManager: SelectionManager,
  /** Whether keyboard navigation is disabled, such as when the arrow keys should be handled by a component within a cell. */
  isKeyboardNavigationDisabled: boolean,
  /** Set whether keyboard navigation is disabled, such as when the arrow keys should be handled by a component within a cell. */
  setKeyboardNavigationDisabled: (val: boolean) => void
}

export interface GridStateOptions<T, C extends GridCollection<T>> extends MultipleSelectionStateProps {
  collection: C,
  isReadOnly?: boolean,
  disabledKeys?: Iterable<Key>,
  focusMode?: 'row' | 'cell',
  /** @private - do not use unless you know what you're doing. */
  UNSAFE_selectionState?: MultipleSelectionState
}

/**
 * Provides state management for a grid component. Handles row selection and focusing a grid cell's focusable child if applicable.
 */
export function useGridState<T extends object, C extends GridCollection<T>>(props: GridStateOptions<T, C>): GridState<T, C> {
  let {collection, focusMode, isReadOnly = false} = props;
  let [editingKey, setEditingKey] = useState<Key | null>(null);
  let [isKeyboardNavigationDisabled, setKeyboardNavigationDisabled] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  let selectionState = props.UNSAFE_selectionState || useMultipleSelectionState(props);
  let disabledKeys = useMemo(() =>
      props.disabledKeys ? new Set(props.disabledKeys) : new Set<Key>()
    , [props.disabledKeys]);

  let setFocusedKey = selectionState.setFocusedKey;
  selectionState.setFocusedKey = (key, child) => {
    // If focusMode is cell and an item is focused, focus a child cell instead.
    if (focusMode === 'cell' && key != null) {
      let item = collection.getItem(key);
      if (item?.type === 'item') {
        let children = getChildNodes(item, collection);
        if (child === 'last') {
          key = getLastItem(children)?.key;
        } else {
          key = getFirstItem(children)?.key;
        }
      }
    }

    setFocusedKey(key, child);
  };

  let selectionManager = useMemo(() =>
    new SelectionManager(collection, selectionState)
    , [collection, selectionState]
  );

  let setEditMode = useCallback((key: Key | null) => {
    setEditingKey(key);
    setKeyboardNavigationDisabled(!!key);
  }, []);

  // Reset focused key if that item is deleted from the collection.
  const cachedCollection = useRef(null);
  useEffect(() => {
    if (selectionState.focusedKey != null && !collection.getItem(selectionState.focusedKey)) {
      const node = cachedCollection.current.getItem(selectionState.focusedKey);
      const parentNode =
        node.parentKey != null && (node.type === 'cell' || node.type === 'rowheader' || node.type === 'column') ?
        cachedCollection.current.getItem(node.parentKey) :
        node;
      const cachedRows = cachedCollection.current.rows;
      const rows = collection.rows;
      const diff = cachedRows.length - rows.length;
      let index = Math.min(
        (
          diff > 1 ?
          Math.max(parentNode.index - diff + 1, 0) :
          parentNode.index
        ),
        rows.length - 1);
      let newRow:GridNode<T>;
      while (index >= 0) {
        if (!selectionManager.isDisabled(rows[index].key) && rows[index].type !== 'headerrow') {
          newRow = rows[index];
          break;
        }
        // Find next, not disabled row.
        if (index < rows.length - 1) {
          index++;
        // Otherwise, find previous, not disabled row.
        } else {
          if (index > parentNode.index) {
            index = parentNode.index;
          }
          index--;
        }
      }
      if (newRow) {
        const childNodes = newRow.hasChildNodes ? [...getChildNodes(newRow, collection)] : [];
        const keyToFocus =
          newRow.hasChildNodes &&
          parentNode !== node &&
          node.index < childNodes.length ?
          childNodes[node.index].key :
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
    editingKey,
    isReadOnly,
    selectionManager,
    setEditingKey: setEditMode,
    isKeyboardNavigationDisabled,
    setKeyboardNavigationDisabled
  };
}
