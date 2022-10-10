import {AriaLabelingProps, DOMAttributes} from '@react-types/shared';
import {FocusableProvider} from '@react-aria/focus';
import {mergeProps, OverlayContainer, useOverlayPosition, useTooltip, useTooltipTrigger} from 'react-aria';
import {mergeRefs, useObjectRef} from '@react-aria/utils';
import {OverlayArrowContext} from './OverlayArrow';
import {PlacementAxis, PositionProps} from '@react-types/overlays';
import React, {createContext, ForwardedRef, forwardRef, ReactNode, RefObject, useContext, useRef} from 'react';
import {RenderProps, useEnterAnimation, useExitAnimation, useRenderProps} from './utils';
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
  placement: PlacementAxis,
  /**
   * Whether the tooltip is currently entering. Use this to apply animations.
   * @selector [data-entering]
   */
  isEntering: boolean,
  /**
   * Whether the tooltip is currently exiting. Use this to apply animations.
   * @selector [data-exiting]
   */
  isExiting: boolean
}

interface TooltipContextValue {
  state: TooltipTriggerState,
  triggerRef: RefObject<HTMLDivElement>,
  tooltipProps: DOMAttributes
}

const TooltipContext = createContext<TooltipContextValue>(null);

/**
 * TooltipTrigger wraps around a trigger element and a Tooltip. It handles opening and closing
 * the Tooltip when the user hovers over or focuses the trigger, and positioning the Tooltip
 * relative to the trigger.
 */
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
  let objectRef = useObjectRef(ref);
  let isExiting = useExitAnimation(objectRef, state.isOpen);
  if (!state.isOpen && !isExiting) {
    return null;
  }
  
  return (
    <OverlayContainer>
      <TooltipInner {...props} tooltipRef={objectRef} isExiting={isExiting} />
    </OverlayContainer>
  );
}

/**
 * A tooltip displays a description of an element on hover or focus.
 */
const _Tooltip = forwardRef(Tooltip);
export {_Tooltip as Tooltip};

function TooltipInner(props: TooltipProps & {isExiting: boolean, tooltipRef: ForwardedRef<HTMLDivElement>}) {
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

  let isEntering = useEnterAnimation(overlayRef, !!placement);
  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-Tooltip',
    values: {
      placement,
      isEntering,
      isExiting: props.isExiting
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
      data-placement={placement}
      data-entering={isEntering || undefined}
      data-exiting={props.isExiting || undefined}>
      <OverlayArrowContext.Provider value={{arrowProps, placement}}>
        {renderProps.children}
      </OverlayArrowContext.Provider>
    </div>
  );
}
