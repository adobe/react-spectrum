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

import {addEvent, getOwnerDocument} from '../utils/domHelpers';
import {AriaButtonProps} from '../button/useButton';
import {DOMProps, FocusableElement, RefObject} from '@react-types/shared';
import {focusSafely} from '../interactions/focusSafely';
import {getEventTarget, nodeContains} from '../utils/shadowdom/DOMFunctions';
import {onCloseMap} from './useCloseOnScroll';
import {OverlayTriggerState} from 'react-stately/useOverlayTriggerState';
import {useEffect, useRef} from 'react';
import {useEffectEvent} from '../utils/useEffectEvent';
import {useId} from '../utils/useId';

export interface OverlayTriggerProps {
  /** Type of overlay that is opened by the trigger. */
  type: 'dialog' | 'menu' | 'listbox' | 'tree' | 'grid';
}

export interface OverlayTriggerAria {
  /** Props for the trigger element. */
  triggerProps: AriaButtonProps;

  /** Props for the overlay container element. */
  overlayProps: DOMProps;
}

/**
 * Handles the behavior and accessibility for an overlay trigger, e.g. a button
 * that opens a popover, menu, or other overlay that is positioned relative to the trigger.
 */
export function useOverlayTrigger(
  props: OverlayTriggerProps,
  state: OverlayTriggerState,
  ref?: RefObject<Element | null>
): OverlayTriggerAria {
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
  let ariaHasPopup: undefined | boolean | 'listbox' = undefined;
  if (type === 'menu') {
    ariaHasPopup = true;
  } else if (type === 'listbox') {
    ariaHasPopup = 'listbox';
  }

  let overlayId = useId();
  let overlayRef = useRef<Element | null>(null);

  // An overlay that opened while nothing was focused (e.g. open at mount) has its
  // FocusScope restore focus to the body. Redirect that restoration to the trigger.
  let onRestoreFocus = useEffectEvent((e: Event) => {
    if (!(e instanceof CustomEvent) || e.defaultPrevented) {
      return;
    }

    let target = getEventTarget(e) as Element;
    let scope: Element[] = e.detail?.scope ?? [];

    let isBodyTarget = target === target.ownerDocument.body;
    let isOverlayScope = scope.some(node => nodeContains(node, overlayRef.current));

    if (isBodyTarget && isOverlayScope && ref?.current?.isConnected) {
      e.preventDefault();
      focusSafely(ref.current as FocusableElement);
    }
  });

  useEffect(() => {
    if (isOpen && ref?.current) {
      let ownerDocument = getOwnerDocument(ref.current);
      overlayRef.current = ownerDocument.getElementById(overlayId);
    }
  }, [isOpen, overlayId, ref]);

  useEffect(() => {
    if (ref?.current) {
      let ownerDocument = getOwnerDocument(ref.current);
      return addEvent(ownerDocument, 'react-aria-focus-scope-restore', onRestoreFocus);
    }
  }, [ref]);

  return {
    triggerProps: {
      'aria-haspopup': ariaHasPopup,
      'aria-expanded': isOpen,
      'aria-controls': isOpen ? overlayId : undefined,
      onPress: state.toggle
    },
    overlayProps: {
      id: overlayId
    }
  };
}
