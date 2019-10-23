import {Overlay, Popover} from '@react-spectrum/overlays';
import {PositionProps, useOverlayPosition, useOverlayTrigger} from '@react-aria/overlays';
import {PressResponder} from '@react-aria/interactions';
import React, {Fragment, ReactNode, ReactElement, RefObject, useRef} from 'react';
import {useControlledState} from '@react-stately/utils';

interface TooltipTriggerProps extends PositionProps {
  children: ReactNode,
  targetRef?: RefObject<HTMLElement>,
  isOpen?: boolean,
  defaultOpen?: boolean,
  onOpenChange?: (isOpen: boolean) => void
}

export function TooltipTrigger(props: TooltipTriggerProps) {

  let {
    children,
    targetRef,
    ...positionProps
  } = props;
  let [trigger, content] = React.Children.toArray(children);

  let [isOpen, setOpen] = useControlledState(props.isOpen, props.defaultOpen || false, props.onOpenChange);

  let onPress = () => {
    setOpen(!isOpen);
  };

  let onClose = () => {
    setOpen(false);
  };

  return (
    <TooltipTriggerContainer
      isOpen={isOpen}
      onPress={onPress}
      onClose={onClose}
      targetRef={targetRef}
      trigger={trigger}
      content={content} />
  );

}

function TooltipTriggerContainer({isOpen, onPress, onClose, targetRef, trigger, content, ...props}) {

  let containerRef = useRef<HTMLDivElement>();
  let triggerRef = useRef<HTMLElement>();
  let overlayRef = useRef<HTMLDivElement>();

  let {overlayProps, placement, arrowProps} = useOverlayPosition({
    containerRef,
    targetRef: targetRef || triggerRef,
    overlayRef,
    placement: props.placement,
    containerPadding: props.containerPadding,
    offset: props.offset,
    crossOffset: props.crossOffset,
    shouldFlip: props.shouldFlip,
    isOpen
  });

  let overlay = (
    <Overlay isOpen={isOpen} ref={containerRef}>
      <Popover {...overlayProps} ref={overlayRef} onClose={onClose} placement={placement} arrowProps={arrowProps}>
        {content}
      </Popover>
    </Overlay>
  );

  return (
    <TooltipTriggerBase
      isOpen={isOpen}
      onPress={onPress}
      trigger={trigger}
      overlay={overlay} />
  );

}

function TooltipTriggerBase({isOpen, onPress, trigger, overlay}) {

  return (
    <Fragment>
      <PressResponder
        isPressed={isOpen}
        onPress={onPress}>
        {trigger}
      </PressResponder>
        {overlay}
    </Fragment>
  );

}
