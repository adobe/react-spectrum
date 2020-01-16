import {DOMRefValue} from '@react-types/shared';
import {Overlay} from '@react-spectrum/overlays';
import {PositionProps, useOverlayPosition} from '@react-aria/overlays';
import {PressResponder} from '@react-aria/interactions';
import React, {Fragment, ReactElement, RefObject, useRef} from 'react';
import {unwrapDOMRef} from '@react-spectrum/utils';
import {useControlledState} from '@react-stately/utils';

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

  let onInteraction = () => {
    setOpen(!open);
  };

  let containerRef = useRef<DOMRefValue<HTMLDivElement>>();
  let triggerRef = useRef<HTMLElement>();
  let overlayRef = useRef<HTMLDivElement>();

  let {overlayProps, placement, arrowProps} = useOverlayPosition({
    placement: props.placement,
    containerRef: unwrapDOMRef(containerRef),
    targetRef: targetRef || triggerRef,
    overlayRef,
    isOpen
  });

  delete overlayProps.style.position;

  let triggerPropsWithRef = {
    ref: triggerRef
  };

  let overlay = (
    <Overlay isOpen={open} ref={containerRef}>
      {React.cloneElement(content, {placement: placement, arrowProps: arrowProps, ref: overlayRef, UNSAFE_style: {...overlayProps.style}, isOpen: open})}
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
