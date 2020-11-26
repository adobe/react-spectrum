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

import {
  AriaLabelingProps,
  CollectionBase,
  DOMProps,
  Node,
  Orientation,
  SingleSelection,
  StyleProps
} from '@react-types/shared';
import {Key} from 'react';

export interface AriaTabProps<T> {
  /** Collection node for the tab. */
  item: Node<T>,
  /** Whether the tab should be disabled. */
  isDisabled?: boolean
}

export interface TabsProps<T> extends CollectionBase<T>, SingleSelection {}

export interface AriaTabsProps<T> extends TabsProps<T>, DOMProps, AriaLabelingProps {
  /**
   * Whether tabs are activated automatically on focus or manually.
   * @default 'automatic'
   */
  keyboardActivation?: 'automatic' | 'manual',
  /**
   * The orientation of the tabs.
   * @default 'horizontal'
   */
  orientation?: Orientation,
  /**
   * Whether the Tabs are disabled.
   * Shows that a selection exists, but is not available in that circumstance.
   */
  isDisabled?: boolean
}

export interface SpectrumTabsProps<T> extends AriaTabsProps<T>, StyleProps {
  /** Whether the Tabs should be displayed with a quiet style. */
  isQuiet?: boolean,
  /**
   * Sets the amount of space between the Tab and the Tab rail.
   * @default 'regular'
   */
  density?: 'compact' | 'regular',
  // overflowMode?: 'dropdown' | 'scrolling',
  // isEmphasized?: boolean,
  /** Whether Tabs are disabled. */
  isDisabled?: boolean,
  /** Handler that is called when the tab selection changes. */
  onSelectionChange?: (selectedItem: Key) => void,
  /** The currently selected Tab key in the collection (controlled). */
  selectedKey?: Key,
  /** The initial selected Tab key in the collection (uncontrolled). */
  defaultSelectedKey?: Key
}
