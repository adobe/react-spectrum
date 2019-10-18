import {AllHTMLAttributes} from 'react';

interface TooltipProps {
  role?: 'tooltip'
}

interface TooltipAria {
  tooltipProps: AllHTMLAttributes<HTMLElement>
}

export function useTooltip(props: TooltipProps): TooltipAria {
  let {
    role
  } = props;
  return {
    tooltipProps: {
      role
    }
  };
}
