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

import {FocusableProvider} from '@react-aria/focus';
import {Overlay} from '@react-spectrum/overlays';
import {PlacementAxis} from '@react-types/overlays';
import React, {RefObject, useContext, useRef} from 'react';
import {StyleProps} from '@react-types/shared';
import {TooltipTriggerProps} from '@react-types/tooltip';
import {useOverlayPosition} from '@react-aria/overlays';
import {useTooltipTrigger} from '@react-aria/tooltip';
import {useTooltipTriggerState} from '@react-stately/tooltip';

interface TooltipContextProps extends StyleProps {
  ref?: RefObject<HTMLDivElement>,
  placement?: PlacementAxis,
  isOpen?: boolean
}

const TooltipContext = React.createContext<TooltipContextProps>({});

export function useTooltipProvider(): TooltipContextProps {
  return useContext(TooltipContext) || {};
}

export function TooltipTrigger(props: TooltipTriggerProps) {
  let {
    children,
    isDisabled
  } = props;

  let [trigger, tooltip] = React.Children.toArray(children);

  let state = useTooltipTriggerState(props);

  let triggerRef = useRef<HTMLElement>();
  let overlayRef = useRef<HTMLDivElement>();

  let {triggerProps, tooltipProps} = useTooltipTrigger({
    isDisabled
  }, state, triggerRef);

  let {overlayProps, placement} = useOverlayPosition({
    placement: props.placement || 'right',
    targetRef: triggerRef,
    overlayRef,
    isOpen: state.isOpen

    // do we need any of these?
    //scrollRef = overlayRef,
    //containerPadding = 12,
    //shouldFlip = true,
    //boundaryElement = document.body,
    //offset = 0,
    //crossOffset = 0,
    //shouldUpdatePosition = true
  });

  return (
    <FocusableProvider
      {...triggerProps}
      ref={triggerRef}>
      {trigger}
      <TooltipContext.Provider
        value={{
          placement,
          ref: overlayRef,
          UNSAFE_style: overlayProps.style,
          ...tooltipProps
        }}>
        <Overlay isOpen={state.isOpen}>
          {tooltip}
        </Overlay>
      </TooltipContext.Provider>
    </FocusableProvider>
  );
}
