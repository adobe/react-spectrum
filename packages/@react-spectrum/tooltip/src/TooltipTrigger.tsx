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

  return (
    <TooltipTriggerContainer
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
    type,
    isOpen,
    onInteraction,
    targetRef,
    trigger,
    content,
    ...otherProps
  } = props;

  let containerRef = useRef<HTMLDivElement>();
  let triggerRef = useRef<HTMLElement>();
  let overlayRef = useRef<HTMLDivElement>();

  let {overlayProps} = useOverlayPosition({
    containerRef,
    targetRef: targetRef || triggerRef,
    overlayRef,
    isOpen
  });

  let triggerPropsWithRef = {
    ref: triggerRef
  };

  let overlay = (
    React.cloneElement(content, {...otherProps, ref: overlayRef, ...overlayProps, isOpen: isOpen})
  );

  if (type === 'click') {
    return (
      <TooltipClickTrigger
        triggerPropsWithRef={triggerPropsWithRef}
        isOpen={isOpen}
        onPress={onInteraction}
        trigger={trigger}
        overlay={overlay} />
    );
  }
}

function TooltipClickTrigger(props) {
  let {
    triggerPropsWithRef,
    isOpen,
    onPress,
    trigger,
    overlay
  } = props;
  return (
    <Fragment>
      <PressResponder
        {...triggerPropsWithRef}
        isPressed={isOpen}
        onPress={onPress}>
        {trigger}
      </PressResponder>
      {overlay}
    </Fragment>
  );
}
