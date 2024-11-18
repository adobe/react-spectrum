import {Key} from '@react-types/shared';
import {useControlledState} from '@react-stately/utils';
import {useState} from 'react';

export interface GridEditState {
  /** The key of the cell that is being edited. */
  editKey: Key | null,
  /** Set the key of the cell that is being edited. */
  setEditKey: (key: Key | null) => void,
  /** The current keyboard navigation behavior. */
  keyboardNavigationBehavior: 'tab' | 'arrow',
  /** Set the keyboard navigation behavior. */
  setKeyboardNavigationBehavior: (navigationBehavior: 'tab' | 'arrow') => void
}
  
export interface GridEditStateOptions {
  /** Handler that is called when the editing key changes. */
  onEditChange?: (key: Key | null) => void,
  /** Whether onEditChange should fire even if the new editing key is the same as the last. */
  allowDuplicateEditEvents?: boolean,
  /**
   * Whether keyboard navigation to focusable elements within the grid is
   * via the left/right arrow keys or the tab key.
   * @default 'arrow'
   */
  keyboardNavigationBehavior?: 'arrow' | 'tab'
}

/**
 * Manages state for cell editing in a grid.
 */
export function useGridEditState(props: GridEditStateOptions): GridEditState {
  let {allowDuplicateEditEvents, keyboardNavigationBehavior: defaultKeyboardNavigationBehavior = 'arrow'} = props;

  let [keyboardNavigationBehavior, setKeyboardNavigationBehavior] = useState(defaultKeyboardNavigationBehavior);
  let [editKey, setEditKey] = useControlledState(undefined, null, props.onEditChange);

  return {
    editKey,
    keyboardNavigationBehavior, 
    setKeyboardNavigationBehavior,
    setEditKey(key) {
      if (allowDuplicateEditEvents || editKey !== key) {
        setEditKey(key);
      }
    }
  };
}
