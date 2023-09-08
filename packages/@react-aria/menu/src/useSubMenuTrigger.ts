/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */


import {AriaMenuItemProps} from './useMenuItem';
import {AriaMenuOptions} from './useMenu';
import type {AriaPopoverProps} from '@react-aria/overlays';
import {FocusableElement, FocusStrategy, PressEvent} from '@react-types/shared';
import {isElementInChildOfActiveScope} from '@react-aria/focus';
import {RefObject, useCallback, useRef} from 'react';
import type {SubMenuTriggerState} from '@react-stately/menu';
import {useEffectEvent, useId, useLayoutEffect} from '@react-aria/utils';
import {useLocale} from '@react-aria/i18n';

export interface AriaSubMenuTriggerProps {
  /** Ref of the menu that contains the submenu trigger. */
  parentMenuRef: RefObject<HTMLElement>,
  /** Ref of the submenu opened by the submenu trigger. */
  subMenuRef: RefObject<HTMLElement>,
  // TODO: naming. Also talk about if this should be customizable in this hook or if it belongs somewhere else
  /** Type of the submenu being rendered. */
  subMenuType?: 'dialog' | 'menu',
  isDisabled?: boolean
}

export interface SubMenuTriggerAria<T> {
  subMenuTriggerProps: AriaMenuItemProps,
  subMenuProps: AriaMenuOptions<T>,
  popoverProps: Pick<AriaPopoverProps, 'isNonModal'>,
  // TODO: perhaps cherry pick these props from existing types, comes from several different types though
  overlayProps:
  {
    onExit: () => void,
    disableFocusManagement: boolean,
    shouldCloseOnInteractOutside: (element: Element) => boolean
  }
}

// TODO description
// TODO: needs UNSTABLE?
// TODO: debatable if we should have a useSubMenu hook for the submenu key handlers. Feels better to have it here so we don't need to ferry around
// things like parentMenu and the timeout canceling since those are available
export function useSubMenuTrigger<T>(props: AriaSubMenuTriggerProps, state: SubMenuTriggerState, ref: RefObject<FocusableElement>): SubMenuTriggerAria<T> {
  let {parentMenuRef, subMenuRef, subMenuType = 'menu', isDisabled} = props;
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
    state.open(focusStrategy);
  });

  let onSubMenuClose = useEffectEvent(() => {
    cancelOpenTimeout();
    state.close();
  });

  useLayoutEffect(() => {
    return () => {
      cancelOpenTimeout();
    };
  }, [cancelOpenTimeout]);


  // TODO: problem with setting up the submenu close handlers here is that we don't get access to the onClose the user provides
  // to the menu since this is too far up . Maybe just provide the subMenuTriggerState and have useMenu and useMenuItem handle the key handlers internally?
  // Maybe we should just have the user pass something like onMenuClose to the trigger level since we have the same problem of being unable to call onClose if the user interacts outside?
  // Maybe have Menu call onClose in an effect when it detects that it is unmounting?
  // (not a problem if we wanna keep onClose to fire only if the user selects a item)
  let subMenuKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        if (direction === 'ltr') {
          e.stopPropagation();
          // TODO: for issue where the arrow left is closing too many menus, maybe because the event is going through portals? Detect if event is happening from within the actual menu?
          onSubMenuClose();
        }
        break;
      case 'ArrowRight':
        if (direction === 'rtl') {
          e.stopPropagation();
          onSubMenuClose();
        }
        break;
      case 'Escape':
        e.stopPropagation();
        state.closeAll();
        break;
    }
  };

  let subMenuProps = {
    id: overlayId,
    'aria-labelledby': subMenuTriggerId,
    ...(subMenuType === 'menu' && {
      onClose: state.closeAll,
      // isSubMenu: true,
      autoFocus: state.focusStrategy,
      onKeyDown: subMenuKeyDown
    })
  };

  // TODO: perhaps just make this onKeyDown and not use useKeyboard since we continuePropagation in both cases
  // TODO maybe can also move focus to the submenu as well on ArrowLeft if
  let subMenuTriggerKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowRight':
        if (!isDisabled) {
          if (direction === 'ltr') {
            if (subMenuType === 'menu' && !!subMenuRef?.current && document.activeElement === ref?.current) {
              subMenuRef.current.focus();
            } else {
              onSubmenuOpen('first');
            }
          } else if (state.isOpen) {
            e.stopPropagation();
            onSubMenuClose();
          }
        }

        break;
      case 'ArrowLeft':
        if (!isDisabled) {
          if (direction === 'rtl') {
            if (subMenuType === 'menu' && !!subMenuRef?.current && document.activeElement === ref?.current) {
              subMenuRef.current.focus();
            } else {
              onSubmenuOpen('first');
            }
          } else if (state.isOpen) {
            e.stopPropagation();
            onSubMenuClose();
          }
        }
        break;
    }
  };

  // TODO: disabled state is determined in useMenuItem, make sure to merge the press handlers with the ones useMenuItem sets up
  // Actually, still check for isDisabled for cases like non isUnavaiable ContextualHelpTriggers which won't make the menu item disabled
  // just stop the sub menu from opening
  let onPressStart = (e: PressEvent) => {
    if (!isDisabled && (e.pointerType === 'virtual' || e.pointerType === 'keyboard')) {
      // If opened with a screen reader or keyboard, auto focus the first submenu item.
      onSubmenuOpen('first');
    }
  };

  let onPress = (e: PressEvent) => {
    if (!isDisabled && e.pointerType === 'touch') {
      onSubmenuOpen();
    }
  };

  let onHoverChange = (isHovered) => {
    if (!isDisabled) {
      if (isHovered && !state.isOpen) {
        if (!openTimeout.current) {
          openTimeout.current = setTimeout(() => {
            // TODO: this should set autofocus to false so focus doesn't move into the next menu
            onSubmenuOpen();
          }, 200);
        }
      } else if (!isHovered) {
        cancelOpenTimeout();
      }
    }
  };

  let onBlur = (e) => {
    if (state.isOpen && (!isElementInChildOfActiveScope(e.relatedTarget) || parentMenuRef.current.contains(e.relatedTarget))) {
      onSubMenuClose();
    }
  };

  let onExit = () => {
    // if focus was already moved back to a menu item, don't need to do anything
    if (!parentMenuRef.current.contains(document.activeElement)) {
      // need to return focus to the trigger because hitting Esc causes focus to go to the subdialog, which is then unmounted
      // this leads to blur never being fired nor focus on the body
      ref.current.focus();
    }
    cancelOpenTimeout();
  };

  let shouldCloseOnInteractOutside = (target) => {
    return target !== ref.current;
  };

  return {
    subMenuTriggerProps: {
      id: subMenuTriggerId,
      'aria-controls': state.isOpen ? overlayId : null,
      'aria-haspopup': !isDisabled ? subMenuType : null,
      'aria-expanded': state.isOpen ? 'true' : 'false',
      onPressStart,
      onPress,
      onHoverChange,
      onKeyDown: subMenuTriggerKeyDown,
      onBlur
    },
    subMenuProps,
    popoverProps: {
      isNonModal: true
    },
    overlayProps: {
      onExit,
      disableFocusManagement: true,
      shouldCloseOnInteractOutside
    }
  };
}
