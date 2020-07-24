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
import {AriaLabelingProps, CollectionBase, KeyboardDelegate, Node, Orientation, SingleSelection} from '@react-types/shared';
import {HTMLAttributes, RefObject, useMemo} from 'react';
import {ListState} from '@react-stately/list';
import {TabsKeyboardDelegate} from './TabsKeyboardDelegate';
import {useId} from '@react-aria/utils';
import {usePress} from '@react-aria/interactions';
import {useSelectableItem, useSelectableList} from '@react-aria/selection';

interface TabsProps<T> extends CollectionBase<T>, SingleSelection, AriaLabelingProps {
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
  keyboardDelegate?: KeyboardDelegate
}

interface TabsAria {
  /** Props for the tablist container. */
  tabListProps: HTMLAttributes<HTMLElement>
}

export function useTabs<T>(props: TabsProps<T>, state: ListState<T>, ref): TabsAria {
  let {
    'aria-label': ariaLabel,
    keyboardDelegate,
    orientation = 'horizontal',
    keyboardActivation = 'automatic'
  } = props;
  let {
    collection,
    selectionManager: manager,
    disabledKeys
  } = state;

  let delegate = useMemo(() => keyboardDelegate || new TabsKeyboardDelegate({
    disabledKeys: disabledKeys,
    collection: collection,
    orientation
  }), [keyboardDelegate, collection, disabledKeys, orientation]);

  let {listProps} = useSelectableList({
    selectionManager: manager,
    collection,
    disabledKeys,
    keyboardDelegate: delegate,
    ref,
    selectOnFocus: keyboardActivation === 'automatic',
    disallowEmptySelection: true
  });
  return {
    tabListProps: {
      ...listProps,
      role: 'tablist',
      'aria-label': ariaLabel
    }
  };
}

interface TabAria {
  /** Props for the tab element. */
  tabProps: HTMLAttributes<HTMLElement>,
  /** Props for the associated tabpanel element. */
  tabPanelProps: HTMLAttributes<HTMLElement>
}

interface TabAriaProps<T> {
  id?: string,
  /** Collection node for the tab. */
  item: Node<T>,
  /** Ref to the tab. */
  ref: RefObject<HTMLElement>,
  /** A delegate object that implements behavior for keyboard focus movement. */
  keyboardDelegate?: KeyboardDelegate,
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
  isDisabled?: boolean
}

export function useTab<T>(props: TabAriaProps<T>, state: ListState<T>): TabAria {
  let {
    id,
    item, 
    ref,
    isDisabled: isDisabledProp
  } = props;
  let {key} = item;
  let {
    selectionManager: manager,
    disabledKeys
  } = state;


  let isSelected = manager.selectedKeys.has(key);
  let isDisabled = isDisabledProp || disabledKeys.has(key);

  let {itemProps} = useSelectableItem({
    selectionManager: manager,
    shouldSelectOnPressUp: true,
    key,
    ref
  });

  let {pressProps} = usePress({...itemProps, isDisabled});
  let tabId = useId(id);
  let tabPanelId = useId(`${tabId}-panel`);

  return {
    tabProps: {
      ...pressProps,
      id: tabId,
      'aria-selected': isSelected,
      'aria-disabled': isDisabled,
      'aria-controls': tabPanelId,
      tabIndex: !isDisabled && isSelected ? 0 : -1,
      role: 'tab'
    },
    tabPanelProps: {
      id: tabPanelId,
      'aria-labelledby': tabId,
      role: 'tabpanel',
      tabIndex: 0
    }
  };
}
