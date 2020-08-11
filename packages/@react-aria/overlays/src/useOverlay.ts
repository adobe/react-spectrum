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

import {HTMLAttributes, RefObject, SyntheticEvent, useEffect} from 'react';
import {useFocusWithin, useInteractOutside} from '@react-aria/interactions';

interface OverlayProps {
  /** Whether the overlay is currently open. */
  isOpen?: boolean,

  /** Handler that is called when the overlay should close. */
  onClose?: () => void,

  /**
   * Whether to close the overlay when the user interacts outside it.
   * @default false
   */
  isDismissable?: boolean,

  /** Whether the overlay should close when focus is lost or moves outside it. */
  shouldCloseOnBlur?: boolean,

  /** 
   * Whether pressing the escape key to close the overlay should be disabled. 
   * @default false
   */
  isKeyboardDismissDisabled?: boolean,

  /**
   * When user interacts with the argument element outside of the overlay ref,
   * return true if onClose should be called.  This gives you a chance to filter
   * out interaction with elements that should not dismiss the overlay.  
   * By default, onClose will always be called on interaction outside the overlay ref.
   */
  shouldCloseOnInteractOutside?: (element: HTMLElement) => boolean
}

interface OverlayAria {
  /** Props to apply to the overlay container element. */
  overlayProps: HTMLAttributes<HTMLElement>
}

const visibleOverlays: RefObject<HTMLElement>[] = [];

/**
 * Provides the behavior for overlays such as dialogs, popovers, and menus.
 * Hides the overlay when the user interacts outside it, when the Escape key is pressed,
 * or optionally, on blur. Only the top-most overlay will close at once.
 */
export function useOverlay(props: OverlayProps, ref: RefObject<HTMLElement>): OverlayAria {
  let {onClose, shouldCloseOnBlur, isOpen, isDismissable = false, isKeyboardDismissDisabled = false, shouldCloseOnInteractOutside} = props;

  // Add the overlay ref to the stack of visible overlays on mount, and remove on unmount.
  useEffect(() => {
    if (isOpen) {
      visibleOverlays.push(ref);
    }

    return () => {
      let index = visibleOverlays.indexOf(ref);
      if (index >= 0) {
        visibleOverlays.splice(index, 1);
      }
    };
  }, [isOpen, ref]);

  // Only hide the overlay when it is the topmost visible overlay in the stack.
  let onHide = () => {
    if (visibleOverlays[visibleOverlays.length - 1] === ref && onClose) {
      onClose();
    }
  };

  let onInteractOutside = (e: SyntheticEvent<HTMLElement>) => {
    if (!shouldCloseOnInteractOutside || shouldCloseOnInteractOutside(e.target as HTMLElement)) {
      onHide();
    }
  };

  // Handle the escape key
  let onKeyDown = (e) => {
    if (e.key === 'Escape' && !isKeyboardDismissDisabled) {
      e.preventDefault();
      onHide();
    }
  };

  // Handle clicking outside the overlay to close it
  useInteractOutside({ref, onInteractOutside: isDismissable ? onInteractOutside : null});

  let {focusWithinProps} = useFocusWithin({
    isDisabled: !shouldCloseOnBlur,
    onBlurWithin: (e) => {
      if (!shouldCloseOnInteractOutside || shouldCloseOnInteractOutside(e.relatedTarget as HTMLElement)) {
        onClose();
      }
    }
  });

  return {
    overlayProps: {
      onKeyDown,
      ...focusWithinProps
    }
  };
}
