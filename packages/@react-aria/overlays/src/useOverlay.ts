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
import {isElementInChildOfActiveScope} from '@react-aria/focus';
import {useCallback, useEffect, useRef} from 'react';
import {useFocusWithin, useInteractOutside} from '@react-aria/interactions';

// CloseWatcher is a newer browser API that handles close requests (Escape key, Android back button, etc.)
// Type declaration since TypeScript may not include this in lib.dom yet
interface CloseWatcherInstance extends EventTarget {
  close(): void,
  destroy(): void,
  oncancel: ((this: CloseWatcherInstance, ev: Event) => any) | null,
  onclose: ((this: CloseWatcherInstance, ev: Event) => any) | null
}

interface CloseWatcherConstructor {
  prototype: CloseWatcherInstance,
  new(options?: {signal?: AbortSignal}): CloseWatcherInstance
}

// Feature detection for CloseWatcher support
const supportsCloseWatcher = typeof window !== 'undefined' && 'CloseWatcher' in window;

export interface AriaOverlayProps {
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
  shouldCloseOnInteractOutside?: (element: Element) => boolean
}

export interface OverlayAria {
  /** Props to apply to the overlay container element. */
  overlayProps: DOMAttributes,
  /** Props to apply to the underlay element, if any. */
  underlayProps: DOMAttributes
}

const visibleOverlays: RefObject<Element | null>[] = [];

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

  let lastVisibleOverlay = useRef<RefObject<Element | null>>(undefined);
  let closeWatcherRef = useRef<CloseWatcherInstance | null>(null);

  // Add the overlay ref to the stack of visible overlays on mount, and remove on unmount.
  useEffect(() => {
    if (isOpen && !visibleOverlays.includes(ref)) {
      visibleOverlays.push(ref);
      return () => {
        let index = visibleOverlays.indexOf(ref);
        if (index >= 0) {
          visibleOverlays.splice(index, 1);
        }
      };
    }
  }, [isOpen, ref]);

  // Only hide the overlay when it is the topmost visible overlay in the stack.
  // Wrapped in useCallback for stable reference in CloseWatcher effect.
  let onHide = useCallback(() => {
    if (visibleOverlays[visibleOverlays.length - 1] === ref && onClose) {
      onClose();
    }
  }, [ref, onClose]);

  // Use CloseWatcher API when supported for handling close requests (Escape key, Android back button, etc.).
  // CloseWatcher provides a unified way to handle close signals across different devices and input methods.
  // Falls back to keyboard event handling in browsers that don't support CloseWatcher.
  useEffect(() => {
    if (!isOpen || isKeyboardDismissDisabled || !supportsCloseWatcher) {
      return;
    }

    closeWatcherRef.current = new ((window as any).CloseWatcher as CloseWatcherConstructor)();
    closeWatcherRef.current.onclose = () => {
      onHide();
    };

    return () => {
      // CloseWatcher is automatically destroyed after its close event fires,
      // but we still call destroy() for cases where the overlay closes without
      // the watcher firing (e.g., clicking outside, programmatic close).
      closeWatcherRef.current?.destroy();
      closeWatcherRef.current = null;
    };
  }, [isOpen, isKeyboardDismissDisabled, onHide]);

  let onInteractOutsideStart = (e: PointerEvent) => {
    const topMostOverlay = visibleOverlays[visibleOverlays.length - 1];
    lastVisibleOverlay.current = topMostOverlay;
    if (!shouldCloseOnInteractOutside || shouldCloseOnInteractOutside(e.target as Element)) {
      if (topMostOverlay === ref) {
        e.stopPropagation();
        e.preventDefault();
      }
    }
  };

  let onInteractOutside = (e: PointerEvent) => {
    if (!shouldCloseOnInteractOutside || shouldCloseOnInteractOutside(e.target as Element)) {
      if (visibleOverlays[visibleOverlays.length - 1] === ref) {
        e.stopPropagation();
        e.preventDefault();
      }
      if (lastVisibleOverlay.current === ref) {
        onHide();
      }
    }
    lastVisibleOverlay.current = undefined;
  };

  // Handle the escape key as a fallback when CloseWatcher is not supported.
  // When CloseWatcher is active, it handles Escape key at the browser level,
  // so we skip the keyboard handler to avoid duplicate close attempts.
  let onKeyDown = (e) => {
    if (e.key === 'Escape' && !isKeyboardDismissDisabled && !e.nativeEvent.isComposing) {
      // Skip if CloseWatcher is handling close requests
      if (closeWatcherRef.current) {
        return;
      }
      e.stopPropagation();
      e.preventDefault();
      onHide();
    }
  };

  // Handle clicking outside the overlay to close it
  useInteractOutside({ref, onInteractOutside: isDismissable && isOpen ? onInteractOutside : undefined, onInteractOutsideStart});

  let {focusWithinProps} = useFocusWithin({
    isDisabled: !shouldCloseOnBlur,
    onBlurWithin: (e) => {
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

      if (!shouldCloseOnInteractOutside || shouldCloseOnInteractOutside(e.relatedTarget as Element)) {
        onClose?.();
      }
    }
  });

  let onPointerDownUnderlay = e => {
    // fixes a firefox issue that starts text selection https://bugzilla.mozilla.org/show_bug.cgi?id=1675846
    if (e.target === e.currentTarget) {
      e.preventDefault();
    }
  };

  return {
    overlayProps: {
      onKeyDown,
      ...focusWithinProps
    },
    underlayProps: {
      onPointerDown: onPointerDownUnderlay
    }
  };
}
