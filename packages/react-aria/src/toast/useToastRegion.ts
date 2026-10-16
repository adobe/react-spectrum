/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaLabelingProps, DOMAttributes, FocusableElement, RefObject} from '@react-types/shared';
import {focusWithoutScrolling} from '../utils/focusWithoutScrolling';
import {getActiveElement, getEventTarget, nodeContains} from '../utils/shadowdom/DOMFunctions';
import {getInteractionModality} from '../interactions/useFocusVisible';
import {getOwnerDocument} from '../utils/domHelpers';
import intlMessages from '../../intl/toast/*.json';
import {mergeProps} from '../utils/mergeProps';
import {ToastState} from 'react-stately/useToastState';
import {useCallback, useEffect, useRef} from 'react';
import {useFocusWithin} from '../interactions/useFocusWithin';
import {useHover} from '../interactions/useHover';
import {useLandmark} from '../landmark/useLandmark';
import {useLayoutEffect} from '../utils/useLayoutEffect';
import {useLocalizedStringFormatter} from '../i18n/useLocalizedStringFormatter';

export interface AriaToastRegionProps extends AriaLabelingProps {
  /**
   * An accessibility label for the toast region.
   *
   * @default 'Notifications'
   */
  'aria-label'?: string;
}

export interface ToastRegionAria {
  /** Props for the landmark region element. */
  regionProps: DOMAttributes;
}

/**
 * Provides the behavior and accessibility implementation for a toast region containing one or more
 * toasts. Toasts display brief, temporary notifications of actions, errors, or other events in an
 * application.
 */
export function useToastRegion<T>(
  props: AriaToastRegionProps,
  state: ToastState<T>,
  ref: RefObject<HTMLElement | null>
): ToastRegionAria {
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-aria/toast');
  let {landmarkProps} = useLandmark(
    {
      role: 'region',
      'aria-label':
        props['aria-label'] ||
        stringFormatter.format('notifications', {count: state.visibleToasts.length})
    },
    ref
  );

  let isHovered = useRef(false);
  let isFocused = useRef(false);
  let updateTimers = useCallback(() => {
    let ownerDocument = getOwnerDocument(ref.current);
    let activeElement = getActiveElement(ownerDocument);
    // React doesn't see a blur when the focused toast is removed, so check where focus is.
    isFocused.current &&= nodeContains(ref.current, activeElement);
    if (isHovered.current || isFocused.current) {
      state.pauseAll();
    } else {
      state.resumeAll();
    }
  }, [state, ref]);

  let {hoverProps} = useHover({
    onHoverStart: () => {
      isHovered.current = true;
      updateTimers();
    },
    onHoverEnd: () => {
      isHovered.current = false;
      updateTimers();
    }
  });

  // Manage focus within the toast region. If the focused toast is removed, move focus to the
  // nearest newer toast, the nearest older one, or the toast that replaced it.
  let prevVisibleToasts = useRef(state.visibleToasts);
  let focusedToast = useRef<string>(null);

  useLayoutEffect(() => {
    let prev = prevVisibleToasts.current;
    prevVisibleToasts.current = state.visibleToasts;

    // If no toast has focus, or it is still visible, then don't do anything.
    let index = prev.findIndex(toast => toast.key === focusedToast.current);
    if (!isFocused.current || index < 0 || state.visibleToasts.includes(prev[index])) {
      return;
    }

    // If the focused toast was removed, focus the next or previous toast.
    // In pointer modality, move focus out of the toast region.
    // Otherwise auto-dismiss timers will appear "stuck".
    // oxlint-disable-next-line react/react-compiler
    if (getInteractionModality() === 'pointer' && lastFocused.current?.isConnected) {
      focusWithoutScrolling(lastFocused.current);
      return;
    }

    // prioritize going to newer toasts
    let newer = prev.slice(0, index).reverse();
    let older = prev.slice(index + 1);
    let target = [...newer, ...older].find(toast => state.visibleToasts.includes(toast));
    // in the case where it's one toast at a time, both will be undefined, but we know the index must be 0
    target ??= state.visibleToasts[0];
    if (!target) {
      return;
    }

    let selector = `[role="alertdialog"][data-key="${CSS.escape(target.key)}"]`;
    let element = ref.current?.querySelector<FocusableElement>(selector);
    if (element) {
      focusWithoutScrolling(element);
    }
  }, [state.visibleToasts, ref]);

  // React doesn't see a blur when the focused toast is removed, so check where focus is now.
  useLayoutEffect(() => {
    if (isFocused.current) {
      updateTimers();
    }
  }, [state.visibleToasts, updateTimers]);

  let lastFocused = useRef<FocusableElement | null>(null);
  let {focusWithinProps} = useFocusWithin({
    onFocusWithin: e => {
      isFocused.current = true;
      // oxlint-disable-next-line react/react-compiler
      lastFocused.current = e.relatedTarget as FocusableElement;
      updateTimers();
    },
    onBlurWithin: () => {
      isFocused.current = false;
      // oxlint-disable-next-line react/react-compiler
      lastFocused.current = null;
      updateTimers();
    }
  });

  // When the number of visible toasts becomes 0 or the region unmounts,
  // restore focus to the last element that had focus before the user moved focus
  // into the region. FocusScope restore focus doesn't update whenever the focus
  // moves in, it only happens once, so we correct it.
  // Because we're in a hook, we can't control if the user unmounts or not.
  useEffect(() => {
    if (state.visibleToasts.length === 0 && lastFocused.current?.isConnected) {
      if (getInteractionModality() === 'pointer') {
        focusWithoutScrolling(lastFocused.current);
      } else {
        lastFocused.current.focus();
      }
      // oxlint-disable-next-line react/react-compiler
      lastFocused.current = null;
    }
  }, [ref, state.visibleToasts.length]);

  useEffect(() => {
    return () => {
      if (lastFocused.current?.isConnected) {
        if (getInteractionModality() === 'pointer') {
          focusWithoutScrolling(lastFocused.current);
        } else {
          lastFocused.current.focus();
        }
        lastFocused.current = null;
      }
    };
  }, [ref]);

  return {
    // oxlint-disable-next-line react/react-compiler
    regionProps: mergeProps(landmarkProps, hoverProps, focusWithinProps, {
      tabIndex: -1,
      // Mark the toast region as a "top layer", so that it:
      //   - is not aria-hidden when opening an overlay
      //   - allows focus even outside a containing focus scope
      //   - doesn’t dismiss overlays when clicking on it, even though it is outside
      // @ts-ignore
      'data-react-aria-top-layer': true,
      // listen to focus events separate from focuswithin because that will only fire once
      // and we need to follow all focus changes
      onFocus: e => {
        let target = (getEventTarget(e) as Element).closest('[role="alertdialog"]');
        focusedToast.current = target?.getAttribute('data-key') ?? null;
        // useFocusWithin doesn't see focus return after it was lost without a blur event.
        if (!isFocused.current) {
          isFocused.current = true;
          updateTimers();
        }
      },
      onBlur: () => {
        focusedToast.current = null;
      }
    })
  };
}
