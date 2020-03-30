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
import {ItemProps} from '@react-types/shared';
import {Key, ReactElement, ReactNode} from 'react';

export interface BreadcrumbItemProps extends PressEvents {
  isCurrent?: boolean,
  isHeading?: boolean,
  isDisabled?: boolean,
  headingAriaLevel?: number,
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | boolean | 'true' | 'false',
  children: ReactNode
}

export interface BreadcrumbsProps<T> {
  children: ReactElement<ItemProps<T>> | ReactElement<ItemProps<T>>[],
  /**
   * The current number of visible items before items are collapsed.
   * @default 4
   */
  maxVisibleItems?: 'auto' | number,
  /** Called when an item is acted upon (usually selection via press). */
  onAction?: (key: Key) => void
}

export interface SpectrumBreadcrumbsProps<T> extends BreadcrumbsProps<T>, DOMProps, StyleProps {
  /**
   * What the Breadcrumbs's size should be.
   * @default "M"
   */
  size?: 'S' | 'M' | 'L',
  /** Whether the last item should have role of "heading". */
  isHeading?: boolean,
  /**
   * Sets the aria-level attribute of the last item, but only if `isHeading` is true.
   * @default 1
   */
  headingAriaLevel?: number,
  /** Whether to always show the root item if the items are collapsed. */
  showRoot?: boolean,
  /** Whether the Breadcrumbs are disabled. */
  isDisabled?: boolean
}
