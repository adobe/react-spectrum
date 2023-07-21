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

import {AriaLabelingProps, DOMAttributes, FocusableElement} from '@react-types/shared';
import {FocusableProvider} from '@react-aria/focus';
import {forwardRefType, RenderProps, useEnterAnimation, useExitAnimation, useRenderProps} from './utils';
import {mergeProps, OverlayContainer, PlacementAxis, PositionProps, useOverlayPosition, useTooltip, useTooltipTrigger} from 'react-aria';
import {mergeRefs, useObjectRef} from '@react-aria/utils';
import {OverlayArrowContext} from './OverlayArrow';
import React, {createContext, ForwardedRef, forwardRef, ReactNode, RefObject, useContext, useRef} from 'react';
import {TooltipTriggerProps, TooltipTriggerState, useTooltipTriggerState} from 'react-stately';

export interface TooltipTriggerComponentProps extends TooltipTriggerProps {
  children: ReactNode
}

export interface TooltipProps extends PositionProps, AriaLabelingProps, RenderProps<TooltipRenderProps> {}

export interface TooltipRenderProps {
  /**
   * The placement of the tooltip relative to the trigger.
   * @selector [data-placement="left | right | top | bottom"]
   */
  placement: PlacementAxis,
  /**
   * Whether the tooltip is currently entering. Use this to apply animations.
   * @selector [data-entering]
   */
  isEntering: boolean,
  /**
   * Whether the tooltip is currently exiting. Use this to apply animations.
   * @selector [data-exiting]
   */
  isExiting: boolean,
  /**
   * State of the tooltip.
   */
  state: TooltipTriggerState
}

interface TooltipContextValue {
  state: TooltipTriggerState,
  triggerRef: RefObject<FocusableElement>,
  tooltipProps: DOMAttributes
}

const InternalTooltipContext = createContext<TooltipContextValue | null>(null);

/**
 * TooltipTrigger wraps around a trigger element and a Tooltip. It handles opening and closing
 * the Tooltip when the user hovers over or focuses the trigger, and positioning the Tooltip
 * relative to the trigger.
 */
export function TooltipTrigger(props: TooltipTriggerComponentProps) {
  let state = useTooltipTriggerState(props);
  let ref = useRef<FocusableElement>(null);
  let {triggerProps, tooltipProps} = useTooltipTrigger(props, state, ref);

  return (
    <InternalTooltipContext.Provider value={{state, triggerRef: ref, tooltipProps}}>
      <FocusableProvider {...triggerProps} ref={ref}>
        {props.children}
      </FocusableProvider>
    </InternalTooltipContext.Provider>
  );
}

function Tooltip(props: TooltipProps, ref: ForwardedRef<HTMLDivElement>) {
  let {state} = useContext(InternalTooltipContext)!;
  let objectRef = useObjectRef(ref);
  let isExiting = useExitAnimation(objectRef, state.isOpen);
  if (!state.isOpen && !isExiting) {
    return null;
  }

  return (
    <OverlayContainer>
      <TooltipInner {...props} tooltipRef={objectRef} isExiting={isExiting} />
    </OverlayContainer>
  );
}

/**
 * A tooltip displays a description of an element on hover or focus.
 */
const _Tooltip = /*#__PURE__*/ (forwardRef as forwardRefType)(Tooltip);
export {_Tooltip as Tooltip};

function TooltipInner(props: TooltipProps & {isExiting: boolean, tooltipRef: ForwardedRef<HTMLDivElement>}) {
  let {state, triggerRef, tooltipProps: triggerTooltipProps} = useContext(InternalTooltipContext)!;

  let overlayRef = useRef<HTMLDivElement>(null);
  let {overlayProps, arrowProps, placement} = useOverlayPosition({
    placement: props.placement || 'top',
    targetRef: triggerRef,
    overlayRef,
    offset: props.offset,
    crossOffset: props.crossOffset,
    isOpen: state.isOpen
  });

  let isEntering = useEnterAnimation(overlayRef, !!placement);
  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-Tooltip',
    values: {
      placement,
      isEntering,
      isExiting: props.isExiting,
      state
    }
  });

  props = mergeProps(props, overlayProps);
  let {tooltipProps} = useTooltip(props, state);

  return (
    <div
      {...mergeProps(triggerTooltipProps, tooltipProps)}
      ref={mergeRefs(overlayRef, props.tooltipRef)}
      {...renderProps}
      style={{...renderProps.style, ...overlayProps.style}}
      data-placement={placement}
      data-entering={isEntering || undefined}
      data-exiting={props.isExiting || undefined}>
      <OverlayArrowContext.Provider value={{arrowProps, placement}}>
        {renderProps.children}
      </OverlayArrowContext.Provider>
    </div>
  );
}
