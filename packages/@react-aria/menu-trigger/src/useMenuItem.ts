import {AllHTMLAttributes, RefObject} from 'react';
import {MenuItemProps} from '@react-types/menu';
import {mergeProps, useId} from '@react-aria/utils';
import {TreeState} from '@react-stately/tree';
import {usePress} from '@react-aria/interactions';
import {useSelectableItem} from '@react-aria/selection';

interface MenuItemAria {
  menuItemProps: AllHTMLAttributes<HTMLElement>
}

interface MenuState<T> extends TreeState<T> {}

export function useMenuItem<T>(props: MenuItemProps<T>, ref: RefObject<HTMLElement>, state: MenuState<T>, onClose?: () => void, closeOnSelect?: boolean): MenuItemAria {
  let {
    isSelected,
    isDisabled,
    key,
    role = 'menuitem',
    blah
  } = props;
  console.log('props', props);
  
  let {itemProps} = useSelectableItem({
    selectionManager: state.selectionManager,
    itemKey: blah,
    // itemKey: key,
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
          if (role === 'menuitem') {
            if (closeOnSelect) {
              onClose && onClose();
            }
          }
        }
        break;
      case 'Enter':
        if (!isDisabled) {
          onClose && onClose();
        }
        break;
    }
  }; 

  let onPress = (e) => {
    if (e.pointerType !== 'keyboard') {
      if (closeOnSelect) {
        onClose && onClose();
      }
    }
  };

  // let onMouseOver = () => state.selectionManager.setFocusedKey(key);
  let onMouseOver = () => state.selectionManager.setFocusedKey(blah);
  let {pressProps} = usePress(mergeProps({onPress, onKeyDown, isDisabled}, itemProps));

  return {
    menuItemProps: {
      ...ariaProps,
      ...pressProps,
      onMouseOver
    }
  };
}
