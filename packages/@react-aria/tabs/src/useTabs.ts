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

import {AriaTabProps, AriaTabsProps} from '@react-types/tabs';
import {HTMLAttributes, Key, RefObject, useMemo} from 'react';
import {mergeProps, useId, useLabels} from '@react-aria/utils';
import {SingleSelectListState} from '@react-stately/list';
import {TabsKeyboardDelegate} from './TabsKeyboardDelegate';
import {TabsState} from '@react-stately/tabs';
import {useLocale} from '@react-aria/i18n';
import {usePress} from '@react-aria/interactions';
import {useSelectableCollection, useSelectableItem} from '@react-aria/selection';

interface TabsAria {
  /** Props for the tablist container. */
  tabListProps: HTMLAttributes<HTMLElement>,
  /** Props for the associated tabpanel element. */
  tabPanelProps: HTMLAttributes<HTMLElement>
}

const tabsIds = new WeakMap<SingleSelectListState<unknown>, string>();

export function useTabs<T>(props: AriaTabsProps<T>, state: TabsState<T>, ref): TabsAria {
  let {
    orientation = 'horizontal',
    keyboardActivation = 'automatic'
  } = props;
  let {
    collection,
    selectionManager: manager,
    disabledKeys,
    selectedKey
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
    disallowEmptySelection: true
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
    },
    tabPanelProps: {
      id: generateId(state, selectedKey, 'tabpanel'),
      'aria-labelledby': generateId(state, selectedKey, 'tab'),
      tabIndex: 0,
      role: 'tabpanel'
    }
  };
}

interface TabAria {
  /** Props for the tab element. */
  tabProps: HTMLAttributes<HTMLElement>
}

export function useTab<T>(
  props: AriaTabProps<T>,
  state: SingleSelectListState<T>,
  ref: RefObject<HTMLElement>
): TabAria {
  let {item, isDisabled: propsDisabled} = props;
  let {key} = item;
  let {selectionManager: manager, selectedKey} = state;

  let isSelected = key === selectedKey;

  let {itemProps} = useSelectableItem({
    selectionManager: manager,
    key,
    ref
  });
  let isDisabled = propsDisabled || state.disabledKeys.has(key);

  let {pressProps} = usePress({...itemProps, isDisabled});
  let tabId = generateId(state, key, 'tab');
  let tabPanelId = generateId(state, key, 'tabpanel');
  let {tabIndex} = pressProps;

  // selected tab should have tabIndex=0, when it initializes
  if (isSelected && !isDisabled) {
    tabIndex = 0;
  }

  return {
    tabProps: {
      ...pressProps,
      id: tabId,
      'aria-selected': isSelected,
      'aria-disabled': isDisabled || undefined,
      'aria-controls': isSelected ? tabPanelId : undefined,
      tabIndex: isDisabled ? undefined : tabIndex,
      role: 'tab'
    }
  };
}

function generateId<T>(state: SingleSelectListState<T>, key: Key, role: string) {
  if (typeof key === 'string') {
    key = key.replace(/\s+/g, '');
  }

  let baseId = tabsIds.get(state);
  return `${baseId}-${role}-${key}`;
}
