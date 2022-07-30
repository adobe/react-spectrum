import {AriaLabelingProps, DOMAttributes} from '@react-types/shared';
import {DOMProps, useRenderProps} from './utils';
import {FocusableProvider} from '@react-aria/focus';
import {mergeProps, OverlayContainer, useOverlayPosition, useTooltip, useTooltipTrigger} from 'react-aria';
import {mergeRefs} from '@react-aria/utils';
import {PlacementAxis, PositionProps} from '@react-types/overlays';
import React, {createContext, CSSProperties, ForwardedRef, forwardRef, HTMLAttributes, ReactNode, RefObject, useContext, useRef} from 'react';
import {TooltipTriggerProps, TooltipTriggerState, useTooltipTriggerState} from 'react-stately';

interface TooltipTriggerComponentProps extends TooltipTriggerProps, PositionProps {
  children: ReactNode
}

interface TooltipProps extends DOMProps, AriaLabelingProps {}

interface TooltipContextValue {
  state: TooltipTriggerState,
  overlayRef: RefObject<HTMLDivElement>,
  overlayProps: DOMAttributes,
  tooltipProps: DOMAttributes,
  arrowProps: DOMAttributes,
  placement: PlacementAxis
}

const TooltipContext = createContext<TooltipContextValue>(null);

export function TooltipTrigger(props: TooltipTriggerComponentProps) {
  let state = useTooltipTriggerState(props);
  let ref = useRef();
  let {triggerProps, tooltipProps} = useTooltipTrigger(props, state, ref);
  
  let overlayRef = useRef();
  let {overlayProps, arrowProps, placement} = useOverlayPosition({
    placement: props.placement || 'top',
    targetRef: ref,
    overlayRef,
    offset: props.offset,
    crossOffset: props.crossOffset,
    isOpen: state.isOpen
  });
  
  return (
    <TooltipContext.Provider value={{state, overlayProps, overlayRef, tooltipProps, arrowProps, placement}}>
      <FocusableProvider {...triggerProps} ref={ref}>
        {props.children}
      </FocusableProvider>
    </TooltipContext.Provider>
  );
}

function Tooltip(props: TooltipProps, ref: ForwardedRef<HTMLDivElement>) {
  let {state} = useContext(TooltipContext);
  if (!state.isOpen) {
    return null;
  }
  
  return (
    <OverlayContainer>
      <TooltipInner {...props} tooltipRef={ref} />
    </OverlayContainer>
  );
}

const _Tooltip = forwardRef(Tooltip);
export {_Tooltip as Tooltip};

function TooltipInner(props: TooltipProps & {tooltipRef: ForwardedRef<HTMLDivElement>}) {
  let {state, overlayRef, overlayProps, placement} = useContext(TooltipContext);

  let renderProps = useRenderProps({
    ...props,
    values: {
      placement
    }
  });
  
  props = mergeProps(props, overlayProps);
  let {tooltipProps} = useTooltip(props, state);
    
  return (
    <div {...tooltipProps} ref={mergeRefs(overlayRef, props.tooltipRef)} {...renderProps} style={{...renderProps.style, ...overlayProps.style}} />
  );
}

function TooltipArrow(props: HTMLAttributes<HTMLDivElement>, ref: ForwardedRef<HTMLDivElement>) {
  let {arrowProps, placement} = useContext(TooltipContext);
  let style: CSSProperties = {
    ...arrowProps.style,
    position: 'absolute',
    [placement]: '100%',
    ...props.style
  };
  
  return <div {...mergeProps(arrowProps, props)} style={style} ref={ref} />;
}

const _TooltipArrow = forwardRef(TooltipArrow);
export {_TooltipArrow as TooltipArrow};
