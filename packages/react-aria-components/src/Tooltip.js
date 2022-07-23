import {useRef, createContext, useContext} from 'react';
import {useTooltipTriggerState} from 'react-stately';
import {useTooltipTrigger, useTooltip, useOverlayPosition, OverlayContainer, mergeProps} from 'react-aria';
import {FocusableProvider} from '@react-aria/focus';
import {useRenderProps} from './utils';

const TooltipContext = createContext();

export function TooltipTrigger(props) {
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

export function Tooltip(props) {
  let {state} = useContext(TooltipContext);
  if (!state.isOpen) {
    return null;
  }
  
  return (
    <OverlayContainer>
      <TooltipInner {...props} />
    </OverlayContainer>
  )
}

function TooltipInner(props) {
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
    <div {...tooltipProps} ref={overlayRef} {...renderProps} style={{...renderProps.style, ...overlayProps.style}} />
  );
}

export function Arrow(props) {
  let {arrowProps, placement} = useContext(TooltipContext);
  let style = {
    ...arrowProps.style,
    position: 'absolute',
    [placement]: '100%',
    ...props.style
  };
  
  return (
    <div {...arrowProps} style={style} className={props.className}>{props.children}</div>
  );
}
