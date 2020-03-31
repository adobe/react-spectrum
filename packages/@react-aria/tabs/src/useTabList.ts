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

import {Orientation} from '@react-types/shared';
import React, {HTMLAttributes, ReactElement} from 'react';
import {useId} from '@react-aria/utils';

interface AriaTabListProps {
  orientation?: Orientation
}

interface AriaTabProps {
  isDisabled?: boolean,
  isSelected?: boolean,
  onSelect?: () => void,
  id?: string
}

interface AriaTabsProps extends HTMLAttributes<HTMLElement>{
  children?: ReactElement | ReactElement[],
}

interface TabListAria {
  tabListProps: HTMLAttributes<HTMLElement>
}

interface TabAria {
  tabProps: HTMLAttributes<HTMLElement>
}

interface TabsAria {
  tabPanelProps: HTMLAttributes<HTMLElement>,
  tabsPropsArray: Array<HTMLAttributes<HTMLElement>>
}

export function useTabList(props: AriaTabListProps): TabListAria {
  let {
    orientation = 'horizontal' as Orientation
  } = props;

  return {
    tabListProps: {
      role: 'tablist',
      'aria-orientation': orientation
    }
  };
}

export function useTab(props: AriaTabProps): TabAria {
  let {
    isSelected,
    isDisabled,
    onSelect,
    id
  } = props;

  return {
    tabProps: {
      id: useId(id),
      'aria-selected': isSelected,
      'aria-disabled': isDisabled,
      tabIndex: isSelected ? 0 : -1,
      role: 'tab',
      onClick: () => isDisabled ? null : onSelect(),
      onKeyPress: (e) => {
        if (!isDisabled) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect();
          }
        }
      }
    }
    // keyboardActivation?
  };
}

export function useTabs(props: AriaTabsProps, state: any): TabsAria {
  let selectedTabId;
  let tabPanelId = useId();
  let tabsPropsArray = [];

  React.Children.forEach(props.children, (child) => {
    let tabProps = {
      'aria-controls': tabPanelId
    };
    tabsPropsArray.push(tabProps);
    if (child && child.props.value === state.selectedItem) {
      selectedTabId = child.props.id;
    }
  });

  if (selectedTabId == null) {
    selectedTabId = React.Children.toArray(props.children)[0].props.id;
  }

  return {
    tabPanelProps: {
      'aria-labelledby': selectedTabId,
      tabIndex: 0,
      role: 'tabpanel',
      id: tabPanelId
    },
    tabsPropsArray
  };
}
