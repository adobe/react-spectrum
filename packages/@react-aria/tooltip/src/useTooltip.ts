import {AllHTMLAttributes, useContext} from 'react';
import {DOMProps} from '@react-types/shared';
import {HoverResponderContext} from '@react-aria/interactions';
import {useId} from '@react-aria/utils';

interface TooltipProps extends DOMProps {
  role?: 'tooltip'
}

interface TooltipAria {
  tooltipProps: AllHTMLAttributes<HTMLElement>
}

export function useTooltip(props: TooltipProps): TooltipAria {
  let contextProps = useContext(HoverResponderContext);
  let tooltipId = useId(props.id);

  let {
    role = 'tooltip'
  } = props;

  let tooltipProps;
  tooltipProps = {
    'aria-describedby': tooltipId,
    role,
    id: tooltipId
  };

  // could maybe add a delay as a second argument here
  if (contextProps) {
    // If mouse leaves the tooltip, hide it
    let onMouseLeave = () => {
      if (contextProps.handleDelayedHide) {
        contextProps.handleDelayedHide();
      }
    };

    // If mouse enters tooltip, call handleDelayedShow so that the hide call
    // triggered by the mouse leaving the toolip trigger button is canceled
    // Potentially replace with a cancel function to simplify handleDelayShow
    let onMouseEnter = () => {
      if (contextProps.handleDelayedShow) {
        contextProps.handleDelayedShow();
      }
    }
    tooltipProps.onMouseLeave = onMouseLeave;
    tooltipProps.onMouseEnter = onMouseEnter;
  }

  return {
    tooltipProps
  };
}
