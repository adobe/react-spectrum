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

import {DOMAttributes, RefObject} from '@react-types/shared';
import {getEventTarget} from '../utils/shadowdom/DOMFunctions';
import {isElementInChildOfActiveScope} from '../focus/FocusScope';
import {useEffect, useRef} from 'react';
import {useEffectEvent} from '../utils/useEffectEvent';
import {useFocusWithin} from '../interactions/useFocusWithin';
import {useInteractOutside} from '../interactions/useInteractOutside';
import {useKeyboard} from '../interactions/useKeyboard';

export interface AriaOverlayProps {
  /** Whether the overlay is currently open. */
  isOpen?: boolean;

  /** Handler that is called when the overlay should close. */
  onClose?: () => void;

  /**
   * Whether to close the overlay when the user interacts outside it.
   *
   * @default false
   */
  isDismissable?: boolean;

  /** Whether the overlay should close when focus is lost or moves outside it. */
  shouldCloseOnBlur?: boolean;

  /**
   * Whether pressing the escape key to close the overlay should be disabled.
   *
   * @default false
   */
  isKeyboardDismissDisabled?: boolean;

  /**
   * When user interacts with the argument element outside of the overlay ref,
   * return true if onClose should be called.  This gives you a chance to filter
   * out interaction with elements that should not dismiss the overlay.
   * By default, onClose will always be called on interaction outside the overlay ref.
   */
  shouldCloseOnInteractOutside?: (element: Element) => boolean;
}

export interface OverlayAria {
  /** Props to apply to the overlay container element. */
  overlayProps: DOMAttributes;
  /** Props to apply to the underlay element, if any. */
  underlayProps: DOMAttributes;
}

interface VisibleOverlayData {
  onClose: () => void;
  isKeyboardDismissDisabled: boolean;
}

interface VisibleOverlay {
  ref: RefObject<Element | null>;
  data: VisibleOverlayData;
}

const visibleOverlays: VisibleOverlay[] = [];

interface CloseWatcher {
  oncancel: ((event: Event) => void) | null;
  onclose: (() => void) | null;
  destroy: () => void;
}

function supportsCloseWatcher(): boolean {
  return typeof globalThis.CloseWatcher !== 'undefined';
}

function getTopMostOverlay(): VisibleOverlay | undefined {
  let topMostOverlay: VisibleOverlay | undefined;
  for (let overlay of visibleOverlays) {
    let element = overlay.ref.current;
    if (!element) {
      continue;
    }

    if (!topMostOverlay?.ref.current) {
      topMostOverlay = overlay;
      continue;
    }

    let topMostElement = topMostOverlay.ref.current;
    if (topMostElement === element) {
      topMostOverlay = overlay;
      continue;
    }

    let ownerNode = element.ownerDocument.defaultView?.Node;
    let position = topMostElement.compareDocumentPosition(element);
    if (
      ownerNode &&
      !(position & ownerNode.DOCUMENT_POSITION_DISCONNECTED) &&
      position & ownerNode.DOCUMENT_POSITION_FOLLOWING
    ) {
      topMostOverlay = overlay;
    }
  }

  return topMostOverlay ?? visibleOverlays[visibleOverlays.length - 1];
}

function isOnlyVisibleOverlayForRef(overlay: VisibleOverlay): boolean {
  return !visibleOverlays.some(
    visibleOverlay => visibleOverlay !== overlay && visibleOverlay.ref === overlay.ref
  );
}

/**
 * Provides the behavior for overlays such as dialogs, popovers, and menus.
 * Hides the overlay when the user interacts outside it, when the Escape key is pressed,
 * or optionally, on blur. Only the top-most overlay will close at once.
 */
export function useOverlay(props: AriaOverlayProps, ref: RefObject<Element | null>): OverlayAria {
  let {
    onClose,
    shouldCloseOnBlur,
    isOpen,
    isDismissable = false,
    isKeyboardDismissDisabled = false,
    shouldCloseOnInteractOutside
  } = props;

  let lastVisibleOverlay = useRef<VisibleOverlay | undefined>(undefined);
  let visibleOverlay = useRef<VisibleOverlay | null>(null);

  let onHide = () => {
    onClose?.();
  };

  let onHideEvent = useEffectEvent(onHide);

  // Only hide the overlay when it is the topmost visible overlay in the stack.
  let onHideTopmost = () => {
    if (getTopMostOverlay() === visibleOverlay.current && onClose) {
      onHide();
    }
  };

  // Stable callback for CloseWatcher that always calls the latest onHideTopmost.
  // useEffectEvent returns a stable reference, so the watcher doesn't need
  // to be recreated when onClose changes.
  let onHideTopmostEvent = useEffectEvent(onHideTopmost);

  // Add the overlay ref to the stack of visible overlays on mount, and remove on unmount.
  // When CloseWatcher is supported, each overlay gets its own instance so the browser's
  // native close watcher stack handles nested overlay ordering for Escape and Android back.
  useEffect(() => {
    if (isOpen && !visibleOverlay.current) {
      let overlay: VisibleOverlay = {
        ref,
        data: {
          onClose: () => onHideEvent(),
          isKeyboardDismissDisabled
        }
      };
      visibleOverlay.current = overlay;
      visibleOverlays.push(overlay);

      let watcher: CloseWatcher | null = null;
      if (!isKeyboardDismissDisabled && supportsCloseWatcher()) {
        let closeWatcher: CloseWatcher = new (globalThis as any).CloseWatcher();
        closeWatcher.oncancel = event => {
          if (getTopMostOverlay() !== overlay) {
            event.preventDefault();
          }
        };
        closeWatcher.onclose = () => {
          onHideTopmostEvent();
        };
        watcher = closeWatcher;
      }

      return () => {
        let index = visibleOverlays.indexOf(overlay);
        if (index >= 0) {
          visibleOverlays.splice(index, 1);
        }
        visibleOverlay.current = null;
        watcher?.destroy();
      };
    }
  }, [isOpen, isKeyboardDismissDisabled, ref]);

  let onInteractOutsideStart = (e: PointerEvent) => {
    const topMostOverlay = getTopMostOverlay();
    lastVisibleOverlay.current = topMostOverlay;
    if (
      !shouldCloseOnInteractOutside ||
      shouldCloseOnInteractOutside(getEventTarget(e) as Element)
    ) {
      if (
        topMostOverlay &&
        topMostOverlay === visibleOverlay.current &&
        isOnlyVisibleOverlayForRef(topMostOverlay)
      ) {
        e.stopPropagation();
      }
    }
  };

  let onInteractOutside = (e: PointerEvent) => {
    if (
      !shouldCloseOnInteractOutside ||
      shouldCloseOnInteractOutside(getEventTarget(e) as Element)
    ) {
      let topMostOverlay = getTopMostOverlay();
      if (
        topMostOverlay &&
        topMostOverlay === visibleOverlay.current &&
        isOnlyVisibleOverlayForRef(topMostOverlay)
      ) {
        e.stopPropagation();
      }
      if (
        lastVisibleOverlay.current === visibleOverlay.current ||
        lastVisibleOverlay.current?.ref === ref
      ) {
        onHide();
      }
    }
    lastVisibleOverlay.current = undefined;
  };

  // Handle the escape key.
  let {keyboardProps} = useKeyboard({
    shortcuts: {
      Escape: e => {
        if (e.nativeEvent.cancelBubble) {
          return false;
        }

        if (supportsCloseWatcher()) {
          return false;
        }

        let topMostOverlay = getTopMostOverlay();
        if (!topMostOverlay) {
          return false;
        }

        let overlay = topMostOverlay.ref === ref ? visibleOverlay.current : topMostOverlay;
        if (!overlay) {
          return false;
        }

        if (overlay.data.isKeyboardDismissDisabled) {
          if (overlay !== visibleOverlay.current) {
            return;
          }
          return false;
        }

        overlay.data.onClose();
        return;
      }
    }
  });

  // Handle clicking outside the overlay to close it
  useInteractOutside({
    ref,
    onInteractOutside: isDismissable && isOpen ? onInteractOutside : undefined,
    onInteractOutsideStart
  });

  let {focusWithinProps} = useFocusWithin({
    isDisabled: !shouldCloseOnBlur,
    onBlurWithin: e => {
      // Do not close if relatedTarget is null, which means focus is lost to the body.
      // That can happen when switching tabs, or due to a VoiceOver/Chrome bug with Control+Option+Arrow navigation.
      // Clicking on the body to close the overlay should already be handled by useInteractOutside.
      // https://github.com/adobe/react-spectrum/issues/4130
      // https://github.com/adobe/react-spectrum/issues/4922
      //
      // If focus is moving into a child focus scope (e.g. menu inside a dialog),
      // do not close the outer overlay. At this point, the active scope should
      // still be the outer overlay, since blur events run before focus.
      if (!e.relatedTarget || isElementInChildOfActiveScope(e.relatedTarget)) {
        return;
      }

      if (
        !shouldCloseOnInteractOutside ||
        shouldCloseOnInteractOutside(e.relatedTarget as Element)
      ) {
        onClose?.();
      }
    }
  });

  return {
    overlayProps: {
      ...keyboardProps,
      ...focusWithinProps
    },
    underlayProps: {}
  };
}
