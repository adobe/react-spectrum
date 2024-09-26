/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaLabelingProps, DOMProps} from '@react-types/shared';
import {ContextValue, SlotProps} from 'react-aria-components';
import {createContext, ReactNode} from 'react';
import {StyleString} from '../style/types';
import {UnsafeStyles} from './style-utils' with {type: 'macro'};

export interface IconProps extends UnsafeStyles, SlotProps, AriaLabelingProps, DOMProps {
  'aria-hidden'?: boolean | 'false' | 'true'
}

export interface IconContextValue extends UnsafeStyles, SlotProps {
  styles?: StyleString,
  render?: (icon: ReactNode) => ReactNode
}

export interface IllustrationContextValue extends IconContextValue {
  size?: 'S' | 'M' | 'L'
}

export const IconContext = createContext<ContextValue<IconContextValue, SVGElement>>({});
export const IllustrationContext = createContext<ContextValue<IllustrationContextValue, SVGElement>>({});
