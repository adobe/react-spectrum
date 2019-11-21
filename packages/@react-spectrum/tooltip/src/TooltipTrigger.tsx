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

  let [open, setOpen] = useControlledState(isOpen, defaultOpen || false, onOpenChange);

  let onInteraction = () => { //DEVON FEEDBACK: a boolean argument and instead of toggling ... set the state
    setOpen(!open);
  };

  let onPressInteraction = () => {
    setOpen(!open);
  };

  let onHoverInteraction = (isHovering) => {
    setOpen(isHovering);
  }


  let onClose = () => {
    setOpen(false);
  };

  let containerRef = useRef<HTMLDivElement>();
  let triggerRef = useRef<HTMLElement>();
  let overlayRef = useRef<HTMLDivElement>();

  // These are the variables you get out ... the parameters you pass in of course can't be used in the function
  let {tooltipTriggerProps, tooltipProps} = useTooltipTrigger(
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

  // console.log("tooltip trigger props", tooltipTriggerProps)

  let {overlayProps, placement, arrowProps} = useOverlayPosition({
    placement: props.placement,
    containerRef,
    targetRef: targetRef || triggerRef,
    overlayRef,
    isOpen
  });

  delete overlayProps.style.position;

  // console.log("Tooltip: ", content)

  // TODO: use the provider & context here instead of cloneElement & bring all the props into a single object that you can spread instead of all these commas
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
          isPressed={isOpen}
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
          {...tooltipTriggerProps}
          isHovering={isOpen}
          onHover={onInteraction}>
          {trigger}
        </HoverResponder>
        {overlay} {/* DEVON FEEDBACK: the overlay is the tooltip ... you can put a HoverResponder around this */}
      </Fragment>
    );
  }
}
