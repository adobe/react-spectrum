import {AllHTMLAttributes, useContext} from 'react';
import {DOMProps} from '@react-types/shared';
import {DOMPropsResponderContext} from '@react-aria/interactions';
import {useId} from '@react-aria/utils';

interface TooltipProps extends DOMProps {
  role?: 'tooltip'
}

interface TooltipAria {
  tooltipProps: AllHTMLAttributes<HTMLElement>
}

export function useTooltip(props: TooltipProps): TooltipAria {
  let contextProps = useContext(DOMPropsResponderContext);
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

  if (contextProps) {
    // If mouse leaves the tooltip, hide it
    let onMouseLeave = () => {
      if (contextProps.handleDelayedHide) {
        contextProps.handleDelayedHide();
      }
    };
    // If mouse enters tooltip, call handleDelayedShow so that the hide call
    // triggered by the mouse leaving the toolip trigger button is canceled
    let onMouseEnter = () => {
      if (contextProps.handleDelayedShow) {
        contextProps.handleDelayedShow();
      }
    };
    tooltipProps.onMouseLeave = onMouseLeave;
    tooltipProps.onMouseEnter = onMouseEnter;
  }

  return {
    tooltipProps
  };
}
