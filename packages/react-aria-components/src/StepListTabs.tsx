/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {CollectionBuilder} from 'react-aria/CollectionBuilder';
import {forwardRefType} from '@react-types/shared';
import {Collection as ICollection, Key, Node} from '@react-types/shared';
import intlMessages from '../intl/*.json';
import React, {ForwardedRef, forwardRef, ReactElement, ReactNode, useMemo} from 'react';
import {
  Tab,
  TabList,
  TabListProps,
  TabPanel,
  TabPanelProps,
  TabPanels,
  TabPanelsProps,
  TabProps,
  Tabs,
  TabsProps
} from './Tabs';
import {useLocalizedStringFormatter} from 'react-aria/useLocalizedStringFormatter';
import {useStep} from './useStep';
import {useStepListTabsState} from './useStepListTabsState';
import {VisuallyHidden} from 'react-aria/VisuallyHidden';

export interface StepListTabsProps extends Omit<TabsProps, 'children' | 'selectedKey'> {
  /** The children of the component (a `StepListTabList` and optional `StepPanels`). */
  children?: ReactNode;
  /** The currently selected step (controlled). */
  selectedKey?: Key | null;
  /** The initially selected step (uncontrolled). */
  defaultSelectedKey?: Key;
  /** Handler called when the selected step changes. */
  onSelectionChange?: (key: Key) => void;
  /**
   * The key of the last completed step (controlled). Every step up to and including the one after
   * it is navigable.
   */
  lastCompletedStep?: Key;
  /** The key of the initially last completed step (uncontrolled). */
  defaultLastCompletedStep?: Key;
  /** Handler called when the last completed step changes. */
  onLastCompletedStepChange?: (key: Key | null) => void;
  /** Whether the step list is read only. Steps are displayed but not navigable. */
  isReadOnly?: boolean;
}

/**
 * A StepListTabs displays a sequence of steps built on Tabs. Previous (completed) steps and
 * the current step are navigable; upcoming steps are not. The current step is marked with
 * `aria-current="step"`.
 */
export const StepListTabs = /*#__PURE__*/ forwardRef(function StepListTabs(
  props: StepListTabsProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  let {children} = props;
  return (
    <CollectionBuilder content={children}>
      {collection => <StepListTabsInner props={props} collection={collection} tabsRef={ref} />}
    </CollectionBuilder>
  );
});

interface StepListTabsInnerProps {
  props: StepListTabsProps;
  collection: ICollection<Node<unknown>>;
  tabsRef: ForwardedRef<HTMLDivElement>;
}

function StepListTabsInner({props, collection, tabsRef: ref}: StepListTabsInnerProps) {
  let {
    children,
    selectedKey,
    defaultSelectedKey,
    onSelectionChange,
    lastCompletedStep,
    defaultLastCompletedStep,
    onLastCompletedStepChange,
    isReadOnly = false,
    ...tabsProps
  } = props;

  // TODO: revist
  // Don't have access to the keyboard delegate here, so just rely on the collection order.
  let keys = useMemo(() => [...collection].map(item => item.key), [collection]);

  let state = useStepListTabsState({
    keys,
    selectedKey,
    defaultSelectedKey,
    onSelectionChange,
    lastCompletedStep,
    defaultLastCompletedStep,
    onLastCompletedStepChange,
    isReadOnly
  });

  return (
    <Tabs
      {...tabsProps}
      keyboardActivation="manual"
      ref={ref}
      selectedKey={state.selectedKey ?? undefined}
      onSelectionChange={state.setSelectedKey}
      disabledKeys={state.disabledKeys}>
      {children}
    </Tabs>
  );
}

export interface StepListTabListProps<T> extends TabListProps<T> {}

export const StepListTabList = /*#__PURE__*/ (forwardRef as forwardRefType)(
  function StepListTabList<T extends object>(
    props: StepListTabListProps<T>,
    ref: ForwardedRef<HTMLDivElement>
  ) {
    return <TabList {...props} ref={ref} />;
  }
);

export interface StepProps extends Omit<TabProps, 'aria-current'> {}

function StepState({stepKey, children}: {stepKey: Key | undefined; children: ReactNode}) {
  let {isCurrent, isCompleted} = useStep(stepKey);
  let stringFormatter = useLocalizedStringFormatter(intlMessages, 'react-aria-components');

  let stateText = isCurrent
    ? stringFormatter.format('stepListItemCurrent')
    : isCompleted
      ? stringFormatter.format('stepListItemCompleted')
      : stringFormatter.format('stepListItemNotCompleted');

  return (
    <span
      style={{display: 'contents'}}
      data-current={isCurrent || undefined}
      data-completed={isCompleted || undefined}>
      <VisuallyHidden elementType="span">{stateText}</VisuallyHidden>
      {children}
    </span>
  );
}

/** A single step within a `StepListTabList` (wraps `Tab`, adds `aria-current="step"`). */
export const Step = /*#__PURE__*/ forwardRef(function Step(
  props: StepProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  let {children, ...otherProps} = props;
  return (
    <Tab {...otherProps} ref={ref} aria-current="step">
      {renderProps => (
        <StepState stepKey={props.id}>
          {typeof children === 'function' ? children(renderProps) : children}
        </StepState>
      )}
    </Tab>
  );
}) as (props: StepProps & {ref?: ForwardedRef<HTMLDivElement>}) => ReactElement;

export interface StepPanelsProps<T> extends TabPanelsProps<T> {}

/** Container for the step panels within a `StepListTabs` (wraps `TabPanels`). */
export const StepPanels = /*#__PURE__*/ (forwardRef as forwardRefType)(function StepPanels<
  T extends object
>(props: StepPanelsProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  return <TabPanels {...props} ref={ref} />;
});

export interface StepPanelProps extends TabPanelProps {}

/** The content region for a single step (wraps `TabPanel`). */
export const StepPanel = /*#__PURE__*/ forwardRef(function StepPanel(
  props: StepPanelProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  return <TabPanel {...props} ref={ref} />;
});
