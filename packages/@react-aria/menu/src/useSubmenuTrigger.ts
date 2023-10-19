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
import {RefObject, useCallback, useRef} from 'react';
import type {SubmenuTriggerState} from '@react-stately/menu';
import {useEffectEvent, useId, useLayoutEffect} from '@react-aria/utils';
import {useLocale} from '@react-aria/i18n';

export interface AriaSubmenuTriggerProps {
  /** An object representing the submenu trigger menu item. Contains all the relevant information that makes up the menu item. */
  node: RSNode<unknown>,
  /** Whether the submenu trigger is disabled. */
  isDisabled?: boolean,
  // TODO: naming. Also talk about if this should be customizable in this hook or if it belongs somewhere else
  /** Type of the submenu being rendered. */
  submenuType?: 'dialog' | 'menu',
  /** Ref of the menu that contains the submenu trigger. */
  parentMenuRef: RefObject<HTMLDivElement>,
  /** Ref of the submenu opened by the submenu trigger. */
  submenuRef: RefObject<HTMLDivElement>
}

interface SubmenuTriggerProps extends AriaMenuItemProps {
  /** Whether the submenu trigger is in an expanded state. */
  isOpen: boolean
}

interface SubmenuProps<T> extends AriaMenuOptions<T> {
  /** The level of the submenu. */
  level: number
}

export interface SubmenuTriggerAria<T> {
  /** Props for the submenu trigger menu item. */
  submenuTriggerProps: SubmenuTriggerProps,
  /** Props for the submenu controlled by the submenu trigger menu item. */
  submenuProps: SubmenuProps<T>,
  /** Props for the submenu's popover container. */
  popoverProps: Pick<AriaPopoverProps, 'isNonModal'>,
  /** Props for the submenu's popover overlay container. */
  overlayProps: {
    // TODO add descriptions when I try to get rid of onExit and stuff
    onExit: () => void,
    disableFocusManagement: boolean,
    shouldCloseOnInteractOutside: (element: Element) => boolean
  }
}

// TODO: debatable if we should have a useSubmenu hook for the submenu keyboard handlers. Feels better to have it here so we don't need to ferry around
// things like parentMenuRef and the open timeout canceling since we centralized them here

/**
 * Provides the behavior and accessbility implementation for a submenu trigger and its associated submenu.
 * @param props - Props for the submenu trigger and refs attach to its submenu and parent menu.
 * @param state - State for the submenu trigger.
 * @param ref - Ref to the submenu trigger element.
 */
export function UNSTABLE_useSubmenuTrigger<T>(props: AriaSubmenuTriggerProps, state: SubmenuTriggerState, ref: RefObject<FocusableElement>): SubmenuTriggerAria<T> {
  let {parentMenuRef, submenuRef, submenuType = 'menu', isDisabled, node} = props;
  let submenuTriggerId = useId();
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

  let onSubmenuClose = useEffectEvent(() => {
    cancelOpenTimeout();
    state.close();
  });

  useLayoutEffect(() => {
    return () => {
      cancelOpenTimeout();
    };
  }, [cancelOpenTimeout]);


  // TODO: problem with setting up the submenu close handlers here is that we don't get access to the onClose the user provides
  // to the menu since this is too far up . Maybe just provide the submenuTriggerState and have useMenu and useMenuItem handle the key handlers internally?
  // Maybe we should just have the user pass something like onMenuClose to the trigger level since we have the same problem of being unable to call onClose if the user interacts outside?
  // Maybe have Menu call onClose in an effect when it detects that it is unmounting? StrictMode is problematic since the cleanup fires even when the component isn't actually unmounting
  // (not a problem if we wanna keep onClose to fire only if the user selects a item)
  let submenuKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        if (direction === 'ltr') {
          onSubmenuClose();
        }
        break;
      case 'ArrowRight':
        if (direction === 'rtl') {
          onSubmenuClose();
        }
        break;
      case 'Escape':
        state.closeAll();
        break;
    }
  };

  let submenuProps = {
    id: overlayId,
    'aria-label': node.textValue,
    level: state.level,
    ...(submenuType === 'menu' && {
      onClose: state.closeAll,
      autoFocus: state.focusStrategy,
      onKeyDown: submenuKeyDown
    })
  };

  let submenuTriggerKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowRight':
        if (!isDisabled) {
          if (direction === 'ltr') {
            if (submenuType === 'menu' && !!submenuRef?.current && document.activeElement === ref?.current) {
              submenuRef.current.focus();
            } else {
              onSubmenuOpen('first');
            }
          } else if (state.isOpen) {
            e.stopPropagation();
            onSubmenuClose();
          }
        }

        break;
      case 'ArrowLeft':
        if (!isDisabled) {
          if (direction === 'rtl') {
            if (submenuType === 'menu' && !!submenuRef?.current && document.activeElement === ref?.current) {
              submenuRef.current.focus();
            } else {
              onSubmenuOpen('first');
            }
          } else if (state.isOpen) {
            e.stopPropagation();
            onSubmenuClose();
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
      onSubmenuClose();
    }
  };

  // TODO: Track the external element being interacted with so that we can move focus to it when the submenu closes. If we don't manually move focus, then focus gets lost to the body
  // Calling ref.current.focus in useMenuItem's onHoverStart doesn't seem to move focus properly unfortunately
  let closeTarget = useRef(null);
  let shouldCloseOnInteractOutside = (target) => {
    if (target !== ref.current) {
      closeTarget.current = target;
      return true;
    }

    return false;
  };

  // TODO: this onExit is Spectrum specific, so kinda weird to have in the aria hook. However, perhaps it would be nice if the aria Popover has onExit as well so
  // users wouldn't need to reimplement this?
  let onExit = () => {
    // TODO: A bit awkward, but this first part of the if statement handles moving focus to the item the user hovers, specifically if said item is a menu item
    // in one of the menu ancestors of the currently open submenu. The ideal logic would be to check if the closeTarget was in any of the menus in the tree and do nothing if so. Technically
    // the else if part of this handles this already since hovering a submenu item sets it as the focusedKey and then focusing the submenu itself will move focus to the focusedKey via useSelectableCollection,
    // but it breaks if the user hovers the base menu's first submenu trigger since then the first submenu won't actually close
    // due to the logic in shouldCloseOnInteractOutside, and thus the first submenu retains focus, overriding the hover focus of the root menu's submenu trigger
    if (closeTarget.current) {
      closeTarget.current?.focus();
      closeTarget.current = null;
    } else if (!parentMenuRef.current.contains(document.activeElement)) {
      // need to return focus to the trigger because hitting Esc causes focus to go to the subdialog, which is then unmounted
      // this leads to blur never being fired nor focus on the body
      parentMenuRef.current.focus();
    }

    cancelOpenTimeout();
  };

  return {
    submenuTriggerProps: {
      id: submenuTriggerId,
      'aria-controls': state.isOpen ? overlayId : null,
      'aria-haspopup': !isDisabled ? submenuType : null,
      'aria-expanded': state.isOpen ? 'true' : 'false',
      onPressStart,
      onPress,
      onHoverChange,
      onKeyDown: submenuTriggerKeyDown,
      onBlur,
      isOpen: state.isOpen
    },
    submenuProps,
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
