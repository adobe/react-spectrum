import {Key} from '@react-types/shared';
import {useControlledState} from '@react-stately/utils';
import {useState} from 'react';

export interface GridEditState {
  
  /** The key of the cell that is being edited. */
  editKey: Key | null,
  /** Set the key of the cell that is being edited. */
  setEditKey: (key: Key | null) => void,
  /** Whether keyboard navigation is disabled, such as when the arrow keys should be handled by a component within a cell. */
  isKeyboardNavigationDisabled: boolean,
  /** Set whether keyboard navigation is disabled, such as when the arrow keys should be handled by a component within a cell. */
  setKeyboardNavigationDisabled: (val: boolean) => void
}
  
export interface GridEditStateOptions {
  /** Handler that is called when the editing key changes. */
  onEditChange?: (key: Key | null) => void,
  /** Whether onEditChange should fire even if the new editing key is the same as the last. */
  allowDuplicateEditEvents?: boolean
}

/**
 * Manages state for cell editing in a grid.
 */
export function useGridEditState(props: GridEditStateOptions): GridEditState {
  let {allowDuplicateEditEvents} = props;

  let [isKeyboardNavigationDisabled, setKeyboardNavigationDisabled] = useState(false);
  let [editKey, setEditKey] = useControlledState(undefined, null, props.onEditChange);

  return {
    editKey,
    isKeyboardNavigationDisabled, 
    setKeyboardNavigationDisabled,
    setEditKey(key) {
      if (allowDuplicateEditEvents || editKey !== key) {
        setEditKey(key);
      }
    }
  };
}
