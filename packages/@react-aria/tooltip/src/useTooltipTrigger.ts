// TODO: rename to useTooltipTriggerBase.ts

import {AllHTMLAttributes, RefObject} from 'react';
import {chain} from '@react-aria/utils';
import {DOMProps} from '@react-types/shared';
import {useId} from '@react-aria/utils';
import {useOverlay} from '@react-aria/overlays';

// const VISIBLE_TOOLTIPS = [];

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
  tooltipTriggerProps: AllHTMLAttributes<HTMLElement>,
  tooltipProps: AllHTMLAttributes<HTMLElement>
}

export function useTooltipTrigger(props: TooltipTriggerProps): TooltipTriggerAria {
  let {
    tooltipProps,
    triggerProps,
    state
  } = props;

  // let contextProps = useContext(TooltipHoverResponderContext); // can you use this to check if over the tooltip?

  let tooltipTriggerId = useId();

  let {overlayProps} = useOverlay({
    ref: triggerProps.ref,
    onClose: tooltipProps.onClose,
    isOpen: state.open
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

  // let enter = () => {
  //   let tooltipBucketItem = triggerProps.ref.current.id;
  //   VISIBLE_TOOLTIPS.push(tooltipBucketItem)
  // }
  //
  // let exit = (e) => {
  //   let hoveringOverTooltip = false
  //   const related = e.relatedTarget || e.nativeEvent.toElement;
  //   const parent = related.parentNode;
  //   if (parent.getAttribute('role') === 'tooltip') {
  //     hoveringOverTooltip = true;
  //   }
  //   if (VISIBLE_TOOLTIPS.length > 0 && hoveringOverTooltip === false) {
  //     state.setOpen(false);
  //   }
  // }

  return {
    tooltipTriggerProps: {
      ...overlayProps,
      id: tooltipTriggerId,
      role: 'button',
      onKeyDown: chain(triggerProps.onKeyDown, onKeyDownTrigger)//,
      // onMouseEnter: enter,
      // onMouseLeave: exit
    },
    tooltipProps: {
      'aria-describedby': tooltipProps['aria-describedby'] || tooltipTriggerId,
      role: tooltipProps.role || 'tooltip'
    }
  };
}
