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

import {AriaLabelingProps, Key, LinkDOMProps} from '@react-types/shared';
import {AriaTabListProps, AriaTabPanelProps, mergeProps, Orientation, useFocusRing, useHover, useTab, useTabList, useTabPanel} from 'react-aria';
import {Collection, Node, TabListState, useTabListState} from 'react-stately';
import {CollectionDocumentContext, CollectionPortal, CollectionProps, useCollectionDocument, useSSRCollectionNode} from './Collection';
import {ContextValue, createHideableComponent, forwardRefType, Hidden, Provider, RenderProps, SlotProps, StyleRenderProps, useContextProps, useRenderProps, useSlottedContext} from './utils';
import {filterDOMProps, useObjectRef} from '@react-aria/utils';
import React, {createContext, ForwardedRef, forwardRef, JSX, RefObject, useContext, useMemo} from 'react';

export interface TabsProps extends Omit<AriaTabListProps<any>, 'items' | 'children'>, RenderProps<TabsRenderProps>, SlotProps {}

export interface TabsRenderProps {
  /**
   * The orientation of the tabs.
   * @selector [data-orientation="horizontal | vertical"]
   */
  orientation: Orientation
}

export interface TabListProps<T> extends StyleRenderProps<TabListRenderProps>, AriaLabelingProps, Omit<CollectionProps<T>, 'disabledKeys'> {}

export interface TabListRenderProps {
  /**
   * The orientation of the tab list.
   * @selector [data-orientation="horizontal | vertical"]
   */
  orientation: Orientation,
  /**
   * State of the tab list.
   */
  state: TabListState<unknown>
}

export interface TabProps extends RenderProps<TabRenderProps>, AriaLabelingProps, LinkDOMProps {
  /** The unique id of the tab. */
  id?: Key,
  /** Whether the tab is disabled. */
  isDisabled?: boolean
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
   * @selector [data-selected]
   */
  isSelected: boolean,
  /**
   * Whether the tab is currently focused.
   * @selector [data-focused]
   */
  isFocused: boolean,
  /**
   * Whether the tab is currently keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean,
  /**
   * Whether the tab is disabled.
   * @selector [data-disabled]
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
   * @selector [data-focused]
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
   * @selector [data-inert]
   */
  isInert: boolean,
  /**
   * State of the tab list.
   */
  state: TabListState<unknown>
}

export const TabsContext = createContext<ContextValue<TabsProps, HTMLDivElement>>(null);
export const TabListStateContext = createContext<TabListState<object> | null>(null);

function Tabs(props: TabsProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, TabsContext);
  let {collection, document} = useCollectionDocument();
  let {children, orientation = 'horizontal'} = props;
  children = useMemo(() => (
    typeof children === 'function'
      ? children({orientation, defaultChildren: null})
      : children
  ), [children, orientation]);

  return (
    <>
      {/* Render a hidden copy of the children so that we can build the collection before constructing the state.
        * This should always come before the real DOM content so we have built the collection by the time it renders during SSR. */}
      <Hidden>
        <CollectionDocumentContext.Provider value={document}>
          {children}
        </CollectionDocumentContext.Provider>
      </Hidden>
      <TabsInner props={props} collection={collection} tabsRef={ref} />
    </>
  );
}

interface TabsInnerProps {
  props: TabsProps,
  collection: Collection<Node<any>>,
  tabsRef: RefObject<HTMLDivElement>
}

function TabsInner({props, tabsRef: ref, collection}: TabsInnerProps) {
  let {orientation = 'horizontal'} = props;
  let state = useTabListState({
    ...props,
    collection,
    children: undefined
  });
  let {focusProps, isFocused, isFocusVisible} = useFocusRing({within: true});
  let values = useMemo(() => ({
    orientation,
    isFocusWithin: isFocused,
    isFocusVisible
  }), [orientation, isFocused, isFocusVisible]);
  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-Tabs',
    values
  });

  return (
    <div
      {...filterDOMProps(props as any)}
      {...focusProps}
      {...renderProps}
      ref={ref}
      slot={props.slot || undefined}
      data-focused={isFocused || undefined}
      data-orientation={orientation}
      data-focus-visible={isFocusVisible || undefined}
      data-disabled={state.isDisabled || undefined}>
      <Provider
        values={[
          [TabsContext, props],
          [TabListStateContext, state]
        ]}>
        {renderProps.children}
      </Provider>
    </div>
  );
}

/**
 * Tabs organize content into multiple sections and allow users to navigate between them.
 */
const _Tabs = /*#__PURE__*/ (forwardRef as forwardRefType)(Tabs);
export {_Tabs as Tabs};

function TabList<T extends object>(props: TabListProps<T>, ref: ForwardedRef<HTMLDivElement>): JSX.Element {
  let document = useContext(CollectionDocumentContext);
  return document
    ? <CollectionPortal {...props} />
    : <TabListInner props={props} forwardedRef={ref} />;
}

interface TabListInnerProps<T> {
  props: TabListProps<T>,
  forwardedRef: ForwardedRef<HTMLDivElement>
}

function TabListInner<T extends object>({props, forwardedRef: ref}: TabListInnerProps<T>) {
  let state = useContext(TabListStateContext)!;
  let {orientation = 'horizontal', keyboardActivation = 'automatic'} = useSlottedContext(TabsContext)!;
  let objectRef = useObjectRef(ref);

  let {tabListProps} = useTabList({
    ...props,
    orientation,
    keyboardActivation
  }, state, objectRef);

  let renderProps = useRenderProps({
    ...props,
    children: null,
    defaultClassName: 'react-aria-TabList',
    values: {
      orientation,
      state
    }
  });

  let DOMProps = filterDOMProps(props);
  delete DOMProps.id;

  return (
    <div
      {...DOMProps}
      {...tabListProps}
      ref={objectRef}
      {...renderProps}
      data-orientation={orientation || undefined}>
      {[...state.collection].map((item) => (
        <TabInner
          key={item.key}
          item={item}
          state={state} />
      ))}
    </div>
  );
}

/**
 * A TabList is used within Tabs to group tabs that a user can switch between.
 * The ids of the items within the <TabList> must match up with a corresponding item inside the <TabPanels>.
 */
const _TabList = /*#__PURE__*/ (forwardRef as forwardRefType)(TabList);
export {_TabList as TabList};

function Tab(props: TabProps, ref: ForwardedRef<HTMLDivElement>): JSX.Element | null {
  return useSSRCollectionNode('item', props, ref, props.children);
}

/**
 * A Tab provides a title for an individual item within a TabList.
 */
const _Tab = /*#__PURE__*/ (forwardRef as forwardRefType)(Tab);
export {_Tab as Tab};

function TabInner({item, state}: {item: Node<object>, state: TabListState<object>}) {
  let ref = useObjectRef<any>(item.props.ref);
  let {tabProps, isSelected, isDisabled, isPressed} = useTab({key: item.key, ...item.props}, state, ref);
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
      isHovered,
      state
    }
  });

  let ElementType: React.ElementType = item.props.href ? 'a' : 'div';

  return (
    <ElementType
      {...mergeProps(tabProps, focusProps, hoverProps, renderProps)}
      ref={ref}
      data-selected={isSelected || undefined}
      data-disabled={isDisabled || undefined}
      data-focused={isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-pressed={isPressed || undefined}
      data-hovered={isHovered || undefined} />
  );
}

function TabPanel(props: TabPanelProps, forwardedRef: ForwardedRef<HTMLDivElement>) {
  const state = useContext(TabListStateContext)!;
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
      isInert: !isSelected,
      state
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
      data-focused={isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined}
      // @ts-ignore
      inert={!isSelected ? 'true' : undefined}
      data-inert={!isSelected ? 'true' : undefined} />
  );
}

/**
 * A TabPanel provides the content for a tab.
 */
const _TabPanel = /*#__PURE__*/ createHideableComponent(TabPanel);
export {_TabPanel as TabPanel};
