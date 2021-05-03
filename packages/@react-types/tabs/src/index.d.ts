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
import {Key} from 'react';

export interface AriaTabProps {
  /** The key of the tab. */
  key: Key,
  /** Whether the tab should be disabled. */
  isDisabled?: boolean
}

export interface TabListProps<T> extends CollectionBase<T>, SingleSelection {}

export interface AriaTabListProps<T> extends TabListProps<T>, DOMProps, AriaLabelingProps {
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

export interface AriaTabPanelProps extends DOMProps, AriaLabelingProps {}

interface SpectrumTabsProps<T> extends SingleSelection, DOMProps, StyleProps {
  items?: Iterable<T>,
  keyboardActivation?: 'automatic' | 'manual',
  orientation?: Orientation,
  isDisabled?: boolean,
  disabledKeys?: Iterable<Key>,
  isQuiet?: boolean,
  density?: 'compact' | 'regular',
  children: any
}

export interface SpectrumTabListProps<T> extends DOMProps, StyleProps {
  children: CollectionChildren<T>
}

export interface SpectrumTabPanelsProps<T> extends DOMProps, StyleProps {
  children: CollectionChildren<T>
}
