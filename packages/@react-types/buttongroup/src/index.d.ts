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


import {DOMProps, Orientation, StyleProps} from '@react-types/shared';
import {ReactNode} from 'react';

export interface SpectrumButtonGroupProps extends DOMProps, StyleProps {
  /** Whether the ButtonGroup is disabled. */
  isDisabled?: boolean,
  /**
   * The axis the ButtonGroup should align with. See the docs[LINK TODO] for additional information
   * regarding overflow behavior.
   * @default "horizontal"
   */
  orientation?: Orientation,
  /** The buttons contained within the ButtonGroup. */
  children: ReactNode
}
