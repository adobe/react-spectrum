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

import {Alignment, CollectionBase, DOMProps, MultipleSelection, StyleProps} from '@react-types/shared';
import {Key, ReactElement} from 'react';

export type FocusStrategy = 'first' | 'last';

export interface MenuTriggerProps {
  // trigger?: 'press' | 'longPress',
  /** Where the Menu aligns with it's trigger. */
  align?: Alignment,
  /** Where the Menu opens relative to it's trigger. */
  direction?: 'bottom' | 'top',
  /** Whether the Menu closes when a selection is made. */
  closeOnSelect?: boolean,
  /** Whether the Menu loads and stays open. */
  isOpen?: boolean,
  /** Whether the Menu loads open. */
  defaultOpen?: boolean,
  /** Handler that is called when the Menu opens or closes. */
  onOpenChange?: (isOpen: boolean) => void,
  /** Weather to flip if the scroll size is greater then available space. */
  shouldFlip?: boolean
}

export interface SpectrumMenuTriggerProps extends MenuTriggerProps {
  /** The contents of the MenuTrigger. */
  children: ReactElement[]
}

export interface MenuProps<T> extends CollectionBase<T>, MultipleSelection {
  /** Where the focus should be set. */
  autoFocus?: boolean | FocusStrategy,
  /** Whether keyboard navigation is circular. */
  shouldFocusWrap?: boolean,
  /** Handler that is called when an item is selected. */
  onAction?: (key: Key) => void
}

export interface SpectrumMenuProps<T> extends MenuProps<T>, DOMProps, StyleProps {
}
