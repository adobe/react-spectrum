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

import {AccordionItemAriaProps, useAccordionItem} from '@react-aria/accordion';
import {AccordionItemState, useAccordionItemState} from '@react-stately/accordion';
import {ButtonContext} from './Button';
import {ContextValue, Provider, RenderProps, SlotProps, useContextProps, useRenderProps} from './utils';
import {forwardRefType} from '@react-types/shared';
import {HoverEvents} from 'react-aria';
import {mergeRefs, useObjectRef} from '@react-aria/utils';
import React, {createContext, DOMAttributes, ForwardedRef, forwardRef, ReactNode, useContext, useRef} from 'react';

export interface AccordionItemProps extends Omit<AccordionItemAriaProps, 'children' | 'panelRef'>, HoverEvents, RenderProps<AccordionItemRenderProps>, SlotProps {}

export interface AccordionItemRenderProps {
  /**
   * Whether the accordion item is open (controlled).
   * @selector [data-open]
   */
  isOpen?: boolean,
  /**
   * Whether the accordion item is focused, either via a mouse or keyboard.
   * @selector [data-focused]
   */
  // isFocused: boolean,
  /**
   * Whether the accordion item is keyboard focused.
   * @selector [data-focus-visible]
   */
  // isFocusVisible: boolean,
  /**
   * Whether the accordion item is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean,
  /**
   * State of the accordion item.
   */
  state: AccordionItemState
}

export const AccordionItemContext = createContext<ContextValue<AccordionItemProps, HTMLDivElement>>(null);
export const AccordionItemStateContext = createContext<AccordionItemState | null>(null);

interface InternalAccordionContextValue {
  regionProps: DOMAttributes<HTMLElement>,
  panelRef: React.RefObject<HTMLElement>
}

const InternalAccordionContext = createContext<InternalAccordionContextValue | null>(null);

function AccordionItem(props: AccordionItemProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, AccordionItemContext);
  let state = useAccordionItemState(props);
  let panelRef = useRef<HTMLElement>(null);
  let {buttonProps, regionProps} = useAccordionItem({...props, panelRef}, state);

  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-AccordionItem',
    values: {
      isOpen: state.isOpen,
      isDisabled: props.isDisabled || false,
      state
    }
  });

  return (
    <Provider
      values={[
        [ButtonContext, {
          slots: {
            trigger: buttonProps
          }
        }],
        [InternalAccordionContext, {regionProps, panelRef}],
        [AccordionItemStateContext, state]
      ]}>
      <div
        ref={ref}
        data-open={state.isOpen || undefined}
        data-disabled={props.isDisabled || undefined}
        {...renderProps}>
        {renderProps.children}
      </div>
    </Provider>
  );
}

export interface AccordionPanelProps extends RenderProps<{}> {
  children: ReactNode
}

function AccordionPanel(props: AccordionPanelProps, ref: ForwardedRef<HTMLElement>) {
  let {regionProps, panelRef} = useContext(InternalAccordionContext)!;
  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-AccordionPanel',
    values: {
      // TODO: add more values?
    }
  });
  let mergedRef = useObjectRef(mergeRefs(panelRef, ref));
  return (
    // @ts-ignore
    <div ref={mergedRef} {...renderProps} {...regionProps}>
      {props.children}
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
