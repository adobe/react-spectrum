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
import {ItemElement, Orientation} from '@react-types/shared';
import {useSingleSelectListState} from '@react-stately/list';
import React, {useEffect, useRef, useState} from 'react';
import {SpectrumTabsProps, TabProps} from '@react-types/tabs';
import styles from '@adobe/spectrum-css-temp/components/tabs/vars.css';
import {Tab} from './Tab';
import {useProviderProps} from '@react-spectrum/provider';
import { useTabs } from '@react-aria/tabs';

export function Tabs<T>(props: SpectrumTabsProps<T>) {
  props = useProviderProps(props);
  let {
    orientation = 'horizontal' as Orientation,
    children,
    onSelectionChange,
    isDisabled,
    isQuiet,
    density,
    defaultSelectedItem,
    ...otherProps
  } = props;
  let ref = useRef<any>();

  let allKeys = React.Children.map(children, (child: ItemElement<TabProps<T>>) => child.key);
  let state = useSingleSelectListState({ 
    ...props, 
    onSelectionChange,
    defaultSelectedKey: defaultSelectedItem || allKeys[0],
    disabledKeys: isDisabled ? [...allKeys] : []
  });
  
  
  let {styleProps} = useStyleProps(otherProps);
  let {tabListProps} = useTabs(props, state, ref);
  
  let selected = [...state.collection].find(item => state.selectionManager.selectedKeys.has(item.key));
  let [selectedTab, setSelectedTab] = useState<HTMLElement>();
  
  useEffect(() => {
    let tabs: HTMLElement[] = Array.from(ref.current.querySelectorAll('.' + styles['spectrum-Tabs-item'])); // v3 what do we with these?
    setSelectedTab(tabs.find(tab => tab.dataset.key === state.selectedKey));
  }, [props.children, state.selectedKey]);

  return (
    <div
      {...styleProps}
      className={classNames(
        {},
        'react-spectrum-TabPanel',
        `react-spectrum-TabPanel--${orientation}`,
        styleProps.className
      )}>
       <div
        {...styleProps}
        {...tabListProps}
        ref={ref}
        className={classNames(
          styles,
          'spectrum-Tabs',
          `spectrum-Tabs--${orientation}`,
          {'spectrum-Tabs--quiet': isQuiet},
          density ? `spectrum-Tabs--${density}` : '',
          styleProps.className
        )} >
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
      <div id="fix-me-tab-id" aria-labelledby="fix-me" role="tabpanel" tabIndex={0} className="react-spectrum-TabPanel-body">
        {selected && selected.props.children}
      </div>
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
