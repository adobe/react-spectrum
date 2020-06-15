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

import {AriaLabelingProps, DOMProps, StyleProps} from '@react-types/shared';
import {ReactNode} from 'react';

export interface SpectrumWellProps extends DOMProps, AriaLabelingProps, StyleProps {
  /**
   * The contents of the Well.
   */
  children: ReactNode,
  /**
   * An accessibility role for the well. Use `'region'` when the contents of the well
   * is important enough to be included in the page table of contents, and `'group'` otherwise.
   * If a role is provided, then an aria-label or aria-labelledby must also be provided.
   */
  role?: 'region' | 'group'
}
