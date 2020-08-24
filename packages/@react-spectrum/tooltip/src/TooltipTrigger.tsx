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

import {DOMRef, StyleProps} from '@react-types/shared';
import {FocusableProvider} from '@react-aria/focus';
import {Overlay} from '@react-spectrum/overlays';
import {PlacementAxis} from '@react-types/overlays';
import React, {RefObject, useContext, useRef} from 'react';
import {TooltipTriggerProps} from '@react-types/tooltip';
import {useDOMRef} from '@react-spectrum/utils';
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

function TooltipTrigger(props: TooltipTriggerProps, ref: DOMRef<HTMLElement>) {
  let {
    children,
    isDisabled
  } = props;

  let [trigger, tooltip] = React.Children.toArray(children);

  let state = useTooltipTriggerState(props);

  let domRef = useDOMRef(ref);
  let triggerRef = useRef<HTMLElement>();
  let tooltipTriggerRef = domRef || triggerRef;
  let overlayRef = useRef<HTMLDivElement>();

  let {triggerProps, tooltipProps} = useTooltipTrigger({
    isDisabled
  }, state, tooltipTriggerRef);

  let {overlayProps, placement} = useOverlayPosition({
    placement: props.placement || 'right',
    targetRef: tooltipTriggerRef,
    overlayRef,
    isOpen: state.isOpen
  });

  return (
    <FocusableProvider
      {...triggerProps}
      ref={tooltipTriggerRef}>
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

/**
 * Display container for Tooltip content. Has a directional arrow dependent on its placement.
 */
let _TooltipTrigger = React.forwardRef(TooltipTrigger);
export {_TooltipTrigger as TooltipTrigger};
