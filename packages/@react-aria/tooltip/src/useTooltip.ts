import {AllHTMLAttributes, useContext} from 'react';
import {useId, mergeProps} from '@react-aria/utils';
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

  let contextProps = useContext(TooltipHoverResponderContext)|| {};

  // let {
  //   isOverTooltip = false, // add to the context interace so you can pull this out as a default?
  //   ...contextProps
  // } = useContext(TooltipHoverResponderContext)|| {};

  let onMouseLeave = (e) => {
    // @ts-ignore
    if (contextProps.isOverTooltip) {
      // @ts-ignore
      contextProps.isOverTooltip(false)
    }
  }

  let {
    role = 'tooltip'
  } = mergeProps(contextProps, props);

  return {
    tooltipProps: {
      'aria-describedby': tooltipId,
      role,
      id: tooltipId,
      onMouseLeave: onMouseLeave
    }
  };




  // let contextProps = useContext(TooltipHoverResponderContext);
  //
  // let tooltipId = useId(props.id);
  //
  // let {
  //   role = 'tooltip'
  // } = props;
  //
  // // put these things in props using the equal sign and in the interace as well?
  // let tooltipProps: {
  //   'aria-describedby': tooltipId,
  //   role,
  //   id: tooltipId
  // }
  //
  // if (contextProps) {
  //   let onMouseLeave = (e) => {
  //     if (contextProps.isOverTooltip) {
  //       contextProps.isOverTooltip(false)
  //     }
  //   }
  //   // conditionally adding
  //   tooltipProps.onMouseLeave = onMouseLeave
  // }
  //
  //
  // return {tooltipProps}








}
