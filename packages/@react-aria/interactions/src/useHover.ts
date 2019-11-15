import {DOMProps} from '@react-types/shared';
import {HoverResponderContext} from './hoverContext';
import {HTMLAttributes, RefObject, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {mergeProps} from '@react-aria/utils';

export interface HoverEvent {
  type: 'hoverstart' | 'hoverend' | 'hover',
  pointerType: 'mouse' | 'touch',
  target: HTMLElement
}

export interface HoverProps {
  isHovering?: boolean,
  isDisabled?: boolean,
  onHover?: (e: HoverEvent) => void,
  onHoverStart?: (e: HoverEvent) => void,
  onHoverEnd?: (e: HoverEvent) => void
}

export interface HoverHookProps extends HoverProps, DOMProps {
  ref?: RefObject<HTMLElement>
}

interface HoverState {
  isHovering: boolean,
  ignoreEmulatedMouseEvents: boolean,
  target: HTMLElement | null
}

interface HoverResult {
  isHovering: boolean,
  hoverProps: HTMLAttributes<HTMLElement>
}

function useHoverResponderContext(props: HoverHookProps): HoverHookProps {
  // Consume context from <HoverResponder> and merge with props.
  let context = useContext(HoverResponderContext);
  if (context) {
    let {register, ...contextProps} = context;
    props = mergeProps(contextProps, props) as HoverHookProps;
    register();
  }

   // Sync ref from <HoverResponder> with ref passed to useHover.
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
    onHoverStart,
    onHoverEnd,
    isDisabled,
    isHovering: isHoveringProp,
    ...domProps
  } = useHoverResponderContext(props);

  let [isHovering, setHover] = useState(false);

  let ref = useRef<HoverState>({
    isHovering: false,
    ignoreEmulatedMouseEvents: false, // if this is true then ignore mouse events
    target: null
  });

  let hoverProps = useMemo(() => {
    let state = ref.current;
    let triggerHoverStart = (target, pointerType) => {
      if (isDisabled) {
        return;
      }

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

      setHover(true);
    };

    let triggerHoverEnd = (target, pointerType, didHover=true) => {
      if (isDisabled) {
        return;
      }

      if (onHoverEnd) {
        onHoverEnd({
          type: 'hoverend',
          target,
          pointerType
        });
      }

      setHover(false);

      if (onHover && didHover) {
        onHover({
          type: 'hover',
          target,
          pointerType
        });
      }


    };

    let hoverProps: HTMLAttributes<HTMLElement> = {};


    if (typeof PointerEvent !== 'undefined') {
      hoverProps.onMouseEnter = (e) => {
        console.log('mouse enter');
        triggerHoverStart(e.target, 'mouse');
      };

      hoverProps.onMouseLeave = (e) => {
        console.log('mouse leave');
        triggerHoverEnd(e.target, 'mouse');
      };


    } else {
      console.log('pointer event is defined');
      // onPointerEnter -> for checking the pointerType (if 'touch' don't fire)
      // test on mobile ... there should be no hover on mobile

      // pressProps.onPointerEnter = (e) => {
      //   if (e.pointerId === state.activePointerId && state.isPressed) {
      //     triggerPressStart(e.target, e.pointerType);
      //   }
      // };
      //
      // pressProps.onPointerLeave = (e) => {
      //   if (e.pointerId === state.activePointerId && state.isPressed) {
      //     triggerPressEnd(e.target, e.pointerType, false);
      //   }
      // };

    }

    return hoverProps;
  }, [onHover, onHoverStart, onHoverEnd, isDisabled]);

  return {
    isHovering: isHoveringProp || isHovering,
    hoverProps: mergeProps(domProps, hoverProps)
  };
}
