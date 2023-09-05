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

import {classNames, useIsMobileDevice} from '@react-spectrum/utils';
import {MenuContext, MenuDialogContext, useMenuStateContext} from './context';
import {Popover, Tray} from '@react-spectrum/overlays';
import React, {Key, ReactElement, useCallback, useEffect, useMemo, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {useMenuTrigger} from '@react-aria/menu';
import {useMenuTriggerState} from '@react-stately/menu';
import {useOverlayTriggerState} from '@react-stately/overlays';
import {FocusStrategy, PressEvent} from '@react-types/shared';
import {useLocale} from '@react-aria/i18n';
import {useEffectEvent, useId, useLayoutEffect} from '@react-aria/utils';
import {useKeyboard} from '@react-aria/interactions';

// TODO: Add shouldFlip and closeOnSelect if we feel like those should be customizable for SubMenuTrigger
// Other MenuTriggerProps like onOpenChange and positioning stuff have been removed as per discussion
interface SubMenuTriggerProps {
  /**
   * The contents of the SubMenuTrigger - a Item and a Menu.
   */
  children: ReactElement[],
  targetKey: Key
}

export interface SpectrumSubMenuTriggerProps extends Omit<SubMenuTriggerProps, 'targetKey'> {}
// TODO: Think about if it should reuse the same state MenuTrigger uses or use its own
// How to control it so that only one submenu can be open at once. At the moment we actually handle this via useMenuItem since it calls setExpandedKey with a single key on open
// and we don't allow isOpen/defaultOpen on SubMenus

// TODO: got rid of user provided ref support since it doesn't really make sense for submenus IMO
function SubMenuTrigger(props: SubMenuTriggerProps) {
  let triggerRef = useRef<HTMLLIElement>();
  let menuRef = useRef<HTMLUListElement>();
  let {
    children,
    targetKey
  } = props;

  let [menuTrigger, menu] = React.Children.toArray(children);

  let {container, menu: parentMenu, menuTreeState} = useMenuStateContext();
  // TODO: block for useSubMenuTriggerState? Takes targetKey and menuTreeState
  // Need some form of isOpen and close for usePopover. Will also need closeAll for onClose for menu items, would be kinda weird
  // to pass in both menuTreeState and the state returned by useSubMenuTriggerState.
  // WOuld it be helpful returning level as well?
  let {expandedKeysStack, openSubMenu, closeSubMenu, closeAll} = menuTreeState;
  let [level] = React.useState(expandedKeysStack?.length + 1);
  console.log('expanded', expandedKeysStack)
  let isOpen = expandedKeysStack[level - 1] === targetKey;
  let [focusStrategy, setFocusStrategy] = React.useState<FocusStrategy>(null);
  // TODO: new instance is made since useMenuTriggerState returns a new isntance thus menuTreeState has a new instance every time
  // need to fix
  let subMenuTriggerState = useMemo(() => ({
    focusStrategy,
    isOpen,
    open(focusStrategy: FocusStrategy = null) {
      setFocusStrategy(focusStrategy);
      openSubMenu(targetKey, level);
    },
    close() {
      setFocusStrategy(null);
      closeSubMenu(targetKey, level);
    },
    closeAll,
    // TODO: add setOpen and toggle for type parity with useOverlayTriggerState type that Tray and Popover expect. Perhaps call useOverlayTriggerState in
    // this hook and just make it controlled? Then spread?
    setOpen: () => {},
    toggle(focusStrategy: FocusStrategy = null) {
      setFocusStrategy(focusStrategy);
      if (isOpen) {
        closeSubMenu(targetKey, level);
      } else {
        openSubMenu(targetKey, level);
      }
    }
  }), [isOpen, closeAll, closeSubMenu, openSubMenu, focusStrategy, setFocusStrategy, level, targetKey]);

  // TODO: block for useSubMenuTrigger
  // needs aria properties, do later
  let subMenuTriggerId = useId();
  let overlayId = useId();
  let {direction} = useLocale();
  let openTimeout = useRef<ReturnType<typeof setTimeout> | undefined>();
  let cancelOpenTimeout = useCallback(() => {
    if (openTimeout.current) {
      clearTimeout(openTimeout.current);
      openTimeout.current = undefined;
    }
  }, [openTimeout]);

  let onSubmenuOpen = useEffectEvent((focusStrategy?: FocusStrategy) => {
    cancelOpenTimeout();
    subMenuTriggerState.open(focusStrategy);
  });

  let onSubMenuClose = useEffectEvent(() => {
    cancelOpenTimeout();
    subMenuTriggerState.close();
  });

  useLayoutEffect(() => {
    return () => {
      cancelOpenTimeout();
    };
  }, [cancelOpenTimeout]);


  // TODO: problem with setting up the submenu close handlers here is that we don't get access to the onClose the user provides
  // to the menu since this is too far up. Maybe just provide the subMenuTriggerState and have useMenu and useMenuItem handle the key handlers internally?
  // For now just also provide a prop to subMenuProps called isSubMenu

  let {keyboardProps: subMenuKeyboardProps} = useKeyboard({
    onKeyDown: (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          if (direction === 'ltr') {
            onSubMenuClose();
          }
          break;
        case 'ArrowRight':
          if (direction === 'rtl') {
            onSubMenuClose;
          }
          break;
        case 'Escape':
          subMenuTriggerState.closeAll();
          break;
        default:
          e.continuePropagation();
          break;
      }
    }
  });

  // TODO: perhaps just make this onKeyDown and not use useKeyboard since we continuePropagation in both cases
  let {keyboardProps: subMenuTriggerKeyboardProps} = useKeyboard({
    onKeyDown: (e) => {
      switch (e.key) {
        case 'ArrowRight':
          if (direction === 'ltr') {
            onSubmenuOpen('first');
          }
          // fallthrough so useMenuItem keydown handlers are called
        case 'ArrowLeft':
          if (direction === 'rtl') {
            onSubmenuOpen('first');
          }
        default:
          e.continuePropagation();
          break;
      }
    }
  });


  let onExit = () => {
    // if focus was already moved back to a menu item, don't need to do anything
    if (!parentMenu.current.contains(document.activeElement)) {
      // need to return focus to the trigger because hitting Esc causes focus to go to the subdialog, which is then unmounted
      // this leads to blur never being fired nor focus on the body
      triggerRef.current.focus();
    }
  };

  // TODO: disabled state is determined in useMenuItem, make sure to merge the press handlers with the ones useMenuItem sets up
  let onPressStart = (e: PressEvent) => {
    if (e.pointerType === 'virtual' || e.pointerType === 'keyboard') {
      // If opened with a screen reader or keyboard, auto focus the first submenu item.
      onSubmenuOpen('first');
    }
  };

  let onPress = (e: PressEvent) => {
    if (e.pointerType === 'touch') {
      onSubmenuOpen();
    }
  };

  // TODO: need to fix this so that hovering back onto the submenu trigger doesn't actually close the submenu
  let onHoverChange = (isHovered) => {
    if (isHovered && !subMenuTriggerState.isOpen) {
      if (!openTimeout.current) {
        openTimeout.current = setTimeout(() => {
          // TODO: this should set autofocus to false so focus doesn't move into the next menu
          onSubmenuOpen();
        }, 200);
      }
    } else if (!isHovered) {
      cancelOpenTimeout();
    }
  };

  let subMenuTriggerProps = {
    id: subMenuTriggerId,
    'aria-controls': subMenuTriggerState.isOpen ? overlayId : null,
    'aria-haspopup': 'menu',
    'aria-expanded': isOpen ? 'true' : 'false',
    onPressStart,
    onPress,
    onHoverChange,
    ...subMenuTriggerKeyboardProps
  };

  let subMenuProps = {
    onClose: subMenuTriggerState.closeAll,
    isSubMenu: true,
    'aria-labelledby': subMenuTriggerId,
    autoFocus: subMenuTriggerState.focusStrategy || true,
    id: overlayId,
    ...subMenuKeyboardProps
  };

  let popoverProps = {
    onExit,
    isNonModal: true
  };

  let overlayProps = {
    disableFocusManagement: true
  };


  // End block





  let isMobile = useIsMobileDevice();
  let menuContext = {
    ...subMenuProps,
    ref: menuRef,
    UNSAFE_style: isMobile ? {
      width: '100%',
      maxHeight: 'inherit'
    } : undefined,
    UNSAFE_className: classNames(styles, {'spectrum-Menu-popover': !isMobile})
  };


  let overlay;
  // TODO: handle tray experience later
  if (isMobile) {
    overlay = (
      <Tray state={subMenuTriggerState}>
        {menu}
      </Tray>
    );
  } else {
    overlay = (
      <Popover
        // Props from ContextualHelpTrigger implementation
        {...popoverProps}
        {...overlayProps}
        // TODO Omitted onBlurWithin, doesn't seem like it was necessary?
        container={container.current}
        offset={-10}
        enableBothDismissButtons

        // Props from MenuTriggerImplementation
        UNSAFE_style={{clipPath: 'unset'}}
        state={subMenuTriggerState}
        triggerRef={triggerRef}
        scrollRef={menuRef}
        placement="end top"
        hideArrow>
        {menu}
      </Popover>
    );
  }

  return (
    <>
      {/* TODO rename MenuDialogContext to something more generic */}
      <MenuDialogContext.Provider value={{triggerRef, ...subMenuTriggerProps}}>{menuTrigger}</MenuDialogContext.Provider>
      <MenuContext.Provider value={menuContext}>
        {overlay}
      </MenuContext.Provider>
    </>
  );
}

SubMenuTrigger.getCollectionNode = function* (props: SpectrumSubMenuTriggerProps) {
  // React.Children.toArray mutates the Item's key which is problematic for user provided keys
  // TODO: perhaps make this same change in ContextualHelpTrigger too
  let childArray: ReactElement[] = [];
  React.Children.forEach(props.children, child => {
    if (React.isValidElement(child)) {
      childArray.push(child);
    }
  });
  let [trigger] = childArray;
  let [, content] = props.children as [ReactElement, ReactElement];

  yield {
    element: React.cloneElement(trigger, {...trigger.props, hasChildItems: true, isTrigger: true}),
    wrapper: (element) => (
      <SubMenuTrigger key={element.key} targetKey={element.key} {...props}>
        {element}
        {content}
      </SubMenuTrigger>
    )
  };
};

let _SubMenuTrigger = SubMenuTrigger as (props: SpectrumSubMenuTriggerProps) => JSX.Element;
export {_SubMenuTrigger as SubMenuTrigger};
