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

import {classNames, useStyleProps} from '@react-spectrum/utils';
import {CollectionChildren, DOMProps, ItemElement, Node, Orientation, StyleProps} from '@react-types/shared';
import {ListState, useSingleSelectListState} from '@react-stately/list';
import React, {ReactNode} from 'react';
import {TabList} from './TabList';
import {useProviderProps} from '@react-spectrum/provider';

interface TabProps<T> extends DOMProps, StyleProps {
  id?: string,
  item: Node<T>,
  state: ListState<T>,
  title?: ReactNode,
  icon?: ReactNode,
  children?: ReactNode,
  isDisabled?: boolean,
  orientation?: Orientation
}

interface TabsProps<T> extends DOMProps, StyleProps {
  orientation?: Orientation,
  isQuiet?: boolean,
  density?: 'compact',
  overflowMode?: 'dropdown' | 'scrolling',
  keyboardActivation?: 'automatic' | 'manual',
  children: CollectionChildren<TabProps<T>>,
  selectedItem?: any,
  defaultSelectedItem?: any,
  onSelectionChange?: (selectedItem: any) => void,
  isEmphasized?: boolean,
  isDisabled?: boolean
}

export function Tabs<T>(props: TabsProps<T>) {
  props = useProviderProps(props);
  let {
    orientation = 'horizontal' as Orientation,
    children,
    onSelectionChange,
    isDisabled,
    defaultSelectedItem,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  let allKeys = React.Children.map(children, (child: ItemElement<TabProps<T>>) => child.key);
  let state = useSingleSelectListState({ 
    ...props, 
    onSelectionChange,
    defaultSelectedKey: defaultSelectedItem || allKeys[0],
    disabledKeys: isDisabled ? [...allKeys] : []
  });
  let selected = [...state.collection].find(item => state.selectionManager.selectedKeys.has(item.key));

  return (
    <div
      {...styleProps}
      className={classNames(
        {},
        'react-spectrum-TabPanel',
        `react-spectrum-TabPanel--${orientation}`,
        styleProps.className
      )}>
      <TabList
        {...otherProps}
        state={state}
        isDisabled={isDisabled}
        orientation={orientation}
        defaultSelectedItem={defaultSelectedItem}
        onSelectionChange={onSelectionChange}>
        {children}
      </TabList>
      <div id="fix-me-tab-id" aria-labelledby="fix-me" role="tabpanel" tabIndex={0} className="react-spectrum-TabPanel-body">
        {selected && selected.props.children}
      </div>
    </div>
  );
}
