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

import {AriaLabelingProps, DOMProps, ItemElement, ItemRenderer, Key, MultipleSelection, Orientation, StyleProps} from '@react-types/shared';
import {ReactElement} from 'react';

// Not extending CollectionBase to avoid async loading props
export interface ActionGroupProps<T> extends MultipleSelection {
  /**
   * The axis the ActionGroup should align with.
   * @default 'horizontal'
   */
  orientation?: Orientation,
  /** An list of `Item` elements or a function. If the latter, a list of items must be provided using the `items` prop. */
  children: ItemElement<T> | ItemElement<T>[] | ItemRenderer<T>,
  /** A list of items to display as children. Must be used with a function as the sole child. */
  items?: Iterable<T>,
  /** A list of keys to disable. */
  disabledKeys?: Iterable<Key>,
  /**
   * Whether the ActionGroup is disabled.
   * Shows that a selection exists, but is not available in that circumstance.
   */
  isDisabled?: boolean,
  /**
   * Invoked when an action is taken on a child. Especially useful when `selectionMode` is none.
   * The sole argument `key` is the key for the item.
   */
  onAction?: (key: Key) => void
}

export interface AriaActionGroupProps<T> extends ActionGroupProps<T>, DOMProps, AriaLabelingProps {}

export interface SpectrumActionGroupProps<T> extends AriaActionGroupProps<T>, StyleProps {
  /** Whether the ActionButtons should be displayed with a [emphasized style](https://spectrum.adobe.com/page/action-button/#Emphasis). */
  isEmphasized?: boolean,
  /**
   * Sets the amount of space between buttons.
   * @default 'regular'
   */
  density?: 'compact' | 'regular',
  /** Whether the ActionButtons should be justified in their container. */
  isJustified?: boolean,
  /** Whether ActionButtons should use the [quiet style](https://spectrum.adobe.com/page/action-button/#Quiet). */
  isQuiet?: boolean,
  /** The static color style to apply. Useful when the ActionGroup appears over a color background. */
  staticColor?: 'white' | 'black',
  /**
   * Defines the behavior of the ActionGroup when the buttons do not fit in the available space.
   * When set to 'wrap', the items wrap to form a new line. When set to 'collapse', the items that
   * do not fit are collapsed into a dropdown menu.
   * @default 'wrap'
   */
  overflowMode?: 'wrap' | 'collapse',
  /**
   * Defines when the text within the buttons should be hidden and only the icon should be shown.
   * When set to 'hide', the text is always shown in a tooltip. When set to 'collapse', the text is visible
   * if space is available, and hidden when space is limited. The text is always visible when the item
   * is collapsed into a menu.
   * @default 'show'
   */
  buttonLabelBehavior?: 'show' | 'collapse' | 'hide',
  /** The icon displayed in the dropdown menu button when a selectable ActionGroup is collapsed. */
  summaryIcon?: ReactElement
}
