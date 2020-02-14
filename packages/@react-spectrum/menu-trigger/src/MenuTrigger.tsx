/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {DOMRefValue} from '@react-types/shared';
import {FocusStrategy, useMenuTrigger} from '@react-aria/menu-trigger';
import {MenuContext} from './context';
import {Overlay, Popover} from '@react-spectrum/overlays';
import {Placement, useOverlayPosition} from '@react-aria/overlays';
import {PressResponder} from '@react-aria/interactions';
import {Provider} from '@react-spectrum/provider';
import React, {Fragment, ReactElement, useRef, useState} from 'react';
import {unwrapDOMRef} from '@react-spectrum/utils';
import {useControlledState} from '@react-stately/utils';

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

  let [menuTrigger, menu] = React.Children.toArray(children);
  let [isOpen, setOpen] = useControlledState(props.isOpen, props.defaultOpen || false, onOpenChange);
  let [focusStrategy, setFocusStrategy] = useState('first' as FocusStrategy);

  let onClose = () => {
    setOpen(false);
  };

  let {menuTriggerProps, menuProps} = useMenuTrigger(
    {
      ref: menuTriggerRef,
      type: 'menu'
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
    setOpen
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
