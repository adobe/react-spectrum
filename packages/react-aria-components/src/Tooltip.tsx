import {AriaLabelingProps, DOMAttributes} from '@react-types/shared';
import {FocusableProvider} from '@react-aria/focus';
import {mergeProps, OverlayContainer, useOverlayPosition, useTooltip, useTooltipTrigger} from 'react-aria';
import {mergeRefs} from '@react-aria/utils';
import {OverlayArrowContext} from './OverlayArrow';
import {PlacementAxis, PositionProps} from '@react-types/overlays';
import React, {createContext, ForwardedRef, forwardRef, ReactNode, RefObject, useContext, useRef} from 'react';
import {RenderProps, useRenderProps} from './utils';
import {TooltipTriggerProps, TooltipTriggerState, useTooltipTriggerState} from 'react-stately';

interface TooltipTriggerComponentProps extends TooltipTriggerProps {
  children: ReactNode
}

interface TooltipProps extends PositionProps, AriaLabelingProps, RenderProps<TooltipRenderProps> {}

export interface TooltipRenderProps {
  /**
   * The placement of the tooltip relative to the trigger.
   * @selector [data-placement="left | right | top | bottom"]
   */
  placement: PlacementAxis
}

interface TooltipContextValue {
  state: TooltipTriggerState,
  triggerRef: RefObject<HTMLDivElement>,
  tooltipProps: DOMAttributes
}

const TooltipContext = createContext<TooltipContextValue>(null);

export function TooltipTrigger(props: TooltipTriggerComponentProps) {
  let state = useTooltipTriggerState(props);
  let ref = useRef();
  let {triggerProps, tooltipProps} = useTooltipTrigger(props, state, ref);
    
  return (
    <TooltipContext.Provider value={{state, triggerRef: ref, tooltipProps}}>
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
  let {state, triggerRef} = useContext(TooltipContext);

  let overlayRef = useRef();
  let {overlayProps, arrowProps, placement} = useOverlayPosition({
    placement: props.placement || 'top',
    targetRef: triggerRef,
    overlayRef,
    offset: props.offset,
    crossOffset: props.crossOffset,
    isOpen: state.isOpen
  });


  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-Tooltip',
    values: {
      placement
    }
  });
  
  props = mergeProps(props, overlayProps);
  let {tooltipProps} = useTooltip(props, state);
    
  return (
    <div 
      {...tooltipProps}
      ref={mergeRefs(overlayRef, props.tooltipRef)}
      {...renderProps}
      style={{...renderProps.style, ...overlayProps.style}}
      data-placement={placement}>
      <OverlayArrowContext.Provider value={{arrowProps, placement}}>
        {renderProps.children}
      </OverlayArrowContext.Provider>
    </div>
  );
}
