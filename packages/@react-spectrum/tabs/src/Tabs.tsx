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

import {classNames, SlotProvider, unwrapDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMProps, Node, Orientation, StyleProps} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import {Item, Picker} from '@react-spectrum/picker';
import {mergeProps, useLayoutEffect} from '@react-aria/utils';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {SingleSelectListState, useSingleSelectListState} from '@react-stately/list';
import {SpectrumTabsProps} from '@react-types/tabs';
import styles from '@adobe/spectrum-css-temp/components/tabs/vars.css';
import tabsStyles from './tabs.css';
import {Text} from '@react-spectrum/text';
import {useHover} from '@react-aria/interactions';
import {useLocale} from '@react-aria/i18n';
import {useProvider, useProviderProps} from '@react-spectrum/provider';
import {useResizeObserver} from '@react-aria/utils';
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

  let {direction} = useLocale();
  let {styleProps} = useStyleProps(otherProps);
  let {tabListProps, tabPanelProps} = useTabs(props, state, ref);
  let [selectedTab, setSelectedTab] = useState<HTMLElement>();
  let [collapse, setCollapse] = useState(false);

  useEffect(() => {
    let tabs: HTMLElement[] = Array.from(ref.current.querySelectorAll('.' + styles['spectrum-Tabs-item']));
    let selectedTab = tabs.find((tab) => tab.dataset.key === state.selectedKey);

    // default to first tab if selectedTab is deleted from children
    if (selectedTab != null) {
      setSelectedTab(selectedTab);
    } else if (tabs[0]) {
      state.setSelectedKey(tabs[0].dataset.key);
      setSelectedTab(tabs[0]);
    }
  }, [props.children, state]);

  let onResize = useCallback(() => {
    let getFurthestPoint = (elem) => {
      if (direction === 'rtl') {
        return elem.getBoundingClientRect().left;
      } else {
        return elem.getBoundingClientRect().right;
      }
    };

    let tabsComponent = ref.current;
    let tabs = Array.from(ref.current.children);
    // The last child is the TabLine so we look at the second to last child for the last Tab
    let lastTab = tabs[tabs.length - 2];

    let farEdgeTabList = getFurthestPoint(tabsComponent);
    let farEdgeLastTab = getFurthestPoint(lastTab);
    let shouldCollapse = direction === 'rtl' ? farEdgeLastTab < farEdgeTabList : farEdgeTabList < farEdgeLastTab;

    if (shouldCollapse) {
      setCollapse(true);
    } else {
      setCollapse(false);
    }
  }, [ref, direction]);

  useEffect(() => {
    onResize();
  }, [props.children, onResize]);

  useResizeObserver({ref: ref, onResize: onResize});

  let hidden = collapse && orientation !== 'vertical';
  let tablist = (
    <>
      <div
        {...styleProps}
        {...tabListProps}
        aria-hidden={hidden}
        ref={ref}
        className={classNames(
          styles,
          'spectrum-Tabs',
          `spectrum-Tabs--${orientation}`,
          {
            'spectrum-Tabs--quiet': isQuiet
          },
          density ? `spectrum-Tabs--${density}` : '',
          classNames(
            tabsStyles,
            {
              // TODO: Ask if I should use VisuallyHidden instead, felt kinda weird using it since I apply aria-hidden above
              'react-spectrum-Tabs--hidden': collapse && orientation !== 'vertical'
            },
            'react-spectrum-Tabs--container'
          ),
          styleProps.className
        )}>
        {[...state.collection].map((item) => (
          <Tab key={item.key} item={item} state={state} isDisabled={isDisabled} orientation={orientation} />
        ))}
        <TabLine orientation={orientation} selectedTab={selectedTab} />
      </div>
      {(collapse && orientation !== 'vertical') &&
        <TabsPicker
          styleProps={styleProps}
          tabListProps={tabListProps}
          density={density}
          isDisabled={isDisabled}
          isQuiet={isQuiet}
          state={state} />
      }
    </>
  );

  if (orientation !== 'vertical') {
    tablist = (
      <div
        className={classNames(
          tabsStyles,
          'react-spectrum-Tabs--collapsible'
        )}>
        {tablist}
      </div>
    );
  }

  return (
    <div
      {...styleProps}
      className={classNames(
        tabsStyles,
        'react-spectrum-TabPanel',
        `react-spectrum-TabPanel--${orientation}`,
        styleProps.className
      )}>
      {tablist}
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
        <SlotProvider
          slots={{
            icon: {
              size: 'S',
              UNSAFE_className: classNames(styles, 'spectrum-Icon')
            },
            text: {
              UNSAFE_className: classNames(styles, 'spectrum-Tabs-itemLabel')
            }
          }}>
          {typeof rendered === 'string'
            ? <Text>{rendered}</Text>
            : rendered}
        </SlotProvider>
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
    if (selectedTab) {
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
    }

  }, [direction, setStyle, selectedTab, orientation, scale, verticalSelectionIndicatorOffset]);

  return <div className={classNames(styles, 'spectrum-Tabs-selectionIndicator')} role="presentation" style={style} />;
}

function TabsPicker(props) {
  let {
    isDisabled,
    tabListProps,
    isQuiet,
    state
  } = props;

  let ref = useRef();
  let [pickerNode, setPickerNode] = useState(null);

  useEffect(() => {
    let node = unwrapDOMRef(ref);
    setPickerNode(node.current);
  }, [ref]);

  let items = [...state.collection].map((item) => ({
    rendered: item.rendered,
    textValue: item.textValue,
    key: item.key
  }));

  let pickerProps = {
    'aria-labelledby': tabListProps['aria-labelledby'],
    'aria-label': tabListProps['aria-label']
  };

  // TODO: Figure out if tabListProps should go onto the div here, v2 doesn't do it
  return (
    <div
      className={classNames(
        styles,
        'spectrum-Tabs',
        'spectrum-Tabs--horizontal',
        {
          'spectrum-Tabs--quiet': isQuiet
        },
        classNames(
          tabsStyles,
          'react-spectrum-Tabs--dropdown'
        )
      )}>
      <Picker {...pickerProps} items={items} ref={ref} isQuiet isDisabled={isDisabled} selectedKey={state.selectedKey} onSelectionChange={state.setSelectedKey}>
        {item => <Item key={item.key} textValue={item.textValue}>{item.rendered}</Item>}
      </Picker>
      {pickerNode && <TabLine orientation="horizontal" selectedTab={pickerNode} />}
    </div>
  );
}
