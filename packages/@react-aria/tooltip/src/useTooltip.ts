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
    tooltipProps.onMouseLeave = contextProps.onMouseLeave;
    tooltipProps.onMouseEnter = contextProps.onMouseEnter;
  }

  return {
    tooltipProps
  };
}
