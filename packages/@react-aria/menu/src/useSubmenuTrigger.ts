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
import {useSafelyMouseToSubmenu} from './useSafelyMouseToSubmenu';

export interface AriaSubmenuTriggerProps {
  /** An object representing the submenu trigger menu item. Contains all the relevant information that makes up the menu item. */
  node: RSNode<unknown>,
  /** Whether the submenu trigger is disabled. */
  isDisabled?: boolean,
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
    /** Whether the overlay should manage restoring and containing focus. */
    disableFocusManagement: boolean,
    /** Callback called to determine if the overlay should be closed when the user interacts with a element outside. */
    shouldCloseOnInteractOutside: (element: Element) => boolean
  }
}

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

  let submenuKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        if (direction === 'ltr') {
          e.stopPropagation();
          onSubmenuClose();
          ref.current.focus();
        }
        break;
      case 'ArrowRight':
        if (direction === 'rtl') {
          e.stopPropagation();
          onSubmenuClose();
          ref.current.focus();
        }
        break;
      case 'Escape':
        e.stopPropagation();
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
    if (state.isOpen && parentMenuRef.current.contains(e.relatedTarget)) {
      onSubmenuClose();
    }
  };

  let shouldCloseOnInteractOutside = (target) => {
    if (target !== ref.current) {
      return true;
    }

    return false;
  };

  useSafelyMouseToSubmenu({menuRef: parentMenuRef, submenuRef, isOpen: state.isOpen});

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
      disableFocusManagement: true,
      shouldCloseOnInteractOutside
    }
  };
}
