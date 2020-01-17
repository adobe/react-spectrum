import {DOMRefValue} from '@react-types/shared';
import {Overlay} from '@react-spectrum/overlays';
import {PressResponder} from '@react-aria/interactions';
import React, {Fragment, useRef} from 'react';
import {TooltipTriggerProps} from '@react-types/tooltip';
import {unwrapDOMRef} from '@react-spectrum/utils';
import {useOverlayPosition} from '@react-aria/overlays';
import {useTooltipState} from '@react-stately/tooltip';
import {useTooltipTrigger} from '@react-aria/tooltip';

export function TooltipTrigger(props: TooltipTriggerProps) {
  let {
    children,
    type,
    targetRef,
    isOpen,
    isDisabled
  } = props;

  let [trigger, content] = React.Children.toArray(children);

  let state = useTooltipState(props);

  let containerRef = useRef<DOMRefValue<HTMLDivElement>>();
  let triggerRef = useRef<HTMLElement>();
  let overlayRef = useRef<HTMLDivElement>();

  let {baseProps, clickTriggerProps} = useTooltipTrigger({
    tooltipProps: {
      ...content.props
    },
    triggerProps: {
      ...trigger.props,
      ref: triggerRef
    },
    state
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
      {React.cloneElement(content, {placement: placement, arrowProps: arrowProps, ref: overlayRef, UNSAFE_style: {...overlayProps.style}, isOpen: open})}
    </Overlay>
  );

  if (type === 'click') {
    return (
      <Fragment>
        <PressResponder
          {...baseProps}
          {...clickTriggerProps}
          ref={triggerRef}
          isPressed={isOpen}
          isDisabled={isDisabled}>
          {trigger}
        </PressResponder>
        {overlay}
      </Fragment>
    );
  }
}
