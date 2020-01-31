import {DOMProps, HoverEvents} from '@react-types/shared';
import {DOMPropsResponderContext} from './DOMPropsContext';
import {HTMLAttributes, RefObject, useContext, useEffect, useMemo, useState} from 'react';
import {mergeProps} from '@react-aria/utils';

export interface HoverProps extends HoverEvents, DOMProps {
 isHovering?: boolean,      // can be used to indicate a potential hover state for visual effects
 isDisabled?: boolean
}

export interface HoverHookProps extends HoverProps, DOMProps {
 ref?: RefObject<HTMLElement>
}

interface HoverState {
 target: HTMLElement | null
}

interface HoverResult {
 isHovering: boolean,
 hoverProps: HTMLAttributes<HTMLElement>
}

export function useDOMPropsResponderContext(props: HoverHookProps): HoverHookProps {
  // Consume context from <DOMPropsResponder> and merge with props.
  let context = useContext(DOMPropsResponderContext);
  if (context) {
    let {register, ...contextProps} = context;
    props = mergeProps(contextProps, props) as HoverHookProps;
    register();
  }

  // Sync ref from <DOMPropsResponder> with ref passed to useHover.
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

export function useHover(props: HoverHookProps): HoverResult {
  let {
    onHover,
    onHoverChange,
    onHoverEnd,
    isDisabled,
    isHovering: isHoveringProp,
    ...domProps
  } = useDOMPropsResponderContext(props);

  let [isHovering, setHover] = useState(false);

  let hoverProps = useMemo(() => {

    let triggerHoverStart = (event, pointerType) => {

      if (isDisabled) {
        return;
      }

      if (pointerType === 'touch') {
        return;
      }

      let target = event.target;

      if (onHover) {
        onHover({
          type: 'hover',
          target,
          pointerType
        });
      }

      if (onHoverChange) {
        onHoverChange(true);
      }

      setHover(true);
    };


    let triggerHoverEnd = (event, pointerType) => {

      if (isDisabled) {
        return;
      }

      if (pointerType === 'touch') {
        return;
      }

      let target = event.target;

      if (onHoverEnd) {
        onHoverEnd({
          type: 'hoverend',
          target,
          pointerType
        });
      }

      if (onHoverChange) {
        onHoverChange(false);
      }

      setHover(false);
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
  }, [onHover, onHoverChange, onHoverEnd, isDisabled]);

  return {
    isHovering: isHoveringProp || isHovering,
    hoverProps: mergeProps(domProps, hoverProps)
  };
}
