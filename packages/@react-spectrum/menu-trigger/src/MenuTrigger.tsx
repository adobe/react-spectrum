import {DOMRefValue} from '@react-types/shared';
import {MenuContext} from './context';
import {Overlay, Popover} from '@react-spectrum/overlays';
import {Placement, useOverlayPosition} from '@react-aria/overlays';
import {PressResponder} from '@react-aria/interactions';
import {Provider} from '@react-spectrum/provider';
import React, {Fragment, ReactElement, useRef} from 'react';
import {unwrapDOMRef} from '@react-spectrum/utils';
import {useControlledState} from '@react-stately/utils';
import {useMenuTrigger} from '@react-aria/menu-trigger';

export interface MenuTriggerProps {
  children: ReactElement[],
  trigger?: 'press' | 'longPress',
  align?: 'start' | 'end',
  direction?: 'bottom' | 'top', // left right?
  isOpen?: boolean,
  defaultOpen?: boolean,
  onOpenChange?: (isOpen: boolean) => void,
  shouldFlip?: boolean,
  isDisabled?: boolean
}

export function MenuTrigger(props: MenuTriggerProps) {
  let containerRef = useRef<DOMRefValue<HTMLDivElement>>();
  let menuPopoverRef = useRef<HTMLDivElement>();
  let menuTriggerRef = useRef<HTMLElement>();
  let {
    children,
    onOpenChange,
    align = 'start',
    shouldFlip = false,
    direction = 'bottom',
    isDisabled
  } = props;
  let focusStrategy = useRef(null);
  let [menuTrigger, menu] = React.Children.toArray(children);
  let [isOpen, setOpen] = useControlledState(props.isOpen, props.defaultOpen || false, onOpenChange);

  let onClose = () => {
    setOpen(false);
  };

  let {menuTriggerProps, menuProps} = useMenuTrigger(
    {
      ref: menuTriggerRef,
      type: 'menu',
      focusStrategy
    },
    {
      isOpen, 
      setOpen
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
    setOpen: setOpen
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
