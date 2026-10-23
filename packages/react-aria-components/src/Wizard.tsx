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
import React, {
  ForwardedRef,
  forwardRef,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useMemo
} from 'react';
import {
  Tab,
  TabList,
  TabListProps,
  TabListStateContext,
  TabPanel,
  TabPanelProps,
  TabPanels,
  TabPanelsProps,
  TabProps,
  Tabs,
  TabsProps
} from './Tabs';
import {useControlledState} from 'react-stately/useControlledState';
import {useLocalizedStringFormatter} from 'react-aria/useLocalizedStringFormatter';
import {VisuallyHidden} from 'react-aria/VisuallyHidden';

export interface WizardProps extends Omit<TabsProps, 'children' | 'selectedKey'> {
  /** The children of the component (a `WizardStepList` and optional `WizardPanels`). */
  children?: ReactNode;
  /** The currently selected step (controlled). */
  selectedKey?: Key | null;
  /** The initially selected step (uncontrolled). */
  defaultSelectedKey?: Key;
  /** Handler called when the selected step changes. */
  onSelectionChange?: (key: Key) => void;
  /**
   * The key of the last completed step (controlled). Every step up to and including the one after
   * it is navigable by default.
   */
  lastCompletedStep?: Key;
  /** The key of the initially last completed step (uncontrolled). */
  defaultLastCompletedStep?: Key;
  /** Handler called when the last completed step changes. */
  onLastCompletedStepChange?: (key: Key | null) => void;
  /**
   * Whether every step that is not in `disabledKeys` is navigable at any time, rather than only
   * completed steps and the one after them.
   */
  allowsRandomAccess?: boolean;
}

/**
 * A Wizard displays a sequence of steps.
 */
export const Wizard = /*#__PURE__*/ forwardRef(function Wizard(
  props: WizardProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  let {children} = props;
  return (
    <CollectionBuilder content={children}>
      {collection => <WizardInner props={props} collection={collection} tabsRef={ref} />}
    </CollectionBuilder>
  );
});

interface WizardInnerProps {
  props: WizardProps;
  collection: ICollection<Node<unknown>>;
  tabsRef: ForwardedRef<HTMLDivElement>;
}

export interface WizardStateOptions {
  /** Ordered list of step keys, in collection order. */
  keys: Key[];
  /** The currently selected step (controlled). */
  selectedKey?: Key | null;
  /** The initially selected step (uncontrolled). */
  defaultSelectedKey?: Key;
  /** Handler called when the selected step changes. */
  onSelectionChange?: (key: Key) => void;
  /** The key of the last completed step (controlled). */
  lastCompletedStep?: Key;
  /** The key of the initially last completed step (uncontrolled). */
  defaultLastCompletedStep?: Key;
  /** Handler called when the last completed step changes. */
  onLastCompletedStepChange?: (key: Key | null) => void;
  /** Whether every step that is not in `disabledKeys` is navigable at any time. */
  allowsRandomAccess?: boolean;
  /** The step keys that are disabled. These steps are never navigable. */
  disabledKeys?: Iterable<Key>;
}

export interface WizardState {
  /** The current (selected) step. */
  selectedKey: Key | null;
  /** Sets the current (selected) step. */
  setSelectedKey(key: Key): void;
  /**
   * The key of the last completed step. Every step up to and including the one after it is
   * navigable by default.
   */
  lastCompletedStep: Key | null;
  /**
   * Keys that are not navigable.
   */
  disabledKeys: Set<Key>;
}

/**
 * This hook controls the selected step and tracks the last completed step so it can derive which
 * steps are navigable. Completed steps and the current step are navigable; upcoming steps are not
 * unless random access is allowed. The last completed step advances as the selection moves forward
 * and is never rolled back unless it's in a controlled state,
 * so previously reached steps stay navigable after navigating backwards.
 */
export function useWizardState(options: WizardStateOptions): WizardState {
  let {
    keys,
    allowsRandomAccess = false,
    disabledKeys: disabledStepKeys,
    onSelectionChange
  } = options;
  let firstKey = keys.length > 0 ? keys[0] : null;

  let [selectedKeyState, setSelectedKey] = useControlledState<Key | null>(
    options.selectedKey,
    options.defaultSelectedKey ?? null,
    onSelectionChange
      ? key => {
          if (key != null) {
            onSelectionChange(key);
          }
        }
      : undefined
  );

  let selectedKey = selectedKeyState ?? firstKey;
  let selectedIndex = selectedKey != null ? keys.indexOf(selectedKey) : -1;

  let [lastCompletedStep, setLastCompletedStep] = useControlledState<Key | null>(
    options.lastCompletedStep,
    options.defaultLastCompletedStep ?? null,
    options.onLastCompletedStepChange
  );
  let lastCompletedIndex = lastCompletedStep != null ? keys.indexOf(lastCompletedStep) : -1;

  useEffect(() => {
    if (selectedIndex > lastCompletedIndex + 1 && selectedIndex > 0) {
      setLastCompletedStep(keys[selectedIndex - 1]);
    }
  }, [keys, selectedIndex, lastCompletedIndex, setLastCompletedStep]);

  let disabledKeys = useMemo(() => {
    // Steps disabled by the consumer are never navigable, however the wizard is configured.
    let set = new Set<Key>(disabledStepKeys);
    keys.forEach((key, i) => {
      if (key === selectedKey) {
        return;
      }
      // Completed steps and the current step are navigable; upcoming steps are only if allowsRandomAccess.
      if (!allowsRandomAccess && i > lastCompletedIndex + 1) {
        set.add(key);
      }
    });
    return set;
  }, [keys, selectedKey, lastCompletedIndex, allowsRandomAccess, disabledStepKeys]);

  return {
    selectedKey,
    setSelectedKey,
    lastCompletedStep,
    disabledKeys
  };
}

function WizardInner({props, collection, tabsRef: ref}: WizardInnerProps) {
  let {
    children,
    selectedKey,
    defaultSelectedKey,
    onSelectionChange,
    lastCompletedStep,
    defaultLastCompletedStep,
    onLastCompletedStepChange,
    allowsRandomAccess,
    disabledKeys,
    ...tabsProps
  } = props;

  // TODO: revist
  // Don't have access to the keyboard delegate here, so just rely on the collection order.
  let keys = useMemo(() => [...collection].map(item => item.key), [collection]);

  let state = useWizardState({
    keys,
    selectedKey,
    defaultSelectedKey,
    onSelectionChange,
    lastCompletedStep,
    defaultLastCompletedStep,
    onLastCompletedStepChange,
    allowsRandomAccess,
    disabledKeys
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

export interface WizardStepListProps<T> extends TabListProps<T> {}

/** The list of steps within a `Wizard` (wraps `TabList`). */
export const WizardStepList = /*#__PURE__*/ (forwardRef as forwardRefType)(function WizardStepList<
  T extends object
>(props: WizardStepListProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  return <TabList {...props} ref={ref} />;
});

export interface WizardStepProps extends TabProps {}

export interface WizardStepAria {
  /** Whether this step is the current (selected) step. */
  isCurrent: boolean;
  /** Whether this step has been completed (precedes the current step). */
  isCompleted: boolean;
}

/**
 * Returns whether the step with the given key is the current step of the enclosing `Wizard`, and
 * whether it has already been completed (it is rendered before the current step).
 */
export function useWizardStep(key: Key | undefined): WizardStepAria {
  let state = useContext(TabListStateContext);

  if (state == null || key == null || state.selectedKey == null) {
    return {isCurrent: false, isCompleted: false};
  }

  let isCurrent = state.selectedKey === key;

  // Walk backwards from the current step. If we reach this step, it precedes the current
  // step and is therefore completed.
  // Should be ok for performance, wizards are generally short.
  let isCompleted = false;
  let cursor = state.collection.getKeyBefore(state.selectedKey);
  while (cursor != null) {
    if (cursor === key) {
      isCompleted = true;
      break;
    }
    cursor = state.collection.getKeyBefore(cursor);
  }

  return {isCurrent, isCompleted};
}

function WizardStepState({stepKey, children}: {stepKey: Key | undefined; children: ReactNode}) {
  let {isCurrent, isCompleted} = useWizardStep(stepKey);
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
      {!isCurrent && <VisuallyHidden elementType="span">{stateText}</VisuallyHidden>}
      {children}
    </span>
  );
}

export const WizardStep = /*#__PURE__*/ forwardRef(function WizardStep(
  props: WizardStepProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  let {children, ...otherProps} = props;
  return (
    <Tab {...otherProps} ref={ref} aria-current="step">
      {renderProps => (
        <WizardStepState stepKey={props.id}>
          {typeof children === 'function' ? children(renderProps) : children}
        </WizardStepState>
      )}
    </Tab>
  );
}) as (props: WizardStepProps & {ref?: ForwardedRef<HTMLDivElement>}) => ReactElement;

export interface WizardPanelsProps<T> extends TabPanelsProps<T> {}

export const WizardPanels = /*#__PURE__*/ (forwardRef as forwardRefType)(function WizardPanels<
  T extends object
>(props: WizardPanelsProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  return <TabPanels {...props} ref={ref} />;
});

export interface WizardPanelProps extends TabPanelProps {}

export const WizardPanel = /*#__PURE__*/ forwardRef(function WizardPanel(
  props: WizardPanelProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  return <TabPanel {...props} ref={ref} />;
});
