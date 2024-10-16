/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaDisclosureProps, useDisclosure} from '@react-aria/disclosure';
import {ButtonContext} from './Button';
import {ContextValue, DEFAULT_SLOT, Provider, RenderProps, SlotProps, useContextProps, useRenderProps} from './utils';
import {DisclosureGroupState, DisclosureState, DisclosureGroupProps as StatelyDisclosureGroupProps, useDisclosureGroupState, useDisclosureState} from '@react-stately/disclosure';
import {DOMProps, forwardRefType, Key} from '@react-types/shared';
import {filterDOMProps, mergeProps, mergeRefs, useId} from '@react-aria/utils';
import React, {createContext, DOMAttributes, ForwardedRef, forwardRef, ReactNode, useContext} from 'react';
import {useFocusRing} from 'react-aria';

export interface DisclosureGroupProps extends StatelyDisclosureGroupProps, RenderProps<DisclosureGroupRenderProps>, DOMProps {}

export interface DisclosureGroupRenderProps {
  /**
   * Whether the disclosure group is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean,
  /**
   * State of the disclosure group.
   */
  state: DisclosureGroupState
}

export const DisclosureGroupStateContext = createContext<DisclosureGroupState | null>(null);

function DisclosureGroup(props: DisclosureGroupProps, ref: ForwardedRef<HTMLDivElement>) {
  let state = useDisclosureGroupState(props);

  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-DisclosureGroup',
    values: {
      isDisabled: state.isDisabled,
      state
    }
  });

  let domProps = filterDOMProps(props);

  return (
    <div
      {...domProps}
      {...renderProps}
      ref={ref}
      data-disabled={props.isDisabled || undefined}>
      <DisclosureGroupStateContext.Provider value={state}>
        {renderProps.children}
      </DisclosureGroupStateContext.Provider>
    </div>
  );
}

/**
 * A DisclosureGroup is a grouping of related disclosures, sometimes called an Accordion.
 * It supports both single and multiple expanded items.
 */
const _DisclosureGroup = forwardRef(DisclosureGroup);
export {_DisclosureGroup as DisclosureGroup};

export interface DisclosureProps extends Omit<AriaDisclosureProps, 'children'>, RenderProps<DisclosureRenderProps>, SlotProps {
  /** An id for the disclosure when used within a DisclosureGroup, matching the id used in `expandedKeys`. */
  id?: Key,
  /** The children of the component. A function may be provided to alter the children based on component state. */
  children: ReactNode | ((values: DisclosureRenderProps & {defaultChildren: ReactNode | undefined}) => ReactNode)
}

export interface DisclosureRenderProps {
  /**
   * Whether the disclosure is expanded.
   * @selector [data-expanded]
   */
  isExpanded: boolean,
  /**
   * Whether the disclosure has keyboard focus.
   * @selector [data-focus-visible-within]
   */
  isFocusVisibleWithin: boolean,
  /**
   * Whether the disclosure is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean,
  /**
   * State of the disclosure.
   */
  state: DisclosureState
}

export const DisclosureContext = createContext<ContextValue<DisclosureProps, HTMLDivElement>>(null);
export const DisclosureStateContext = createContext<DisclosureState | null>(null);

interface InternalDisclosureContextValue {
  panelProps: DOMAttributes<HTMLElement>,
  panelRef: React.RefObject<HTMLDivElement | null>
}

const InternalDisclosureContext = createContext<InternalDisclosureContextValue | null>(null);

function Disclosure(props: DisclosureProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, DisclosureContext);
  let groupState = useContext(DisclosureGroupStateContext);
  let {id, ...otherProps} = props;

  // Generate an id if one wasn't provided.
  // (can't pass id into useId since it can also be a number)
  let defaultId = useId();
  id ||= defaultId;

  let isExpanded = groupState ? groupState.expandedKeys.has(id) : props.isExpanded;
  let state = useDisclosureState({
    ...props,
    isExpanded,
    onExpandedChange(isExpanded) {
      if (groupState) {
        groupState.toggleKey(id);
      }

      props.onExpandedChange?.(isExpanded);
    }
  });

  let panelRef = React.useRef<HTMLDivElement | null>(null);
  let isDisabled = props.isDisabled || groupState?.isDisabled || false;
  let {buttonProps, panelProps} = useDisclosure({
    ...props,
    isExpanded,
    isDisabled
  }, state, panelRef);
  let {
    isFocusVisible: isFocusVisibleWithin,
    focusProps: focusWithinProps
  } = useFocusRing({within: true});

  let renderProps = useRenderProps({
    ...props,
    id: undefined,
    defaultClassName: 'react-aria-Disclosure',
    values: {
      isExpanded: state.isExpanded,
      isDisabled,
      isFocusVisibleWithin,
      state
    }
  });

  let domProps = filterDOMProps(otherProps as any);

  return (
    <Provider
      values={[
        [ButtonContext, {
          slots: {
            [DEFAULT_SLOT]: {},
            trigger: buttonProps
          }
        }],
        [InternalDisclosureContext, {panelProps, panelRef}],
        [DisclosureStateContext, state]
      ]}>
      <div
        ref={ref}
        data-expanded={state.isExpanded || undefined}
        data-disabled={isDisabled || undefined}
        data-focus-visible-within={isFocusVisibleWithin || undefined}
        {...domProps}
        {...focusWithinProps}
        {...renderProps}>
        {renderProps.children}
      </div>
    </Provider>
  );
}

export interface DisclosurePanelProps extends RenderProps<{}> {
  /**
   * The accessibility role for the disclosure's panel.
   * @default 'group'
   */
  role?: 'group' | 'region',
  /**
   * The children of the component.
   */
  children: ReactNode
}

function DisclosurePanel(props: DisclosurePanelProps, ref: ForwardedRef<HTMLDivElement>) {
  let {role = 'group'} = props;
  let {panelProps, panelRef} = useContext(InternalDisclosureContext)!;
  let {
    isFocusVisible: isFocusVisibleWithin,
    focusProps: focusWithinProps
  } = useFocusRing({within: true});
  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-DisclosurePanel',
    values: {
      isFocusVisibleWithin
    }
  });
  return (
    <div
      ref={mergeRefs(ref, panelRef)}
      {...mergeProps(panelProps, focusWithinProps)}
      {...renderProps}
      role={role}
      data-focus-visible-within={isFocusVisibleWithin || undefined}>
      <Provider
        values={[
          [ButtonContext, null]
        ]}>
        {props.children}
      </Provider>
    </div>
  );
}

/**
 * A disclosure is a collapsible section of content. It is composed of a a header with a heading and trigger button, and a panel that contains the content.
 */
const _Disclosure = /*#__PURE__*/ (forwardRef as forwardRefType)(Disclosure);
export {_Disclosure as Disclosure};

/**
 * A DisclosurePanel provides the content for a disclosure.
 */
const _DisclosurePanel = /*#__PURE__*/ (forwardRef as forwardRefType)(DisclosurePanel);
export {_DisclosurePanel as DisclosurePanel};
