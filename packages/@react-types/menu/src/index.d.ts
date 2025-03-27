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

import {Alignment, AriaLabelingProps, CollectionBase, DOMProps, FocusStrategy, Key, MultipleSelection, StyleProps} from '@react-types/shared';
import {OverlayTriggerProps} from '@react-types/overlays';
import {ReactElement} from 'react';

export type MenuTriggerType = 'press' | 'longPress';

export interface MenuTriggerProps extends OverlayTriggerProps {
  /**
   * How the menu is triggered.
   * @default 'press'
   */
  trigger?: MenuTriggerType
}

export interface SpectrumMenuTriggerProps extends MenuTriggerProps {
  /**
   * The contents of the MenuTrigger - a trigger and a Menu.
   */
  children: ReactElement[],
  /**
   * Alignment of the menu relative to the trigger.
   * @default 'start'
   */
  align?: Alignment,
  /**
   * Where the Menu opens relative to its trigger.
   * @default 'bottom'
   */
  direction?: 'bottom' | 'top' | 'left' | 'right' | 'start' | 'end',
  /**
   * Whether the menu should automatically flip direction when space is limited.
   * @default true
   */
  shouldFlip?: boolean,
  /**
   * Whether the Menu closes when a selection is made.
   * @default true
   */
  closeOnSelect?: boolean
}

export interface MenuProps<T> extends CollectionBase<T>, MultipleSelection {
  /** Where the focus should be set. */
  autoFocus?: boolean | FocusStrategy,
  /** Whether keyboard navigation is circular. */
  shouldFocusWrap?: boolean,
  /** Handler that is called when an item is selected. */
  onAction?: (key: Key) => void,
  /** Handler that is called when the menu should close after selecting an item. */
  onClose?: () => void
}

export interface AriaMenuProps<T> extends MenuProps<T>, DOMProps, AriaLabelingProps {
  /**
   * Whether pressing the escape key should clear selection in the menu or not.
   *
   * Most experiences should not modify this option as it eliminates a keyboard user's ability to
   * easily clear selection. Only use if the escape key is being handled externally or should not
   * trigger selection clearing contextually.
   * @default 'clearSelection'
   */
  escapeKeyBehavior?: 'clearSelection' | 'none'
}
export interface SpectrumMenuProps<T> extends AriaMenuProps<T>, StyleProps {}

export interface SpectrumActionMenuProps<T> extends CollectionBase<T>, Omit<SpectrumMenuTriggerProps, 'children'>, StyleProps, DOMProps, AriaLabelingProps {
  /** Whether the button is disabled. */
  isDisabled?: boolean,
  /** Whether the button should be displayed with a [quiet style](https://spectrum.adobe.com/page/action-button/#Quiet). */
  isQuiet?: boolean,
  /** Whether the element should receive focus on render. */
  autoFocus?: boolean,
  /** Handler that is called when an item is selected. */
  onAction?: (key: Key) => void
}
