import {AllHTMLAttributes, useContext} from 'react';
import {DOMProps} from '@react-types/shared';
import {DOMPropsResponderContext} from '@react-aria/interactions';
import {useId} from '@react-aria/utils';

interface TooltipProps extends DOMProps {
  role?: 'tooltip'
  id?: string
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

  let tooltipProps: TooltipAria['tooltipProps'] = {
    role,
    id: tooltipId
  };

  // TODO: investigate if tooltip and trigger mouse events conflict, specifically user provided ones 
  if (contextProps) {
    tooltipProps.onMouseLeave = contextProps.onMouseLeave;
    tooltipProps.onMouseEnter = contextProps.onMouseEnter;
  }

  return {
    tooltipProps
  };
}
