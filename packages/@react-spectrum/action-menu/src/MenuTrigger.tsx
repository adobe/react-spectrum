import {chain} from '@react-aria/utils';
import {DOMProps} from '@react-types/shared';
import {MenuContext} from './context';
import {Overlay, Popover} from '@react-spectrum/overlays';
import {Placement, useOverlayPosition} from '@react-aria/overlays';
import {PressResponder} from '@react-aria/interactions';
import React, {Fragment, ReactElement, useRef} from 'react';
import {useControlledState} from '@react-stately/utils';
import {useMenuTrigger} from '@react-aria/action-menu';

export interface MenuTriggerProps extends DOMProps {
  children: ReactElement[],
  trigger?: 'press' | 'longPress',
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
  let menuPopoverRef = useRef<HTMLDivElement>();
  let menuTriggerRef = useRef<HTMLElement>();
  let {
    children,
    onOpenChange,
    align = 'start',
    shouldFlip = false,
    direction = 'bottom',
    ...otherProps
  } = props;

  let [menuTrigger, menu] = React.Children.toArray(children);
  let [isOpen, setOpen] = useControlledState(props.isOpen, props.defaultOpen || false, onOpenChange);

  let onClose = () => {
    setOpen(false);
  };

  let {menuTriggerAriaProps, menuAriaProps} = useMenuTrigger(
    {
      ...menu.props,
      onClose
    },
    {
      ...menuTrigger.props,
      ref: menuTriggerRef
    },
    isOpen
  );

  let onPress = (e) => {
    if (e.pointerType !== 'keyboard') {
      setOpen(!isOpen);
    }
  };

  let onSelect = (...args) => {
    if (otherProps.onSelect) {
      otherProps.onSelect(...args);
    }
  };

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
  };

  let {overlayProps, placement} = useOverlayPosition({
    containerRef,
    targetRef: menuTriggerRef,
    overlayRef: menuPopoverRef,
    placement: `${direction} ${align}` as Placement,
    shouldFlip: shouldFlip,
    isOpen
  });

  let menuContext = {
    ...menuAriaProps,
    onSelect: onSelect
  };

  let menuTriggerProps = {
    ...menuTriggerAriaProps,
    onKeyDown: chain(menuTrigger.props.onKeyDown, onKeyDownTrigger),
    ref: menuTriggerRef,
    onPress,
    isPressed: isOpen
  };

  let popoverProps = {
    ...overlayProps,
    ref: menuPopoverRef,
    onClose, 
    placement, 
    hideArrow: true
  };

  return (
    <Fragment>
      <PressResponder {...menuTriggerProps}>
        {menuTrigger}
      </PressResponder>
      <MenuContext.Provider value={menuContext}>
        <Overlay isOpen={isOpen} ref={containerRef}>
          <Popover {...popoverProps}>
            {menu}
          </Popover>
        </Overlay>
      </MenuContext.Provider> 
    </Fragment>
  );
}
