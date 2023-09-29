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
import {FocusableElement, FocusStrategy, KeyboardEvent, PressEvent, Node as RSNode} from '@react-types/shared';
import {getFocusableTreeWalker} from '@react-aria/focus';
import {RefObject, useCallback, useRef} from 'react';
import type {SubMenuTriggerState} from '@react-stately/menu';
import {useEffectEvent, useId, useLayoutEffect} from '@react-aria/utils';
import {useLocale} from '@react-aria/i18n';

export interface AriaSubMenuTriggerProps {
  /** An object representing the submenu trigger menu item. Contains all the relevant information that makes up the menu item. */
  node: RSNode<unknown>,
  /** Whether the submenu trigger is disabled. */
  isDisabled?: boolean,
  // TODO: naming. Also talk about if this should be customizable in this hook or if it belongs somewhere else
  /** Type of the submenu being rendered. */
  subMenuType?: 'dialog' | 'menu',
  /** Ref of the menu that contains the submenu trigger. */
  parentMenuRef: RefObject<HTMLElement>,
  /** Ref of the submenu opened by the submenu trigger. */
  subMenuRef: RefObject<HTMLElement>,
  /** Ref of the root menu's trigger element.  */
  rootMenuTriggerRef: RefObject<HTMLElement>
}

interface SubMenuTriggerProps extends AriaMenuItemProps {
  /** Whether the submenu trigger is in an expanded state. */
  isOpen: boolean
}

interface SubMenuProps<T> extends AriaMenuOptions<T> {
  /** The level of the submenu. */
  level: number
}

export interface SubMenuTriggerAria<T> {
  /** Props for the submenu trigger menu item. */
  subMenuTriggerProps: SubMenuTriggerProps,
  /** Props for the submenu controlled by the submenu trigger menu item. */
  subMenuProps: SubMenuProps<T>,
  /** Props for the submenu's popover container. */
  popoverProps: Pick<AriaPopoverProps, 'isNonModal'>,
  /** Props for the submenu's popover overlay container. */
  overlayProps: {
    // TODO add descriptions when I try to get rid of onExit and stuff
    disableFocusManagement: boolean,
    shouldCloseOnInteractOutside: (element: Element) => boolean
  }
}

// TODO: debatable if we should have a useSubMenu hook for the submenu keyboard handlers. Feels better to have it here so we don't need to ferry around
// things like parentMenuRef and the open timeout canceling since we centralized them here

/**
 * Provides the behavior and accessbility implementation for a submenu trigger and its associated submenu.
 * @param props - Props for the submenu trigger and refs attach to its submenu and parent menu.
 * @param state - State for the submenu trigger.
 * @param ref - Ref to the submenu trigger element.
 */
export function UNSTABLE_useSubMenuTrigger<T>(props: AriaSubMenuTriggerProps, state: SubMenuTriggerState, ref: RefObject<FocusableElement>): SubMenuTriggerAria<T> {
  let {parentMenuRef, subMenuRef, rootMenuTriggerRef, subMenuType = 'menu', isDisabled, node} = props;
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
  // Maybe have Menu call onClose in an effect when it detects that it is unmounting? StrictMode is problematic since the cleanup fires even when the component isn't actually unmounting
  // (not a problem if we wanna keep onClose to fire only if the user selects a item)

  let focusNext = (e) => {
    let walker = getFocusableTreeWalker(document.body, {tabbable: true});
    walker.currentNode = rootMenuTriggerRef.current;
    let nextElement = (e.shiftKey ? walker.previousNode() : walker.nextNode()) as FocusableElement;
    // TODO this feels pretty gross, but I want to close all menus and focus the previous/next focusable element adjacent to the root menu trigger button
    // The current solution relies on a delayed focus call so FocusScope/useSelectableCollection's focus handling/tab .focus() call doesn't get in the way
    // However it doesn't quite work for ContextualTriggerDialog for unavailable menu items, specifically shift tab
    // Making the root menu contain focus messes up the behavior even further...
    // We could have Tab do nothing in a menu, but that feels like a departure from the accessibility menu pattern
    requestAnimationFrame(() =>  nextElement.focus());
    // nextElement.focus();
  };
  let subMenuKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        if (direction === 'ltr') {
          onSubMenuClose();
        }
        break;
      case 'ArrowRight':
        if (direction === 'rtl') {
          onSubMenuClose();
        }
        break;
      case 'Escape':
        state.closeAll();
        break;
      case 'Tab':
        console.log('tab in usesubmenu keydown', e.isPropagationStopped())
        state.closeAll();
        focusNext(e);
        break;
    }
  };

  let subMenuProps = {
    id: overlayId,
    'aria-label': node.textValue,
    level: state.level,
    ...(subMenuType === 'menu' && {
      onClose: state.closeAll,
      autoFocus: state.focusStrategy,
      onKeyDown: subMenuKeyDown
    })
  };

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
            onSubmenuOpen();
          }, 200);
        }
      } else if (!isHovered) {
        cancelOpenTimeout();
      }
    }
  };

  let onBlur = (e) => {
    // TODO: getting rid of the (!isElementInChildOfActiveScope(e.relatedTarget) part of the check below fixes hovering to open a root unavailable menu item when focus is on a submenu
    // but breaks the case where the user is hovering over a submenu's submenu trigger child item and then hovers a root menu item (eg hover lvl 1 item 2 -> hover lvl 2 item 3 -> hover lvl 1 item 3)
    // Ideally we'd be able to track the full menu tree and then check if focus has moved to an element that isn't part of the current submenu tree and close it then
    if (state.isOpen && parentMenuRef.current.contains(e.relatedTarget)) {
      onSubMenuClose();
    }
  };

  let shouldCloseOnInteractOutside = (target) => {
    if (target !== ref.current) {
      return true;
    }

    return false;
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
      onBlur,
      isOpen: state.isOpen
    },
    subMenuProps,
    popoverProps: {
      isNonModal: true
    },
    overlayProps: {
      disableFocusManagement: true,
      shouldCloseOnInteractOutside
    }
  };
}
