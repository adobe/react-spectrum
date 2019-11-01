import {AllHTMLAttributes} from 'react';
import {useId} from '@react-aria/utils';
import {useOverlayTrigger} from '@react-aria/overlays';

interface MenuProps {
}

interface MenuTriggerProps {
}

interface MenuTriggerAria extends AllHTMLAttributes {
}

export function useMenuTrigger(menuProps: MenuProps, menuTriggerProps:MenuTriggerProps, isOpen): MenuTriggerAria {
  let menuTriggerId = useId(menuTriggerProps.id);
  let {triggerAriaProps, overlayAriaProps} = useOverlayTrigger({
    ref: menuTriggerProps.ref,
    type: menuProps.type,
    id: menuProps.id,
    onClose: menuProps.onClose,
    isOpen
  });
  let menuId = overlayAriaProps.id;

  // handle roles stuff here since overlaytrigger handles type attribute

  return {
    menuTriggerAriaProps: {
      ...triggerAriaProps,
      id: menuTriggerId,
      'aria-haspopup': menuTriggerProps['aria-haspopup'] || menuProps['role'] || 'true',
      role: 'button',
      type: 'button'
    },
    menuAriaProps: {
      id: menuId,
      'aria-labelledby': menuProps['aria-labelledby'] || menuTriggerId,
      role: menuProps['role'] || 'menu',
    }
  };
}
