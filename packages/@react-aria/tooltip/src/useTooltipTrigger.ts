import {AllHTMLAttributes, RefObject, useContext} from 'react';
import {chain} from '@react-aria/utils';
import {DOMProps} from '@react-types/shared';
import {TooltipState} from '@react-stately/tooltip';
import {useId} from '@react-aria/utils';
import {useOverlay} from '@react-aria/overlays';

//import {HoverProps, useHover} from '@react-aria/interactions';
//import {HoverResponderContext} from '@react-aria/interactions';

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

interface InteractionProps extends DOMProps {
  onPressInteraction: () => void,
  onHoverInteraction: (value: boolean) => void,
}

interface TooltipTriggerAria {
  baseProps: AllHTMLAttributes<HTMLElement>,
  interactionProps: InteractionProps,
  hoverTriggerProps: AllHTMLAttributes<HTMLElement>,
  clickTriggerProps: AllHTMLAttributes<HTMLElement>
}

let visibleTooltips = [];
let tooltipStates = [];
//let hoverHideTimeout = null;
//let hoverShowTimeout = null;

export function useTooltipTrigger(props: TooltipTriggerProps): TooltipTriggerAria {
  // let contextProps = useContext(HoverResponderContext);
  let tooltipTriggerId = useId();

  let {
    triggerProps,
    state
  } = props;

  let onPressInteraction = () => {
    state.setOpen(!state.open);
  };

  let onHoverInteraction = (isHovering) => {
    state.setOpen(isHovering);
  };

  let onClose = () => {
    state.setOpen(false);
  };

  let {overlayProps} = useOverlay({
    ref: triggerProps.ref,
    onClose: onClose,
    isOpen: state.open
  });

  // console.log('useTooltipTrigger', contextProps)
  //
  // let {hoverProps} = useHover({
  //   onHover: () => {
  //     console.log('I am hovering');
  //
  //     // handleDelayedShow2()
  //     testFunction()
  //
  //     if (contextProps) {
  //       console.log('entry context props here') // not called
  //       if (contextProps.onShow && contextProps.onHoverTooltip) {
  //         handleDelayedShow(contextProps.onShow, contextProps.onHoverTooltip);
  //       }
  //     }
  //
  //   },
  //   onHoverEnd: () => {
  //     console.log('I am going to stop hovering')
  //
  //     if (contextProps) {
  //       console.log('exit context props here') // not called
  //       if (contextProps.onShow) {
  //         handleMouseOverOut(contextProps.onShow, event);
  //       }
  //     }
  //
  //   }
  // });
  //
  // let testFunction = () => {
  //   console.log('test', contextProps)
  // }

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

  let enter = () => {
    console.log('enter')
    let tooltipBucketItem = triggerProps.ref.current.id;
    visibleTooltips.push(tooltipBucketItem);
    tooltipStates.forEach(tooltip => tooltip.setOpen(false));
  };

  let exit = (e) => {
    console.log('exit')
    let hoveringOverTooltip = false;
    const related = e.relatedTarget || e.nativeEvent.toElement;
    const parent = related.parentNode;
    if (parent.getAttribute('role') === 'tooltip') {
      hoveringOverTooltip = true;
    }
    if (visibleTooltips.length > 0 && hoveringOverTooltip === false) {  // made 1 instead of 0
      console.log('exit is closing')
      // state.setOpen(false);
    }
    visibleTooltips.pop();
  };

  let enterClick = () => {
    let tooltipBucketItem = triggerProps.ref.current.id;
    visibleTooltips.push(tooltipBucketItem);
    tooltipStates.push(state);
    if (visibleTooltips.length > 1) {
      visibleTooltips.shift();
    }
  };

  // pass props into useTooltip
  return {
    baseProps: {
      ...overlayProps,
      id: tooltipTriggerId,
      role: 'button',
      onKeyDown: chain(triggerProps.onKeyDown, onKeyDownTrigger)
    },
    interactionProps: {
      onPressInteraction,
      onHoverInteraction
    },
    hoverTriggerProps: {
      //...hoverProps,
      onMouseEnter: enter,
      onMouseLeave: exit
    },
    clickTriggerProps: {
      onMouseDown: enterClick
    }
  };
}


// function handleDelayedShow(onShow, onHoverTooltip) {
//   if (hoverHideTimeout != null) {
//     clearTimeout(hoverHideTimeout);
//     hoverHideTimeout = null;
//   }
//   hoverShowTimeout = setTimeout(() => {
//     onShow(true);
//     if (onHoverTooltip) {
//       onHoverTooltip(true);
//     }
//   }, 300);
// }
//
// function handleDelayedHide(onShow) {
//   if (hoverShowTimeout != null) {
//     clearTimeout(hoverShowTimeout);
//     hoverShowTimeout = null;
//   }
//   hoverHideTimeout = setTimeout(() => {
//     onShow(false);
//   }, 300);
// }
//
// function handleMouseOverOut(onShow, e) {
//   const related = e.relatedTarget || e.nativeEvent.toElement;
//   const parent = related.parentNode;
//   if (parent.getAttribute('role') === 'tooltip') {
//     clearTimeout(hoverShowTimeout);
//     return;
//   } else {
//     handleDelayedHide(onShow);
//   }
// }

/*
// this doesn't work either ...
export function handleDelayedShow2() {
  let contextProps = useContext(HoverResponderContext);
  if (hoverHideTimeout != null) {
    clearTimeout(hoverHideTimeout);
    hoverHideTimeout = null;
  }
  hoverShowTimeout = setTimeout(() => {
    if(contextProps.onShow) {
      contextProps.onShow(true);
    }
    if (contextProps.onHoverTooltip) {
      contextProps.onHoverTooltip(true);
    }
  }, 300);
}

*/
