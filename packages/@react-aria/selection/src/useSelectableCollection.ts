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

import {FocusEvent, HTMLAttributes, KeyboardEvent, RefObject, useEffect} from 'react';
import {focusSafely, getFocusableTreeWalker} from '@react-aria/focus';
import {FocusStrategy, KeyboardDelegate} from '@react-types/shared';
import {mergeProps} from '@react-aria/utils';
import {MultipleSelectionManager} from '@react-stately/selection';
import {useTypeSelect} from './useTypeSelect';

const isMac =
  typeof window !== 'undefined' && window.navigator != null
    ? /^Mac/.test(window.navigator.platform)
    : false;

function isCtrlKeyPressed(e: KeyboardEvent) {
  if (isMac) {
    return e.metaKey;
  }

  return e.ctrlKey;
}

interface SelectableCollectionOptions {
  /**
   * An interface for reading and updating multiple selection state.
   */
  selectionManager: MultipleSelectionManager,
  /**
   * A delegate object that implements behavior for keyboard focus movement.
   */
  keyboardDelegate: KeyboardDelegate,
  /**
   * The ref attached to the element representing the collection.
   */
  ref: RefObject<HTMLElement>,
  /**
   * Whether the collection or one of its items should be automatically focused upon render.
   * @default false
   */
  autoFocus?: boolean | FocusStrategy,
  /**
   * Whether focus should wrap around when the end/start is reached.
   * @default false
   */
  shouldFocusWrap?: boolean,
  /**
   * Whether the collection allows empty selection.
   * @default false
   */
  disallowEmptySelection?: boolean,
  /**
   * Whether the collection allows the user to select all items via keyboard shortcut.
   * @default false
   */
  disallowSelectAll?: boolean,
  /**
   * Whether selection should occur automatically on focus.
   * @default false
   */
  selectOnFocus?: boolean,
  /**
   * Whether typeahead is disabled.
   * @default false
   */
  disallowTypeAhead?: boolean
}

interface SelectableCollectionAria {
  /** Props for the collection element. */
  collectionProps: HTMLAttributes<HTMLElement>
}

/**
 * Handles interactions with selectable collections.
 */
export function useSelectableCollection(options: SelectableCollectionOptions): SelectableCollectionAria {
  let {
    selectionManager: manager,
    keyboardDelegate: delegate,
    ref,
    autoFocus = false,
    shouldFocusWrap = false,
    disallowEmptySelection = false,
    disallowSelectAll = false,
    selectOnFocus = false,
    disallowTypeAhead = false
  } = options;

  let onKeyDown = (e: KeyboardEvent) => {
    // Let child element (e.g. menu button) handle the event if the Alt key is pressed.
    // Keyboard events bubble through portals. Don't handle keyboard events
    // for elements outside the collection (e.g. menus).
    if (e.altKey || !ref.current.contains(e.target as HTMLElement)) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown': {
        if (delegate.getKeyBelow) {
          e.preventDefault();
          let nextKey = manager.focusedKey != null
            ? delegate.getKeyBelow(manager.focusedKey)
            : delegate.getFirstKey();

          if (nextKey) {
            manager.setFocusedKey(nextKey);
            if (manager.selectionMode === 'single' && selectOnFocus) {
              manager.replaceSelection(nextKey);
            }
          } else if (shouldFocusWrap) {
            let wrapKey = delegate.getFirstKey(manager.focusedKey);
            manager.setFocusedKey(wrapKey);
            if (manager.selectionMode === 'single' && selectOnFocus) {
              manager.replaceSelection(wrapKey);
            }
          }

          if (e.shiftKey && manager.selectionMode === 'multiple') {
            manager.extendSelection(nextKey);
          }
        }
        break;
      }
      case 'ArrowUp': {
        if (delegate.getKeyAbove) {
          e.preventDefault();
          let nextKey = manager.focusedKey != null
            ? delegate.getKeyAbove(manager.focusedKey)
            : delegate.getLastKey();

          if (nextKey) {
            manager.setFocusedKey(nextKey);
            if (manager.selectionMode === 'single' && selectOnFocus) {
              manager.replaceSelection(nextKey);
            }
          } else if (shouldFocusWrap) {
            let wrapKey = delegate.getLastKey(manager.focusedKey);
            manager.setFocusedKey(wrapKey);
            if (manager.selectionMode === 'single' && selectOnFocus) {
              manager.replaceSelection(wrapKey);
            }
          }

          if (e.shiftKey && manager.selectionMode === 'multiple') {
            manager.extendSelection(nextKey);
          }
        }
        break;
      }
      case 'ArrowLeft': {
        if (delegate.getKeyLeftOf) {
          e.preventDefault();
          let nextKey = delegate.getKeyLeftOf(manager.focusedKey);
          if (nextKey) {
            manager.setFocusedKey(nextKey);
            if (manager.selectionMode === 'single' && selectOnFocus) {
              manager.replaceSelection(nextKey);
            }
          }
          if (e.shiftKey && manager.selectionMode === 'multiple') {
            manager.extendSelection(nextKey);
          }
        }
        break;
      }
      case 'ArrowRight': {
        if (delegate.getKeyRightOf) {
          e.preventDefault();
          let nextKey = delegate.getKeyRightOf(manager.focusedKey);
          if (nextKey) {
            manager.setFocusedKey(nextKey);
            if (manager.selectionMode === 'single' && selectOnFocus) {
              manager.replaceSelection(nextKey);
            }
          }
          if (e.shiftKey && manager.selectionMode === 'multiple') {
            manager.extendSelection(nextKey);
          }
        }
        break;
      }
      case 'Home':
        if (delegate.getFirstKey) {
          e.preventDefault();
          let firstKey = delegate.getFirstKey(manager.focusedKey, isCtrlKeyPressed(e));
          manager.setFocusedKey(firstKey);
          if (manager.selectionMode === 'single' && selectOnFocus) {
            manager.replaceSelection(firstKey);
          }
          if (isCtrlKeyPressed(e) && e.shiftKey && manager.selectionMode === 'multiple') {
            manager.extendSelection(firstKey);
          }
        }
        break;
      case 'End':
        if (delegate.getLastKey) {
          e.preventDefault();
          let lastKey = delegate.getLastKey(manager.focusedKey, isCtrlKeyPressed(e));
          manager.setFocusedKey(lastKey);
          if (manager.selectionMode === 'single' && selectOnFocus) {
            manager.replaceSelection(lastKey);
          }
          if (isCtrlKeyPressed(e) && e.shiftKey && manager.selectionMode === 'multiple') {
            manager.extendSelection(lastKey);
          }
        }
        break;
      case 'PageDown':
        if (delegate.getKeyPageBelow) {
          e.preventDefault();
          let nextKey = delegate.getKeyPageBelow(manager.focusedKey);
          if (nextKey) {
            manager.setFocusedKey(nextKey);
            if (e.shiftKey && manager.selectionMode === 'multiple') {
              manager.extendSelection(nextKey);
            }
          }
        }
        break;
      case 'PageUp':
        if (delegate.getKeyPageAbove) {
          e.preventDefault();
          let nextKey = delegate.getKeyPageAbove(manager.focusedKey);
          if (nextKey) {
            manager.setFocusedKey(nextKey);
            if (e.shiftKey && manager.selectionMode === 'multiple') {
              manager.extendSelection(nextKey);
            }
          }
        }
        break;
      case 'a':
        if (isCtrlKeyPressed(e) && manager.selectionMode === 'multiple' && disallowSelectAll !== true) {
          e.preventDefault();
          manager.selectAll();
        }
        break;
      case 'Escape':
        e.preventDefault();
        if (!disallowEmptySelection) {
          manager.clearSelection();
        }
        break;
      case 'Tab': {
        // There may be elements that are "tabbable" inside a collection (e.g. in a grid cell).
        // However, collections should be treated as a single tab stop, with arrow key navigation internally.
        // We don't control the rendering of these, so we can't override the tabIndex to prevent tabbing.
        // Instead, we handle the Tab key, and move focus manually to the first/last tabbable element
        // in the collection, so that the browser default behavior will apply starting from that element
        // rather than the currently focused one.
        if (e.shiftKey) {
          ref.current.focus();
        } else {
          let walker = getFocusableTreeWalker(ref.current, {tabbable: true});
          let next: HTMLElement;
          let last: HTMLElement;
          do {
            last = walker.lastChild() as HTMLElement;
            if (last) {
              next = last;
            }
          } while (last);

          if (next && !next.contains(document.activeElement)) {
            next.focus();
          }
        }
        break;
      }
    }
  };

  let onFocus = (e: FocusEvent) => {
    if (manager.isFocused) {
      // If a focus event bubbled through a portal, reset focus state.
      if (!e.currentTarget.contains(e.target)) {
        manager.setFocused(false);
      }

      return;
    }

    // Focus events can bubble through portals. Ignore these events.
    if (!e.currentTarget.contains(e.target)) {
      return;
    }

    manager.setFocused(true);

    if (manager.focusedKey == null) {
      // If the user hasn't yet interacted with the collection, there will be no focusedKey set.
      // Attempt to detect whether the user is tabbing forward or backward into the collection
      // and either focus the first or last item accordingly.
      let relatedTarget = e.relatedTarget as Element;
      if (relatedTarget && (e.currentTarget.compareDocumentPosition(relatedTarget) & Node.DOCUMENT_POSITION_FOLLOWING)) {
        manager.setFocusedKey(manager.lastSelectedKey ?? delegate.getLastKey());
      } else {
        manager.setFocusedKey(manager.firstSelectedKey ?? delegate.getFirstKey());
      }
    }
  };

  let onBlur = (e) => {
    // Don't set blurred and then focused again if moving focus within the collection.
    if (!e.currentTarget.contains(e.relatedTarget as HTMLElement)) {
      manager.setFocused(false);
    }
  };

  useEffect(() => {
    if (autoFocus) {
      let focusedKey = null;

      // Check focus strategy to determine which item to focus
      if (autoFocus === 'first') {
        focusedKey = delegate.getFirstKey();
      } if (autoFocus === 'last') {
        focusedKey = delegate.getLastKey();
      }

      // If there are any selected keys, make the first one the new focus target
      let selectedKeys = manager.selectedKeys;
      if (selectedKeys.size) {
        focusedKey = selectedKeys.values().next().value;
      }

      manager.setFocused(true);
      manager.setFocusedKey(focusedKey);

      // If no default focus key is selected, focus the collection itself.
      if (focusedKey == null) {
        focusSafely(ref.current);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let handlers = {
    // We use a capturing listener to ensure that the keyboard events for the collection
    // override those of the children. For example, ArrowDown in a table should always go
    // to the cell below, and not open a menu.
    onKeyDownCapture: onKeyDown,
    onFocus,
    onBlur,
    onMouseDown(e) {
      // Prevent focus going to the collection when clicking on the scrollbar.
      e.preventDefault();
    }
  };

  let {typeSelectProps} = useTypeSelect({
    keyboardDelegate: delegate,
    selectionManager: manager
  });

  if (!disallowTypeAhead) {
    handlers = mergeProps(typeSelectProps, handlers);
  }

  return {
    collectionProps: {
      ...handlers,
      // If nothing is focused within the collection, make the collection itself tabbable.
      // This will be marshalled to either the first or last item depending on where focus came from.
      tabIndex: manager.focusedKey == null ? 0 : -1
    }
  };
}
