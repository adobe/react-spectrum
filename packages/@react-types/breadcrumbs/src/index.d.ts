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
import {DOMProps, PressEvents, StyleProps} from '@react-types/shared';
import {ReactElement, ReactNode} from 'react';

export interface BreadcrumbItemProps extends PressEvents {
  isCurrent?: boolean,
  isHeading?: boolean,
  isDisabled?: boolean,
  headingAriaLevel?: number,
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | boolean | 'true' | 'false',
  children: ReactNode
}

export interface BreadcrumbsProps {
  children: ReactElement<BreadcrumbItemProps> | ReactElement<BreadcrumbItemProps>[],
  maxVisibleItems?: 'auto' | number
}

export interface SpectrumBreadcrumbsProps extends BreadcrumbsProps, DOMProps, StyleProps {
  size?: 'S' | 'M' | 'L',
  isHeading?: boolean,
  headingAriaLevel?: number,
  showRoot?: boolean,
  isDisabled?: boolean
}
