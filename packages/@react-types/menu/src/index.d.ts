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

import {Alignment, AriaLabelingProps, CollectionBase, DOMProps, FocusStrategy, MultipleSelection, StyleProps} from '@react-types/shared';
import {Key, ReactElement} from 'react';
import {OverlayTriggerProps} from '@react-types/overlays';

export interface MenuTriggerProps extends OverlayTriggerProps {
  // trigger?: 'press' | 'longPress',
  /** Where the Menu aligns with its trigger. */
  align?: Alignment,
  /** Where the Menu opens relative to its trigger. */
  direction?: 'bottom' | 'top',
  /** Whether the Menu closes when a selection is made. */
  closeOnSelect?: boolean,
  /**
   * Whether the element should flip its orientation when there is insufficient
   * space for it to render within the view.
   */
  shouldFlip?: boolean
}

export interface SpectrumMenuTriggerProps extends MenuTriggerProps {
  /**
   * The contents of the MenuTrigger, a trigger and a Menu. See the MenuTrigger
   * [Content section](#content) for more information on what to provide as children.
   */
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

export interface AriaMenuProps<T> extends MenuProps<T>, DOMProps, AriaLabelingProps {}
export interface SpectrumMenuProps<T> extends AriaMenuProps<T>, StyleProps {}
