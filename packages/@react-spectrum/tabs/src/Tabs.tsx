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

import {classNames, SlotProvider, unwrapDOMRef, useStyleProps, useValueEffect} from '@react-spectrum/utils';
import {DOMProps, Node, Orientation} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import {Item, Picker} from '@react-spectrum/picker';
import {mergeProps, useLayoutEffect} from '@react-aria/utils';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {SingleSelectListState, useSingleSelectListState} from '@react-stately/list';
import {SpectrumTabsProps} from '@react-types/tabs';
import styles from '@adobe/spectrum-css-temp/components/tabs/vars.css';
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
  let wrapperRef = useRef<HTMLDivElement>();
  let state = useSingleSelectListState<T>({
    ...props,
    onSelectionChange
  });

  let {direction} = useLocale();
  let {styleProps} = useStyleProps(otherProps);
  let {tabListProps, tabPanelProps} = useTabs(props, state, ref);
  let [collapse, setCollapse] = useValueEffect(false);
  let [selectedTab, setSelectedTab] = useState<HTMLElement>();

  let lastSelectedKey = useRef(state.selectedItem);
  useEffect(() => {
    // Ensure a tab is always selected (in case no selected key was specified or if selected item was deleted from collection)
    if (state.selectionManager.isEmpty || !state.collection.getItem(state.selectedKey)) {
      // if there was a prior key specified, try to set the next key as the selected key
      // fall back to the previous key if next key doesn't exist
      if (state.selectedKey != null) {
        let nextKey = lastSelectedKey.current.nextKey;
        let replacementKey = nextKey != null && state.collection.getItem(nextKey) ? nextKey : lastSelectedKey.current.prevKey;
        replacementKey = state.collection.getItem(replacementKey) ? replacementKey : state.collection.getLastKey();
        state.selectionManager.replaceSelection(replacementKey);
      } else {
        state.selectionManager.replaceSelection(state.collection.getFirstKey());
      }
    }

    lastSelectedKey.current = state.selectedItem;
  }, [state]);

  useEffect(() => {
    if (ref.current) {
      let tabs: HTMLElement[] = Array.from(ref.current.querySelectorAll('.' + styles['spectrum-Tabs-item']));
      let selectedTab = tabs.find((tab) => tab.dataset.key === state.selectedKey);

      if (selectedTab != null) {
        setSelectedTab(selectedTab);
      }
    }
  }, [props.children, state, ref]);


  let checkShouldCollapse = useCallback(() => {
    let computeShouldCollapse = () => {
      if (wrapperRef.current) {
        let tabsComponent = wrapperRef.current;
        let tabs = Array.from(ref.current.children);
        // The last child is the TabLine so we look at the second to last child for the last Tab
        let lastTab = tabs[tabs.length - 2];

        let end = direction === 'rtl' ? 'left' : 'right';
        let farEdgeTabList = tabsComponent.getBoundingClientRect()[end];
        let farEdgeLastTab = lastTab?.getBoundingClientRect()[end];
        let shouldCollapse = direction === 'rtl' ? farEdgeLastTab < farEdgeTabList : farEdgeTabList < farEdgeLastTab;

        return shouldCollapse;
      }
    };

    if (orientation !== 'vertical') {
      setCollapse(function* () {
        // Make Tabs render in non-collapsed state
        yield false;

        // Compute if Tabs should collapse and update
        yield computeShouldCollapse();
      });
    }
  }, [ref, wrapperRef, direction, orientation, setCollapse]);

  useEffect(() => {
    checkShouldCollapse();
  }, [props.children, checkShouldCollapse]);

  useResizeObserver({ref: wrapperRef.current && wrapperRef, onResize: checkShouldCollapse});

  let tablist = (
    <TabList
      {...tabListProps}
      ref={ref}
      orientation={orientation}
      density={density}
      isQuiet={isQuiet}
      isDisabled={isDisabled}
      state={state}
      selectedTab={selectedTab} />
  );

  if (collapse && orientation !== 'vertical') {
    tablist = (
      <TabsPicker
        {...props}
        state={state} />
    );
  }

  if (orientation !== 'vertical') {
    tablist = (
      <div
        ref={wrapperRef}
        className={classNames(
          styles,
          'spectrum-Tabs--collapsible'
        )}>
        {tablist}
      </div>
    );
  }

  return (
    <div
      {...styleProps}
      className={classNames(
        styles,
        'spectrum-TabsPanel',
        `spectrum-TabsPanel--${orientation}`,
        styleProps.className
      )}>
      {tablist}
      <div {...tabPanelProps}>
        {state.selectedItem && state.selectedItem.props.children}
      </div>
    </div>
  );
}

interface TabProps<T> extends DOMProps {
  item: Node<T>,
  state: SingleSelectListState<T>,
  isDisabled?: boolean,
  orientation?: Orientation
}

export function Tab<T>(props: TabProps<T>) {
  let {item, state, isDisabled: propsDisabled} = props;
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
        {...mergeProps(tabProps, hoverProps)}
        ref={ref}
        className={classNames(
          styles,
          'spectrum-Tabs-item',
          {
            'is-selected': isSelected,
            'is-disabled': isDisabled,
            'is-hovered': isHovered
          }
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

function TabLine(props) {
  let {
    orientation,
    // Is either the tab node (non-collapsed) or the picker node (collapsed)
    selectedTab,
    // selectedKey is provided so that the TabLine styles are updated when the TabPicker's width updates from a selection change
    selectedKey
  } = props;

  let verticalSelectionIndicatorOffset = 12;
  let {direction} = useLocale();
  let {scale} = useProvider();

  let [style, setStyle] = useState({
    width: undefined,
    height: undefined
  });

  useLayoutEffect(() => {
    if (selectedTab) {
      let styleObj = {transform: undefined, width: undefined, height: undefined};
      // In RTL, calculate the transform from the right edge of the tablist so that resizing the window doesn't break the Tabline position due to offsetLeft changes
      let offset = direction === 'rtl' ? -1 * (selectedTab.offsetParent?.offsetWidth - selectedTab.offsetWidth - selectedTab.offsetLeft) : selectedTab.offsetLeft;
      styleObj.transform = orientation === 'vertical'
        ? `translateY(${selectedTab.offsetTop + verticalSelectionIndicatorOffset / 2}px)`
        : `translateX(${offset}px)`;

      if (orientation === 'horizontal') {
        styleObj.width = `${selectedTab.offsetWidth}px`;
      } else {
        styleObj.height = `${selectedTab.offsetHeight - verticalSelectionIndicatorOffset}px`;
      }
      setStyle(styleObj);
    }

  }, [direction, setStyle, selectedTab, orientation, scale, verticalSelectionIndicatorOffset, selectedKey]);

  return <div className={classNames(styles, 'spectrum-Tabs-selectionIndicator')} role="presentation" style={style} />;
}

interface TabListProps<T> {
  isQuiet?: boolean,
  density?: 'compact',
  isDisabled?: boolean,
  orientation?: Orientation,
  state: SingleSelectListState<T>,
  selectedTab: HTMLElement
}

const TabList = React.forwardRef(function <T> (props: TabListProps<T>, ref) {
  let {
    isQuiet,
    density,
    state,
    isDisabled,
    orientation,
    selectedTab,
    ...otherProps
  } = props;

  return (
    <div
      {...otherProps}
      ref={ref}
      className={classNames(
        styles,
        'spectrum-Tabs',
        `spectrum-Tabs--${orientation}`,
        {
          'spectrum-Tabs--quiet': isQuiet,
          [`spectrum-Tabs--${density}`]: density
        },
        'spectrum-Tabs-container'
      )}>
      {[...state.collection].map((item) => (
        <Tab key={item.key} item={item} state={state} isDisabled={isDisabled} orientation={orientation} />
      ))}
      <TabLine orientation={orientation} selectedTab={selectedTab} />
    </div>
  );
});

function TabsPicker(props) {
  let {
    isDisabled,
    isQuiet,
    state,
    'aria-labelledby': ariaLabeledBy,
    'aria-label': ariaLabel,
    density
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
    'aria-labelledby': ariaLabeledBy,
    'aria-label': ariaLabel
  };

  // TODO: Figure out if tabListProps should go onto the div here, v2 doesn't do it
  return (
    <div
      className={classNames(
        styles,
        'spectrum-Tabs',
        'spectrum-Tabs--horizontal',
        'spectrum-Tabs-dropdown',
        {
          'spectrum-Tabs--quiet': isQuiet,
          [`spectrum-Tabs-dropdown--${density}`]: density
        }
      )}>
       <SlotProvider
          slots={{
            button: {
              focusRingStyles: styles
            }
          }}>
        <Picker
          {...pickerProps}
          items={items}
          ref={ref}
          isQuiet
          isDisabled={isDisabled}
          selectedKey={state.selectedKey}
          disabledKeys={state.disabledKeys}
          onSelectionChange={state.setSelectedKey}>
          {item => <Item key={item.key} textValue={item.textValue}>{item.rendered}</Item>}
        </Picker>
        {pickerNode && <TabLine orientation="horizontal" selectedTab={pickerNode} selectedKey={state.selectedKey} />}
      </SlotProvider>
    </div>
  );
}
