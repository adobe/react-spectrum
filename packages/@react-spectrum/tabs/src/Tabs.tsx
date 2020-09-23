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
import {DOMProps, Node, Orientation, StyleProps} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import {mergeProps, useLayoutEffect} from '@react-aria/utils';
import React, {useEffect, useRef, useState} from 'react';
import {SingleSelectListState, useSingleSelectListState} from '@react-stately/list';
import {SpectrumTabsProps} from '@react-types/tabs';
import styles from '@adobe/spectrum-css-temp/components/tabs/vars.css';
import tabsStyles from './tabs.css';
import {useHover} from '@react-aria/interactions';
import {useLocale} from '@react-aria/i18n';
import {useProvider, useProviderProps} from '@react-spectrum/provider';
import {useTab, useTabs} from '@react-aria/tabs';

export function Tabs<T extends object>(props: SpectrumTabsProps<T>) {
  props = useProviderProps(props);
  let {
    orientation = 'horizontal' as Orientation,
    onSelectionChange,
    isDisabled,
    isQuiet,
    density,
    ...otherProps
  } = props;
  let ref = useRef<HTMLDivElement>();
  let state = useSingleSelectListState<T>({
    ...props,
    onSelectionChange
  });

  let {styleProps} = useStyleProps(otherProps);
  let {tabListProps, tabPanelProps} = useTabs(props, state, ref);
  let [selectedTab, setSelectedTab] = useState<HTMLElement>();

  useEffect(() => {
    let tabs: HTMLElement[] = Array.from(ref.current.querySelectorAll('.' + styles['spectrum-Tabs-item']));
    setSelectedTab(tabs.find((tab) => tab.dataset.key === state.selectedKey));
  }, [props.children, state.selectedKey]);

  return (
    <div
      {...styleProps}
      className={classNames(
        tabsStyles,
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
        )}>
        {[...state.collection].map((item) => (
          <Tab key={item.key} item={item} state={state} isDisabled={isDisabled} orientation={orientation} />
        ))}
        {selectedTab && <TabLine orientation={orientation} selectedTab={selectedTab} />}
      </div>
      <div {...tabPanelProps} className="react-spectrum-TabPanel-body">
        {state.selectedItem && state.selectedItem.props.children}
      </div>
    </div>
  );
}

interface TabProps<T> extends DOMProps, StyleProps {
  item: Node<T>,
  state: SingleSelectListState<T>,
  isDisabled?: boolean,
  orientation?: Orientation
}

export function Tab<T>(props: TabProps<T>) {
  let {item, state, isDisabled: propsDisabled, ...otherProps} = props;
  let {styleProps} = useStyleProps(otherProps);
  let {key, rendered} = item;
  let isDisabled = propsDisabled || state.disabledKeys.has(key);

  let ref = useRef<HTMLDivElement>();
  let {tabProps} = useTab({item, isDisabled}, state, ref);

  let {hoverProps, isHovered} = useHover({
    ...props
  });
  let isSelected = state.selectedKey === key;

  let icon = item.props.icon ? React.cloneElement(item.props.icon, {
    size: 'S',
    UNSAFE_className: classNames(styles, 'spectrum-Icon')
  }) : undefined;

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <div
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

function TabLine({orientation, selectedTab}) {
  let verticalSelectionIndicatorOffset = 12;
  let {direction} = useLocale();
  let {scale} = useProvider();

  let [style, setStyle] = useState({
    width: undefined,
    height: undefined,
    transform: undefined
  });

  useLayoutEffect(() => {
    let styleObj = {transform: undefined, width: undefined, height: undefined};
    styleObj.transform = orientation === 'vertical'
      ? `translateY(${selectedTab.offsetTop + verticalSelectionIndicatorOffset / 2}px)`
      : `translateX(${selectedTab.offsetLeft}px) `;

    if (orientation === 'horizontal') {
      styleObj.width = `${selectedTab.offsetWidth}px`;
    } else {
      styleObj.height = `${selectedTab.offsetHeight - verticalSelectionIndicatorOffset}px`;
    }
    setStyle(styleObj);
  }, [direction, setStyle, selectedTab, orientation, scale]);

  return <div className={classNames(styles, 'spectrum-Tabs-selectionIndicator')} role="presentation" style={style} />;
}
