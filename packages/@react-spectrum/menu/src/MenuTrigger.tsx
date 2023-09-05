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

import {classNames, SlotProvider, useDOMRef, useIsMobileDevice} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import {MenuContext} from './context';
import {Placement} from '@react-types/overlays';
import {Popover, Tray} from '@react-spectrum/overlays';
import {PressResponder} from '@react-aria/interactions';
import React, {forwardRef, Fragment, useCallback, useRef} from 'react';
import {SpectrumMenuTriggerProps} from '@react-types/menu';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {useMenuTrigger} from '@react-aria/menu';
import {useMenuTriggerState} from '@react-stately/menu';

function MenuTrigger(props: SpectrumMenuTriggerProps, ref: DOMRef<HTMLElement>) {
  let triggerRef = useRef<HTMLElement>();
  let domRef = useDOMRef(ref);
  let menuTriggerRef = domRef || triggerRef;
  let menuRef = useRef<HTMLUListElement>();
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


  // TODO: block for eventual useMenuState
  // Should we include the open state of the root menu in it? That means we will need to tie the
  // root menu's open state to this expandedKeysStack, meaning we'd have to toggle the menuTrigger state when the
  // stack is wiped. Perhaps we have the key stack just track the submenu expanded keys and have closeAll also call state.close for the root

  // TODO: Problem is that clicking outside of the all the menu's doesn't wipe the expandedKeysStack. Perhaps handle this in useSubMenutrigger
  // and wipe it if the submenutrigger has unmounted?
  let [expandedKeysStack, setExpandedKeysStack] = React.useState<string[]>([]);
  let closeAll = useCallback(() => {
    console.log('calling close all')
    setExpandedKeysStack([]);
    state.close();
  }, [setExpandedKeysStack, state]);
  let openSubMenu = useCallback((triggerKey, level) => {
    console.log('calling open submenu', triggerKey, level);
    setExpandedKeysStack(oldStack => [...oldStack.slice(0, level), triggerKey]);
  }, [setExpandedKeysStack]);
  let closeSubMenu = useCallback((triggerKey, level) => {
    console.log('calling close submenu', triggerKey, level);
    setExpandedKeysStack(oldStack => {
      let key = oldStack[level - 1];
      console.log('key', key, oldStack, oldStack.slice(0, level - 1));
      if (key === triggerKey) {
        console.log('inreturn', oldStack.slice(0, level - 1))
        return oldStack.slice(0, level - 1);
      } else {
        return oldStack;
      }
    });
  }, [setExpandedKeysStack]);

  let menuTreeState = {
    expandedKeysStack,
    setExpandedKeysStack,
    closeAll,
    openSubMenu,
    closeSubMenu
  };
  // End block


  let menuContext = {
    ...menuProps,
    state,
    ref: menuRef,
    onClose: state.close,
    closeOnSelect,
    autoFocus: state.focusStrategy || true,
    UNSAFE_style: isMobile ? {
      width: '100%',
      maxHeight: 'inherit'
    } : undefined,
    UNSAFE_className: classNames(styles, {'spectrum-Menu-popover': !isMobile}),
    menuTreeState
  };

  // On small screen devices, the menu is rendered in a tray, otherwise a popover.
  let overlay;
  if (isMobile) {
    overlay = (
      <Tray state={state}>
        {menu}
      </Tray>
    );
  } else {
    overlay = (
      <Popover
        UNSAFE_style={{clipPath: 'unset'}}
        state={state}
        triggerRef={menuTriggerRef}
        scrollRef={menuRef}
        placement={initialPlacement}
        hideArrow
        isMenu
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
}

/**
 * The MenuTrigger serves as a wrapper around a Menu and its associated trigger,
 * linking the Menu's open state with the trigger's press state.
 */
let _MenuTrigger = forwardRef(MenuTrigger);
export {_MenuTrigger as MenuTrigger};
