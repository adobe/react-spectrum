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

import {AriaTabListProps} from '@react-types/tabs';
import {DOMAttributes, RefObject} from '@react-types/shared';
import {mergeProps, useId, useLabels} from '@react-aria/utils';
import {TabListState} from '@react-stately/tabs';
import {tabsIds} from './utils';
import {TabsKeyboardDelegate} from './TabsKeyboardDelegate';
import {useLocale} from '@react-aria/i18n';
import {useMemo} from 'react';
import {useSelectableCollection} from '@react-aria/selection';

export interface AriaTabListOptions<T> extends Omit<AriaTabListProps<T>, 'children'> {}

export interface TabListAria {
  /** Props for the tablist container. */
  tabListProps: DOMAttributes
}

/**
 * Provides the behavior and accessibility implementation for a tab list.
 * Tabs organize content into multiple sections and allow users to navigate between them.
 */
export function useTabList<T>(props: AriaTabListOptions<T>, state: TabListState<T>, ref: RefObject<HTMLElement | null>): TabListAria {
  let {
    orientation = 'horizontal',
    keyboardActivation = 'automatic'
  } = props;
  let {
    collection,
    selectionManager: manager,
    disabledKeys
  } = state;
  let {direction} = useLocale();
  let delegate = useMemo(() => new TabsKeyboardDelegate(
    collection,
    direction,
    orientation,
    disabledKeys), [collection, disabledKeys, orientation, direction]);

  let {collectionProps} = useSelectableCollection({
    ref,
    selectionManager: manager,
    keyboardDelegate: delegate,
    selectOnFocus: keyboardActivation === 'automatic',
    disallowEmptySelection: true,
    scrollRef: ref,
    linkBehavior: 'selection'
  });

  // Compute base id for all tabs
  let tabsId = useId();
  tabsIds.set(state, tabsId);

  let tabListLabelProps = useLabels({...props, id: tabsId});

  return {
    tabListProps: {
      ...mergeProps(collectionProps, tabListLabelProps),
      role: 'tablist',
      'aria-orientation': orientation,
      tabIndex: undefined
    }
  };
}
