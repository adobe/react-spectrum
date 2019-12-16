import {DOMRefValue, unwrapDOMRef} from '@react-spectrum/utils';
import {HoverResponder} from '@react-aria/interactions';
import {Overlay} from '@react-spectrum/overlays';
import {PositionProps, useOverlayPosition} from '@react-aria/overlays';
import {PressResponder} from '@react-aria/interactions';
import React, {Fragment, ReactElement, RefObject, useRef} from 'react';
import {useControlledState} from '@react-stately/utils';
import {useTooltipTrigger} from '@react-aria/tooltip';

interface TooltipTriggerProps extends PositionProps {
  children: ReactElement[],
  type?: 'click',
  targetRef?: RefObject<HTMLElement>,
  isOpen?: boolean,
  defaultOpen?: boolean,
  isDisabled?: boolean,
  onOpenChange?: (isOpen: boolean) => void
}

export function TooltipTrigger(props: TooltipTriggerProps) {
  let {
    children,
    type,
    targetRef,
    isOpen,
    defaultOpen,
    isDisabled,
    onOpenChange
  } = props;

  let [trigger, content] = React.Children.toArray(children);

  // TODO: move this to react-statley in a tooltipTrigger package
  let [open, setOpen] = useControlledState(isOpen, defaultOpen || false, onOpenChange);

  // TODO: move these three functions into useTooltipTrigger
  let onPressInteraction = () => {
    setOpen(!open);
  };

  let onHoverInteraction = (isHovering) => {
    setOpen(isHovering);
  };

  let onClose = () => {
    setOpen(false);
  };

  let containerRef = useRef<DOMRefValue<HTMLDivElement>>();
  let triggerRef = useRef<HTMLElement>();
  let overlayRef = useRef<HTMLDivElement>();

  let {tooltipTriggerBaseProps} = useTooltipTrigger({
    tooltipProps: {
      ...content.props,
      onClose
    },
    triggerProps: {
      ...trigger.props,
      ref: triggerRef
    },
    state: {
      open,
      setOpen
    }
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
    <Overlay isOpen={open} ref={containerRef}>
      {React.cloneElement(content, {placement: placement, arrowProps: arrowProps, ref: overlayRef, UNSAFE_style: {...overlayProps.style}, isOpen: open})}
    </Overlay>
  );

  if (type === 'click') {
    return (
      <Fragment>
        <PressResponder
          {...tooltipTriggerBaseProps}
          ref={triggerRef}
          isPressed={isOpen}
          isDisabled={isDisabled}
          onPress={onPressInteraction}>
          {trigger}
        </PressResponder>
        {overlay}
      </Fragment>
    );
  } else if (type === 'hover') {
    return (
      <Fragment>
        <HoverResponder
          {...tooltipTriggerBaseProps}
          ref={triggerRef}
          isDisabled={isDisabled}
          onShow={onHoverInteraction}
          onHoverTooltip={onHoverInteraction}>
          {trigger}
          {overlay}
        </HoverResponder>
      </Fragment>
    );
  }
}
