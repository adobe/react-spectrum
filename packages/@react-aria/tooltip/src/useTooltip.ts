import {AllHTMLAttributes, useContext} from 'react';
import {useId} from '@react-aria/utils';
import {TooltipHoverProps, TooltipHoverResponderContext, useTooltipHover} from '@react-aria/interactions';
import {DOMProps} from '@react-types/shared';

interface TooltipProps extends DOMProps {
  role?: 'tooltip'
}

interface TooltipAria {
  tooltipProps: AllHTMLAttributes<HTMLElement>
}

export function useTooltip(props: TooltipProps): TooltipAria {
  let tooltipId = useId(props.id);

  // Grab props from contextProps
  let props1 = useContext(TooltipHoverResponderContext) || {};
  console.log('context props', props1)
  let onMouseLeave = (e) => {
    console.log('isOverTooltip', props1.isOverTooltip);
    if (props1.isOverTooltip) {
      props1.isOverTooltip(false)
    }
    console.log('leaving tooltip')
  }

  // let {hoverProps} = useTooltipHover({
  //   ref
  // });


  // in design review ask: when the tooltip opens, focus the tooltip? so that the esc key works on there as well 

  let {
    role = 'tooltip'

  } = props;

  return {
    tooltipProps: {
      'aria-describedby': tooltipId,
      role,
      id: tooltipId,
      onMouseLeave: onMouseLeave
    }
  };
}
