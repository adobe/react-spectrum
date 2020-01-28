import {DOMRefValue} from '@react-types/shared';
import {FocusStrategy, SpectrumMenuTriggerProps} from '@react-types/menu';
import {MenuContext} from './context';
import {Overlay, Popover} from '@react-spectrum/overlays';
import {Placement, useOverlayPosition} from '@react-aria/overlays';
import {PressResponder} from '@react-aria/interactions';
import {Provider} from '@react-spectrum/provider';
import React, {Fragment, useRef, useState} from 'react';
import {unwrapDOMRef} from '@react-spectrum/utils';
import {useControlledState} from '@react-stately/utils';
import {useMenuTrigger} from '@react-aria/menu-trigger';

export function MenuTrigger(props: SpectrumMenuTriggerProps) {
  let containerRef = useRef<DOMRefValue<HTMLDivElement>>();
  let menuPopoverRef = useRef<HTMLDivElement>();
  let menuTriggerRef = useRef<HTMLElement>();
  let {
    children,
    onOpenChange,
    align = 'start',
    shouldFlip = false,
    direction = 'bottom',
    isDisabled,
    closeOnSelect = true
  } = props;

  let [menuTrigger, menu] = React.Children.toArray(children);
  let [isOpen, setOpen] = useControlledState(props.isOpen, props.defaultOpen || false, onOpenChange);
  let [focusStrategy, setFocusStrategy] = useState('first' as FocusStrategy);

  let onClose = () => {
    setOpen(false);
  };

  let {menuTriggerProps, menuProps} = useMenuTrigger(
    {
      ref: menuTriggerRef,
      type: 'menu',
      isDisabled
    },
    {
      isOpen, 
      setOpen,
      focusStrategy,
      setFocusStrategy
    }
  );

  let {overlayProps, placement} = useOverlayPosition({
    containerRef: unwrapDOMRef(containerRef),
    targetRef: menuTriggerRef,
    overlayRef: menuPopoverRef,
    placement: `${direction} ${align}` as Placement,
    shouldFlip: shouldFlip,
    isOpen
  });

  let menuContext = {
    ...menuProps,
    focusStrategy,
    setFocusStrategy,
    onClose,
    closeOnSelect
  };

  let triggerProps = {
    ...menuTriggerProps,
    ref: menuTriggerRef,
    isPressed: isOpen
  };

  let popoverProps = {
    ...overlayProps,
    ref: menuPopoverRef,
    placement, 
    hideArrow: true,
    onClose
  };
   
  return (
    <Fragment>
      <Provider isDisabled={isDisabled}>
        <PressResponder {...triggerProps}>
          {menuTrigger}
        </PressResponder>
      </Provider>
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
