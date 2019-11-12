import {Overlay} from '@react-spectrum/overlays';
import {PositionProps, useOverlayPosition} from '@react-aria/overlays';
import {PressResponder} from '@react-aria/interactions';
import React, {Fragment, ReactNode, RefObject, useRef} from 'react';
import {useControlledState} from '@react-stately/utils';

interface TooltipTriggerProps extends PositionProps {
  children: ReactNode,
  type?: 'click',
  targetRef?: RefObject<HTMLElement>,
  isOpen?: boolean,
  defaultOpen?: boolean,
  onOpenChange?: (isOpen: boolean) => void
}

export function TooltipTrigger(props: TooltipTriggerProps) {
  let {
    // placement,
    children,
    type,
    targetRef,
    isOpen,
    defaultOpen,
    onOpenChange
  } = props;

  let [trigger, content] = React.Children.toArray(children);

  let [open, setOpen] = useControlledState(isOpen, defaultOpen || false, onOpenChange);

  let onInteraction = () => {
    setOpen(!open);
  };

  console.log("props placement in top level funtion: ", props.placement) // always proper

  return (
    <TooltipTriggerContainer
      // placement={placement}
      type={type}
      isOpen={open}
      onInteraction={onInteraction}
      targetRef={targetRef}
      trigger={trigger}
      content={content} />
  );
}

function TooltipTriggerContainer(props) {
  let {
    // placement,
    type,
    isOpen,
    onInteraction,
    targetRef,
    trigger,
    content
  } = props;

  let containerRef = useRef<HTMLDivElement>();
  let triggerRef = useRef<HTMLElement>();
  let overlayRef = useRef<HTMLDivElement>();

  let {overlayProps, placement, arrowProps} = useOverlayPosition({
    placement: props.placement,
    containerRef,
    targetRef: targetRef || triggerRef,
    overlayRef,
    isOpen
  });

  delete overlayProps.style.position;

  let triggerPropsWithRef = {
    ref: triggerRef
  };

  // <Popover {...overlayProps} ref={overlayRef} onClose={onClose} placement={placement} arrowProps={arrowProps} hideArrow={hideArrow}>

  console.log("placement inside container: ", placement) // always bottom
  console.log("props placment inside container: ", props.placement) // always undefined

  let overlay = (
    <Overlay isOpen={isOpen} ref={containerRef}>
      {React.cloneElement(content, {placement: placement, ref: overlayRef, ...overlayProps, isOpen: isOpen} )}
    </Overlay>
  );

  if (type === 'click') {
    return (
      <Fragment>
        <PressResponder
          {...triggerPropsWithRef}
          isPressed={isOpen}
          onPress={onInteraction}>
          {trigger}
        </PressResponder>
        {overlay}
      </Fragment>
    );
  }

}
