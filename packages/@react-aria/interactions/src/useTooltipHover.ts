import {DOMProps} from '@react-types/shared';
import {HTMLAttributes, RefObject, useContext, useEffect, useMemo, useState} from 'react';
import {mergeProps} from '@react-aria/utils';
import {TooltipHoverResponderContext} from './tooltipHoverContext';

export interface TooltipHoverEvent {
  type: 'hoverstart' | 'hoverend' | 'hover',
  pointerType: 'mouse' | 'touch' | 'pen',
  target: HTMLElement
}

export interface TooltipHoverProps {
  isHovering?: boolean,
  isOverTooltip?: (isHovering: boolean) => void
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

  let hoverProps = useMemo(() => {

    let triggerHoverStart = (event, pointerType) => {

      if (pointerType === 'touch') {
        return;
      }

      if (isOverTooltip) {
        isOverTooltip(true);
      }

      setHover(true);
    };

    let hoverProps: HTMLAttributes<HTMLElement> = {};

    if (typeof PointerEvent !== 'undefined') {

      hoverProps.onPointerEnter = (e) => {
        triggerHoverStart(e, e.pointerType);
      };

    } else {

      hoverProps.onMouseEnter = (e) => {
        triggerHoverStart(e, 'mouse');
      };

    }
    return hoverProps;
  }, [isOverTooltip]);

  return {
    isHovering: isHoveringProp || isHovering,
    hoverProps: mergeProps(domProps, hoverProps)
  };
}
