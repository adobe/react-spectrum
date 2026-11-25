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
import {ButtonContext} from './Button';
import {
  ClassNameOrFunction,
  DEFAULT_SLOT,
  PossibleLinkDOMRenderProps,
  Provider,
  RenderProps
} from './utils';
import {CollectionBuilder, createLeafComponent} from 'react-aria/CollectionBuilder';
import {CollectionNode} from 'react-aria/private/collections/BaseCollection';
import {FocusableElement, forwardRefType, RefObject} from '@react-types/shared';
import {Collection as ICollection, Key, Node} from '@react-types/shared';
import intlMessages from '../intl/*.json';
import React, {
  createContext,
  ForwardedRef,
  forwardRef,
  ReactNode,
  useContext,
  useMemo
} from 'react';
import {
  TabInner,
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
  TabsInner,
  TabsProps,
  TabsRenderProps
} from './Tabs';
import {useControlledState} from 'react-stately/useControlledState';
import {useId} from 'react-aria/useId';
import {useLocalizedStringFormatter} from 'react-aria/useLocalizedStringFormatter';
import {useObjectRef} from 'react-aria/useObjectRef';
import {VisuallyHidden} from 'react-aria/VisuallyHidden';

export interface WizardProps extends Omit<TabsProps, 'children' | 'selectedKey'> {
  /**
   * The children of the component (a `WizardStepList` and optional `WizardPanels`). Buttons with
   * `slot="previous"` and `slot="next"` move to the previous and next steps.
   */
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
   * The keys of the completed steps. The application decides when a step is completed, for example,
   * when all its fields are valid. Unless `allowsRandomAccess` is set, any step up to and including
   * the step immediately following the last completed step is navigable, and the `next` button only
   * moves to navigable steps. When omitted, the steps before the current step are considered
   * completed. If `allowsRandomAccess` is set, no steps are considered completed.
   */
  completedKeys?: Iterable<Key>;
  /**
   * Whether every step that is not in `disabledKeys` is navigable at any time, rather than only the
   * steps up to and including the one after the last completed step.
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
  // Like Select, the wizard builds the collection of its steps once and provides its state to the
  // TabList, rather than rendering Tabs, which would build the collection again.
  return (
    <CollectionBuilder content={children}>
      {collection => <WizardInner props={props} collection={collection} tabsRef={ref} />}
    </CollectionBuilder>
  );
});

// Used so that Wizard can use render props for className with it's own default classname
function withDefaultClassName<T>(
  className: ClassNameOrFunction<T> | undefined,
  defaultClassName: string
): ClassNameOrFunction<T> {
  return typeof className === 'function'
    ? values => className({...values, defaultClassName}) ?? defaultClassName
    : (className ?? defaultClassName);
}

interface WizardInnerProps {
  props: WizardProps;
  collection: ICollection<Node<unknown>>;
  tabsRef: ForwardedRef<HTMLDivElement>;
}

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
  /**
   * The keys of the completed steps. When omitted, every step before the selected step is
   * considered complete. If random access is allowed, none of the steps are considered complete.
   */
  completedKeys?: Iterable<Key>;
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
  /** The keys of the completed steps. */
  completedKeys: Set<Key>;
  /**
   * Keys that are not navigable.
   */
  disabledKeys: Set<Key>;
  /** The closest navigable step before the current step. */
  previousKey: Key | null;
  /**
   * The closest step after the current step that the user can move to. Unless the completed steps
   * are provided, it may be an upcoming step, since moving to it is how the user completes the
   * current step.
   */
  nextKey: Key | null;
}

/**
 * This hook controls the selected step, and derives which steps are completed and navigable. The
 * application decides which steps are completed, or by default, the steps before the selected step
 * are completed unless random access is allowed. The steps up to and including the one after the
 * last completed step, and the selected step, are navigable; the steps after those are upcoming,
 * and are not navigable unless random access is allowed.
 */
export function useWizardState<T>(props: WizardStateOptions<T>): WizardState<T> {
  let {
    collection,
    allowsRandomAccess = false,
    disabledKeys: disabledStepKeys,
    completedKeys: completedStepKeys,
    onSelectionChange
  } = props;

  // Steps disabled by the user are never navigable.
  let disabledSteps = useMemo(() => {
    let set = new Set<Key>(disabledStepKeys);
    // aggregate steps disabled via individual props as well
    for (let step of collection) {
      if (step.props?.isDisabled) {
        set.add(step.key);
      }
    }
    return set;
  }, [collection, disabledStepKeys]);

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

  // Like Tabs, select the first step that isn't disabled when no step is selected or the selected
  // step is removed, or the first step if every step is disabled.
  let selectedKey =
    selectedKeyState != null && collection.getItem(selectedKeyState)
      ? selectedKeyState
      : (findEnabledStep(collection.getFirstKey(), disabledSteps, key =>
          collection.getKeyAfter(key)
        ) ?? collection.getFirstKey());

  let completedKeys = useMemo(() => {
    // controlled
    if (completedStepKeys) {
      return new Set<Key>(completedStepKeys);
    }
    // uncontrolled and linear
    let set = new Set<Key>();
    if (!allowsRandomAccess && selectedKey != null) {
      let key = collection.getKeyBefore(selectedKey);
      while (key != null) {
        set.add(key);
        key = collection.getKeyBefore(key);
      }
    }
    return set;
  }, [collection, completedStepKeys, allowsRandomAccess, selectedKey]);

  let disabledKeys = useMemo(() => {
    let set = new Set<Key>(disabledSteps);
    if (!allowsRandomAccess) {
      // In linear, everything after the last completed step is disabled.
      let lastCompletedKey: Key | null = null;
      for (let key of completedKeys) {
        if (getStepIndex(collection, key) > getStepIndex(collection, lastCompletedKey)) {
          lastCompletedKey = key;
        }
      }
      let nextStep = findEnabledStep(
        lastCompletedKey != null
          ? collection.getKeyAfter(lastCompletedKey)
          : collection.getFirstKey(),
        disabledSteps,
        key => collection.getKeyAfter(key)
      );
      let key = nextStep != null ? collection.getKeyAfter(nextStep) : null;
      while (key != null) {
        if (key !== selectedKey) {
          set.add(key);
        }
        key = collection.getKeyAfter(key);
      }
    }
    return set;
  }, [collection, selectedKey, completedKeys, allowsRandomAccess, disabledSteps]);

  let previousKey =
    selectedKey != null
      ? findEnabledStep(collection.getKeyBefore(selectedKey), disabledKeys, key =>
          collection.getKeyBefore(key)
        )
      : null;
  // When the application decides which steps are completed, the user can only move forward to a
  // navigable step. Otherwise, moving to the next step is how the user completes the current step,
  // so it may be an upcoming step.
  let nextKey =
    selectedKey != null
      ? findEnabledStep(
          collection.getKeyAfter(selectedKey),
          completedStepKeys ? disabledKeys : disabledSteps,
          key => collection.getKeyAfter(key)
        )
      : null;

  return {
    collection,
    selectedKey,
    setSelectedKey: setSelectedKeyState,
    completedKeys,
    disabledKeys,
    previousKey,
    nextKey
  };
}

// The closest step to the given one, including itself, in the direction of getNextKey that isn't in
// disabledKeys.
function findEnabledStep(
  key: Key | null,
  disabledKeys: Set<Key>,
  getNextKey: (key: Key) => Key | null
): Key | null {
  while (key != null && disabledKeys.has(key)) {
    key = getNextKey(key);
  }
  return key;
}

// The position of a step within the wizard, or -1 if the key isn't one of its steps.
function getStepIndex<T>(collection: ICollection<Node<T>>, key: Key | null): number {
  return key != null ? (collection.getItem(key)?.index ?? -1) : -1;
}

function WizardInner({props, collection, tabsRef}: WizardInnerProps) {
  let {
    className,
    selectedKey,
    defaultSelectedKey,
    onSelectionChange,
    completedKeys,
    allowsRandomAccess,
    disabledKeys,
    ...tabsProps
  } = props;

  let state = useWizardState({
    collection,
    selectedKey,
    defaultSelectedKey,
    onSelectionChange,
    completedKeys,
    allowsRandomAccess,
    disabledKeys
  });

  // Buttons with the previous and next slots move to the previous and next steps, and are disabled
  // when there isn't one. The slots of an outer ButtonContext, such as the close slot of a Dialog,
  // are kept so that their buttons still work within the wizard.
  let buttonContext = useContext(ButtonContext);
  let outerButtonSlots =
    buttonContext && 'slots' in buttonContext ? buttonContext.slots : undefined;
  let {previousKey, nextKey} = state;
  let buttonSlots = {
    [DEFAULT_SLOT]: {},
    ...outerButtonSlots,
    previous: {
      isDisabled: props.isDisabled || previousKey == null,
      onPress: () => {
        if (previousKey != null) {
          state.setSelectedKey(previousKey);
        }
      }
    },
    next: {
      isDisabled: props.isDisabled || nextKey == null,
      onPress: () => {
        if (nextKey != null) {
          state.setSelectedKey(nextKey);
        }
      }
    }
  };

  return (
    <Provider
      values={[
        [WizardStateContext, state],
        [ButtonContext, {slots: buttonSlots}]
      ]}>
      <TabsInner
        props={{
          ...tabsProps,
          className: withDefaultClassName(className, 'react-aria-Wizard'),
          keyboardActivation: 'manual',
          selectedKey: state.selectedKey!,
          onSelectionChange: state.setSelectedKey,
          disabledKeys: state.disabledKeys,
          shouldFocusWrap: false
        }}
        collection={collection}
        tabsRef={tabsRef}
      />
    </Provider>
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
   * Whether the step is completed.
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
  /** Whether this step is completed. */
  isCompleted: boolean;
  /** The position of the step within the wizard, starting from 1. */
  stepNumber: number;
}

interface AriaWizardStepProps {
  /** The key of the step. */
  key: Key;
}

/**
 * Provides the state of a step within a wizard: whether it is the current step, whether it is
 * completed, and its position.
 */
export function useWizardStep<T>(
  props: AriaWizardStepProps,
  state: WizardState<T>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ref: RefObject<FocusableElement | null>
): WizardStepAria {
  let {key} = props;
  let {collection, selectedKey, completedKeys} = state;
  let index = getStepIndex(collection, key);

  return {
    isCurrent: key === selectedKey,
    isCompleted: index >= 0 && completedKeys.has(key),
    stepNumber: index + 1
  };
}

class WizardStepNode extends CollectionNode<unknown> {
  static readonly type = 'item';
}

/**
 * A WizardStep represents an individual step within a `<WizardStepList>`.
 */
export const WizardStep = /*#__PURE__*/ createLeafComponent(
  WizardStepNode,
  function WizardStep(
    props: WizardStepProps,
    forwardedRef: ForwardedRef<HTMLDivElement>,
    item: Node<unknown>
  ) {
    let state = useContext(WizardStateContext)!;
    let {children, className, style, render, ...otherProps} = props;
    let ref = useObjectRef(forwardedRef);
    let {isCurrent, isCompleted, stepNumber} = useWizardStep({key: item.key}, state, ref);
    let stringFormatter = useLocalizedStringFormatter(intlMessages, 'react-aria-components');
    let stateText = isCompleted
      ? stringFormatter.format('progressListItemCompleted')
      : stringFormatter.format('progressListItemNotCompleted');
    let stateTextId = useId();

    // Steps other than the current one announce whether they're completed with visually hidden
    // text. An aria-label or aria-labelledby replaces the text content of the step, so the state is
    // added to it.
    let ariaLabel = props['aria-label'];
    let ariaLabelledby = props['aria-labelledby'];
    if (!isCurrent && ariaLabelledby) {
      ariaLabelledby = `${stateTextId} ${ariaLabelledby}`;
    } else if (!isCurrent && ariaLabel) {
      ariaLabel = `${stateText} ${ariaLabel}`;
    }

    // Adds the step state to the render props that Tab provides.
    let getRenderProps = <R extends TabRenderProps>(renderProps: R): R & WizardStepRenderProps => ({
      ...renderProps,
      isCurrent,
      isCompleted,
      stepNumber
    });

    let tabProps: TabProps & {
      'aria-current'?: 'step';
      'data-current'?: boolean;
      'data-completed'?: boolean;
    } = {
      ...otherProps,
      className: withDefaultClassName<TabRenderProps>(
        typeof className === 'function' ? values => className(getRenderProps(values)) : className,
        'react-aria-WizardStep'
      ),
      style: typeof style === 'function' ? values => style(getRenderProps(values)) : style,
      render: render ? (domProps, values) => render(domProps, getRenderProps(values)) : undefined,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      'aria-current': isCurrent ? 'step' : undefined,
      'data-current': isCurrent || undefined,
      'data-completed': isCompleted || undefined,
      children: renderProps => (
        <>
          {!isCurrent && (
            <VisuallyHidden elementType="span" id={stateTextId}>
              {stateText}
            </VisuallyHidden>
          )}
          {typeof children === 'function' ? children(getRenderProps(renderProps)) : children}
        </>
      )
    };

    return <TabInner props={tabProps} forwardedRef={ref} item={item} />;
  }
);

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
