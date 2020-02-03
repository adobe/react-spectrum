import {chain, useId} from '@react-aria/utils';
import {DOMProps} from '@react-types/shared';
import {HTMLAttributes, RefObject} from 'react';
import {PressProps} from '@react-aria/interactions';
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

export function useTooltipTrigger(props: TooltipTriggerProps): TooltipTriggerAria {
  let tooltipId = useId();
  let triggerId = useId();
  let {
    tooltipProps,
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

  // Last design review meeting had useHover hook here but if this is needed for other components
  // ... I believe it should be in useDomPropsResponder

  // let {hoverProps} = useHover({
  //   isDisabled,
  //   ref: triggerProps.ref
  // });

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

  // abstract away knowledge of timing transitions from aria hook
  let tooltipManager = state.tooltipManager;

  let handleDelayedShow = () => {
    if (isDisabled) {
      return;
    }
    let triggerId = triggerProps.ref.current.id;
    tooltipManager.showTooltipDelayed(state, triggerId);
  };

  let handleDelayedHide = () => {
    tooltipManager.hideTooltipDelayed(state);
  };

  let onPress = () => {
    let triggerId = triggerProps.ref.current.id;
    tooltipManager.updateTooltipState(state, triggerId);
  };

  let triggerType = type;

  return {
    triggerProps: {
      id: triggerId,
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
      onMouseLeave: handleDelayedHide
      // ...hoverProps //-> this causes the ref or styles to be temporarily lost for some reason?
    }
  };
}
