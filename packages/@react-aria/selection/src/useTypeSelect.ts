/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {DOMAttributes, Key, KeyboardDelegate} from '@react-types/shared';
import {KeyboardEvent, useRef} from 'react';
import {MultipleSelectionManager} from '@react-stately/selection';

/**
 * Controls how long to wait before clearing the typeahead buffer.
 */
const TYPEAHEAD_DEBOUNCE_WAIT_MS = 1000; // 1 second

export interface AriaTypeSelectOptions {
  /**
   * A delegate that returns collection item keys with respect to visual layout.
   */
  keyboardDelegate: KeyboardDelegate,
  /**
   * An interface for reading and updating multiple selection state.
   */
  selectionManager: MultipleSelectionManager,
  /**
   * Called when an item is focused by typing.
   */
  onTypeSelect?: (key: Key) => void
}

export interface TypeSelectAria {
  /**
   * Props to be spread on the owner of the options.
   */
  typeSelectProps: DOMAttributes
}

/**
 * Handles typeahead interactions with collections.
 */
export function useTypeSelect(options: AriaTypeSelectOptions): TypeSelectAria {
  let {keyboardDelegate, selectionManager, onTypeSelect} = options;
  let state = useRef<{search: string, timeout: ReturnType<typeof setTimeout> | undefined}>({
    search: '',
    timeout: undefined
  }).current;

  let onKeyDown = (e: KeyboardEvent) => {
    let character = getStringForKey(e.key);
    if (!character || e.ctrlKey || e.metaKey || !e.currentTarget.contains(e.target as HTMLElement) || (state.search.length === 0 && character === ' ')) {
      return;
    }

    // Do not propagate the Spacebar event if it's meant to be part of the search.
    // When we time out, the search term becomes empty, hence the check on length.
    // Trimming is to account for the case of pressing the Spacebar more than once,
    // which should cycle through the selection/deselection of the focused item.
    if (character === ' ' && state.search.trim().length > 0) {
      e.preventDefault();
      if (!('continuePropagation' in e)) {
        e.stopPropagation();
      }
    }

    state.search += character;

    if (keyboardDelegate.getKeyForSearch != null) {
      // Use the delegate to find a key to focus.
      // Prioritize items after the currently focused item, falling back to searching the whole list.
      let key = keyboardDelegate.getKeyForSearch(state.search, selectionManager.focusedKey);

      // If no key found, search from the top.
      if (key == null) {
        key = keyboardDelegate.getKeyForSearch(state.search);
      }

      if (key != null) {
        selectionManager.setFocusedKey(key);
        if (onTypeSelect) {
          onTypeSelect(key);
        }
      }
    }

    clearTimeout(state.timeout);
    state.timeout = setTimeout(() => {
      state.search = '';
    }, TYPEAHEAD_DEBOUNCE_WAIT_MS);
  };

  return {
    typeSelectProps: {
      // Using a capturing listener to catch the keydown event before
      // other hooks in order to handle the Spacebar event.
      onKeyDownCapture: keyboardDelegate.getKeyForSearch ? onKeyDown : undefined
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
