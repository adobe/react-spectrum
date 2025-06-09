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

import {classNames, SlotProvider, unwrapDOMRef, useDOMRef, useIsMobileDevice} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import {MenuContext} from './context';
import {Placement} from '@react-types/overlays';
import {Popover, Tray} from '@react-spectrum/overlays';
import {PressResponder, useInteractOutside} from '@react-aria/interactions';
import React, {forwardRef, Fragment, useRef} from 'react';
import {SpectrumMenuTriggerProps} from '@react-types/menu';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {useMenuTrigger} from '@react-aria/menu';
import {useMenuTriggerState} from '@react-stately/menu';

/**
 * The MenuTrigger serves as a wrapper around a Menu and its associated trigger,
 * linking the Menu's open state with the trigger's press state.
 */
export const MenuTrigger = forwardRef(function MenuTrigger(props: SpectrumMenuTriggerProps, ref: DOMRef<HTMLElement>) {
  let triggerRef = useRef<HTMLElement>(null);
  let domRef = useDOMRef(ref);
  let menuTriggerRef = domRef || triggerRef;
  let menuRef = useRef<HTMLDivElement>(null);
  let {
    children,
    align = 'start',
    shouldFlip = true,
    direction = 'bottom',
    closeOnSelect,
    trigger = 'press'
  } = props;

  let [menuTrigger, menu] = React.Children.toArray(children);
  let state = useMenuTriggerState(props);

  let {menuTriggerProps, menuProps} = useMenuTrigger({trigger}, state, menuTriggerRef);

  let initialPlacement: Placement;
  switch (direction) {
    case 'left':
    case 'right':
    case 'start':
    case 'end':
      initialPlacement = `${direction} ${align === 'end' ? 'bottom' : 'top'}` as Placement;
      break;
    case 'bottom':
    case 'top':
    default:
      initialPlacement = `${direction} ${align}` as Placement;
  }

  let isMobile = useIsMobileDevice();
  let menuContext = {
    ...menuProps,
    ref: menuRef,
    onClose: state.close,
    closeOnSelect,
    autoFocus: state.focusStrategy || true,
    UNSAFE_style: isMobile ? {
      width: '100%',
      maxHeight: 'inherit'
    } : undefined,
    UNSAFE_className: classNames(styles, {'spectrum-Menu-popover': !isMobile}),
    state
  };

  // Close when clicking outside the root menu when a submenu is open.
  let rootOverlayRef = useRef(null);
  let rootOverlayDomRef = unwrapDOMRef(rootOverlayRef);
  useInteractOutside({
    ref: rootOverlayDomRef,
    onInteractOutside: () => {
      state?.close();
    },
    isDisabled: !state.isOpen || state.expandedKeysStack.length === 0
  });

  // On small screen devices, the menu is rendered in a tray, otherwise a popover.
  let overlay;
  if (isMobile) {
    overlay = (
      <Tray state={state} isFixedHeight ref={rootOverlayRef}>
        {menu}
      </Tray>
    );
  } else {
    overlay = (
      <Popover
        ref={rootOverlayRef}
        UNSAFE_style={{clipPath: 'unset', overflow: 'visible', filter: 'unset', borderWidth: '0px'}}
        state={state}
        triggerRef={menuTriggerRef}
        scrollRef={menuRef}
        placement={initialPlacement}
        hideArrow
        shouldFlip={shouldFlip}>
        {menu}
      </Popover>
    );
  }

  return (
    <Fragment>
      <SlotProvider slots={{actionButton: {holdAffordance: trigger === 'longPress'}}}>
        <PressResponder {...menuTriggerProps} ref={menuTriggerRef} isPressed={state.isOpen}>
          {menuTrigger}
        </PressResponder>
      </SlotProvider>
      <MenuContext.Provider value={menuContext}>
        {overlay}
      </MenuContext.Provider>
    </Fragment>
  );
});
