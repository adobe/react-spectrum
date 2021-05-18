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
  CollectionChildren,
  DOMProps,
  Orientation,
  SingleSelection,
  StyleProps
} from '@react-types/shared';
import {Key, ReactNode} from 'react';

export interface AriaTabProps {
  /** The key of the tab. */
  key: Key,
  /** Whether the tab should be disabled. */
  isDisabled?: boolean
}

export interface TabListProps<T> extends CollectionBase<T>, Omit<SingleSelection, 'disallowEmptySelection'> {}

interface AriaTabListBase {
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

export interface AriaTabListProps<T> extends TabListProps<T>, AriaTabListBase, DOMProps, AriaLabelingProps {}

export interface AriaTabPanelProps extends DOMProps, AriaLabelingProps {}

export interface SpectrumTabsProps<T> extends AriaTabListBase, SingleSelection, DOMProps, StyleProps {
  /** The children of the <Tabs> element. Should include `<TabList>` and `<TabPanels>` elements. */
  children: ReactNode,
  /** The item objects for each tab, for dynamic collections. */
  items?: Iterable<T>,
  /** The keys of the tabs that are disabled. These tabs cannot be selected, focused, or otherwise interacted with. */
  disabledKeys?: Iterable<Key>,
  /** Whether the tabs are displayed in a quiet style. */
  isQuiet?: boolean,
  /** The amount of space between the tabs. */
  density?: 'compact' | 'regular'
}

export interface SpectrumTabListProps<T> extends DOMProps, StyleProps {
  /** The tab items to display. Item keys should match the key of the corresponding `<Item>` within the `<TabPanels>` element. */
  children: CollectionChildren<T>
}

export interface SpectrumTabPanelsProps<T> extends DOMProps, StyleProps {
  /** The contents of each tab. Item keys should match the key of the corresponding `<Item>` within the `<TabList>` element. */
  children: CollectionChildren<T>
}
