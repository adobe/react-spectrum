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

import {FocusScope} from '@react-aria/focus';
import {FocusStrategy, SpectrumMenuTriggerProps} from '@react-types/menu';
import {MenuContext} from './context';
import {Overlay, Popover, Tray} from '@react-spectrum/overlays';
import {Placement, useOverlayPosition} from '@react-aria/overlays';
import {PressResponder} from '@react-aria/interactions';
import {Provider} from '@react-spectrum/provider';
import React, {Fragment, useRef, useState} from 'react';
import {useControlledState} from '@react-stately/utils';
import {useMediaQuery} from '@react-spectrum/utils';
import {useMenuTrigger} from '@react-aria/menu';

export function MenuTrigger(props: SpectrumMenuTriggerProps) {
  let menuPopoverRef = useRef<HTMLDivElement>();
  let menuTriggerRef = useRef<HTMLElement>();
  let menuRef = useRef<HTMLUListElement>();
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
    targetRef: menuTriggerRef,
    overlayRef: menuPopoverRef,
    scrollRef: menuRef,
    placement: `${direction} ${align}` as Placement,
    shouldFlip: shouldFlip,
    isOpen
  });

  let isMobile = useMediaQuery('(max-width: 700px)');
  let menuContext = {
    ...menuProps,
    ref: menuRef,
    focusStrategy,
    onClose,
    closeOnSelect,
    autoFocus: true,
    wrapAround: true,
    UNSAFE_style: {
      width: isMobile ? '100%' : undefined
    }
  };

  // On small screen devices, the menu is rendered in a tray, otherwise a popover.
  let overlay;
  if (isMobile) {
    overlay = (
      <Tray isOpen={isOpen} onClose={onClose}>
        <FocusScope restoreFocus>
          {menu}
        </FocusScope>
      </Tray>
    );
  } else {
    overlay = (
      <Popover 
        {...overlayProps}
        ref={menuPopoverRef}
        placement={placement}
        hideArrow
        onClose={onClose}>
        <FocusScope restoreFocus>
          {menu}
        </FocusScope>
      </Popover>
    );
  }
   
  return (
    <Fragment>
      <Provider isDisabled={isDisabled}>
        <PressResponder {...menuTriggerProps} ref={menuTriggerRef} isPressed={isOpen}>
          {menuTrigger}
        </PressResponder>
      </Provider>
      <MenuContext.Provider value={menuContext}>
        <Overlay isOpen={isOpen}>
          {overlay}
        </Overlay>
      </MenuContext.Provider>
    </Fragment>
  );
}
