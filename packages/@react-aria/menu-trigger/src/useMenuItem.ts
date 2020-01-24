import {AllHTMLAttributes, RefObject} from 'react';
import {mergeProps, useId} from '@react-aria/utils';
import {Node} from '@react-stately/collections';
import {TreeState} from '@react-stately/tree';
import {usePress} from '@react-aria/interactions';
import {useSelectableItem} from '@react-aria/selection';

// TODO: Combine interface with the one in MenuItem.tsx
interface MenuItemProps<T> extends AllHTMLAttributes<HTMLElement> {
  item: Node<T>
}

interface MenuItemAria {
  menuItemProps: AllHTMLAttributes<HTMLElement>
}

interface MenuState<T> extends TreeState<T> {}

type MenuTriggerState = (value: boolean) => void

export function useMenuItem<T>(props: MenuItemProps<T>, ref: RefObject<HTMLElement>, state: MenuState<T>, setOpen?: MenuTriggerState): MenuItemAria {
  let {
    item,
    role
  } = props;

  let {
    isSelected,
    isDisabled
  } = item;
 
  let {itemProps} = useSelectableItem({
    selectionManager: state.selectionManager,
    itemKey: item.key,
    itemRef: ref
  });

  let ariaProps = {
    'aria-disabled': isDisabled,
    id: useId(),
    role
  };

  if (role === 'option') {
    ariaProps['aria-selected'] = isSelected ? 'true' : 'false';
  } else if (role === 'menuitemradio' || role === 'menuitemcheckbox') {
    ariaProps['aria-checked'] = isSelected ? 'true' : 'false';
  }

  let onKeyDown = (e) => {
    switch (e.key) {
      case ' ':
        if (!isDisabled) {
          if (role !== 'menuitemcheckbox' && role !== 'menuitemradio' && role !== 'option') {
            setOpen && setOpen(false);
          }
        }
        break;
      case 'Enter':
        if (!isDisabled) {
          setOpen && setOpen(false);
        }
        break;
    }
  }; 

  let onPress = (e) => {
    if (e.pointerType !== 'keyboard') {
      setOpen && setOpen(false);
    }
  };

  let onMouseOver = () => state.selectionManager.setFocusedKey(item.key);
  // Note: the ref below is needed so that a menuItem with children serves as a MenuTrigger properly
  // Add it if we like that behavior but remove if/when we make a subMenu item/trigger component
  // let {pressProps} = usePress(mergeProps({onPressStart}, {...itemProps, ref}));

  // The below allows the user to properly cycle through all choices via up/down arrow (suppresses up and down from triggering submenus by not including the ref). 
  // isDisabled suppresses sub menu triggers from firing
  let {pressProps} = usePress(mergeProps({onPress}, mergeProps({onKeyDown}, {...itemProps, isDisabled: isDisabled})));
  // let handlers = mergeProps(pressProps, )

  return {
    menuItemProps: {
      ...ariaProps,
      ...pressProps,
      onMouseOver
    }
  };
}
