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

  // 1TODO: remove these ts lint ignores


  if (contextProps) {
    // If mouse leaves the tooltip, hide it
    let onMouseLeave = () => {
      // @ts-ignore
      if (contextProps.handleDelayedHide) {
        // @ts-ignore
        contextProps.handleDelayedHide();
      }
    };
    // If mouse enters tooltip, call handleDelayedShow so that the hide call
    // triggered by the mouse leaving the toolip trigger button is canceled
    let onMouseEnter = () => {
      // @ts-ignore
      if (contextProps.handleDelayedShow) {
        // @ts-ignore
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
