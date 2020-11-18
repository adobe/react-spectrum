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

import {HTMLAttributes, ReactNode} from 'react';
import {useId} from '@react-aria/utils';

interface AriaListBoxSectionProps {
  /** The heading for the section. */
  heading?: ReactNode,
  /** An accessibility label for the section. Required if `heading` is not present. */
  'aria-label'?: string
}

interface ListBoxSectionAria {
  /** Props for the wrapper list item. */
  itemProps: HTMLAttributes<HTMLElement>,

  /** Props for the heading element, if any. */
  headingProps: HTMLAttributes<HTMLElement>,

  /** Props for the group element. */
  groupProps: HTMLAttributes<HTMLElement>
}

/**
 * Provides the behavior and accessibility implementation for a section in a listbox.
 * See `useListBox` for more details about listboxes.
 * @param props - Props for the section.
 */
export function useListBoxSection(props: AriaListBoxSectionProps): ListBoxSectionAria {
  let {heading, 'aria-label': ariaLabel} = props;
  let headingId = useId();

  return {
    itemProps: {
      role: 'presentation'
    },
    headingProps: heading ? {
      // Techincally, listbox cannot contain headings according to ARIA.
      // We hide the heading from assistive technology, and only use it
      // as a label for the nested group.
      id: headingId,
      'aria-hidden': true
    } : {},
    groupProps: {
      role: 'group',
      'aria-label': ariaLabel,
      'aria-labelledby': heading ? headingId : undefined
    }
  };
}
