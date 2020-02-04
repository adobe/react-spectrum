import {DOMProps, HoverEvents} from '@react-types/shared';
import {HTMLAttributes, RefObject, useMemo} from 'react';
import {mergeProps} from '@react-aria/utils';

export interface HoverProps extends HoverEvents, DOMProps {
 isDisabled?: boolean
}

export interface HoverHookProps extends HoverProps, DOMProps {
 ref?: RefObject<HTMLElement>
}

interface HoverState {
 target?: HTMLElement
}

interface HoverResult {
 hoverProps: HTMLAttributes<HTMLElement>
}

export function useHover(props: HoverHookProps): HoverResult {
  let {
    onHover,
    onHoverChange,
    onHoverEnd,
    isDisabled,
    ...domProps
  } = props;

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
    hoverProps: mergeProps(domProps, hoverProps)
  };
}
