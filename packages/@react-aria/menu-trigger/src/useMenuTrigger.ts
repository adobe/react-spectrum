import {AllHTMLAttributes, RefObject} from 'react';
import {PressProps} from '@react-aria/interactions';
import {useId} from '@react-aria/utils';
import {useOverlayTrigger} from '@react-aria/overlays';

export type focusStrategy = 'first' | 'last';

interface MenuTriggerState {
  isOpen: boolean,
  setOpen(value: boolean): void
}

interface MenuTriggerProps {
  onSelect?: (...args) => void
  ref: RefObject<HTMLElement | null>,
  type: 'dialog' | 'menu' | 'listbox' | 'tree' | 'grid',
  focusStrategy: React.MutableRefObject<focusStrategy>
} 

interface MenuTriggerAria {
  menuTriggerProps: AllHTMLAttributes<HTMLElement> & PressProps,
  menuProps: AllHTMLAttributes<HTMLElement>
}

export function useMenuTrigger(props: MenuTriggerProps, state: MenuTriggerState): MenuTriggerAria {
  let {
    ref,
    type,
    focusStrategy
  } = props;

  let menuTriggerId = useId();
  let {triggerAriaProps, overlayAriaProps} = useOverlayTrigger({
    ref,
    type,
    onClose: () => state.setOpen(false),
    isOpen: state.isOpen
  });

  let onPress = (e) => {
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
          onPress(e);
          break;
        case 'ArrowUp':
          e.preventDefault();
          e.stopPropagation();
          onPress(e);
          // If no menu item is selected, focus last item when opening menu with ArrowDown
          focusStrategy.current = 'last';
          break;
      }
    }
  };

  let onSelect = (...args) => {
    if (props.onSelect) {
      props.onSelect(...args);
    }

    state.setOpen(false);
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
      'aria-labelledby': menuTriggerId,
      onSelect
    }
  };
}
