import {HTMLAttributes, Key, KeyboardEvent, useRef} from 'react';
import {KeyboardDelegate} from '@react-types/shared';
import {MultipleSelectionManager} from '@react-stately/selection';

interface TypeSelectOptions {
  keyboardDelegate: KeyboardDelegate,
  selectionManager: MultipleSelectionManager,
  onTypeSelect?: (key: Key) => void
}

interface TypeSelectAria {
  typeSelectProps: HTMLAttributes<HTMLElement>
}

export function useTypeSelect(options: TypeSelectOptions): TypeSelectAria {
  let {keyboardDelegate, selectionManager, onTypeSelect} = options;
  let state = useRef({
    search: '',
    timeout: null
  }).current;

  let onKeyDown = (e: KeyboardEvent) => {
    let character = getStringForKey(e.key);
    if (!character) {
      return;
    }

    state.search += character;

    // Use the delegate to find a key to focus.
    // Prioritize items after the currently focused item, falling back to searching the whole list.
    let key = keyboardDelegate.getKeyForSearch(state.search, selectionManager.focusedKey);
    if (!key) {
      key = keyboardDelegate.getKeyForSearch(state.search);
    }

    if (key) {
      selectionManager.setFocusedKey(key);
      if (onTypeSelect) {
        onTypeSelect(key);
      }
    }

    clearTimeout(state.timeout);
    state.timeout = setTimeout(() => {
      state.search = '';
    }, 500);
  };

  return {
    typeSelectProps: {
      onKeyDown: keyboardDelegate.getKeyForSearch ? onKeyDown : null
    }
  };
}

function getStringForKey(key: string) {
  // If the key is of length 1, it is an ASCII value.
  // Otherwise, if there are no ASCII characters in the key name,
  // it is a Unicode character.
  // See https://www.w3.org/TR/uievents-key/
  if (key.length === 1 || !/^[A-Z]/i.test(key)) {
    return key;
  }

  return '';
}
