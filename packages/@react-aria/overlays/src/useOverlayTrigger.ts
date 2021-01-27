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

import {AriaButtonProps} from '@react-types/button';
import {HTMLAttributes, RefObject, useEffect} from 'react';
import {onCloseMap} from './useCloseOnScroll';
import {OverlayTriggerState} from '@react-stately/overlays';
import {useId} from '@react-aria/utils';
import {visibleOverlays} from './useOverlay';

interface OverlayTriggerProps {
  /** Type of overlay that is opened by the trigger. */
  type: 'dialog' | 'menu' | 'listbox' | 'tree' | 'grid'
}

interface OverlayTriggerAria {
  /** Props for the trigger element. */
  triggerProps: AriaButtonProps,

  /** Props for the overlay container element. */
  overlayProps: HTMLAttributes<HTMLElement>
}

/**
 * Handles the behavior and accessibility for an overlay trigger, e.g. a button
 * that opens a popover, menu, or other overlay that is positioned relative to the trigger.
 */
export function useOverlayTrigger(props: OverlayTriggerProps, state: OverlayTriggerState, ref: RefObject<HTMLElement>): OverlayTriggerAria {
  let {type} = props;
  let {isOpen} = state;

  // Backward compatibility. Share state close function with useOverlayPosition so it can close on scroll
  // without forcing users to pass onClose.
  useEffect(() => {
    if (ref.current) {
      onCloseMap.set(ref.current, state.close);
    }
  });

  useEffect(() => {
    if (isOpen === true && visibleOverlays.length > 1) {
      // The last overlay is the one just opened.
      // If we have two overlays open, then we need to determine if we're nested or not.
      // Start from top of the stack (minus the one we just opened) and close it if it doesn't
      // contain the trigger that opened the most recent overlay.
      // Do this until we find one that does contain it or close everything.
      let i = visibleOverlays.length - 2;
      do {
        let {ref: overlayRef, onClose} = visibleOverlays[i];
        if (!overlayRef.current.contains(ref.current)) {
          onClose();
        } else {
          break;
        }
        i--;
      } while (i >= 0);
    }
  }, [isOpen]);

  // Aria 1.1 supports multiple values for aria-haspopup other than just menus.
  // https://www.w3.org/TR/wai-aria-1.1/#aria-haspopup
  // However, we only add it for menus for now because screen readers often
  // announce it as a menu even for other values.
  let ariaHasPopup = undefined;
  if (type === 'menu') {
    ariaHasPopup = true;
  } else if (type === 'listbox') {
    ariaHasPopup = 'listbox';
  }

  let overlayId = useId();
  return {
    triggerProps: {
      'aria-haspopup': ariaHasPopup,
      'aria-expanded': isOpen,
      'aria-controls': isOpen ? overlayId : null
    },
    overlayProps: {
      id: overlayId
    }
  };
}
