import {HoverResponder} from '@react-aria/interactions';
import {Overlay} from '@react-spectrum/overlays';
import {PositionProps, useOverlayPosition} from '@react-aria/overlays';
import {PressResponder} from '@react-aria/interactions';
import React, {Fragment, ReactElement, RefObject, useRef} from 'react';
import {TooltipHoverResponder} from '@react-aria/interactions';
import {useControlledState} from '@react-stately/utils';
import {useTooltipTrigger, useTooltipHoverTrigger} from '@react-aria/tooltip';

// const VISIBLE_TOOLTIPS = new Map;
// const DEFAULT_BUCKET_KEY = 'x';

interface TooltipTriggerProps extends PositionProps {
  children: ReactElement[],
  type?: 'click',
  targetRef?: RefObject<HTMLElement>,
  isOpen?: boolean,
  defaultOpen?: boolean,
  onOpenChange?: (isOpen: boolean) => void
}

// function determineBucketKey(overlay) {
//   const {children} = overlay.props;
//   if (children && children.props) {
//     // return children.props.role === 'tooltip' ? 'tooltip' : DEFAULT_BUCKET_KEY; ... this is what it should be
//     // TODO: figure out why disabled=false is not a prop + id & role are parents and not direct props
//     // current work around / brute force solution:
//     return children.props.children === 'This is a tooltip.' ? 'tooltip' : DEFAULT_BUCKET_KEY;
//   }
//   return DEFAULT_BUCKET_KEY;
// }

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

  // This implementation is not in use & not complete. Maybe it should be instead of the useTooltipTrigger approach? //////////////////////

  // let hide = () => {
  //   const visibleTooltips = VISIBLE_TOOLTIPS.get(determineBucketKey(overlay));
  //   // only hide if this is the top overlay
  //   if (visibleTooltips[visibleTooltips.length - 1] === overlay) {
  //     onClose();
  //   }
  // }

  // let entered = () => {
  //   let tooltipBucketKey = determineBucketKey(overlay) // make this a global variable?
  //   let visibleTooltips = VISIBLE_TOOLTIPS.get(tooltipBucketKey);
  //   if (!visibleTooltips) {
  //     VISIBLE_TOOLTIPS.set(tooltipBucketKey, []);
  //     visibleTooltips = VISIBLE_TOOLTIPS.get(tooltipBucketKey);
  //   }
  //   if (!visibleTooltips.includes(overlay)) {
  //     visibleTooltips.push(overlay);
  //   }
  //   if (visibleTooltips.length > 1) {
  //     hide()
  //   }
  // }

  // let exited = () => {
  //   const visibleTooltips = VISIBLE_TOOLTIPS.get(determineBucketKey(overlay));
  //   let index = visibleTooltips.indexOf(overlay);
  //   if (index >= 0) {
  //     visibleTooltips.splice(index, 1);
  //   }
  // }

  //////////////////////

  let containerRef = useRef<HTMLDivElement>();
  let triggerRef = useRef<HTMLElement>();
  let overlayRef = useRef<HTMLDivElement>();

  // rename tooltipBaseTriggerProps
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

  let {tooltipHoverTriggerProps} = useTooltipHoverTrigger(
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

  // onEntered={entered} onExited={exited}
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
          {...tooltipHoverTriggerProps}
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
