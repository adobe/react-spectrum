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

function useDOMPropsResponderContext(props: HoverHookProps): HoverHookProps {
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
    }
    return () => {
      if (context && context.ref) {
        context.ref.current = null;
      }
    };
  }, [context, props.ref]);

  return props;
}

export function useHover(props: HoverHookProps): HoverResult {
  let {
    onHover,
    onHoverStart,
    onHoverEnd,
    onHoverChange,
    isDisabled,
    isHovering: isHoveringProp,
    ...domProps
  } = useDOMPropsResponderContext(props);

  let [isHovering, setHover] = useState(false);

  let hoverProps = useMemo(() => {

    let triggerHoverStart = (event, pointerType) => { // if keep pointerType (you probably should) then use typescript on it like usePress does)

      console.log('hovering')

      if (isDisabled) {
        return;
      }

      // get rid of this touch restriction, leave up to the individiual aria hook to decide this?
      if (pointerType === 'touch') {
        return;
      }

      let target = event.target;

      if (onHoverStart) {
        onHoverStart({
          type: 'hoverstart',
          target,
          pointerType
        });
      }

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

      console.log('not hovering')

      if (isDisabled) {
        return;
      }

      // get rid of this touch restriction, leave up to the individiual aria hook to decide this?
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

    let hoverProps: HTMLAttributes<HTMLElement> = {
      // add mouseOvers like how usePress has key up / downs ?
    };

    if (typeof PointerEvent !== 'undefined') {
      hoverProps.onPointerEnter = (e) => {
        console.log('enterP')
        triggerHoverStart(e, e.pointerType);
      };

      hoverProps.onPointerLeave = (e) => {
        console.log('leaveP')
        triggerHoverEnd(e, e.pointerType);
      };

    } else {
      hoverProps.onMouseEnter = (e) => {
        console.log('enterM')
        triggerHoverStart(e, 'mouse');
      };

      hoverProps.onMouseLeave = (e) => {
        console.log('leaveM')
        triggerHoverEnd(e, 'mouse');
      };
    }
    return hoverProps;
  }, [onHover, onHoverStart, onHoverEnd, onHoverChange, isDisabled]);

  return {
    isHovering: isHoveringProp || isHovering,
    hoverProps: mergeProps(domProps, hoverProps)
  };
}
