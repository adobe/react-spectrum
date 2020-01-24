import {chain} from '@react-aria/utils';
import {DOMProps} from '@react-types/shared';
import {HTMLAttributes, RefObject} from 'react';
import {PressProps, useHover} from '@react-aria/interactions';
import {TooltipProps} from '@react-types/tooltip';
import {TooltipTriggerState} from '@react-stately/tooltip';
import {mergeProps, useId} from '@react-aria/utils';
import {useOverlay} from '@react-aria/overlays';

interface TriggerRefProps extends DOMProps, HTMLAttributes<HTMLElement> {
  ref: RefObject<HTMLElement | null>,
}

interface TooltipTriggerProps {
  tooltipProps: TooltipProps,
  triggerProps: TriggerRefProps,
  state: TooltipTriggerState,
  type: string
}

interface TooltipTriggerAria {
  triggerProps: HTMLAttributes<HTMLElement> & PressProps
  tooltipProps: HTMLAttributes<HTMLElement>
}

export function useTooltipTrigger(props: TooltipTriggerProps): TooltipTriggerAria {
  let tooltipId = useId();
  let {
    tooltipProps,
    triggerProps,
    state,
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

  let onPress = () => {
    state.setOpen(!state.open);
  };

  let {hoverProps} = useHover({
    onHover: (e) => {
      if (e.pointerType !== 'touch')  {
        state.setOpen(!state.open);
      }
    },
    onHoverEnd: (e) => {
      if (e.pointerType !== 'touch')  {
        state.setOpen(!state.open);
      }
    }
  });

  let triggerType = type;

  return {
    triggerProps: {
      ...tooltipProps,
      ...overlayProps,
      'aria-describedby': tooltipId,
      onKeyDown: chain(triggerProps.onKeyDown, onKeyDownTrigger),
      onPress: triggerType === 'click' ? onPress : undefined,
      ...hoverProps
      //...(triggerType === 'hover' ? hoverProps : {})
    },
    tooltipProps: {
      id: tooltipId
    }
  };
}
