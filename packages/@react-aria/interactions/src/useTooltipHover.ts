import {DOMProps} from '@react-types/shared';
import {TooltipHoverResponderContext} from './tooltipHoverContext';
import {HTMLAttributes, RefObject, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {mergeProps} from '@react-aria/utils';

export interface TooltipHoverEvent {
  type: 'hoverstart' | 'hoverend' | 'hover',
  pointerType: 'mouse' | 'pen',
  target: HTMLElement
}

export interface TooltipHoverProps {
  isHovering?: boolean,
  isOverTooltip?: (e: TooltipHoverEvent) => void
}

export interface TooltipHoverHookProps extends TooltipHoverProps, DOMProps {
  ref?: RefObject<HTMLElement>
}

interface HoverState {
  target: HTMLElement | null
}

interface TooltipHoverResult {
  isHovering: boolean,
  hoverProps: HTMLAttributes<HTMLElement>
}

let hoverHideDelay = null

function useTooltipHoverResponderContext(props: TooltipHoverHookProps): TooltipHoverHookProps {
  // Consume context from <TooltipHoverResponder> and merge with props.
  let context = useContext(TooltipHoverResponderContext);
  if (context) {
    let {register, ...contextProps} = context;
    props = mergeProps(contextProps, props) as TooltipHoverHookProps;
    register();
  }

   // Sync ref from <TooltipHoverResponder> with ref passed to useHover.
  useEffect(() => {
    if (context && context.ref) {
      context.ref.current = props.ref.current;
      return () => {
        context.ref.current = null;
      };
    }
  }, [context, props.ref]);

  return props;
}

export function useTooltipHover(props: TooltipHoverHookProps): TooltipHoverResult {

  let {
    isOverTooltip,
    isHovering: isHoveringProp,
    ...domProps
  } = useTooltipHoverResponderContext(props);

  let [isHovering, setHover] = useState(false);

  let ref = useRef<HoverState>({
    target: null
  });


  let hoverProps = useMemo(() => {
    let state = ref.current;

    // let triggerHoverStart = (event, pointerType) => {
    //
    //   let target = event.target;
    //   console.log("start target", target)
    //
    //   if (isOverTooltip) {
    //     console.log("you're ON the tooltip")
    //     // isOverTooltip(true)
    //   }
    //
    //   setHover(true);
    // };


    let triggerHoverEnd = (event, pointerType, didHover=true) => {

      let target = event.target;
      console.log("exit target", target)

      setHover(false);

      if (isOverTooltip && didHover) {
        handleDelayedHide(isOverTooltip, event)
      }

    };

    let hoverProps: HTMLAttributes<HTMLElement> = {};

    if (typeof PointerEvent !== 'undefined') {

      hoverProps.onPointerEnter = (e) => {
        triggerHoverStart(e, e.pointerType);
      };

      hoverProps.onPointerLeave = (e) => {
        triggerHoverEnd(e, e.pointerType);
      };

    } else {

      hoverProps.onMouseEnter = (e) => {
        triggerHoverStart(e, 'mouse');
      };

      hoverProps.onMouseLeave = (e) => {
        triggerHoverEnd(e, 'mouse');
      };

    }

    return hoverProps;
  }, [isOverTooltip]);

  return {
    isHovering: isHoveringProp || isHovering,
    hoverProps: mergeProps(domProps, hoverProps)
  };
}

function handleDelayedHide(isOverTooltip, e) {
  hoverHideDelay = setTimeout(() => {
    isOverTooltip(false)
    console.log("you're OFF the tooltip")
  }, 100);
}
