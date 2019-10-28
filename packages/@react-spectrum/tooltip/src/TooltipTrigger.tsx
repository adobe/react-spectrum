import {Overlay} from '@react-spectrum/overlays';
import {PositionProps, useOverlayPosition} from '@react-aria/overlays';
import {PressResponder} from '@react-aria/interactions';
import {HoverResponder} from '@react-aria/interactions';
import React, {Fragment, ReactNode, ReactElement, RefObject, useRef} from 'react';
import {useControlledState} from '@react-stately/utils';

interface TooltipTriggerProps extends PositionProps {
  children: ReactNode,
  type?: 'click' | 'hover',
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

  console.log('Sdfsd');
  console.log(props);
  console.log(props.placement);
  console.log('Sdfsd');

  return (
    <TooltipTriggerContainer
      type={type}
      isOpen={isOpen}
      onPress={onPress}
      onClose={onClose}
      targetRef={targetRef}
      trigger={trigger}
      content={content}
      placement={props.placement} />
  );

}

function TooltipTriggerContainer({type, isOpen, onPress, onClose, targetRef, trigger, content, ...props}) {

  let containerRef = useRef<HTMLDivElement>();
  let triggerRef = useRef<HTMLElement>();
  let overlayRef = useRef<HTMLDivElement>();

  let {overlayProps, placement, arrowProps} = useOverlayPosition({
    containerRef,
    targetRef: targetRef || triggerRef,
    overlayRef,
    placement: props.placement,
    isOpen
  });

  let triggerPropsWithRef = {
    ref: triggerRef
  };


  console.log("placement....", overlayProps) // top and left are at 0!! That's the top left corner!


  let blah = React.cloneElement(content, {...props, ref: overlayRef, ...overlayProps, showIcon: isOpen})
  console.log("right here... ", blah)


  let overlay = (
    // <Overlay isOpen={isOpen} ref={containerRef}>
      blah
    // </Overlay>
  );

  console.log("&&&&&")
  console.log(content) // props: {children: "This is a tooltip."}
  console.log("&&&&&")
  console.log(type) // passes correct value
  console.log("&&&&&")


  if (type === 'click') {
    return (
      <TooltipClickTrigger
        xyz={triggerPropsWithRef}
        isOpen={isOpen}
        onPress={onPress}
        trigger={trigger}
        overlay={overlay} />
    );
  } else {
    return (
      <TooltipHoverTrigger
        isOpen={isOpen}
        onPress={onPress}
        trigger={trigger}
        overlay={overlay} />
    );
  }

}

function TooltipClickTrigger({xyz, isOpen, onPress, trigger, overlay}) {

  console.log("??????")
  console.log(trigger) // props: {children: "Click Me"}
  console.log("??????")

  return (
    <Fragment>
      <PressResponder
        {...xyz}
        isPressed={isOpen}
        onPress={onPress}>
        {trigger}
      </PressResponder>
        {overlay}
    </Fragment>
  );

}

function TooltipHoverTrigger({isOpen, onPress, trigger, overlay}) {

  return (
    <Fragment>
      <HoverResponder
        isPressed={isOpen}
        onPress={onPress}>
        {trigger}
      </HoverResponder>
        {overlay}
    </Fragment>
  );

}
