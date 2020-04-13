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

import {focusWithoutScrolling, useSlotId} from '@react-aria/utils';
import {HTMLAttributes, RefObject, useEffect} from 'react';

export interface DialogProps {
  /** A ref to the dialog container element */
  ref: RefObject<HTMLElement | null>,

  /** The accessibility role for the dialog */
  role?: 'dialog' | 'alertdialog'
}

interface DialogAria {
  /** Props for the dialog container element */
  dialogProps: HTMLAttributes<HTMLElement>
  
  /** Props for the dialog title element */
  titleProps: HTMLAttributes<HTMLElement>
}

/**
 * Provides the behavior and accessibility implementation for a dialog component.
 * A dialog is an overlay shown above other content in an application.
 */
export function useDialog(props: DialogProps): DialogAria {
  let {ref, role = 'dialog'} = props;
  let titleId = useSlotId();
  titleId = props['aria-label'] ? undefined : titleId;

  // Focus the dialog itself on mount, unless a child element is already focused.
  useEffect(() => {
    if (ref.current && !ref.current.contains(document.activeElement)) {
      focusWithoutScrolling(ref.current);

      // Safari on iOS does not move the VoiceOver cursor to the dialog
      // or announce that it has opened until it has rendered. A workaround
      // is to wait for half a second, then blur and re-focus the dialog.
      let timeout = setTimeout(() => {
        if (document.activeElement === ref.current) {
          ref.current.blur();
          focusWithoutScrolling(ref.current);
        }
      }, 500);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [ref]);

  return {
    dialogProps: {
      role,
      tabIndex: -1,
      'aria-labelledby': props['aria-labelledby'] || titleId,
      'aria-modal': true
    },
    titleProps: {
      id: titleId
    }
  };
}
