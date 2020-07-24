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
import {ListState, SingleSelectListState, useSingleSelectListState} from '@react-stately/list';
import React, {AriaAttributes, ReactNode, useEffect, useRef, useState} from 'react';
import styles from '@adobe/spectrum-css-temp/components/tabs/vars.css';
import {Tab} from './Tab';
import {useProviderProps} from '@react-spectrum/provider';
import {useTabs} from '@react-aria/tabs';

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

interface TabListProps<T> extends DOMProps, StyleProps, AriaAttributes {
  orientation?: Orientation,
  isQuiet?: boolean,
  density?: 'compact',
  isDisabled?: boolean,
  overflowMode?: 'dropdown' | 'scrolling',
  keyboardActivation?: 'automatic' | 'manual',
  children: CollectionChildren<TabProps<T>>,
  selectedItem?: any,
  defaultSelectedItem?: any,
  onSelectionChange?: (selectedItem: any) => void,
  isEmphasized?: boolean,
  state?: SingleSelectListState<TabProps<T>>
}

// TODO: Implement functionality related to overflowMode
export function TabList<T>(props: TabListProps<T>) {
  props = useProviderProps(props);
  let ref = useRef<any>(); // Had to put this <any> in order to get around a null check.
  let {
    orientation = 'horizontal',
    isQuiet = false,
    density = '',
    isDisabled,
    defaultSelectedItem,
    onSelectionChange,
    state: stateProp,
    children,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  let allKeys = React.Children.map(children, (child: ItemElement<TabProps<T>>) => child.key);
  let tabListState = useSingleSelectListState({ 
    ...props, 
    onSelectionChange,
    defaultSelectedKey: defaultSelectedItem || allKeys[0],
    disabledKeys: isDisabled ? [...allKeys] : []
  });
  let state = stateProp || tabListState;
  let {tabListProps} = useTabs(props, state, ref);
  let [selectedTab, setSelectedTab] = useState<HTMLElement>();
  
  useEffect(() => {
    let tabs: HTMLElement[] = Array.from(ref.current.querySelectorAll('.' + styles['spectrum-Tabs-item'])); // v3 what do we with these?
    setSelectedTab(tabs.find(tab => tab.dataset.key === state.selectedKey));
  }, [props.children, state.selectedKey]);

  return (
    <div
      {...styleProps}
      ref={ref}
      className={classNames(
        styles,
        'spectrum-Tabs',
        `spectrum-Tabs--${orientation}`,
        {'spectrum-Tabs--quiet': isQuiet},
        density ? `spectrum-Tabs--${density}` : '',
        styleProps.className
      )}
      {...tabListProps}>
      {[...state.collection].map(item => (
        <Tab
          {...item.props}
          key={item.key}
          item={item}
          state={state}
          orientation={orientation} />
      ))}
      {selectedTab && <TabLine orientation={orientation} selectedTab={selectedTab} />}
    </div>
  );
}

function TabLine({orientation, selectedTab}) {
  // v3 clean this up a bit
  // Ideally this would be a DNA variable, but vertical tabs aren't even in DNA, soo...
  let verticalSelectionIndicatorOffset = 12;

  let style = {
    transform: orientation === 'vertical'
      ? `translateY(${selectedTab.offsetTop + verticalSelectionIndicatorOffset / 2}px)`
      : `translateX(${selectedTab.offsetLeft}px) `,
    width: undefined,
    height: undefined
  };

  if (orientation === 'horizontal') {
    style.width = `${selectedTab.offsetWidth}px`;
  } else {
    style.height = `${selectedTab.offsetHeight - verticalSelectionIndicatorOffset}px`;
  }

  return <div className={classNames(styles, 'spectrum-Tabs-selectionIndicator')} role="presentation" style={style} />;
}
