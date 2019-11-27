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

  // Potential alternative solution to "single tooltip story":
    // You can close all tooltip before opening a new one using close method on open events?

  let enter = () => {
    console.log("enter from useTooltipTrigger");
    let tooltipBucketItem = triggerProps.ref.current.id;
    VISIBLE_TOOLTIPS.push(tooltipBucketItem)
    console.log("current array", VISIBLE_TOOLTIPS)
    if (VISIBLE_TOOLTIPS.length > 1){
      console.log("more than one on the screen")
      // state.setOpen(false); // this does nothing
    }
  }

  // this is called both before you enter another action button & if you hover over the tooltip
  let exit = (e) => {
    console.log("leave from useTooltipTrigger");
    // console.log("exit ref", triggerProps.ref.current)
    // state.setOpen(false) // this works to keep only one tooltip open at a time!!!
      // however prevents the hovering over tooltip ability ... you can fix that by making sure the enter [] is more than 2 first
        // then remove the first index after this to bring the list back to 2

    let hoveringOverTooltip = false

    const related = e.relatedTarget || e.nativeEvent.toElement;
    const parent = related.parentNode;
    if (parent.getAttribute('role') === 'tooltip') {
      console.log('is over tooltip');
      hoveringOverTooltip = true;
    }

    console.log(hoveringOverTooltip)

    if (VISIBLE_TOOLTIPS.length > 0 && hoveringOverTooltip === false) { // > 1 doesn't do what is expected due to order of events
      console.log("set open to false")


      // both of the below methods stop the hovering over the tooltip logic to take effect.
        // need to have a boolean so that you know you are over the tooltip and that as a condition in your if statement
        // OR
        // TRY NEXT: if this is a true mouse event method then doesn't that mean you have access to 'e'????
          // if so then you should be able to use this to check if you are over the tooltip or not!!!

      state.setOpen(false);

      // give the user time to hover over the tooltip
      // let tooltipHoverAllowance = setTimeout(() => {
      //   state.setOpen(false);
      // }, 300);


    }


  }

  return {
    tooltipTriggerProps: {
      ...overlayProps,
      id: tooltipTriggerId,
      role: 'button',
      onKeyDown: chain(triggerProps.onKeyDown, onKeyDownTrigger),
      onMouseEnter: enter,
      onMouseLeave: exit
    },
    tooltipProps: {
      'aria-describedby': tooltipProps['aria-describedby'] || tooltipTriggerId,
      role: tooltipProps.role || 'tooltip'
    }
  };
}
