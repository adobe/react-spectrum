import {FocusEvent, HTMLAttributes, KeyboardEvent} from 'react';
import {KeyboardDelegate} from '@react-types/shared';
import {MultipleSelectionManager} from '@react-stately/selection';

import {Node} from '@react-stately/collections';
import {Key} from 'react';

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

interface SelectableListOptions {
  selectionManager: MultipleSelectionManager,
  keyboardDelegate: KeyboardDelegate,
  tree: any
}

interface SelectableListAria {
  listProps: HTMLAttributes<HTMLElement>
}

let keysSoFar = '';
let keyClearTimeout = null;
let searchIndex;
const WHITESPACE_REGEXP = /[\n\r]+|[\s]{1,}/g;

export function useSelectableCollection(options: SelectableListOptions): SelectableListAria {
  let {
    selectionManager: manager,
    keyboardDelegate: delegate,
    tree
  } = options;

  let normalize = (string = '', normalizationForm = 'NFC') => {
    if ('normalize' in String.prototype) {
      string = string.normalize(normalizationForm);
    }
    return string;
  }
  
  let removeDiacritics = (string = '', normalizationForm = 'NFD') => {
    return normalize(string, normalizationForm.replace('C', 'D')).replace(/[\u0300-\u036f]/g, '');
  }

  let clearKeysSoFarAfterDelay = () => {
    if (keyClearTimeout) {
      clearTimeout(keyClearTimeout);
    }
    keyClearTimeout = setTimeout(() => keysSoFar = '', 500);
  }

  let findMatchInRange = (items, startIndex, endIndex) => {
    // Find the first item starting with the keysSoFar substring, searching in the specified range of items
    for (let i = startIndex; i < endIndex; i++) {
      const label = items[i].rendered;
      if (label &&
          removeDiacritics(label)
          .replace(WHITESPACE_REGEXP, '')
          .toUpperCase()
          .indexOf(keysSoFar) === 0) {
        return items[i].key;
      }
    }
    return null;
  }

  let findItemToFocus = (e) => {
    const {
      target,
      shiftKey,
      charCode
    } = e;

    const character = removeDiacritics(String.fromCharCode(charCode)).toUpperCase();
    let itemMap = tree.keyMap;
    let items = Array.from(itemMap.values()).reduce((results: Array<any>, item: any) => {
      if (item.type === 'item') {
        results.push(item);
      }
      return results
    }, []) as Array<any>;

    let targetLabel = target.innerText || target.textContent;
    if (keysSoFar === '' || character === keysSoFar || shiftKey) {
      // reverse order if shiftKey is pressed
      if (shiftKey) {
        items = items.reverse();
      }
      searchIndex = items.findIndex((item) => item.rendered === targetLabel);
    }

    if (character !== keysSoFar) {
      keysSoFar += character;
    }

    clearKeysSoFarAfterDelay();

    let itemKey = findMatchInRange(
      items,
      searchIndex + 1,
      items.length
    );

    if (!itemKey) {
      itemKey = findMatchInRange(
        items,
        0,
        searchIndex
      );
    }

    if (itemKey) {
      manager.setFocusedKey(itemKey)
    }
  }

  let onKeyPress = (e) => {
    if (e.isPropagationStopped()) {
      return;
    }
    findItemToFocus(e);
  }

  let onKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown': {
        if (delegate.getKeyBelow) {
          e.preventDefault();
          let nextKey = delegate.getKeyBelow(manager.focusedKey);
          if (nextKey) {
            manager.setFocusedKey(nextKey);
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
          let nextKey = delegate.getKeyAbove(manager.focusedKey);
          if (nextKey) {
            manager.setFocusedKey(nextKey);
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
          let firstKey = delegate.getFirstKey();
          manager.setFocusedKey(firstKey);
          if (isCtrlKeyPressed(e) && e.shiftKey && manager.selectionMode === 'multiple') {
            manager.extendSelection(firstKey);
          }
        }
        break;
      case 'End':
        if (delegate.getLastKey) {
          e.preventDefault();
          let lastKey = delegate.getLastKey();
          manager.setFocusedKey(lastKey);
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
        if (isCtrlKeyPressed(e) && manager.selectionMode === 'multiple') {
          e.preventDefault();
          manager.selectAll();
        }
        break;
      case 'Escape':
        e.preventDefault();
        manager.clearSelection();
        break;
    }
  };

  let onFocus = (e: FocusEvent) => {
    manager.setFocused(true);

    if (manager.focusedKey == null && e.target === e.currentTarget) {
      // If the user hasn't yet interacted with the collection, there will be no focusedKey set.
      // Attempt to detect whether the user is tabbing forward or backward into the collection
      // and either focus the first or last item accordingly.
      let relatedTarget = e.relatedTarget as Element;
      if (relatedTarget && (e.currentTarget.compareDocumentPosition(relatedTarget) & Node.DOCUMENT_POSITION_FOLLOWING)) {
        manager.setFocusedKey(delegate.getLastKey());
      } else {
        manager.setFocusedKey(delegate.getFirstKey());
      }
    }
  };

  let onBlur = () => {
    manager.setFocused(false);
  };

  return {
    listProps: {
      onKeyPress,
      onKeyDown,
      onFocus,
      onBlur
    }
  };
}
