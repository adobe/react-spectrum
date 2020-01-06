import {DOMProps, HoverEvents} from '@react-types/shared';
import {HoverResponderContext} from './hoverContext';
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

let hoverHideTimeout = null;
let hoverShowTimeout = null;

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
    onShow,
    isDisabled,
    onHoverTooltip,
    isHovering: isHoveringProp,
    ...domProps
  } = useHoverResponderContext(props);

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

      if (onShow) {
        handleDelayedShow(onShow, onHoverTooltip);
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

      setHover(false);

      if (onShow) {
        handleMouseOverOut(onShow, event);
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
  }, [onHover, onHoverStart, onHoverEnd, onShow, isDisabled, onHoverTooltip]);

  return {
    isHovering: isHoveringProp || isHovering,
    hoverProps: mergeProps(domProps, hoverProps)
  };
}

// TODO: move tooltip specific functions to another file

function handleDelayedShow(onShow, onHoverTooltip) {
  if (hoverHideTimeout != null) {
    clearTimeout(hoverHideTimeout);
    hoverHideTimeout = null;
  }
  hoverShowTimeout = setTimeout(() => {
    onShow(true);
    if (onHoverTooltip) {
      onHoverTooltip(true);
    }
  }, 300);
}

function handleDelayedHide(onShow) {
  if (hoverShowTimeout != null) {
    clearTimeout(hoverShowTimeout);
    hoverShowTimeout = null;
  }
  hoverHideTimeout = setTimeout(() => {
    onShow(false);
  }, 300);
}

function handleMouseOverOut(onShow, e) {
  const related = e.relatedTarget || e.nativeEvent.toElement;
  const parent = related.parentNode;
  if (parent.getAttribute('role') === 'tooltip') {
    clearTimeout(hoverShowTimeout);
    return;
  } else {
    handleDelayedHide(onShow);
  }
}
