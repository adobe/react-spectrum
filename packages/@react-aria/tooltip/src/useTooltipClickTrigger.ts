import {AllHTMLAttributes, RefObject} from 'react';
import {chain} from '@react-aria/utils';
import {DOMProps} from '@react-types/shared';
import {useId} from '@react-aria/utils';
import {useOverlay} from '@react-aria/overlays';

const VISIBLE_TOOLTIPS = [];

interface TooltipProps extends DOMProps {
  onClose?: () => void,
  role?: 'tooltip'
}

interface TriggerProps extends DOMProps, AllHTMLAttributes<HTMLElement> {
  ref: RefObject<HTMLElement | null>,
}

interface TooltipTriggerState {
  open: boolean,
  setOpen(value: boolean): void
}

interface TooltipTriggerProps {
  tooltipProps: TooltipProps,
  triggerProps: TriggerProps,
  state: TooltipTriggerState
}

interface TooltipTriggerAria {
  tooltipTriggerProps: AllHTMLAttributes<HTMLElement>
}

export function useTooltipClickTrigger(props: TooltipTriggerProps): TooltipTriggerAria {
  let {
    tooltipProps,
    triggerProps,
    state
  } = props;

  let {overlayProps} = useOverlay({
    ref: triggerProps.ref,
    onClose: tooltipProps.onClose,
    isOpen: state.open
  });

  // Potential alternative solution to "single tooltip story":
    // You can close all tooltip before opening a new one using close method on open events?

  let enter = () => {
    let tooltipBucketItem = triggerProps.ref.current.id;
    VISIBLE_TOOLTIPS.push(tooltipBucketItem)
  }

  let exit = (e) => {
    if (VISIBLE_TOOLTIPS.length > 0) {
      state.setOpen(false);
    }
  }

  return {
    tooltipTriggerProps: {
      ...overlayProps,
      onMouseDown: enter,
      onMouseUp: exit
    }
  };
}
