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
