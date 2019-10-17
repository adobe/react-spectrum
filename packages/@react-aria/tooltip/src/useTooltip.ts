import {AllHTMLAttributes, RefObject, useEffect} from 'react';

interface TooltipProps {
  ref: RefObject<HTMLElement | null>,
  role?: 'tooltip'
}

interface TooltipAria {
  tooltipProps: AllHTMLAttributes<HTMLElement>
}

export function useTooltip({ref, role = 'tooltip'}: TooltipProps): TooltipAria {
  return {
    tooltipProps: {
      role
    }
  };
}
