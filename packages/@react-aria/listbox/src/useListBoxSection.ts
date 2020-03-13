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

import {HTMLAttributes} from 'react';
import {useId} from '@react-aria/utils';

interface ListBoxSectionAria {
  headingProps: HTMLAttributes<HTMLElement>,
  groupProps: HTMLAttributes<HTMLElement>
}

export function useListBoxSection(): ListBoxSectionAria {
  let headingId = useId();

  return {
    headingProps: {
      // Techincally, listbox cannot contain headings according to ARIA.
      // We hide the heading from assistive technology, and only use it
      // as a label for the nested group.
      id: headingId,
      'aria-hidden': true
    },
    groupProps: {
      role: 'group',
      'aria-labelledby': headingId
    }
  };
}
