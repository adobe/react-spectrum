import {mergeProps} from '@react-aria/utils';
import {PlacementAxis} from '@react-types/overlays';
import React, {createContext, CSSProperties, ForwardedRef, forwardRef, HTMLAttributes, useContext} from 'react';
import {RenderProps, useRenderProps} from './utils';

interface OverlayArrowContextValue {
  arrowProps: HTMLAttributes<HTMLElement>,
  placement: PlacementAxis
}

export const OverlayArrowContext = createContext<OverlayArrowContextValue>(null);

export interface OverlayArrowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'style' | 'children'>, RenderProps<OverlayArrowRenderProps> {}

export interface OverlayArrowRenderProps {
  /**
   * The placement of the overlay relative to the trigger.
   * @selector [data-placement="left | right | top | bottom"]
   */
  placement: PlacementAxis
}

function OverlayArrow(props: OverlayArrowProps, ref: ForwardedRef<HTMLDivElement>) {
  let {arrowProps, placement} = useContext(OverlayArrowContext);
  let style: CSSProperties = {
    ...arrowProps.style,
    position: 'absolute',
    [placement]: '100%',
    transform: placement === 'top' || placement === 'bottom' ? 'translateX(-50%)' : 'translateY(-50%)'
  };

  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-OverlayArrow',
    values: {
      placement
    }
  });
  
  return (
    <div
      {...mergeProps(arrowProps, props)}
      {...renderProps}
      style={{
        ...renderProps.style,
        ...style
      }}
      ref={ref}
      data-placement={placement} />
  );
}

/**
 * An OverlayArrow renders a custom arrow element relative to an overlay element
 * such as a popover or tooltip such that it aligns with a trigger element.
 */
const _OverlayArrow = forwardRef(OverlayArrow);
export {_OverlayArrow as OverlayArrow};
