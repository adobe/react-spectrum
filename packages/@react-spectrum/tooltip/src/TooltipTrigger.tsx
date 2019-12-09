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
  immediateAppearance?: boolean,
  onOpenChange?: (isOpen: boolean) => void
}

function isOneOf(one, of) {
  if (Array.isArray(of)) {
    return of.indexOf(one) >= 0;
  }
  return one === of;
}

export function TooltipTrigger(props: TooltipTriggerProps) {
  let {
    children,
    type,
    isDisabled,
    immediateAppearance,
    targetRef,
    isOpen,
    defaultOpen,
    onOpenChange
  } = props;

  let [trigger, content] = React.Children.toArray(children);

  // Next PR: move this to react-statley in a tooltip trigger package similar to the Switch component
  let [open, setOpen] = useControlledState(isOpen, defaultOpen || false, onOpenChange);

  // Next PR: move these three functions into useTooltipTrigger, as they are interactions?
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

  let {tooltipTriggerBaseProps, tooltipClickTriggerSingularityProps, tooltipHoverTriggerSingularityProps} = useTooltipTrigger(
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

  if (isOneOf('click', type)) {
    return (
      <Fragment>
        <PressResponder
          {...tooltipTriggerBaseProps}
          {...tooltipClickTriggerSingularityProps}
          ref={triggerRef}
          isPressed={isOpen}
          isDisabled={isDisabled}
          onPress={onPressInteraction}>
          {trigger}
        </PressResponder>
        {overlay}
      </Fragment>
    );
  } else if (isOneOf('hover', type) || isOneOf('focus', type)) {
    return (
      <Fragment>
        <HoverResponder
          {...tooltipTriggerBaseProps}
          {...tooltipHoverTriggerSingularityProps}
          ref={triggerRef}
          isHovering={isOpen}
          isDisabled={isDisabled}
          immediateAppearance={immediateAppearance}
          onHoverChange={onHoverInteraction}
          isOverTooltip={onHoverInteraction}>
          {trigger}
          {overlay}
        </HoverResponder>
      </Fragment>
    );
  }
}
