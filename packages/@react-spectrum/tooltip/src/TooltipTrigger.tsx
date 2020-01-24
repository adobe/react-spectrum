import {DOMRefValue} from '@react-types/shared';
import {Overlay} from '@react-spectrum/overlays';
import {PressResponder, DOMPropsResponder} from '@react-aria/interactions';
import React, {Fragment, useRef} from 'react';
import {TooltipTriggerProps} from '@react-types/tooltip';
import {unwrapDOMRef} from '@react-spectrum/utils';
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

  let containerRef = useRef<DOMRefValue<HTMLDivElement>>();
  let triggerRef = useRef<HTMLElement>();
  let overlayRef = useRef<HTMLDivElement>();

  let {triggerProps, tooltipProps} = useTooltipTrigger({
    tooltipProps: content.props,
    triggerProps: {
      ...trigger.props,
      ref: triggerRef
    },
    state,
    type
  });

  let {overlayProps, placement, arrowProps} = useOverlayPosition({
    placement: props.placement,
    containerRef: unwrapDOMRef(containerRef),
    targetRef: targetRef || triggerRef,
    overlayRef,
    isOpen
  });

  delete overlayProps.style.position;

  let overlay = (
    <Overlay isOpen={state.open} ref={containerRef}>
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
  } else if (type === 'hover') {
    return (
      <Fragment>
        <DOMPropsResponder
          {...triggerProps}
          ref={triggerRef}
          isHovering={isOpen}
          isDisabled={isDisabled}>
          {trigger}
        </DOMPropsResponder>
        {overlay}
      </Fragment>
    );
  }
}
