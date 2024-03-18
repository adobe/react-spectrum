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
import {DOMProps} from '@react-types/shared';
import {onCloseMap} from './useCloseOnScroll';
import {OverlayTriggerState} from '@react-stately/overlays';
import {RefObject, useEffect} from 'react';
import {useId} from '@react-aria/utils';

export interface OverlayTriggerProps {
  /** Type of overlay that is opened by the trigger. */
  type: 'dialog' | 'menu' | 'listbox' | 'tree' | 'grid'
}

export interface OverlayTriggerAria {
  /** Props for the trigger element. */
  triggerProps: AriaButtonProps,

  /** Props for the overlay container element. */
  overlayProps: DOMProps
}

/**
 * Handles the behavior and accessibility for an overlay trigger, e.g. a button
 * that opens a popover, menu, or other overlay that is positioned relative to the trigger.
 */
export function useOverlayTrigger(props: OverlayTriggerProps, state: OverlayTriggerState, ref?: RefObject<Element>): OverlayTriggerAria {
  let {type} = props;
  let {isOpen} = state;

  // Backward compatibility. Share state close function with useOverlayPosition so it can close on scroll
  // without forcing users to pass onClose.
  useEffect(() => {
    if (ref && ref.current) {
      onCloseMap.set(ref.current, state.close);
    }
  });

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
      'aria-controls': isOpen ? overlayId : null,
      onPress: state.toggle
    },
    overlayProps: {
      id: overlayId
    }
  };
}
