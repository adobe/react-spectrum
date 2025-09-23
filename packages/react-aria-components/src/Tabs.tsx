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

import {AriaLabelingProps, forwardRefType, GlobalDOMAttributes, HoverEvents, Key, LinkDOMProps, PressEvents, RefObject} from '@react-types/shared';
import {AriaTabListProps, AriaTabPanelProps, mergeProps, Orientation, useFocusRing, useHover, useTab, useTabList, useTabPanel} from 'react-aria';
import {Collection, CollectionBuilder, CollectionNode, createHideableComponent, createLeafComponent} from '@react-aria/collections';
import {CollectionProps, CollectionRendererContext, DefaultCollectionRenderer, usePersistedKeys} from './Collection';
import {ContextValue, Provider, RenderProps, SlotProps, StyleRenderProps, useContextProps, useRenderProps, useSlottedContext} from './utils';
import {filterDOMProps, inertValue, useObjectRef} from '@react-aria/utils';
import {Collection as ICollection, Node, TabListState, useTabListState} from 'react-stately';
import React, {createContext, ForwardedRef, forwardRef, JSX, useContext, useMemo} from 'react';
import {SelectionIndicatorContext} from './SelectionIndicator';
import {SharedElementTransition} from './SharedElementTransition';

export interface TabsProps extends Omit<AriaTabListProps<any>, 'items' | 'children'>, RenderProps<TabsRenderProps>, SlotProps, GlobalDOMAttributes<HTMLDivElement> {}

export interface TabsRenderProps {
  /**
   * The orientation of the tabs.
   * @selector [data-orientation="horizontal | vertical"]
   */
  orientation: Orientation
}

export interface TabListProps<T> extends StyleRenderProps<TabListRenderProps>, AriaLabelingProps, Omit<CollectionProps<T>, 'disabledKeys'>, GlobalDOMAttributes<HTMLDivElement> {}

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

export interface TabProps extends RenderProps<TabRenderProps>, AriaLabelingProps, LinkDOMProps, HoverEvents, PressEvents, Omit<GlobalDOMAttributes<HTMLDivElement>, 'onClick'> {
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

export interface TabPanelProps extends AriaTabPanelProps, RenderProps<TabPanelRenderProps>, GlobalDOMAttributes<HTMLDivElement> {
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

/**
 * Tabs organize content into multiple sections and allow users to navigate between them.
 */
export const Tabs = /*#__PURE__*/ (forwardRef as forwardRefType)(function Tabs(props: TabsProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, TabsContext);
  let {children, orientation = 'horizontal'} = props;
  children = useMemo(() => (
    typeof children === 'function'
      ? children({orientation, defaultChildren: null})
      : children
  ), [children, orientation]);

  return (
    <CollectionBuilder content={children}>
      {collection => <TabsInner props={props} collection={collection} tabsRef={ref} />}
    </CollectionBuilder>
  );
});

interface TabsInnerProps {
  props: TabsProps,
  collection: ICollection<Node<any>>,
  tabsRef: RefObject<HTMLDivElement | null>
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

  let DOMProps = filterDOMProps(props, {global: true});

  return (
    <div
      {...mergeProps(DOMProps, renderProps, focusProps)}
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
 * A TabList is used within Tabs to group tabs that a user can switch between.
 * The ids of the items within the <TabList> must match up with a corresponding item inside the <TabPanels>.
 */
export const TabList = /*#__PURE__*/ (forwardRef as forwardRefType)(function TabList<T extends object>(props: TabListProps<T>, ref: ForwardedRef<HTMLDivElement>): JSX.Element {
  let state = useContext(TabListStateContext);
  return state
    ? <TabListInner props={props} forwardedRef={ref} />
    : <Collection {...props} />;
});

interface TabListInnerProps<T> {
  props: TabListProps<T>,
  forwardedRef: ForwardedRef<HTMLDivElement>
}

function TabListInner<T extends object>({props, forwardedRef: ref}: TabListInnerProps<T>) {
  let state = useContext(TabListStateContext)!;
  let {CollectionRoot} = useContext(CollectionRendererContext);
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

  let DOMProps = filterDOMProps(props, {global: true});
  delete DOMProps.id;

  return (
    <div
      {...mergeProps(DOMProps, renderProps, tabListProps)}
      ref={objectRef}
      data-orientation={orientation || undefined}>
      <SharedElementTransition>
        <CollectionRoot collection={state.collection} persistedKeys={usePersistedKeys(state.selectionManager.focusedKey)} />
      </SharedElementTransition>
    </div>
  );
}

class TabItemNode extends CollectionNode<unknown> {
  static readonly type = 'item';
}

/**
 * A Tab provides a title for an individual item within a TabList.
 */
export const Tab = /*#__PURE__*/ createLeafComponent(TabItemNode, (props: TabProps, forwardedRef: ForwardedRef<HTMLDivElement>, item: Node<unknown>) => {
  let state = useContext(TabListStateContext)!;
  let ref = useObjectRef<any>(forwardedRef);
  let {tabProps, isSelected, isDisabled, isPressed} = useTab({key: item.key, ...props}, state, ref);
  let {focusProps, isFocused, isFocusVisible} = useFocusRing();
  let {hoverProps, isHovered} = useHover({
    isDisabled,
    onHoverStart: props.onHoverStart,
    onHoverEnd: props.onHoverEnd,
    onHoverChange: props.onHoverChange
  });

  let renderProps = useRenderProps({
    ...props,
    id: undefined,
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

  let ElementType: React.ElementType = item.props.href ? 'a' : 'div';
  let DOMProps = filterDOMProps(props as any, {global: true});
  delete DOMProps.id;
  delete DOMProps.onClick;

  return (
    <ElementType
      {...mergeProps(DOMProps, renderProps, tabProps, focusProps, hoverProps)}
      ref={ref}
      data-selected={isSelected || undefined}
      data-disabled={isDisabled || undefined}
      data-focused={isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-pressed={isPressed || undefined}
      data-hovered={isHovered || undefined}>
      <SelectionIndicatorContext.Provider value={{isSelected}}>
        {renderProps.children}
      </SelectionIndicatorContext.Provider>
    </ElementType>
  );
});

/**
 * A TabPanel provides the content for a tab.
 */
export const TabPanel = /*#__PURE__*/ createHideableComponent(function TabPanel(props: TabPanelProps, forwardedRef: ForwardedRef<HTMLDivElement>) {
  const state = useContext(TabListStateContext)!;
  let ref = useObjectRef<HTMLDivElement>(forwardedRef);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let {id, ...otherProps} = props;
  let {tabPanelProps} = useTabPanel(props, state, ref);
  let {focusProps, isFocused, isFocusVisible} = useFocusRing();

  let isSelected = state.selectedKey === props.id;
  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-TabPanel',
    values: {
      isFocused,
      isFocusVisible,
      // @ts-ignore - compatibility with React < 19
      isInert: inertValue(!isSelected),
      state
    }
  });

  if (!isSelected && !props.shouldForceMount) {
    return null;
  }

  let DOMProps = filterDOMProps(otherProps, {global: true});
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
      inert={inertValue(!isSelected || props.inert)}
      data-inert={!isSelected ? 'true' : undefined}>
      <Provider
        values={[
          [TabsContext, null],
          [TabListStateContext, null]
        ]}>
        <CollectionRendererContext.Provider value={DefaultCollectionRenderer}>
          {renderProps.children}
        </CollectionRendererContext.Provider>
      </Provider>
    </div>
  );
});
