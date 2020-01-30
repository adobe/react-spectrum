import {chain, useId} from '@react-aria/utils';
import {DOMProps} from '@react-types/shared';
import {HTMLAttributes, RefObject} from 'react';
import {PressProps, useHover} from '@react-aria/interactions';
import {TooltipProps} from '@react-types/tooltip';
import {TooltipTriggerState} from '@react-stately/tooltip';
import {useOverlay} from '@react-aria/overlays';

interface TriggerRefProps extends DOMProps, HTMLAttributes<HTMLElement> {
  ref: RefObject<HTMLElement | null>,
}

interface TooltipTriggerProps {
  tooltipProps: TooltipProps,
  triggerProps: TriggerRefProps,
  state: TooltipTriggerState,
  isDisabled: boolean,
  type: string
}

interface TooltipHoverTriggerProps {
  onMouseEnter?: () => void,
  onMouseLeave?: () => void,
  hoverHookProps?: HTMLAttributes<HTMLElement>
}

interface TooltipTriggerAria {
  triggerProps: HTMLAttributes<HTMLElement> & PressProps
  tooltipProps: HTMLAttributes<HTMLElement>,
  hoverTriggerProps: TooltipHoverTriggerProps
}

let visibleTooltips;
let hoverHideTimeout = null;
let hoverShowTimeout = null;

export function useTooltipTrigger(props: TooltipTriggerProps): TooltipTriggerAria {
  let tooltipId = useId();
  // create your own trigger id 
  let {
    tooltipProps,
    triggerProps,
    state,
    isDisabled,
    type
  } = props;

  console.log("triggerProps", triggerProps)

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



    let triggerId = triggerProps.ref.current;
    console.log("xyz")
    console.log(triggerId)
    console.log("show id", triggerId)
    // Only cancel a prior tooltip hide operation if the current tooltip trigger is the same as the previous tooltip trigger
    // a.k.a if user is moving back and forth between trigger and tooltip
    if (hoverHideTimeout != null && visibleTooltips.triggerId === triggerId) {
      clearTimeout(hoverHideTimeout);
      hoverHideTimeout = null;
      return;
    }


    console.log("visible Tooltips", visibleTooltips)


    hoverShowTimeout = setTimeout(() => {
      hoverShowTimeout = null;
      state.setOpen(true);
      // Close previously open tooltip (deals with tooltip opened via click operation)
      if (visibleTooltips) {
        visibleTooltips.state.setOpen(false);
        console.log("close previously open tooltip")
      }
      visibleTooltips = {triggerId, state};
    }, 300);
  };

  let handleDelayedHide = () => {
    if (hoverShowTimeout != null) {
      clearTimeout(hoverShowTimeout);
      hoverShowTimeout = null;
      return;
    }

    hoverHideTimeout = setTimeout(() => {
      hoverHideTimeout = null;
      state.setOpen(false);
      console.log("close via hide")
      visibleTooltips = null;
    }, 300);
  };

  let onPress = () => {
    let triggerId = triggerProps.ref.current.id;
    state.setOpen(!state.open);
    visibleTooltips = {triggerId, state};
  };

  let triggerType = type;

  return {
    triggerProps: {
      ...tooltipProps,
      ...overlayProps,
      'aria-describedby': tooltipId,
      onKeyDown: chain(triggerProps.onKeyDown, onKeyDownTrigger),
      onPress: triggerType === 'click' ? onPress : undefined
    },
    tooltipProps: {
      id: tooltipId
    },
    hoverTriggerProps: {
      onMouseEnter: handleDelayedShow,
      onMouseLeave: handleDelayedHide,
      hoverHookProps: hoverProps
    }
  };
}
