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

import {AllHTMLAttributes, RefObject, useEffect} from 'react';
import {useSlotId} from '@react-aria/utils';

export interface DialogProps {
  ref: RefObject<HTMLElement | null>,
  role?: 'dialog' | 'alertdialog'
}

interface DialogAria {
  dialogProps: AllHTMLAttributes<HTMLElement>
  titleProps: AllHTMLAttributes<HTMLElement>
}

export function useDialog(props: DialogProps): DialogAria {
  let {ref, role = 'dialog'} = props;
  let titleId = useSlotId();
  titleId = props['aria-label'] ? undefined : titleId;

  // Focus the dialog itself on mount, unless a child element is already focused.
  useEffect(() => {
    if (ref.current && !ref.current.contains(document.activeElement)) {
      ref.current.focus({preventScroll: true});
    }
  }, [ref]);

  return {
    dialogProps: {
      role,
      tabIndex: -1,
      'aria-labelledby': props['aria-labelledby'] || titleId
    },
    titleProps: {
      id: titleId
    }
  };
}
