import {AllHTMLAttributes, RefObject} from 'react';
import {chain, useId} from '@react-aria/utils';
import {DOMProps} from '@react-types/shared';
import {PressProps, useHover} from '@react-aria/interactions';
import {TooltipState} from '@react-stately/tooltip';
import {useOverlay} from '@react-aria/overlays';

interface TooltipProps extends DOMProps {
  onClose?: () => void,
  role?: 'tooltip'
}

interface TriggerProps extends DOMProps, AllHTMLAttributes<HTMLElement> {
  ref: RefObject<HTMLElement | null>,
}

interface TooltipTriggerProps {
  tooltipProps: TooltipProps,
  triggerProps: TriggerProps,
  state: TooltipState,
  isDisabled: boolean,
  type: string
}

// @ts-ignore
interface TooltipTriggerAria {
  baseProps: AllHTMLAttributes<HTMLElement> & PressProps,
  // @ts-ignore
  hoverTriggerProps: AllHTMLAttributes<HTMLElement>,
}

let visibleTooltips;
let hoverHideTimeout = null;
let hoverShowTimeout = null;

export function useTooltipTrigger(props: TooltipTriggerProps): TooltipTriggerAria {
  let tooltipTriggerId = useId();

  let {
    triggerProps,
    state,
    isDisabled,
    type
  } = props;

  let onClose = () => {
    state.setOpen(false);
  };

  let {overlayProps} = useOverlay({
    ref: triggerProps.ref,
    onClose: onClose,
    isOpen: state.open
  });

  let {hoverProps} = useHover({
    isDisabled,
    ref: triggerProps.ref
  });

  let onKeyDownTrigger = (e) => {
    if (triggerProps.ref && triggerProps.ref.current) {
      // dismiss tooltip on esc key press
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        state.setOpen(false);
      }
    }
  };

  let handleDelayedShow = () => {

    if (isDisabled) {
      return;
    }

    let triggerId = triggerProps.ref.current.id;
    // Only cancel a prior tooltip hide operation if the current tooltip trigger is the same as the previous tooltip trigger
    // a.k.a if user is moving back and forth between trigger and tooltip
    if (hoverHideTimeout != null && visibleTooltips.triggerId === triggerId) {
      console.log('clearing hidetimeout');
      clearTimeout(hoverHideTimeout);
      hoverHideTimeout = null;
      return;
    }

    hoverShowTimeout = setTimeout(() => {
      hoverShowTimeout = null;
      state.setOpen(true);

      // Close previously open tooltip (deals with tooltip opened via click operation)
      if (visibleTooltips) {
        console.log('visible tooltips', visibleTooltips);
        visibleTooltips.state.setOpen(false);
      }

      visibleTooltips = {triggerId, state};
      console.log('visibletooltips after show', visibleTooltips);
    }, 300);
  };

  let handleDelayedHide = () => {
    if (hoverShowTimeout != null) {
      console.log('clearing showtimeout');
      clearTimeout(hoverShowTimeout);
      hoverShowTimeout = null;
      return;
    }

    hoverHideTimeout = setTimeout(() => {
      hoverHideTimeout = null;
      state.setOpen(false);
      console.log('removing a visible tooltip');
      visibleTooltips = null;
    }, 300);
  };

  // Just use handleDelayedShow since enter just calls it
  let enter = () => {
    console.log('enter');
    handleDelayedShow();

  };
  // Just use handleDelayExit since exit just calls it
  let exit = () => {
    console.log('exit');
    handleDelayedHide();
  };

  let onPress = () => {
    let triggerId = triggerProps.ref.current.id;
    state.setOpen(!state.open);
    visibleTooltips = {triggerId, state};
  };

  let triggerType = type;

  // pass props into useTooltip
    // 1TODO: refactor enter and exit stuff to not mess up the functions passed via context to useTooltip
  return {
    baseProps: {
      ...overlayProps,
      id: tooltipTriggerId,
      onKeyDown: chain(triggerProps.onKeyDown, onKeyDownTrigger),
      onPress: triggerType === 'click' ? onPress : undefined
    },
    hoverTriggerProps: {
      onMouseEnter: enter,
      onMouseLeave: exit,
      // @ts-ignore
      handleDelayedShow: handleDelayedShow,
      handleDelayedHide: handleDelayedHide
    },
    hoverHook: {
      hoverH: hoverProps
    }
  };
}
