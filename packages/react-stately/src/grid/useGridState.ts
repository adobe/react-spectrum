import {getChildNodes, getFirstItem, getLastItem} from '../collections/getChildNodes';
import {GridNode, IGridCollection} from './GridCollection';
import {Key} from '@react-types/shared';
import {MultipleSelectionState} from '../selection/types';
import {
  MultipleSelectionStateProps,
  useMultipleSelectionState
} from '../selection/useMultipleSelectionState';
import {SelectionManager} from '../selection/SelectionManager';
import {useEffect, useMemo, useRef} from 'react';

export interface GridState<T, C extends IGridCollection<T>> {
  collection: C;
  /** A set of keys for rows that are disabled. */
  disabledKeys: Set<Key>;
  /** A selection manager to read and update row selection state. */
  selectionManager: SelectionManager;
  /**
   * Whether keyboard navigation is disabled, such as when the arrow keys should be handled by a
   * component within a cell.
   */
  isKeyboardNavigationDisabled: boolean;
}

export interface GridStateOptions<
  T,
  C extends IGridCollection<T>
> extends MultipleSelectionStateProps {
  collection: C;
  disabledKeys?: Iterable<Key>;
  focusMode?: 'row' | 'cell';
  /** @private - Do not use unless you know what you're doing. */
  UNSAFE_selectionState?: MultipleSelectionState;
}

/**
 * Provides state management for a grid component. Handles row selection and focusing a grid cell's
 * focusable child if applicable.
 */
export function useGridState<T extends object, C extends IGridCollection<T>>(
  props: GridStateOptions<T, C>
): GridState<T, C> {
  let {collection, focusMode} = props;
  let defaultSelectionState = useMultipleSelectionState(props);
  let selectionState = props.UNSAFE_selectionState ?? defaultSelectionState;
  let disabledKeys = useMemo(
    () => (props.disabledKeys ? new Set(props.disabledKeys) : new Set<Key>()),
    [props.disabledKeys]
  );

  let selectionStateWithFocus = useMemo(() => {
    let setFocusedKey = selectionState.setFocusedKey;
    return {
      ...selectionState,
      setFocusedKey(key: Key | null, child?: 'first' | 'last') {
        // If focusMode is cell and an item is focused, focus a child cell instead.
        if (focusMode === 'cell' && key != null) {
          let item = collection.getItem(key);
          if (item?.type === 'item') {
            let children = getChildNodes(item, collection);
            if (child === 'last') {
              key = getLastItem(children)?.key ?? null;
            } else {
              key = getFirstItem(children)?.key ?? null;
            }
          }
        }

        setFocusedKey(key, child);
      }
    };
  }, [collection, focusMode, selectionState]);

  let selectionManager = useMemo(
    () => new SelectionManager(collection, selectionStateWithFocus),
    [collection, selectionStateWithFocus]
  );

  // Reset focused key if that item is deleted from the collection.
  const cachedCollection = useRef<C | null>(null);
  useEffect(() => {
    if (
      selectionStateWithFocus.focusedKey != null &&
      cachedCollection.current &&
      !collection.getItem(selectionStateWithFocus.focusedKey)
    ) {
      const node = cachedCollection.current.getItem(selectionStateWithFocus.focusedKey);
      const parentNode =
        node?.parentKey != null &&
        (node.type === 'cell' || node.type === 'rowheader' || node.type === 'column')
          ? cachedCollection.current.getItem(node.parentKey)
          : node;
      if (!parentNode) {
        selectionStateWithFocus.setFocusedKey(null);
        return;
      }
      const cachedRows = cachedCollection.current.rows;
      const rows = collection.rows;
      const diff = cachedRows.length - rows.length;
      let index = Math.min(
        diff > 1 ? Math.max(parentNode.index - diff + 1, 0) : parentNode.index,
        rows.length - 1
      );
      let newRow: GridNode<T> | null = null;
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
          newRow.hasChildNodes && parentNode !== node && node && node.index < childNodes.length
            ? childNodes[node.index].key
            : newRow.key;
        selectionStateWithFocus.setFocusedKey(keyToFocus);
      } else {
        selectionStateWithFocus.setFocusedKey(null);
      }
    }
    cachedCollection.current = collection;
  }, [collection, selectionManager, selectionStateWithFocus, selectionStateWithFocus.focusedKey]);

  return {
    collection,
    disabledKeys,
    isKeyboardNavigationDisabled: false,
    selectionManager
  };
}
