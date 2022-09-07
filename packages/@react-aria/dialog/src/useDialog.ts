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

import {AriaDialogProps} from '@react-types/dialog';
import {DOMAttributes, FocusableElement} from '@react-types/shared';
import {filterDOMProps, useSlotId} from '@react-aria/utils';
import {focusSafely} from '@react-aria/focus';
import {RefObject, useEffect, useState} from 'react';

export interface DialogAria {
  /** Props for the dialog container element. */
  dialogProps: DOMAttributes,

  /** Props for the dialog title element. */
  titleProps: DOMAttributes
}

/**
 * Provides the behavior and accessibility implementation for a dialog component.
 * A dialog is an overlay shown above other content in an application.
 */
export function useDialog(props: AriaDialogProps, ref: RefObject<FocusableElement>): DialogAria {
  let {role = 'dialog'} = props;
  let titleId = useSlotId();

  // The autoFocused state flags when the the dialog or one of its descendants has received focus when the dialog opens.
  let [autoFocused, setAutoFocused] = useState(false);
  titleId = props['aria-label'] ? undefined : titleId;

  // Focus the dialog itself on mount, unless a child element is already focused.
  useEffect(() => {
    if (ref.current) {
      if (!ref.current.contains(document.activeElement)) {
        focusSafely(ref.current);
      }

      // Set autoFocused to true.
      setAutoFocused(true);

      // Safari on iOS does not move the VoiceOver cursor to the dialog
      // or announce that it has opened until it has rendered. A workaround
      // is to wait for half a second, then blur and re-focus the dialog.
      let timeout = setTimeout(() => {
        if (document.activeElement === ref.current) {
          ref.current.blur();
          focusSafely(ref.current);
        }
      }, 500);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [ref]);

  // We do not use aria-modal due to a Safari bug which forces the first focusable element to be focused
  // on mount when inside an iframe, no matter which element we programmatically focus.
  // See https://bugs.webkit.org/show_bug.cgi?id=211934.
  // useModal sets aria-hidden on all elements outside the dialog, so the dialog will behave as a modal
  // even without aria-modal on the dialog itself.
  return {
    dialogProps: {
      ...filterDOMProps(props, {labelable: true}),
      role,
      // Intialize tabIndex equal to 0, so that autoFocus prop on the Dialog's FocusScope
      // will focus the dialog itself first should no descendant have focus.
      // After autoFocused gets set to true, the tabIndex on the dialog itself should be set to -1,
      // so that the dialog will not be included in the focus order focus wraps with FocusScope.
      tabIndex: (autoFocused ? -1 : 0),
      'aria-labelledby': props['aria-labelledby'] || titleId
    },
    titleProps: {
      id: titleId
    }
  };
}
