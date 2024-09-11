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
import {ContextValue, Provider, RenderProps, SlotProps, useContextProps, useRenderProps} from './utils';
import {DisclosureState, useDisclosureState} from '@react-stately/disclosure';
import {forwardRefType} from '@react-types/shared';
import {HoverEvents, useFocusRing} from 'react-aria';
import {mergeProps, mergeRefs, useObjectRef} from '@react-aria/utils';
import React, {createContext, DOMAttributes, ForwardedRef, forwardRef, ReactNode, useContext, useRef} from 'react';

export interface AccordionItemProps extends Omit<AriaDisclosureProps, 'children' | 'contentRef'>, HoverEvents, RenderProps<AccordionItemRenderProps>, SlotProps {}

export interface AccordionItemRenderProps {
  /**
   * Whether the accordion item is expanded (controlled).
   * @selector [data-expanded]
   */
  isExpanded?: boolean,
  /**
   * Whether the accordion item has keyboard focus.
   * @selector [data-focus-visible-within]
   */
  isFocusVisibleWithin: boolean,
  /**
   * Whether the accordion item is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean,
  /**
   * State of the accordion item.
   */
  state: DisclosureState
}

export const AccordionItemContext = createContext<ContextValue<AccordionItemProps, HTMLDivElement>>(null);
export const DisclosureStateContext = createContext<DisclosureState | null>(null);

interface InternalAccordionContextValue {
  contentProps: DOMAttributes<HTMLElement>,
  contentRef: React.RefObject<HTMLElement | null>
}

const InternalAccordionContext = createContext<InternalAccordionContextValue | null>(null);

function AccordionItem(props: AccordionItemProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, AccordionItemContext);
  let state = useDisclosureState(props);
  let contentRef = useRef<HTMLElement>(null);
  let {triggerProps, contentProps} = useDisclosure({...props, contentRef}, state);
  let {
    isFocusVisible: isFocusVisibleWithin,
    focusProps: focusWithinProps
  } = useFocusRing({within: true});

  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-AccordionItem',
    values: {
      isExpanded: state.isExpanded,
      isDisabled: props.isDisabled || false,
      isFocusVisibleWithin,
      state
    }
  });

  return (
    <Provider
      values={[
        [ButtonContext, {
          slots: {
            trigger: triggerProps
          }
        }],
        [InternalAccordionContext, {contentProps, contentRef}],
        [DisclosureStateContext, state]
      ]}>
      <div
        ref={ref}
        data-expanded={state.isExpanded || undefined}
        data-disabled={props.isDisabled || undefined}
        data-focus-visible-within={isFocusVisibleWithin || undefined}
        {...focusWithinProps}
        {...renderProps}>
        {renderProps.children}
      </div>
    </Provider>
  );
}

export interface AccordionPanelProps extends RenderProps<{}> {
  /**
   * The accessibility role for the accordion item's panel.
   * @default 'region'
   */
  role?: string,
  children: ReactNode
}

function AccordionPanel(props: AccordionPanelProps, ref: ForwardedRef<HTMLElement>) {
  let {role = 'region'} = props;
  let {contentProps, contentRef} = useContext(InternalAccordionContext)!;
  let {
    isFocusVisible: isFocusVisibleWithin,
    focusProps: focusWithinProps
  } = useFocusRing({within: true});
  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-AccordionPanel',
    values: {
      isFocusVisibleWithin
    }
  });
  let mergedRef = useObjectRef(mergeRefs(contentRef, ref));
  return (
    <div
      role={role}
      // @ts-ignore
      ref={mergedRef}
      {...mergeProps(contentProps, focusWithinProps)}
      {...renderProps}
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
 * A accordion item is a collapsible section of content. It is composed of a a header with a heading and trigger button, and a panel that contains the content.
 */
const _AccordionItem = /*#__PURE__*/ (forwardRef as forwardRefType)(AccordionItem);
export {_AccordionItem as AccordionItem};

const _AccordionPanel = /*#__PURE__*/ (forwardRef as forwardRefType)(AccordionPanel);
export {_AccordionPanel as AccordionPanel};
