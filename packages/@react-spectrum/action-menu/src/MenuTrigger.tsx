import {chain} from '@react-aria/utils';
import {MenuContext} from './context';
import {Overlay} from '@react-spectrum/overlays';
import {useOverlayPosition} from '@react-aria/overlays';
import {PressResponder} from '@react-aria/interactions';
import React, {Fragment, useRef, ReactElement} from 'react';
import {useControlledState} from '@react-stately/utils';

import {useMenuTrigger} from '@react-aria/action-menu';

export interface MenuTriggerProps {
  children: ReactElement[],
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
  let menuPopoverRef = useRef<HTMLElement>();
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
  
  // Initialize "open" state (controlled vs uncontrolled), default closed.
  let [isOpen, setOpen] = useControlledState(props.isOpen, props.defaultOpen || false, props.onOpenChange);

  let onClose = () => {
    setOpen(false);
  }

  let {menuTriggerAriaProps, menuAriaProps} = useMenuTrigger(
    {
      ...menu.props,
      onClose,
      ref: menuPopoverRef
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
    overlayRef: menuPopoverRef,
    placement: `${direction} ${align}`, // Legit? For some reason bottom/top right/left works but not bottom/top start/end. Do I just convert to right/left or should I alter calculatePosition so that it can check for RTL?
    shouldFlip: shouldFlip,
    isOpen
  })

  let menuContext = {
    ...overlayProps, 
    ...menuAriaProps,
    placement, 
    arrowProps,
    menuPopoverRef,
    onSelect: onSelect,
    hideArrow: true
  }

  let menuTriggerProps = {
    ...menuTriggerAriaProps,
    onKeyDown: chain(menuTrigger.props.onKeyDown, onKeyDownTrigger),
    ref: menuTriggerRef
  }

  return (
    <Fragment>
      <PressResponder
        {...menuTriggerProps}
        onPress={onPress}
        isPressed={isOpen}>
        {menuTrigger}
      </PressResponder>
      <MenuContext.Provider value={menuContext}>
        <Overlay isOpen={isOpen} ref={containerRef}>
          {menu}
        </Overlay>
      </MenuContext.Provider> 
    </Fragment>
  );
};
