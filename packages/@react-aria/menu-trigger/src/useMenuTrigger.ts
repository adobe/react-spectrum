import {AllHTMLAttributes, RefObject} from 'react';
import {PressProps} from '@react-aria/interactions';
import {useId} from '@react-aria/utils';
import {useOverlayTrigger} from '@react-aria/overlays';

export type FocusStrategy = 'first' | 'last';

interface MenuTriggerState {
  isOpen: boolean,
  setOpen: (value: boolean) => void,
  focusStrategy: FocusStrategy,
  setFocusStrategy: (value: FocusStrategy) => void
}

interface MenuTriggerProps {
  ref: RefObject<HTMLElement | null>,
  type: 'dialog' | 'menu' | 'listbox' | 'tree' | 'grid',
} 

interface MenuTriggerAria {
  menuTriggerProps: AllHTMLAttributes<HTMLElement> & PressProps,
  menuProps: AllHTMLAttributes<HTMLElement>
}

export function useMenuTrigger(props: MenuTriggerProps, state: MenuTriggerState): MenuTriggerAria {
  let {
    ref,
    type
  } = props;

  let menuTriggerId = useId();
  let {triggerAriaProps, overlayAriaProps} = useOverlayTrigger({
    ref,
    type,
    onClose: () => state.setOpen(false),
    isOpen: state.isOpen
  });

  let onPress = () => {
    state.setOpen(!state.isOpen);
  };

  let onKeyDown = (e) => {
    if ((typeof e.isDefaultPrevented === 'function' && e.isDefaultPrevented()) || e.defaultPrevented) {
      return;
    }

    if (ref && ref.current) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          e.stopPropagation();
          onPress();
          break;
        case 'ArrowUp':
          e.preventDefault();
          e.stopPropagation();
          onPress();
          // If no menu item is selected, focus last item when opening menu with ArrowDown
          state.setFocusStrategy('last');
          break;
      }
    }
  };

  return {
    menuTriggerProps: {
      ...triggerAriaProps,
      id: menuTriggerId,
      onPress,
      onKeyDown
    },
    menuProps: {
      ...overlayAriaProps,
      'aria-labelledby': menuTriggerId
    }
  };
}
