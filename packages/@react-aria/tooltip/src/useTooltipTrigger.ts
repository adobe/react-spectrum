import {AllHTMLAttributes, RefObject} from 'react';
import {chain} from '@react-aria/utils';
import {DOMProps} from '@react-types/shared';
import {TooltipState} from '@react-stately/tooltip';
import {useId} from '@react-aria/utils';
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
  state: TooltipState
}

interface InteractionProps { // extends DOMProps {
  toggleTooltipState: () => void,
}

interface TooltipTriggerAria {
  baseProps: AllHTMLAttributes<HTMLElement>,
  interactionProps: InteractionProps,
  clickTriggerProps: AllHTMLAttributes<HTMLElement>
}

export function useTooltipTrigger(props: TooltipTriggerProps): TooltipTriggerAria {
  let tooltipTriggerId = useId();
  let {
    tooltipProps,
    triggerProps,
    state
  } = props;

  let toggleTooltipState = () => {
    state.setOpen(!state.open);
  };

  let onClose = () => {
    state.setOpen(false);
  };

  let {overlayProps} = useOverlay({
    ref: triggerProps.ref,
    onClose: onClose,
    isOpen: state.open
  });

  let onKeyDownTrigger = (e) => {
    if (triggerProps.ref && triggerProps.ref.current) {
      // dismiss tooltip on esc key press
      if (e.key === 'Escape' || e.altKey && e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        state.setOpen(false);
      }
    }
  };

  let handlePress = () => {
    let triggerId = triggerProps.ref.current.id;
    toggleTooltipState();
  };

  return {
    baseProps: {
      ...overlayProps,
      id: tooltipTriggerId,
      role: 'button',
      onKeyDown: chain(triggerProps.onKeyDown, onKeyDownTrigger)
    },
    clickTriggerProps: {
      onPress: handlePress
    }
  };
}
