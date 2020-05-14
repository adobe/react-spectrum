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

import {DOMProps, ItemElement, ItemRenderer, MultipleSelection, Orientation, StyleProps} from '@react-types/shared';
import {Key} from 'react';

// Not extending CollectionBase to avoid async loading props
export interface ActionGroupProps<T> extends DOMProps, StyleProps, MultipleSelection {
  /**
   * The axis the ActionGroup should align with.
   * @default 'horizontal'
   */
  orientation?: Orientation,
  /** An list of `Item` elements or an `ItemRenderer`. If the latter, a list of items must be provided as an separate prop. */
  children: ItemElement<T> | ItemElement<T>[] | ItemRenderer<T>,
  /** A list of items to iterate through and display as children. Must be used with an `ItemRenderer` as the sole child. */
  items?: Iterable<T>,
  /** A field used as the `uniqueKey` if providing a list of items as a prop. */
  itemKey?: string,
  /** A list of `uniqueKeys` to disable. */
  disabledKeys?: Iterable<Key>,
  /**
   * Whether the ActionGroup is disabled.
   * Shows that a selection exists, but is not available in that circumstance.
   */
  isDisabled?: boolean,
  /** Invoked when an action is taken on a child. The sole argument `key` is the uniqueKey for the item. */
  onAction?: (key: Key) => void
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
  holdAffordance?: boolean
}
