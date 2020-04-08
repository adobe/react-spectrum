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

import {DOMPropsResponder, PressResponder} from '@react-aria/interactions';
import {Overlay} from '@react-spectrum/overlays';
import React, {Fragment, useRef} from 'react';
import {TooltipTriggerProps} from '@react-types/tooltip';
import {useOverlayPosition} from '@react-aria/overlays';
import {useTooltipTrigger} from '@react-aria/tooltip';
import {useTooltipTriggerState} from '@react-stately/tooltip';

export function TooltipTrigger(props: TooltipTriggerProps) {
  let {
    children,
    type,
    targetRef,
    isOpen,
    isDisabled
  } = props;

  let [trigger, content] = React.Children.toArray(children);

  let state = useTooltipTriggerState(props);

  let triggerRef = useRef<HTMLElement>();
  let overlayRef = useRef<HTMLDivElement>();

  let {triggerProps, tooltipProps} = useTooltipTrigger({
    tooltipProps: content.props,
    triggerProps: {
      ...trigger.props,
      ref: triggerRef
    },
    state,
    isDisabled,
    type
  });

  let {overlayProps, placement, arrowProps} = useOverlayPosition({
    placement: props.placement,
    targetRef: targetRef || triggerRef,
    overlayRef,
    isOpen
  });

  let overlay = (
    <Overlay isOpen={state.open}>
      {React.cloneElement(content, {placement: placement, arrowProps: arrowProps, ref: overlayRef, UNSAFE_style: overlayProps.style, isOpen: open, ...tooltipProps})}
    </Overlay>
  );

  if (type === 'click') {
    return (
      <Fragment>
        <PressResponder
          {...triggerProps}
          ref={triggerRef}
          isPressed={isOpen}
          isDisabled={isDisabled}>
          {trigger}
        </PressResponder>
        {overlay}
      </Fragment>
    );
  } else if (type.includes('hover') || type.includes('focus')) {
    return (
      <Fragment>
        <DOMPropsResponder
          {...triggerProps}
          ref={triggerRef}
          isDisabled={isDisabled}>
          {trigger}
          {overlay}
        </DOMPropsResponder>
      </Fragment>
    );
  }
}
