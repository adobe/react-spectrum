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
import {ClassNameOrFunction, PossibleLinkDOMRenderProps, RenderProps} from './utils';
import {CollectionBuilder} from 'react-aria/CollectionBuilder';
import {FocusableElement, forwardRefType, RefObject} from '@react-types/shared';
import {Collection as ICollection, Key, Node} from '@react-types/shared';
import intlMessages from '../intl/*.json';
import React, {
  createContext,
  ForwardedRef,
  forwardRef,
  ReactElement,
  ReactNode,
  useContext,
  useMemo,
  useState
} from 'react';
import {
  Tab,
  TabList,
  TabListProps,
  TabListRenderProps,
  TabPanel,
  TabPanelProps,
  TabPanelRenderProps,
  TabPanels,
  TabPanelsProps,
  TabProps,
  TabRenderProps,
  Tabs,
  TabsProps,
  TabsRenderProps
} from './Tabs';
import {useControlledState} from 'react-stately/useControlledState';
import {useLocalizedStringFormatter} from 'react-aria/useLocalizedStringFormatter';
import {useObjectRef} from 'react-aria/useObjectRef';
import {VisuallyHidden} from 'react-aria/VisuallyHidden';

export interface WizardProps extends Omit<TabsProps, 'children' | 'selectedKey'> {
  /** The children of the component (a `WizardStepList` and optional `WizardPanels`). */
  children?: ReactNode;
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-Wizard'
   */
  className?: ClassNameOrFunction<TabsRenderProps>;
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
  lastCompletedStep?: Key | null;
  /** The key of the initially last completed step (uncontrolled). */
  defaultLastCompletedStep?: Key;
  /**
   * Handler called when selecting a step completes the steps before it, in the same event as
   * `onSelectionChange`.
   */
  onLastCompletedStepChange?: (key: Key | null) => void;
  /**
   * Whether every step that is not in `disabledKeys` is navigable at any time, rather than only
   * completed steps and the one after them.
   */
  allowsRandomAccess?: boolean;
}

/**
 * A Wizard guides users through a multi-step process one step at a time, and allows them to
 * navigate between the steps they have reached.
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

// Passes the wizard's default class name to className functions, rather than the one of the
// Tabs component it wraps.
function withDefaultClassName<T>(
  className: ClassNameOrFunction<T> | undefined,
  defaultClassName: string
): ClassNameOrFunction<T> {
  return typeof className === 'function'
    ? values => className({...values, defaultClassName})
    : (className ?? defaultClassName);
}

interface WizardInnerProps {
  props: WizardProps;
  collection: ICollection<Node<unknown>>;
  tabsRef: ForwardedRef<HTMLDivElement>;
}

// Steps are rendered into the collection outside of the TabListStateContext, so the wizard provides
// its state to them directly.
const WizardStateContext = createContext<WizardState<unknown> | null>(null);

export interface WizardStateOptions<T> {
  /** The collection of steps, in order. */
  collection: ICollection<Node<T>>;
  /** The currently selected step (controlled). */
  selectedKey?: Key | null;
  /** The initially selected step (uncontrolled). */
  defaultSelectedKey?: Key;
  /** Handler called when the selected step changes. */
  onSelectionChange?: (key: Key) => void;
  /** The key of the last completed step (controlled). */
  lastCompletedStep?: Key | null;
  /** The key of the initially last completed step (uncontrolled). */
  defaultLastCompletedStep?: Key;
  /**
   * Handler called when selecting a step completes the steps before it, in the same event as
   * `onSelectionChange`.
   */
  onLastCompletedStepChange?: (key: Key | null) => void;
  /** Whether every step that is not in `disabledKeys` is navigable at any time. */
  allowsRandomAccess?: boolean;
  /** The step keys that are disabled. These steps are never navigable. */
  disabledKeys?: Iterable<Key>;
}

export interface WizardState<T> {
  /** The collection of steps. */
  collection: ICollection<Node<T>>;
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
 * unless random access is allowed. Unless it's controlled, the last completed step is derived from
 * the selection: it advances as the selection moves forward and is never rolled back, so previously
 * reached steps stay navigable after navigating backwards. `onLastCompletedStepChange` is called in
 * the same event as `onSelectionChange`, so a controlled last completed step can be updated along
 * with the selection.
 */
export function useWizardState<T>(props: WizardStateOptions<T>): WizardState<T> {
  let {
    collection,
    allowsRandomAccess = false,
    disabledKeys: disabledStepKeys,
    onSelectionChange,
    onLastCompletedStepChange
  } = props;

  // TODO: revist
  // Don't have access to the keyboard delegate here, so just rely on the collection order.
  let keys = useMemo(() => [...collection].map(item => item.key), [collection]);
  let firstKey = keys.length > 0 ? keys[0] : null;

  let [selectedKeyState, setSelectedKeyState] = useControlledState<Key | null>(
    props.selectedKey,
    props.defaultSelectedKey ?? null,
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

  let isLastCompletedStepControlled = props.lastCompletedStep !== undefined;
  let [lastCompletedStepState, setLastCompletedStepState] = useState<Key | null>(
    props.defaultLastCompletedStep ?? null
  );
  let lastCompletedStep = isLastCompletedStepControlled
    ? (props.lastCompletedStep ?? null)
    : lastCompletedStepState;
  let lastCompletedIndex = lastCompletedStep != null ? keys.indexOf(lastCompletedStep) : -1;

  // When uncontrolled, every step before the selected step is completed. Store it during render
  // rather than syncing it in an effect, so it's correct on the first render and isn't rolled back
  // when the selection moves backwards, even if the selection is controlled.
  if (!isLastCompletedStepControlled && selectedIndex - 1 > lastCompletedIndex) {
    lastCompletedIndex = selectedIndex - 1;
    lastCompletedStep = keys[lastCompletedIndex];
    setLastCompletedStepState(lastCompletedStep);
  }

  // Notify in the same event as the selection change, so a controlled lastCompletedStep can be
  // updated along with the selection.
  let setSelectedKey = (key: Key) => {
    setSelectedKeyState(key);
    let index = keys.indexOf(key);
    if (index - 1 > lastCompletedIndex) {
      onLastCompletedStepChange?.(keys[index - 1]);
    }
  };

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
    collection,
    selectedKey,
    setSelectedKey,
    lastCompletedStep,
    disabledKeys
  };
}

function WizardInner({props, collection, tabsRef: ref}: WizardInnerProps) {
  let {
    children,
    className,
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

  let state = useWizardState({
    collection,
    selectedKey,
    defaultSelectedKey,
    onSelectionChange,
    lastCompletedStep,
    defaultLastCompletedStep,
    onLastCompletedStepChange,
    allowsRandomAccess,
    disabledKeys
  });

  // Tabs treats null as a controlled empty selection, so passing it rather than undefined keeps Tabs
  // controlled while there is no selected step (e.g. before the collection is populated).
  return (
    <WizardStateContext.Provider value={state}>
      <Tabs
        {...tabsProps}
        className={withDefaultClassName(className, 'react-aria-Wizard')}
        keyboardActivation="manual"
        ref={ref}
        selectedKey={state.selectedKey!}
        onSelectionChange={state.setSelectedKey}
        disabledKeys={state.disabledKeys}>
        {children}
      </Tabs>
    </WizardStateContext.Provider>
  );
}

export interface WizardStepListProps<T> extends TabListProps<T> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-WizardStepList'
   */
  className?: ClassNameOrFunction<TabListRenderProps>;
}

/**
 * A WizardStepList groups the steps within a `<Wizard>`. The ids of its steps must match up with a
 * corresponding `<WizardPanel>` inside the `<WizardPanels>`.
 */
export const WizardStepList = /*#__PURE__*/ (forwardRef as forwardRefType)(function WizardStepList<
  T extends object
>(props: WizardStepListProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  return (
    <TabList
      {...props}
      ref={ref}
      className={withDefaultClassName(props.className, 'react-aria-WizardStepList')}
    />
  );
});

export interface WizardStepRenderProps extends TabRenderProps {
  /**
   * Whether the step is the current step.
   *
   * @selector [data-current]
   */
  isCurrent: boolean;
  /**
   * Whether the step is rendered before the current step.
   *
   * @selector [data-completed]
   */
  isCompleted: boolean;
  /** The position of the step within the `WizardStepList`, starting from 1. */
  stepNumber: number;
}

export interface WizardStepProps
  extends
    Omit<TabProps, 'className' | 'style' | 'children' | 'render'>,
    Omit<RenderProps<WizardStepRenderProps>, 'render'>,
    PossibleLinkDOMRenderProps<'div', WizardStepRenderProps> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-WizardStep'
   */
  className?: ClassNameOrFunction<WizardStepRenderProps>;
}

export interface WizardStepAria {
  /** Whether this step is the current (selected) step. */
  isCurrent: boolean;
  /** Whether this step has been completed (precedes the current step). */
  isCompleted: boolean;
  /** The position of the step within the wizard, starting from 1. */
  stepNumber: number;
}

interface AriaWizardStepProps {
  /** The key of the step. */
  key: Key;
}

/**
 * Provides the state of a step within a wizard: whether it is the current step, whether it has
 * already been completed (it is rendered before the current step), and its position.
 */
export function useWizardStep<T>(
  props: AriaWizardStepProps,
  state: WizardState<T>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ref: RefObject<FocusableElement | null>
): WizardStepAria {
  let {key} = props;
  let {collection, selectedKey} = state;
  let index = collection.getItem(key)?.index ?? -1;
  let selectedIndex = selectedKey != null ? (collection.getItem(selectedKey)?.index ?? -1) : -1;

  return {
    isCurrent: index >= 0 && index === selectedIndex,
    isCompleted: index >= 0 && index < selectedIndex,
    stepNumber: index + 1
  };
}

/**
 * A WizardStep represents an individual step within a `<WizardStepList>`.
 */
export const WizardStep = /*#__PURE__*/ forwardRef(function WizardStep(
  props: WizardStepProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  let state = useContext(WizardStateContext);
  // The Wizard renders its steps before its state exists to build the collection the state is
  // computed from, which only needs the keys of the steps.
  if (!state) {
    return <Tab id={props.id} />;
  }

  return <WizardStepInner props={props} state={state} stepRef={ref} />;
}) as (props: WizardStepProps & {ref?: ForwardedRef<HTMLDivElement>}) => ReactElement;

interface WizardStepInnerProps {
  props: WizardStepProps;
  state: WizardState<unknown>;
  stepRef: ForwardedRef<HTMLDivElement>;
}

function WizardStepInner({props, state, stepRef}: WizardStepInnerProps) {
  let {children, className, style, render, ...otherProps} = props;
  let ref = useObjectRef(stepRef);
  let {isCurrent, isCompleted, stepNumber} = useWizardStep({key: props.id!}, state, ref);
  let stringFormatter = useLocalizedStringFormatter(intlMessages, 'react-aria-components');
  let stateText = isCompleted
    ? stringFormatter.format('stepListItemCompleted')
    : stringFormatter.format('stepListItemNotCompleted');

  // Adds the step state to the render props that Tab provides.
  let getRenderProps = <R extends TabRenderProps>(renderProps: R): R & WizardStepRenderProps => ({
    ...renderProps,
    isCurrent,
    isCompleted,
    stepNumber
  });

  return (
    <Tab
      {...otherProps}
      ref={ref}
      className={withDefaultClassName<TabRenderProps>(
        typeof className === 'function' ? values => className(getRenderProps(values)) : className,
        'react-aria-WizardStep'
      )}
      style={typeof style === 'function' ? values => style(getRenderProps(values)) : style}
      render={render ? (domProps, values) => render(domProps, getRenderProps(values)) : undefined}
      aria-current="step"
      data-current={isCurrent || undefined}
      data-completed={isCompleted || undefined}>
      {renderProps => (
        <>
          {!isCurrent && <VisuallyHidden elementType="span">{stateText}</VisuallyHidden>}
          {typeof children === 'function' ? children(getRenderProps(renderProps)) : children}
        </>
      )}
    </Tab>
  );
}

export interface WizardPanelsProps<T> extends TabPanelsProps<T> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element.
   *
   * @default 'react-aria-WizardPanels'
   */
  className?: string;
}

/**
 * Groups multiple `<WizardPanel>` elements, and provides CSS variables for animated transitions.
 */
export const WizardPanels = /*#__PURE__*/ (forwardRef as forwardRefType)(function WizardPanels<
  T extends object
>(props: WizardPanelsProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  return (
    <TabPanels {...props} ref={ref} className={props.className ?? 'react-aria-WizardPanels'} />
  );
});

export interface WizardPanelProps extends TabPanelProps {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-WizardPanel'
   */
  className?: ClassNameOrFunction<TabPanelRenderProps>;
}

/**
 * A WizardPanel provides the content for a step.
 */
export const WizardPanel = /*#__PURE__*/ forwardRef(function WizardPanel(
  props: WizardPanelProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <TabPanel
      {...props}
      ref={ref}
      className={withDefaultClassName(props.className, 'react-aria-WizardPanel')}
    />
  );
});
