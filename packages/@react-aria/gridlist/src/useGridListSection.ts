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

import {DOMAttributes} from '@react-types/shared';
import {ReactNode} from 'react';
import {useId} from '@react-aria/utils';
import {Node} from 'react-stately';
import type {ListState} from '@react-stately/list';


export interface AriaGridListSectionProps {
  /** The heading for the section. */
  heading?: ReactNode,
  /** An accessibility label for the section. Required if `heading` is not present. */
  'aria-label'?: string
}

export interface GridListSectionAria {
  /** Props for the wrapper list item. */
  rowProps: DOMAttributes,

  /** Props for the heading element, if any. */
  headingProps: DOMAttributes,

  /** Props for the grid's row group element. */
  rowGroupProps: DOMAttributes
}

/**
 * Provides the behavior and accessibility implementation for a section in a grid list.
 * See `useGridList` for more details about grid list.
 * @param props - Props for the section.
 */
export function useGridListSection(props: AriaGridListSectionProps): GridListSectionAria {
  let {heading, 'aria-label': ariaLabel} = props;
  let headingId = useId();
  
  return {
    rowProps: {
      role: 'row'
    },
    headingProps: heading ? {
      id: headingId,
      role: 'rowheader'
    } : {},
    rowGroupProps: {
      role: 'rowgroup',
      'aria-label': ariaLabel,
      'aria-labelledby': heading ? headingId : undefined
    }
  };
}