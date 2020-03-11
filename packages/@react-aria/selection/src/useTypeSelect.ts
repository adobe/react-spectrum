import {HTMLAttributes, KeyboardEvent, useRef} from 'react';
import {KeyboardDelegate} from '@react-types/shared';
import {MultipleSelectionManager} from '@react-stately/selection';

interface TypeSelectOptions {
  keyboardDelegate: KeyboardDelegate,
  selectionManager: MultipleSelectionManager
}

interface TypeSelectAria {
  typeSelectProps: HTMLAttributes<HTMLElement>
}

export function useTypeSelect(options: TypeSelectOptions): TypeSelectAria {
  let {keyboardDelegate, selectionManager} = options;
  let state = useRef({
    search: '',
    timeout: null
  }).current;

  let onKeyPress = (e: KeyboardEvent) => {
    let character = String.fromCharCode(e.charCode);
    state.search += character;

    // Use the delegate to find a key to focus.
    // Prioritize items after the currently focused item, falling back to searching the whole list.
    let key = keyboardDelegate.getKeyForSearch(state.search, selectionManager.focusedKey);
    if (!key) {
      key = keyboardDelegate.getKeyForSearch(state.search);
    }

    if (key) {
      selectionManager.setFocusedKey(key);
    }

    clearTimeout(state.timeout);
    state.timeout = setTimeout(() => {
      state.search = '';
    }, 500);
  };

  return {
    typeSelectProps: {
      onKeyPress: keyboardDelegate.getKeyForSearch ? onKeyPress : null
    }
  };
}
