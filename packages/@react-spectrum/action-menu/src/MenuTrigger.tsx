import {chain, filterDOMProps, useId} from '@react-aria/utils';
import {Overlay} from '@react-spectrum/overlays';
import {useOverlayPosition, useOverlayTrigger} from '@react-aria/overlays';
import {PressResponder} from '@react-aria/interactions';
import React, {Fragment, useRef, ReactElement} from 'react';
import {useControlledState} from '@react-stately/utils';

import {useMenuTrigger} from '@react-aria/action-menu';

export interface MenuTriggerProps {
  children: ReactElement,
  trigger: 'press' | 'longPress',
  align?: 'start' | 'end',
  direction?: 'bottom' | 'top', // left right?
  isOpen?: boolean,
  defaultOpen?: boolean,
  onOpenChange?: (isOpen: boolean) => void,
  shouldFlip?: boolean,
  onSelect?: (...args) => void
}

export function MenuTrigger(props: MenuTriggerProps) {
  let containerRef = useRef<HTMLDivElement>();
  let menuRef = useRef<HTMLElement>();
  let menuTriggerRef = useRef<HTMLElement>();
  let {
    children,
    trigger = "press", // TODO: actually use this prop when longPress is implemented
    onOpenChange,
    align = "start",
    shouldFlip = false,
    direction = "bottom",
    ...otherProps
  } = props;
  
  // Split into menuTrigger and menu
  let [menuTrigger, menu] = React.Children.toArray(children);
  
  // TODO: move id generation and all the aria stuff into a MenuTrigger aria hook if I don't end up using 
  // useOverlayTrigger + modifications
  // let menuId = useId(menu.props.id);
  // let menuTriggerId = useId(menuTrigger.props.id);
 
  // TODO outofscope: handle mobile, but see DialogTrigger for inspiration

  // Initialize "open" state (controlled vs uncontrolled), default closed.
  let [isOpen, setOpen] = useControlledState(props.isOpen, props.defaultOpen || false, props.onOpenChange);

  let onClose = () => {
    setOpen(false);
  }

  let {menuTriggerAriaProps, menuAriaProps} = useMenuTrigger(
    {
      ...menu.props,
      onClose,
      ref: menuRef
    },
    {
      ...menuTrigger.props,
      ref: menuTriggerRef
    },
    isOpen
  )

  // Press handler for menuTrigger
  let onPress = (e) => {
    if (e.pointerType !== 'keyboard') {
      setOpen(!isOpen);
    }
  }

  // Menu item selection handler
  let onSelect = (...args) => {
    if (otherProps.onSelect) {
      otherProps.onSelect(...args);
    }
  }

  let onKeyDownTrigger = (e) => {
    if ((typeof e.isDefaultPrevented === 'function' && e.isDefaultPrevented()) || e.defaultPrevented) {
      return;
    }

    if (menuTriggerRef && menuTriggerRef.current) {
      switch (e.key) {
        case 'Enter': 
        case 'ArrowDown':
        case 'ArrowUp':
        case ' ':
          e.preventDefault();
          e.stopPropagation();
          onPress(e);
          break;
      }
    }
  }

  let {overlayProps, placement, arrowProps} = useOverlayPosition({
    containerRef,
    targetRef: menuTriggerRef,
    overlayRef: menuRef,
    placement: `${direction} ${align}`, // Legit? For some reason bottom/top right/left works but not bottom/top start/end. Do I just convert to right/left or should I alter calculatePosition so that it can check for RTL?
    shouldFlip: shouldFlip,
    isOpen
  })

  // TODO: replace with context stuff, split into menu props and popover context
  menu = React.cloneElement(menu, {
    ...overlayProps, 
    ...menuAriaProps,
    placement, 
    arrowProps,
    ref: menuRef,
    onSelect: onSelect,
    hideArrow: true,
    // id: menuId,
    // role: menu.props['role'] || 'menu',
    // 'aria-labelledby': menu.props['aria-labelledby'] || menuTriggerId,
  });

  // Note: use useOverlayTrigger, and possiblly refactor some stuff so common stuff is common to dialog + menu
  // pull out menu and dialog specific stuff into their own hooks
  let menuTriggerProps = {
    // id: menuTriggerId,
    // role: 'button',
    // 'aria-haspopup': menuTrigger.props['aria-haspopup'] || menu.props.role || 'true', // Double check this logic, can I just do menu.props.role?
    // 'aria-expanded': isOpen,
    // 'aria-controls': (isOpen ? menuId : null),
    ...menuTriggerAriaProps,
    onKeyDown: chain(menuTrigger.props.onKeyDown, onKeyDownTrigger),
    ref: menuTriggerRef
  }

  
  // console.log('menu', menu);
  // console.log('containerRef', containerRef.current);
  // console.log('menuTriggerRef', menuTriggerRef.current);
  // console.log('menuRef', menuRef.current);
  // console.log('overlayprops e.g. styles', overlayProps);

  return (
    <Fragment>
      <PressResponder
        {...menuTriggerProps}
        onPress={onPress}
        isPressed={isOpen}>
        {menuTrigger}
      </PressResponder>
      <Overlay isOpen={isOpen} ref={containerRef}>
        {menu}
      </Overlay> 
    </Fragment>
  );
};
