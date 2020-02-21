import {FocusEvent, HTMLAttributes, KeyboardEvent} from 'react';
import {KeyboardDelegate} from '@react-types/shared';
import {MultipleSelectionManager} from '@react-stately/selection';

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
  keyboardDelegate: KeyboardDelegate
}

interface SelectableListAria {
  listProps: HTMLAttributes<HTMLElement>
}

export function useSelectableCollection(options: SelectableListOptions): SelectableListAria {
  let {
    selectionManager: manager,
    keyboardDelegate: delegate
  } = options;

  let onKeyDown = (e: KeyboardEvent) => {
    console.log('keydown')
    switch (e.key) {
      case 'ArrowDown': {
        if (delegate.getKeyBelow) {
          e.preventDefault();
          let nextKey = delegate.getKeyBelow(manager.focusedKey);
          console.log('nextKey', nextKey);
          if (nextKey) {
            manager.setFocusedKey(nextKey);
          } else {
            manager.setFocusedKey(delegate.getFirstKey());
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
          } else {
            manager.setFocusedKey(delegate.getLastKey());
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
      onKeyDown,
      onFocus,
      onBlur
    }
  };
}
