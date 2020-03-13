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

import {classNames, filterDOMProps, useSlotProps, useStyleProps} from '@react-spectrum/utils';
import {DOMProps, Orientation, StyleProps} from '@react-types/shared';
import React, {ReactElement, ReactNode} from 'react';
import styles from '../style/index.css';
import {TabList} from './TabList';
import {useProviderProps} from '@react-spectrum/provider';
import {useTabListState} from '@react-stately/tabs';
import {useTabs} from '@react-aria/tabs';

interface TabProps extends DOMProps, StyleProps {
  icon?: ReactNode,
  label?: ReactNode,
  value: any,
  children?: ReactNode,
  isDisabled?: boolean,
  isSelected?: boolean, // Had to add this, TS complains in TabList in renderTabs
  onSelect?: () => void
}

interface TabsProps extends DOMProps, StyleProps {
  orientation?: Orientation,
  isQuiet?: boolean,
  density?: 'compact',
  isDisabled?: boolean,
  overflowMode?: 'dropdown' | 'scrolling',
  keyboardActivation?: 'automatic' | 'manual',
  children: ReactElement<TabProps> | ReactElement<TabProps>[],
  selectedItem?: any,
  defaultSelectedItem?: any,
  onSelectionChange?: (selectedItem: any) => void,
  isEmphasized?: boolean
}

export function Tabs(props: TabsProps) {
  props = useProviderProps(props);
  props = useSlotProps(props);
  let state = useTabListState(props);
  let {
    orientation = 'horizontal' as Orientation,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);

  let {tabPanelProps, tabsPropsArray} = useTabs(props, state);
  let children = React.Children.map(props.children, (c, i) =>
    // @ts-ignore - TODO fix
    typeof c === 'object' && c ? React.cloneElement(c, tabsPropsArray[i]) : c
  );

  let selected = children.find((child) => child.props.value === state.selectedItem) || children[0];
  let body = selected.props.children;

  return (
    <div
      {...filterDOMProps(otherProps)}
      {...styleProps}
      className={classNames(
        styles,
        'react-spectrum-TabPanel',
        `react-spectrum-TabPanel--${orientation}`,
        styleProps.className
      )}>
      <TabList
        {...otherProps}
        orientation={orientation}
        onSelectionChange={state.setSelectedItem}>
        {children}
      </TabList>
      <div
        className="react-spectrum-TabPanel-body"
        {...tabPanelProps}>
        {body}
      </div>
    </div>
  );
}
