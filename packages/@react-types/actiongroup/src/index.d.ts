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

import {DOMProps, ItemElement, ItemRenderer, MultipleSelection, StyleProps} from '@react-types/shared';

export interface ActionGroupProps<T> extends DOMProps, StyleProps, MultipleSelection {
  /**
   * The axis the ActionGroup should align with.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical',
  children: ItemElement<T> | ItemElement<T>[] | ItemRenderer<T>,
  /**
   * Whether the ActionGroup is disabled or not.
   * Shows that a selection exists, but is not available in that circumstance.
   */
  isDisabled?: boolean
}

export interface SpectrumActionGroupProps<T> extends ActionGroupProps<T> {
  /** Whether the ActionButtons should be displayed with a [emphasized style](https://spectrum.adobe.com/page/action-button/#Emphasis). */
  isEmphasized?: boolean,
  /** Whether the ActionButtons should be connected together, without default space between. */
  isConnected?: boolean
  /** Whether the ActionButtons should be justified in their container. */
  isJustified?: boolean,
  /** Whether ActionButtons should use the [quiet style](https://spectrum.adobe.com/page/action-button/#Quiet). */
  isQuiet?: boolean,
  /** Whether the ActionButtons should be displayed with a [hold icon](https://spectrum.adobe.com/page/action-button/#Hold-icon). */
  holdAffordance?: boolean,
   /** Called when an item is acted upon (usually selection via press). */
  onSelectionChange?: (...args) => void
}
