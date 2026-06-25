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

import {
  AriaLabelingProps,
  DOMAttributes,
  DOMProps,
  FocusableElement,
  RefObject
} from '@react-types/shared';
import {filterDOMProps} from '../utils/filterDOMProps';
import {focusSafely} from '../interactions/focusSafely';
import {getActiveElement, isFocusWithin} from '../utils/shadowdom/DOMFunctions';
import {useEffect, useRef} from 'react';
import {useOverlayFocusContain} from '../overlays/Overlay';
import {useSlotId} from '../utils/useId';

export interface AriaDialogProps extends DOMProps, AriaLabelingProps {
  /**
   * The accessibility role for the dialog.
   *
   * @default 'dialog'
   */
  role?: 'dialog' | 'alertdialog';
}

export interface DialogAria {
  /** Props for the dialog container element. */
  dialogProps: DOMAttributes;

  /** Props for the dialog title element. */
  titleProps: DOMAttributes;
}

/**
 * Provides the behavior and accessibility implementation for a dialog component.
 * A dialog is an overlay shown above other content in an application.
 */
export function useDialog(
  props: AriaDialogProps,
  ref: RefObject<FocusableElement | null>
): DialogAria {
  let {role = 'dialog'} = props;
  let titleId: string | undefined = useSlotId();
  titleId = props['aria-label'] ? undefined : titleId;

  let isRefocusing = useRef(false);

  // Focus the dialog itself on mount, unless a child element is already focused.
  useEffect(() => {
    if (ref.current && !isFocusWithin(ref.current)) {
      focusSafely(ref.current);

      // Safari on iOS does not move the VoiceOver cursor to the dialog
      // or announce that it has opened until it has rendered. A workaround
      // is to wait for half a second, then blur and re-focus the dialog.
      let timeout = setTimeout(() => {
        // Check that the dialog is still focused, or focused was lost to the body.
        if (getActiveElement() === ref.current || getActiveElement() === document.body) {
          isRefocusing.current = true;
          if (ref.current) {
            ref.current.blur();
            focusSafely(ref.current);
          }
          isRefocusing.current = false;
        }
      }, 500);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [ref]);

  useOverlayFocusContain();

  // Warn in dev mode if the dialog has no accessible title.
  // This catches a common mistake where useDialog and useOverlayTriggerState
  // are used in the same component, causing the title element to not be
  // in the DOM when useSlotId queries for it.
  // Check the DOM element directly since aria-labelledby may be added by
  // wrapper components (e.g. RAC Dialog uses trigger ID as a fallback).
  let hasWarned = useRef(false);
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && !hasWarned.current && ref.current) {
      let el = ref.current;
      let hasAriaLabel = el.hasAttribute('aria-label');
      let hasAriaLabelledby = el.hasAttribute('aria-labelledby');
      if (!hasAriaLabel && !hasAriaLabelledby) {
        console.warn(
          'A dialog must have a title for accessibility. ' +
            'Either provide an aria-label or aria-labelledby prop, or render a heading element inside the dialog.'
        );
        hasWarned.current = true;
      }
    }
  });

  // We do not use aria-modal due to a Safari bug which forces the first focusable element to be focused
  // on mount when inside an iframe, no matter which element we programmatically focus.
  // See https://bugs.webkit.org/show_bug.cgi?id=211934.
  // useModal sets aria-hidden on all elements outside the dialog, so the dialog will behave as a modal
  // even without aria-modal on the dialog itself.
  return {
    dialogProps: {
      ...filterDOMProps(props, {labelable: true}),
      role,
      tabIndex: -1,
      'aria-labelledby': props['aria-labelledby'] || titleId,
      // Prevent blur events from reaching useOverlay, which may cause
      // popovers to close. Since focus is contained within the dialog,
      // we don't want this to occur due to the above useEffect.
      onBlur: e => {
        if (isRefocusing.current) {
          e.stopPropagation();
        }
      }
    },
    titleProps: {
      id: titleId
    }
  };
}
