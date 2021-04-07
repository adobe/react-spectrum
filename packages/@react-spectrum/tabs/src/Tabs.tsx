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

import {classNames, SlotProvider, unwrapDOMRef, useDOMRef, useStyleProps, useValueEffect} from '@react-spectrum/utils';
import {DOMProps, DOMRef, Node, Orientation} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import {Item, Picker} from '@react-spectrum/picker';
import {mergeProps, useId, useLayoutEffect} from '@react-aria/utils';
import React, {HTMLAttributes, Key, MutableRefObject, ReactElement, useCallback, useEffect, useRef, useState} from 'react';
import {SingleSelectListState} from '@react-stately/list';
import {SpectrumPickerProps} from '@react-types/select';
import {SpectrumTabsProps} from '@react-types/tabs';
import styles from '@adobe/spectrum-css-temp/components/tabs/vars.css';
import {Text} from '@react-spectrum/text';
import {useHover} from '@react-aria/interactions';
import {useLocale} from '@react-aria/i18n';
import {useProvider, useProviderProps} from '@react-spectrum/provider';
import {useResizeObserver} from '@react-aria/utils';
import {useTab, useTabs} from '@react-aria/tabs';
import {useTabsState} from '@react-stately/tabs';

function Tabs<T extends object>(props: SpectrumTabsProps<T>, ref: DOMRef<HTMLDivElement>) {
  props = useProviderProps(props);
  let {
    orientation = 'horizontal' as Orientation,
    isDisabled,
    isQuiet,
    density = 'regular',
    children,
    ...otherProps
  } = props;

  let domRef = useDOMRef(ref);
  let tablistRef = useRef<HTMLDivElement>();
  let wrapperRef = useRef<HTMLDivElement>();
  let state = useTabsState(props);

  let {direction} = useLocale();
  let {styleProps} = useStyleProps(otherProps);
  let {tabListProps, tabPanelProps} = useTabs(props, state, tablistRef);
  let [collapse, setCollapse] = useValueEffect(false);
  let [selectedTab, setSelectedTab] = useState<HTMLElement>();

  useEffect(() => {
    if (tablistRef.current) {
      let selectedTab: HTMLElement = tablistRef.current.querySelector(`[data-key="${state.selectedKey}"]`);

      if (selectedTab != null) {
        setSelectedTab(selectedTab);
      }
    }
    // collapse is in the dep array so selectedTab can be updated for TabLine positioning
  }, [children, state.selectedKey, collapse, tablistRef]);

  let checkShouldCollapse = useCallback(() => {
    let computeShouldCollapse = () => {
      if (wrapperRef.current) {
        let tabsComponent = wrapperRef.current;
        let tabs = tablistRef.current.querySelectorAll('[role="tab"]');
        let lastTab = tabs[tabs.length - 1];

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
  }, [tablistRef, wrapperRef, direction, orientation, setCollapse]);

  useEffect(() => {
    checkShouldCollapse();
  }, [children, checkShouldCollapse]);

  useResizeObserver({ref: wrapperRef, onResize: checkShouldCollapse});

  // When the tabs are collapsed, the tabPanel should be labelled by the Picker button element.
  let collapsibleTabListId = useId();
  if (collapse && orientation !== 'vertical') {
    tabPanelProps['aria-labelledby'] = collapsibleTabListId;
  }

  return (
    <div
      {...styleProps}
      ref={domRef}
      className={classNames(
        styles,
        'spectrum-TabsPanel',
        `spectrum-TabsPanel--${orientation}`,
        styleProps.className
      )}>
      {orientation === 'vertical' &&
        <TabList
          {...tabListProps}
          ref={tablistRef}
          orientation={orientation}
          density={density}
          isQuiet={isQuiet}
          isDisabled={isDisabled}
          state={state}
          selectedTab={selectedTab} />
      }
      {orientation !== 'vertical' &&
        <CollapsibleTabList
          {...props}
          id={collapsibleTabListId}
          wrapperRef={wrapperRef}
          collapse={collapse}
          tabListProps={tabListProps}
          state={state}
          selectedTab={selectedTab}
          ref={tablistRef} />
      }
      <div {...tabPanelProps} className={classNames(styles, 'spectrum-TabsPanel-tabpanel')}>
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

interface TabLineProps {
  orientation?: Orientation,
  selectedTab?: HTMLElement,
  selectedKey?: Key
}

function TabLine(props: TabLineProps) {
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
      let offset = direction === 'rtl' ? -1 * ((selectedTab.offsetParent as HTMLElement)?.offsetWidth - selectedTab.offsetWidth - selectedTab.offsetLeft) : selectedTab.offsetLeft;
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

interface CollapsibleTabListProps<T> extends TabListProps<T>, TabPickerProps<T> {
  tabListProps?: HTMLAttributes<HTMLElement>,
  wrapperRef: MutableRefObject<HTMLDivElement>,
  collapse?: boolean,
  tabListclassName?: string
}

const CollapsibleTabList = React.forwardRef(function <T> (props: CollapsibleTabListProps<T>, ref: MutableRefObject<HTMLDivElement>) {
  let {
    tabListProps,
    density,
    isQuiet,
    isDisabled,
    state,
    selectedTab,
    wrapperRef,
    collapse
  } = props;

  let tabListclassName = classNames(styles, 'spectrum-TabsPanel-tabs');

  return (
    <div
      ref={wrapperRef}
      className={classNames(
        styles,
        'spectrum-TabsPanel-collapseWrapper'
      )}>
      {collapse && <TabPicker {...props} className={tabListclassName} />}
      {!collapse && (
        <TabList
          {...tabListProps}
          density={density}
          isQuiet={isQuiet}
          isDisabled={isDisabled}
          state={state}
          selectedTab={selectedTab}
          ref={ref}
          orientation="horizontal"
          className={tabListclassName} />
      )}
    </div>
  );
});

interface TabListProps<T> {
  isQuiet?: boolean,
  density?: 'compact' | 'regular',
  isDisabled?: boolean,
  orientation?: Orientation,
  state: SingleSelectListState<T>,
  selectedTab: HTMLElement,
  className?: string
}

const TabList = React.forwardRef(function <T> (props: TabListProps<T>, ref: MutableRefObject<HTMLDivElement>) {
  let {
    isQuiet,
    density,
    state,
    isDisabled,
    orientation,
    selectedTab,
    className,
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
          ['spectrum-Tabs--compact']: density === 'compact'
        },
        className
      )}>
      {[...state.collection].map((item) => (
        <Tab key={item.key} item={item} state={state} isDisabled={isDisabled} orientation={orientation} />
      ))}
      <TabLine orientation={orientation} selectedTab={selectedTab} />
    </div>
  );
});

interface TabPickerProps<T> extends SpectrumPickerProps<T> {
  density?: 'compact' | 'regular',
  state: SingleSelectListState<T>,
  className?: string
}

function TabPicker<T>(props: TabPickerProps<T>) {
  let {
    isDisabled,
    isQuiet,
    state,
    'aria-labelledby': ariaLabeledBy,
    'aria-label': ariaLabel,
    density,
    className,
    id
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
    id: item.key
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
        'spectrum-Tabs--isCollapsed',
        {
          'spectrum-Tabs--quiet': isQuiet,
          ['spectrum-Tabs--compact']: density === 'compact'
        },
        className
      )}>
      <SlotProvider
        slots={{
          icon: {
            size: 'S',
            UNSAFE_className: classNames(styles, 'spectrum-Icon')
          },
          button: {
            focusRingClass: classNames(styles, 'focus-ring')
          }
        }}>
        <Picker
          {...pickerProps}
          id={id}
          items={items}
          ref={ref}
          isQuiet
          isDisabled={isDisabled}
          selectedKey={state.selectedKey}
          disabledKeys={state.disabledKeys}
          onSelectionChange={state.setSelectedKey}>
          {item => <Item textValue={item.textValue}>{item.rendered}</Item>}
        </Picker>
        {pickerNode && <TabLine orientation="horizontal" selectedTab={pickerNode} selectedKey={state.selectedKey} />}
      </SlotProvider>
    </div>
  );
}

/**
 * Tabs organize content into multiple sections and allow users to navigate between them. The content under the set of tabs should be related and form a coherent unit.
 */
// forwardRef doesn't support generic parameters, so cast the result to the correct type
// https://stackoverflow.com/questions/58469229/react-with-typescript-generics-while-using-react-forwardref
const _Tabs = React.forwardRef(Tabs) as <T>(props: SpectrumTabsProps<T> & {ref?: DOMRef<HTMLDivElement>}) => ReactElement;
export {_Tabs as Tabs};
