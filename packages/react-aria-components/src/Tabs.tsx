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
import {BaseCollection, CollectionProps, Document, Item, useCollectionDocument, useCollectionPortal} from './Collection';
import {ContextValue, forwardRefType, RenderProps, SlotProps, StyleRenderProps, useContextProps, useRenderProps} from './utils';
import {filterDOMProps, useObjectRef} from '@react-aria/utils';
import {Node, TabListState, useTabListState} from 'react-stately';
import React, {createContext, ForwardedRef, forwardRef, Key, useContext, useMemo} from 'react';

export interface TabsProps extends Omit<AriaTabListProps<any>, 'items' | 'children'>, RenderProps<TabsRenderProps>, SlotProps {}

export interface TabsRenderProps {
  /**
   * The orientation of the tabs.
   * @selector [data-orientation="horizontal | vertical"]
   */
  orientation: Orientation
}

export interface TabListProps<T> extends StyleRenderProps<TabListRenderProps>, AriaLabelingProps, CollectionProps<T> {}

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

export interface TabPanelProps extends AriaTabPanelProps, RenderProps<TabPanelRenderProps> {
  /**
   * Whether to mount the tab panel in the DOM even when it is not currently selected.
   * Inactive tab panels are inert and cannot be interacted with. They must be styled appropriately so this is clear to the user visually.
   * @default false
   */
  shouldForceMount?: boolean
}

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
  isFocusVisible: boolean,
  /**
   * Whether the tab panel is currently non-interactive. This occurs when the
   * `shouldForceMount` prop is true, and the corresponding tab is not selected.
   * @selector [inert]
   */
  isInert: boolean
}

interface InternalTabsContextValue {
  state: TabListState<object>,
  document: Document<any, BaseCollection<any>>,
  orientation: Orientation
}

export const TabsContext = createContext<ContextValue<TabsProps, HTMLDivElement>>(null);
const InternalTabsContext = createContext<InternalTabsContextValue | null>(null);

function Tabs(props: TabsProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, TabsContext);
  let {orientation = 'horizontal'} = props;
  let values = useMemo(() => ({orientation}), [orientation]);
  let {collection, document} = useCollectionDocument();
  let state = useTabListState({
    ...props,
    collection,
    children: undefined
  });

  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-Tabs',
    values
  });

  return (
    <div
      {...filterDOMProps(props as any)}
      {...renderProps}
      ref={ref}
      slot={props.slot}
      data-orientation={orientation}>
      <InternalTabsContext.Provider value={{state, document, orientation}}>
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
  let {state, document, orientation} = useContext(InternalTabsContext)!;
  let objectRef = useObjectRef(ref);

  let portal = useCollectionPortal(props, document);
  let {tabListProps} = useTabList({
    ...props,
    orientation
  }, state, objectRef);

  let renderProps = useRenderProps({
    ...props,
    children: null,
    defaultClassName: 'react-aria-TabList',
    values: {
      orientation
    }
  });

  let DOMProps = filterDOMProps(props);
  delete DOMProps.id;

  return (
    <>
      <div {...DOMProps} {...tabListProps} ref={objectRef} {...renderProps}>
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

function Tab(props: TabProps, ref: ForwardedRef<HTMLDivElement>) {
  // @ts-ignore
  return <Item {...props} ref={ref} />;
}

/**
 * A Tab provides a title for an individual item within a TabList.
 */
const _Tab = forwardRef(Tab);
export {_Tab as Tab};

function TabInner({item, state}: {item: Node<object>, state: TabListState<object>}) {
  let {key} = item;
  let ref = useObjectRef<HTMLDivElement>(item.props.ref);
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

  let DOMProps = filterDOMProps(item.props);
  delete DOMProps.id;

  return (
    <div
      {...mergeProps(DOMProps, tabProps, focusProps, hoverProps, renderProps)}
      ref={ref}
      data-focus-visible={isFocusVisible || undefined}
      data-pressed={isPressed || undefined}
      data-hovered={isHovered || undefined} />
  );
}

function TabPanel(props: TabPanelProps, forwardedRef: ForwardedRef<HTMLDivElement>) {
  const {state} = useContext(InternalTabsContext)!;
  let ref = useObjectRef<HTMLDivElement>(forwardedRef);
  let {tabPanelProps} = useTabPanel(props, state, ref);
  let {focusProps, isFocused, isFocusVisible} = useFocusRing();

  let isSelected = state.selectedKey === props.id;
  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-TabPanel',
    values: {
      isFocused,
      isFocusVisible,
      isInert: !isSelected
    }
  });

  if (!isSelected && !props.shouldForceMount) {
    return null;
  }

  let DOMProps = filterDOMProps(props);
  delete DOMProps.id;

  let domProps = isSelected
    ? mergeProps(DOMProps, tabPanelProps, focusProps, renderProps)
    : renderProps;

  return (
    <div
      {...domProps}
      ref={ref}
      data-focus-visible={isFocusVisible || undefined}
      // @ts-ignore
      inert={!isSelected ? 'true' : undefined} />
  );
}

/**
 * A TabPanel provides the content for a tab.
 */
const _TabPanel = forwardRef(TabPanel);
export {_TabPanel as TabPanel};
