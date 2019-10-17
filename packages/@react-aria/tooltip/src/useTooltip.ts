import {AllHTMLAttributes, RefObject} from 'react';

interface TooltipProps {
  ref: RefObject<HTMLElement | null>,
  role?: 'tooltip'
}

interface TooltipAria {
  tooltipProps: AllHTMLAttributes<HTMLElement>
}

export function useTooltip(props: TooltipProps): TooltipProps {

  let {
    ref,
    role
  } = props;

  return {
    ref,
    role 
  };

}
