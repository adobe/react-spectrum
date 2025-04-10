/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {FocusableProvider} from '@react-aria-nutrient/focus';
import {Overlay} from '@react-spectrum/overlays';
import React, {JSX, ReactElement, useRef, useState} from 'react';
import {SpectrumTooltipTriggerProps} from '@react-types/tooltip';
import {TooltipContext} from './context';
import {useLayoutEffect} from '@react-aria-nutrient/utils';
import {useOverlayPosition} from '@react-aria-nutrient/overlays';
import {useTooltipTrigger} from '@react-aria-nutrient/tooltip';
import {useTooltipTriggerState} from '@react-stately/tooltip';

const DEFAULT_OFFSET = -1; // Offset needed to reach 4px/5px (med/large) distance between tooltip and trigger button
const DEFAULT_CROSS_OFFSET = 0;

function TooltipTrigger(props: SpectrumTooltipTriggerProps) {
  let {
    children,
    crossOffset = DEFAULT_CROSS_OFFSET,
    isDisabled,
    offset = DEFAULT_OFFSET,
    trigger: triggerAction
  } = props;

  let [trigger, tooltip] = React.Children.toArray(children) as [ReactElement, ReactElement];
  let state = useTooltipTriggerState(props);

  let tooltipTriggerRef = useRef<HTMLElement>(null);
  let overlayRef = useRef<HTMLDivElement>(null);

  let {triggerProps, tooltipProps} = useTooltipTrigger({
    isDisabled,
    trigger: triggerAction
  }, state, tooltipTriggerRef);

  let [borderRadius, setBorderRadius] = useState(0);
  useLayoutEffect(() => {
    if (overlayRef.current && state.isOpen) {
      let spectrumBorderRadius = window.getComputedStyle(overlayRef.current).borderRadius;
      if (spectrumBorderRadius !== '') {
        setBorderRadius(parseInt(spectrumBorderRadius, 10));
      }
    }
  }, [state.isOpen, overlayRef]);
  let arrowRef = useRef<HTMLElement>(null);
  let [arrowWidth, setArrowWidth] = useState(0);
  useLayoutEffect(() => {
    if (arrowRef.current && state.isOpen) {
      setArrowWidth(arrowRef.current.getBoundingClientRect().width);
    }
  }, [state.isOpen, arrowRef]);

  let {overlayProps, arrowProps, placement} = useOverlayPosition({
    placement: props.placement || 'top',
    targetRef: tooltipTriggerRef,
    overlayRef,
    offset,
    crossOffset,
    isOpen: state.isOpen,
    shouldFlip: props.shouldFlip,
    containerPadding: props.containerPadding,
    arrowSize: arrowWidth,
    arrowBoundaryOffset: borderRadius,
    onClose: () => state.close(true)
  });

  return (
    <FocusableProvider
      {...triggerProps}
      ref={tooltipTriggerRef}>
      {trigger}
      <TooltipContext.Provider
        value={{
          state,
          placement,
          ref: overlayRef,
          UNSAFE_style: overlayProps.style,
          arrowProps,
          arrowRef: arrowRef,
          ...tooltipProps
        }}>
        <Overlay isOpen={state.isOpen} nodeRef={overlayRef}>
          {tooltip}
        </Overlay>
      </TooltipContext.Provider>
    </FocusableProvider>
  );
}

// Support TooltipTrigger inside components using CollectionBuilder.
TooltipTrigger.getCollectionNode = function* (props: SpectrumTooltipTriggerProps) {
  // Replaced the use of React.Children.toArray because it mutates the key prop.
  let childArray: ReactElement[] = [];
  React.Children.forEach(props.children, child => {
    if (React.isValidElement(child)) {
      childArray.push(child);
    }
  });
  let [trigger, tooltip] = childArray;
  yield {
    element: trigger,
    wrapper: (element) => (
      <TooltipTrigger key={element.key} {...props}>
        {element}
        {tooltip}
      </TooltipTrigger>
    )
  };
};

/**
 * TooltipTrigger wraps around a trigger element and a Tooltip. It handles opening and closing
 * the Tooltip when the user hovers over or focuses the trigger, and positioning the Tooltip
 * relative to the trigger.
 */
// We don't want getCollectionNode to show up in the type definition
let _TooltipTrigger = TooltipTrigger as (props: SpectrumTooltipTriggerProps) => JSX.Element;
export {_TooltipTrigger as TooltipTrigger};
