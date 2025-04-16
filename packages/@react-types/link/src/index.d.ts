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

import {AriaLabelingProps, FocusableProps, LinkDOMProps, PressEvents, StyleProps} from '@react-types/shared';
import {ReactNode} from 'react';

export interface LinkProps extends PressEvents, FocusableProps {}

export interface AriaLinkProps extends LinkProps, LinkDOMProps, AriaLabelingProps { }

export interface SpectrumLinkProps extends Omit<AriaLinkProps, 'onClick'>, StyleProps {
  /** The content to display in the link. */
  children: ReactNode,
  /**
   * The [visual style](https://spectrum.adobe.com/page/link/#Options) of the link.
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'overBackground',
  /** Whether the link should be displayed with a quiet style. */
  isQuiet?: boolean
}
