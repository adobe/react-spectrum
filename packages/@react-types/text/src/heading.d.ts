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

import {DOMProps, StyleProps} from '@react-types/shared';
import {ReactNode} from 'react';

export interface HeadingProps extends DOMProps, StyleProps {
  /**
   * Heading content.
   */
  children: ReactNode,
  /**
   * A slot to place the heading in.
   * @default 'heading'
   */
  slot?: string,
  /**
   * Sets heading level, h1 through h6.
   * @default 3
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6
}
