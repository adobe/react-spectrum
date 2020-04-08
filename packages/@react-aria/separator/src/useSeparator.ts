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
import {Orientation} from '@react-types/shared';

export interface SeparatorProps {
  orientation?: Orientation,
  elementType?: string
}

export interface SeparatorAria {
  separatorProps: HTMLAttributes<HTMLElement>
}

export function useSeparator(props: SeparatorProps): SeparatorAria {
  let ariaOrientation;
  // if orientation is horizontal, aria-orientation default is horizontal, so we leave it undefined
  // if it's vertical, we need to specify it
  if (props.orientation === 'vertical') {
    ariaOrientation = 'vertical';
  }
  // hr elements implicitly have role = separator and a horizontal orientation
  if (props.elementType !== 'hr') {
    return {
      separatorProps: {
        role: 'separator',
        'aria-orientation': ariaOrientation
      }
    };
  }
  return {separatorProps: {}};
}
