import {AllHTMLAttributes, RefObject} from 'react';
import {chain} from '@react-aria/utils';
import {DOMProps} from '@react-types/shared';
import {useId} from '@react-aria/utils';
import {useOverlay} from '@react-aria/overlays';

interface TooltipProps extends DOMProps {
  onClose?: () => void,
  role?: 'tooltip'
}

interface TriggerProps extends DOMProps, AllHTMLAttributes<HTMLElement> {
  ref: RefObject<HTMLElement | null>,
}

interface TooltipTriggerState {
  isOpen: boolean,
  setOpen(value: boolean): void
}

interface TooltipTriggerProps {
  tooltipProps: TooltipProps,
  triggerProps: TriggerProps,
  state: TooltipTriggerState
}

interface TooltipTriggerAria {
  tooltipTriggerProps: AllHTMLAttributes<HTMLElement>,
  tooltipProps: AllHTMLAttributes<HTMLElement>
}

export function useTooltipTrigger(props: TooltipTriggerProps): TooltipTriggerAria {
  // console.log("usage")
  let {
    tooltipProps,
    triggerProps,
    state
  } = props;

  let tooltipTriggerId = useId();

  let {overlayProps} = useOverlay({
    ref: triggerProps.ref,
    onClose: tooltipProps.onClose,
    isOpen: state.isOpen
  });

  let onKeyDownTrigger = (e) => {

    console.log("in key down trigger")

    if (triggerProps.ref && triggerProps.ref.current) {

      // dismiss tooltip on esc key press
      if (e.key === 'Escape') {
        console.log("esc button called from tooltip")
        e.preventDefault();
        e.stopPropagation();

        state.setOpen(false); // this doesn't toggle open

        // console.log(state.open)
        // state.open = false; // this doesn't close the tooltip

        console.log(state) // why is open still true if you use use setOpen?
      }

    }

  };

  return {
    tooltipTriggerProps: {
      ...overlayProps,
      ref: triggerProps.ref,
      id: tooltipTriggerId,
      role: 'button',
      onKeyDown: chain(triggerProps.onKeyDown, onKeyDownTrigger)
    },
    tooltipProps: {
      'aria-describedby': tooltipProps['aria-describedby'] || tooltipTriggerId,
      role: tooltipProps.role || 'tooltip'
    }
  };
}
