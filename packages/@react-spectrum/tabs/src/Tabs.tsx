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
import {CollectionChildren, CollectionElement, DOMProps, Node, Orientation, StyleProps} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import {ListState, useSingleSelectListState} from '@react-stately/list';
import {mergeProps} from '@react-aria/utils';
import {Picker} from '@react-spectrum/picker';
import React, {Key, useEffect, useRef, useState} from 'react';
import {SpectrumTabsProps} from '@react-types/tabs';
import styles from '@adobe/spectrum-css-temp/components/tabs/vars.css';
import {useHover} from '@react-aria/interactions';
import {useProviderProps} from '@react-spectrum/provider';
import {useTab, useTabs} from '@react-aria/tabs';

export function Tabs<T extends object>(props: SpectrumTabsProps<T>) {
  props = useProviderProps(props);
  let {
    orientation = 'horizontal' as Orientation,
    children,
    onSelectionChange,
    isDisabled,
    isQuiet,
    density,
    defaultSelectedItem,
    overflowMode = 'scrolling',
    ...otherProps
  } = props;
  let ref = useRef<HTMLDivElement>();

  let allKeys = React.Children.map(children, (child: CollectionElement<T>) => child.key);
  let state = useSingleSelectListState<T>({
    ...props, 
    onSelectionChange,
    defaultSelectedKey: defaultSelectedItem || allKeys[0],
    disabledKeys: isDisabled ? [...allKeys] : []
  });
  
  let {styleProps} = useStyleProps(otherProps);
  let {tabListProps, tabPanelProps} = useTabs(props, state, ref);
  
  let selected = [...state.collection].find(item => state.selectionManager.selectedKeys.has(item.key));
  let [selectedTab, setSelectedTab] = useState<HTMLElement>();
  
  useEffect(() => {
    let tabs: HTMLElement[] = Array.from(ref.current.querySelectorAll('.' + styles['spectrum-Tabs-item']));
    if (overflowMode === 'scrolling') {
      setSelectedTab(tabs.find(tab => tab.dataset.key === state.selectedKey));
    }
    if (overflowMode === 'dropdown') {
      setSelectedTab(tabs[0]);
    }
  }, [props.children, state.selectedKey, overflowMode]);

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
        {overflowMode === 'scrolling' && [...state.collection].map(item => (
          <Tab
            key={item.key}
            item={item}
            state={state}
            isDisabled={isDisabled}
            orientation={orientation} />
        ))}
        {overflowMode === 'dropdown' && (
          <OverflowTab isDisabled={isDisabled} state={state}>
            {children}
          </OverflowTab>
        )}
        {selectedTab && <TabLine orientation={orientation} selectedTab={selectedTab} />}
      </div>
      <div {...tabPanelProps} className="react-spectrum-TabPanel-body">
        {selected && selected.props.children}
      </div>
    </div>
  );
}

interface TabProps<T> extends DOMProps, StyleProps {
  item: Node<T>,
  state: ListState<T>,
  isDisabled?: boolean,
  orientation?: Orientation
}

export function Tab<T>(props: TabProps<T>) {
  let {item, state, ...otherProps} = props;
  let {styleProps} = useStyleProps(otherProps);
  let {
    key,
    rendered
  } = item;

  /** Needs to be HTMLButtonElement. */
  let ref = useRef<HTMLDivElement>();
  let {tabProps} = useTab({
    item,
    ref
  }, state);

  let {hoverProps, isHovered} = useHover({
    ...props
  });
  let isSelected = state.selectionManager.selectedKeys.has(key);
  let isDisabled = state.disabledKeys.has(key);

  let icon = item.props.icon ? React.cloneElement(item.props.icon, {
    size: 'S',
    UNSAFE_className: classNames(styles, 'spectrum-Icon')
  }) : undefined;

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <div // Needs to be a button.
        {...styleProps}
        {...mergeProps(tabProps, hoverProps)}
        ref={ref}
        className={classNames(
          styles,
          'spectrum-Tabs-item',
          {
            'is-selected': isSelected,
            'is-disabled': isDisabled,
            'is-hovered': isHovered
          },
          styleProps.className
        )}>
        {icon}
        {rendered && <span className={classNames(styles, 'spectrum-Tabs-itemLabel')}>{rendered}</span>}
      </div>
    </FocusRing>
  );
}

interface OverflowTabProps<T> extends DOMProps, StyleProps {
  children: CollectionChildren<T>,
  state: ListState<T>,
  isDisabled?: boolean,
  defaultSelectedItem?: Key
}

/** This is currently under construction: just for testing. */
function OverflowTab<T = object>(props: OverflowTabProps<T>) {
  let {
    children,
    state,
    isDisabled,
    defaultSelectedItem
  } = props;
  let selected = [...state.collection].find(item => state.selectionManager.selectedKeys.has(item.key));

  return (
    <Picker
      isQuiet
      isDisabled={isDisabled}
      onSelectionChange={key => state.selectionManager.replaceSelection(key)}
      defaultSelectedKey={defaultSelectedItem}
      selectedKey={selected.key}
      UNSAFE_className={classNames(styles, 'spectrum-Tabs-item')} >
      {children}
    </Picker>
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
