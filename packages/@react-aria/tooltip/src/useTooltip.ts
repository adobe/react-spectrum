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

  if (contextProps) {
    if (contextProps.onPointerLeave && contextProps.onPointerEnter) {
      tooltipProps.onPointerLeave = contextProps.onPointerLeave;
      tooltipProps.onPointerEnter = contextProps.onPointerEnter;
    }
    if (contextProps.onMouseLeave && contextProps.onMouseEnter) {
      tooltipProps.onMouseLeave = contextProps.onMouseLeave;
      tooltipProps.onMouseEnter = contextProps.onMouseEnter;
    }
  }

  return {
    tooltipProps
  };
}
