import {mergeProps} from '@react-aria/utils';
import {PlacementAxis} from '@react-types/overlays';
import React, {createContext, CSSProperties, ForwardedRef, forwardRef, HTMLAttributes, useContext} from 'react';

interface OverlayArrowContextValue {
  arrowProps: HTMLAttributes<HTMLElement>,
  placement: PlacementAxis
}

export const OverlayArrowContext = createContext<OverlayArrowContextValue>(null);

function OverlayArrow(props: HTMLAttributes<HTMLDivElement>, ref: ForwardedRef<HTMLDivElement>) {
  let {arrowProps, placement} = useContext(OverlayArrowContext);
  let style: CSSProperties = {
    ...arrowProps.style,
    position: 'absolute',
    [placement]: '100%',
    transform: placement === 'top' || placement === 'bottom' ? 'translateX(-50%)' : 'translateY(-50%)',
    ...props.style
  };
  
  return (
    <div
      {...mergeProps(arrowProps, props)}
      style={style}
      className={props.className ?? 'react-aria-OverlayArrow'}
      ref={ref} />
  );
}

const _OverlayArrow = forwardRef(OverlayArrow);
export {_OverlayArrow as OverlayArrow};
