import {HTMLAttributes, Key, RefObject, useEffect} from 'react';
import {MultipleSelectionManager} from '@react-stately/selection';
import {PressEvent, PressProps} from '@react-aria/interactions';

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
      // How do we handle user provided onSelect callbacks here?
      // Should we call it here or have the user provide a onPress that they merge with itemProps?
      // Or is this something SelectionManager should handle?
      // How do we handle custom selection strategies? Like if we don't want to be able to select an item
      // if it has child nodes?
      manager.toggleSelection(itemKey);
    }
  };

  // Focus the associated DOM node when this item becomes the focusedKey
  let isFocused = itemKey === manager.focusedKey;
  useEffect(() => {
    if (isFocused && manager.isFocused && document.activeElement !== itemRef.current) {
      itemRef.current && itemRef.current.focus({preventScroll: true});
    }
  }, [itemRef, isFocused, manager]);

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
