/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaLabelingProps} from '@react-types/shared';
import {AriaTabListProps, AriaTabPanelProps, mergeProps, Orientation, useFocusRing, useHover, useTab, useTabList, useTabPanel} from 'react-aria';
import {CollectionProps, Item, useCollection} from './Collection';
import {ContextValue, forwardRefType, RenderProps, SlotProps, StyleRenderProps, useContextProps, useRenderProps} from './utils';
import {Node, TabListState, useTabListState} from 'react-stately';
import React, {createContext, ForwardedRef, forwardRef, Key, useContext, useEffect, useState} from 'react';
import {useObjectRef} from '@react-aria/utils';

export interface TabsProps extends RenderProps<TabsRenderProps>, SlotProps {
  /**
   * The orientation of the tabs.
   * @default 'horizontal'
   */
  orientation?: Orientation
}

export interface TabsRenderProps {
  /**
   * The orientation of the tabs.
   * @selector [data-orientation="horizontal | vertical"]
   */
  orientation: Orientation
}

export interface TabListProps<T> extends Omit<AriaTabListProps<T>, 'children' | 'orientation'>, StyleRenderProps<TabListRenderProps>, AriaLabelingProps, CollectionProps<T> {}

export interface TabListRenderProps {
  /**
   * The orientation of the tab list.
   * @selector [aria-orientation="horizontal | vertical"]
   */
  orientation: Orientation
}

export interface TabProps extends RenderProps<TabRenderProps>, AriaLabelingProps {
  id?: Key
}

export interface TabRenderProps {
  /**
   * Whether the tab is currently hovered with a mouse.
   * @selector [data-hovered]
   */
  isHovered: boolean,
  /**
   * Whether the tab is currently in a pressed state.
   * @selector [data-pressed]
   */
  isPressed: boolean,
  /**
   * Whether the tab is currently selected.
   * @selector [aria-selected=true]
   */
  isSelected: boolean,
  /**
   * Whether the tab is currently focused.
   * @selector :focus
   */
  isFocused: boolean,
  /**
   * Whether the tab is currently keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean,
  /**
   * Whether the tab is disabled.
   * @selector [aria-disabled]
   */
  isDisabled: boolean
}

export interface TabPanelProps extends AriaTabPanelProps, RenderProps<TabPanelRenderProps> {}
export interface TabPanelRenderProps {
  /**
   * Whether the tab panel is currently focused.
   * @selector :focus
   */
  isFocused: boolean,
  /**
   * Whether the tab panel is currently keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean
}

interface InternalTabsContextValue {
  state: TabListState<unknown> | null,
  setState: React.Dispatch<React.SetStateAction<TabListState<unknown> | null>>,
  orientation: Orientation
}

export const TabsContext = createContext<ContextValue<TabsProps, HTMLDivElement>>(null);
const InternalTabsContext = createContext<InternalTabsContextValue | null>(null);

function Tabs(props: TabsProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, TabsContext);
  let {orientation = 'horizontal'} = props;
  let [state, setState] = useState<TabListState<unknown> | null>(null);

  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-Tabs',
    values: {
      orientation
    }
  });

  return (
    <div
      {...renderProps}
      ref={ref}
      slot={props.slot}
      data-orientation={orientation}>
      <InternalTabsContext.Provider value={{state, setState, orientation}}>
        {renderProps.children}
      </InternalTabsContext.Provider>
    </div>
  );
}

/**
 * Tabs organize content into multiple sections and allow users to navigate between them.
 */
const _Tabs = forwardRef(Tabs);
export {_Tabs as Tabs};

function TabList<T extends object>(props: TabListProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  let {setState, orientation} = useContext(InternalTabsContext)!;
  let objectRef = useObjectRef(ref);

  let {portal, collection} = useCollection(props);
  let state = useTabListState({
    ...props,
    collection,
    children: undefined
  });

  let {tabListProps} = useTabList({
    ...props,
    orientation
  }, state, objectRef);

  useEffect(() => {
    setState(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection, state.selectedKey]);

  let renderProps = useRenderProps({
    ...props,
    children: null,
    defaultClassName: 'react-aria-TabList',
    values: {
      orientation
    }
  });

  return (
    <>
      <div {...tabListProps} ref={objectRef} {...renderProps}>
        {[...state.collection].map((item) => (
          <TabInner
            key={item.key}
            item={item}
            state={state} />
        ))}
      </div>
      {portal}
    </>
  );
}

/**
 * A TabList is used within Tabs to group tabs that a user can switch between.
 * The ids of the items within the <TabList> must match up with a corresponding item inside the <TabPanels>.
 */
const _TabList = /*#__PURE__*/ (forwardRef as forwardRefType)(TabList);
export {_TabList as TabList};

/**
 * A Tab provides a title for an individual item within a TabList.
 */
export function Tab(props: TabProps): JSX.Element {
  // @ts-ignore
  return Item(props);
}

function TabInner({item, state}: {item: Node<object>, state: TabListState<object>}) {
  let {key} = item;
  let ref = React.useRef<HTMLDivElement>(null);
  let {tabProps, isSelected, isDisabled, isPressed} = useTab({key}, state, ref);
  let {focusProps, isFocused, isFocusVisible} = useFocusRing();
  let {hoverProps, isHovered} = useHover({
    isDisabled
  });

  let renderProps = useRenderProps({
    ...item.props,
    children: item.rendered,
    defaultClassName: 'react-aria-Tab',
    values: {
      isSelected,
      isDisabled,
      isFocused,
      isFocusVisible,
      isPressed,
      isHovered
    }
  });

  return (
    <div
      {...mergeProps(tabProps, focusProps, hoverProps, renderProps)}
      ref={ref}
      data-focus-visible={isFocusVisible || undefined}
      data-pressed={isPressed || undefined}
      data-hovered={isHovered || undefined} />
  );
}

export interface TabPanelsProps<T> extends Omit<CollectionProps<T>, 'disabledKeys'> {}

/**
 * TabPanels is used within Tabs as a container for the content of each tab.
 * The ids of the items within the <TabPanels> must match up with a corresponding item inside the <TabList>.
 */
export function TabPanels<T extends object>(props: TabPanelsProps<T>) {
  const {state} = useContext(InternalTabsContext)!;
  let {portal, collection} = useCollection(props);
  const selectedItem = state?.selectedKey != null
    ? collection.getItem(state!.selectedKey)
    : null;

  return (
    <>
      {selectedItem && <SelectedTabPanel item={selectedItem} />}
      {portal}
    </>
  );
}

/**
 * A TabPanel provides the content for a tab.
 */
export function TabPanel(props: TabPanelProps): JSX.Element {
  return Item(props);
}

function SelectedTabPanel({item}: {item: Node<object>}) {
  const {state} = useContext(InternalTabsContext)!;
  let ref = React.useRef<HTMLDivElement>(null);
  let {tabPanelProps} = useTabPanel(item.props, state!, ref);
  let {focusProps, isFocused, isFocusVisible} = useFocusRing();

  let renderProps = useRenderProps({
    ...item.props,
    children: item.rendered,
    defaultClassName: 'react-aria-TabPanel',
    values: {
      isFocused,
      isFocusVisible
    }
  });

  return (
    <div
      {...mergeProps(tabPanelProps, focusProps, renderProps)}
      ref={ref}
      data-focus-visible={isFocusVisible || undefined} />
  );
}
