import {HTMLAttributes, Key, RefObject, useEffect} from 'react';
import {MultipleSelectionManager} from '@react-stately/selection';
import {PressEvent} from '@react-types/shared';
import {PressProps} from '@react-aria/interactions';

interface SelectableItemOptions {
  selectionManager: MultipleSelectionManager,
  itemKey: Key,
  itemRef: RefObject<HTMLElement>
}

interface SelectableItemAria {
  itemProps: HTMLAttributes<HTMLElement> & PressProps
}

export function useSelectableItem(options: SelectableItemOptions): SelectableItemAria {
  let {
    selectionManager: manager,
    itemKey,
    itemRef
  } = options;

  let onPressStart = (e: PressEvent) => {
    if (manager.selectionMode === 'none') {
      return;
    }

    if (manager.selectionMode === 'single') {
      if (manager.selectedKeys.has(itemKey)) {
        manager.toggleSelection(itemKey);
      } else {
        manager.replaceSelection(itemKey);
      }
    } else if (e.shiftKey) {
      manager.extendSelection(itemKey);
    } else if (manager) {
      manager.toggleSelection(itemKey);
    }
  };

  // Focus the associated DOM node when this item becomes the focusedKey
  let isFocused = itemKey === manager.focusedKey;
  useEffect(() => {
    if (isFocused && manager.isFocused && document.activeElement !== itemRef.current) {
      itemRef.current.focus({preventScroll: false});
    }
  }, [itemRef, isFocused, manager.focusedKey, manager.isFocused]);

  return {
    itemProps: {
      onPressStart,
      tabIndex: isFocused ? 0 : -1,
      onFocus() {
        manager.setFocusedKey(itemKey);
      }
    }
  };
}
