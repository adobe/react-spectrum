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

import {AriaTabPanelProps} from '@react-types/tabs';
import {DOMAttributes} from '@react-types/shared';
import {generateId} from './utils';
import {mergeProps, useLabels} from '@react-aria/utils';
import {RefObject} from 'react';
import {TabListState} from '@react-stately/tabs';
import {useHasTabbableChild} from '@react-aria/focus';

export interface TabPanelAria {
  /** Props for the tab panel element. */
  tabPanelProps: DOMAttributes
}


/**
 * Provides the behavior and accessibility implementation for a tab panel. A tab panel is a container for
 * the contents of a tab, and is shown when the tab is selected.
 */
export function useTabPanel<T>(props: AriaTabPanelProps, state: TabListState<T>, ref: RefObject<Element>): TabPanelAria {
  // The tabpanel should have tabIndex=0 when there are no tabbable elements within it.
  // Otherwise, tabbing from the focused tab should go directly to the first tabbable element
  // within the tabpanel.
  let tabIndex = useHasTabbableChild(ref) ? undefined : 0;

  const id = generateId(state, props.id ?? state?.selectedKey, 'tabpanel');
  const tabPanelProps = useLabels({...props, id, 'aria-labelledby': generateId(state, state?.selectedKey, 'tab')});

  return {
    tabPanelProps: mergeProps(tabPanelProps, {
      tabIndex,
      role: 'tabpanel',
      'aria-describedby': props['aria-describedby'],
      'aria-details': props['aria-details']
    })
  };
}
