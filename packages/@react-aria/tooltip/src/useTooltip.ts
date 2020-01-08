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
    console.log('context props', contextProps)
    let onMouseLeave = () => {
      if (contextProps.onHoverTooltip) {
        contextProps.onHoverTooltip(false);
      }
    };
    let onMouseEnter = () => {
      console.log('fawefaweg')
      // this is faster than theDelayHide .... you need to block it right here 
    }
    tooltipProps.onMouseLeave = onMouseLeave;
    tooltipProps.onMouseEnter = onMouseEnter;
  }

  // onMouseEnter to override the delayHide?

  return {
    tooltipProps
  };
}
