import {DOMProps} from '@react-types/shared';
import {HoverResponderContext} from './hoverContext';
import {HTMLAttributes, RefObject, useContext, useEffect, useMemo, useState} from 'react';
import {mergeProps} from '@react-aria/utils';

export interface HoverEvent {
  type: 'hoverstart' | 'hoverend' | 'hover',
  pointerType: 'mouse' | 'touch' | 'pen',
  target: HTMLElement
}

// Next PR: Add tests for isDisabled
export interface HoverProps {
  isHovering?: boolean,
  isDisabled?: boolean,
  immediateAppearance?: boolean,
  onHover?: (e: HoverEvent) => void,
  onHoverStart?: (e: HoverEvent) => void,
  onHoverEnd?: (e: HoverEvent) => void,
  onHoverChange?: (isHovering: boolean) => void,
  isOverTooltip?: (isHovering: boolean) => void
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

let hoverHideDelay = null;
let hoverShowDelay = null;

// Next PR: refactor these variables to be in a state machine [using Enums or useReducer]
// const WARMUP_PERIOD_LENGTH = 2000; -> TODO this PR after review: use this variable in hoverShowDelay
// const COOLDOWN_PERID_LENGTH = 160; -> TODO this PR after review: use this variable in hoverHideDelay
let warmupPeriodComplete = false;
let cooldownPeriodComplete = false;
let cooldownPeriodTimer = null;

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
    onHoverChange,
    isDisabled,
    immediateAppearance,
    isOverTooltip,
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

      if (onHoverChange) {
        handleDelayedShow(onHoverChange, isDisabled, immediateAppearance, isOverTooltip);
      }

      setHover(true);
    };


    let triggerHoverEnd = (event, pointerType, didHover = true) => {
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

      if (onHoverChange && didHover) {
        handleMouseOverOut(onHoverChange, event);
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

      hoverProps.onFocus = () => {
        handleDelayedShow(onHoverChange, isDisabled, immediateAppearance, isOverTooltip);
      };

      hoverProps.onBlur = () => {
        handleDelayedHide(onHoverChange);
      };

    } else {

      hoverProps.onMouseEnter = (e) => {
        triggerHoverStart(e, 'mouse');
      };

      hoverProps.onMouseLeave = (e) => {
        triggerHoverEnd(e, 'mouse');
      };

      hoverProps.onFocus = () => {
        handleDelayedShow(onHoverChange, isDisabled, immediateAppearance, isOverTooltip);
      };

      hoverProps.onBlur = () => {
        handleDelayedHide(onHoverChange);
      };

    }
    return hoverProps;
  }, [onHover, onHoverStart, onHoverEnd, onHoverChange, isDisabled, immediateAppearance, isOverTooltip]);

  return {
    isHovering: isHoveringProp || isHovering,
    hoverProps: mergeProps(domProps, hoverProps)
  };
}

function handleDelayedShow(onHoverChange, isDisabled, immediateAppearance, isOverTooltip) {

  if (isDisabled) {
    return;
  }

  if (immediateAppearance) {
    onHoverChange(true);
  }

  if (warmupPeriodComplete === true && cooldownPeriodComplete === false) {
    onHoverChange(true);
  }

  if (cooldownPeriodTimer != null) {
    clearInterval(cooldownPeriodTimer);
    cooldownPeriodTimer = null;
  }

  if (hoverHideDelay != null) {
    clearTimeout(hoverHideDelay);
    hoverHideDelay = null;
  }

  hoverShowDelay = setTimeout(() => {
    onHoverChange(true);
    warmupPeriodComplete = true;
    if (isOverTooltip) {
      isOverTooltip(true);
    }
  }, 800);
}

function handleDelayedHide(onHoverChange) {

  cooldownPeriodComplete = false;

  if (hoverShowDelay != null) {
    clearTimeout(hoverShowDelay);
    hoverShowDelay = null;
  }

  hoverHideDelay = setTimeout(() => {
    onHoverChange(false);
  }, 300);

  cooldownPeriodTimer = setInterval(() => {
    cooldownPeriodComplete = true;
    warmupPeriodComplete = false;
  }, 3000);

}

function handleMouseOverOut(onHoverChange, e) {
  const related = e.relatedTarget || e.nativeEvent.toElement;
  const parent = related.parentNode;
  if (parent.getAttribute('role') === 'tooltip') {
    clearTimeout(hoverShowDelay);
    return;
  } else {
    handleDelayedHide(onHoverChange);
  }
}
