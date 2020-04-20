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

import {HTMLAttributes, RefObject, useEffect} from 'react';
import {useFocusWithin, useInteractOutside} from '@react-aria/interactions';

interface OverlayProps {
  /** A ref to the overlay container element. */
  ref: RefObject<HTMLElement | null>,

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
  shouldCloseOnBlur?: boolean
}

interface OverlayAria {
  /** Props to apply to the overlay container element */
  overlayProps: HTMLAttributes<HTMLElement>
}

const visibleOverlays: RefObject<HTMLElement>[] = [];

/**
 * Provides the behavior for overlays such as dialogs, popovers, and menus.
 * Handles hiding the overlay when the user interacts outside it (if `isDismissible`),
 * when the Escape key is pressed, or optionally, on blur. Handles multiple overlays 
 * open at once as a stack: only the top-most overlay will close at once.
 */
export function useOverlay(props: OverlayProps): OverlayAria {
  let {ref, onClose, shouldCloseOnBlur, isOpen, isDismissable = false} = props;

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

  // Handle the escape key
  let onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onHide();
    }
  };

  // Handle clicking outside the overlay to close it
  useInteractOutside({ref, onInteractOutside: isDismissable ? onHide : null});

  let {focusWithinProps} = useFocusWithin({
    isDisabled: !shouldCloseOnBlur,
    onBlurWithin: () => {
      onClose();
    }
  });

  return {
    overlayProps: {
      onKeyDown,
      ...focusWithinProps
    }
  };
}
