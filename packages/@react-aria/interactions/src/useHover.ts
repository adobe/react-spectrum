import {DOMProps} from '@react-types/shared';
import {HoverResponderContext} from './hoverContext';
import {HTMLAttributes, RefObject, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {mergeProps} from '@react-aria/utils';

export interface HoverEvent {
  type: 'hoverstart' | 'hoverend' | 'hover',
  pointerType: 'mouse' | 'touch' | 'pen',
  target: HTMLElement
}

export interface HoverProps {
  isHovering?: boolean,
  isDisabled?: boolean,
  onHover?: (isHovering: boolean) => void,
  onHoverStart?: (e: HoverEvent) => void,
  onHoverEnd?: (e: HoverEvent) => void
}

export interface HoverHookProps extends HoverProps, DOMProps {
  ref?: RefObject<HTMLElement>
}

interface HoverState {
  ignoreEmulatedMouseEvents: boolean,
  target: HTMLElement | null
}

interface HoverResult {
  isHovering: boolean,
  hoverProps: HTMLAttributes<HTMLElement>
}

let hoverHideDelay = null;
let hoverShowDelay = null;

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
    ignoreEmulatedMouseEvents: false,
    target: null
  });

  let hoverProps = useMemo(() => {
    let state = ref.current;

    let triggerHoverStart = (event, pointerType) => {
      if (isDisabled) {
        return;
      }

      if (pointerType === 'touch') {
        state.ignoreEmulatedMouseEvents = true;
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
        handleDelayedShow(onHover);
      }

      setHover(true);
    };


    let triggerHoverEnd = (event, pointerType, didHover = true) => {
      if (isDisabled) {
        return;
      }

      if (pointerType === 'touch') {
        state.ignoreEmulatedMouseEvents = true;
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

      setHover(false);

      if (onHover && didHover) {
        handleMouseOverOut(onHover, event);
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

      // TODO: create a separate useFocus hook? Would be a lot of duplicate code.
      hoverProps.onFocus = () => {
        handleDelayedShow(onHover);
      };

      hoverProps.onBlur = () => {
        handleDelayedHide(onHover);
      };

    } else {

      hoverProps.onMouseEnter = (e) => {
        triggerHoverStart(e, 'mouse');
      };

      hoverProps.onMouseLeave = (e) => {
        triggerHoverEnd(e, 'mouse');
      };

      hoverProps.onFocus = () => {
        handleDelayedShow(onHover);
      };

      hoverProps.onBlur = () => {
        handleDelayedHide(onHover);
      };

    }
    return hoverProps;
  }, [onHover, onHoverStart, onHoverEnd, isDisabled]);

  return {
    isHovering: isHoveringProp || isHovering,
    hoverProps: mergeProps(domProps, hoverProps)
  };
}

function handleDelayedShow(onHover) {

  if (hoverHideDelay != null) {
    clearTimeout(hoverHideDelay);
    hoverHideDelay = null;
  }

  hoverShowDelay = setTimeout(() => {
    onHover(true);
  }, 400);
}

function handleDelayedHide(onHover) {

  if (hoverShowDelay != null) {
    clearTimeout(hoverShowDelay);
    hoverShowDelay = null;
  }

  hoverHideDelay = setTimeout(() => {
    onHover(false);
  }, 400);
}

function handleMouseOverOut(onHover, e) {
  const related = e.relatedTarget || e.nativeEvent.toElement;
  const parent = related.parentNode;
  if (parent.getAttribute('role') === 'tooltip') {
    clearTimeout(hoverShowDelay);
    return;
  } else {
    handleDelayedHide(onHover);
  }
}
