import {AllHTMLAttributes, useContext} from 'react';
import {DOMProps} from '@react-types/shared';
import {TooltipHoverResponderContext} from '@react-aria/interactions';
import {useId} from '@react-aria/utils';

interface TooltipProps extends DOMProps {
  role?: 'tooltip'
}

interface TooltipAria {
  tooltipProps: AllHTMLAttributes<HTMLElement>
}

interface useTooltipProps {
  'aria-describedby': string,
  role: string,
  id: string,
  onMouseLeave?: (e) => void
}

export function useTooltip(props: TooltipProps): TooltipAria {

  let contextProps = useContext(TooltipHoverResponderContext);

  let tooltipId = useId(props.id);

  let {
    role = 'tooltip'
  } = props;

  let tooltipProps = {
    'aria-describedby': tooltipId,
    role,
    id: tooltipId
  } as useTooltipProps;

  if (contextProps) {
    let onMouseLeave = () => {
      if (contextProps.isOverTooltip) {
        contextProps.isOverTooltip(false);
      }
    };
    tooltipProps.onMouseLeave = onMouseLeave;
  }

  return {
    tooltipProps
  };

}
