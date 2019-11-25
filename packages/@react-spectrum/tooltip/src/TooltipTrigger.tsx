import {HoverResponder} from '@react-aria/interactions';
import {Overlay} from '@react-spectrum/overlays';
import {PositionProps, useOverlayPosition} from '@react-aria/overlays';
import {PressResponder} from '@react-aria/interactions';
import React, {Fragment, ReactElement, RefObject, useRef} from 'react';
import {TooltipHoverResponder} from '@react-aria/interactions';
import {useControlledState} from '@react-stately/utils';
import {useTooltipTrigger} from '@react-aria/tooltip';

interface TooltipTriggerProps extends PositionProps {
  children: ReactElement[],
  type?: 'click',
  targetRef?: RefObject<HTMLElement>,
  isOpen?: boolean,
  defaultOpen?: boolean,
  onOpenChange?: (isOpen: boolean) => void
}

export function TooltipTrigger(props: TooltipTriggerProps) {
  let {
    children,
    type,
    targetRef,
    isOpen,
    defaultOpen,
    onOpenChange
  } = props;

  let [trigger, content] = React.Children.toArray(children);

  // Potential TODO: move this to react-statley in a tooltip trigger package similar to the Switch component?
  let [open, setOpen] = useControlledState(isOpen, defaultOpen || false, onOpenChange);

  // Potential TODO: move these three functions into useTooltipTrigger, as they are interactions?
  let onPressInteraction = () => {
    setOpen(!open);
  };

  let onHoverInteraction = (isHovering) => {
    setOpen(isHovering);
  };

  let onClose = () => {
    setOpen(false);
  };

  let containerRef = useRef<HTMLDivElement>();
  let triggerRef = useRef<HTMLElement>();
  let overlayRef = useRef<HTMLDivElement>();

  let {tooltipTriggerProps} = useTooltipTrigger(
    {
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
    }
  );

  let {overlayProps, placement, arrowProps} = useOverlayPosition({
    placement: props.placement,
    containerRef,
    targetRef: targetRef || triggerRef,
    overlayRef,
    isOpen
  });

  delete overlayProps.style.position;

  let overlay = (
    <Overlay isOpen={open} ref={containerRef}>
      {React.cloneElement(content, {placement: placement, arrowProps: arrowProps, ref: overlayRef, ...overlayProps, isOpen: open})}
    </Overlay>
  );

  if (type === 'click') {
    return (
      <Fragment>
        <PressResponder
          {...tooltipTriggerProps}
          ref={triggerRef}
          isPressed={isOpen}
          onPress={onPressInteraction}>
          {trigger}
        </PressResponder>
        {overlay}
      </Fragment>
    );
  } else if (type === 'hover') { // parse a ['hover', 'focus'] array if you change the story to check for either one 
    return (
      <Fragment>
        <HoverResponder
          {...tooltipTriggerProps}
          ref={triggerRef}
          isHovering={isOpen}
          onHover={onHoverInteraction}>
          {trigger}
        </HoverResponder>
        <TooltipHoverResponder
          isOverTooltip={onHoverInteraction}>
          {overlay}
        </TooltipHoverResponder>
      </Fragment>
    );
  }
}
