'use client';
import {Overlay} from 'react-aria/Overlay';
import {useOverlayPosition} from 'react-aria/useOverlayPosition';
import {useTooltip, useTooltipTrigger, type TooltipTriggerProps} from 'react-aria/useTooltipTrigger';
import {FocusableProvider} from 'react-aria/private/interactions/useFocusable';
import {useTooltipTriggerState} from 'react-stately/useTooltipTriggerState';
import {useRef} from 'react';
import type {ReactElement, ReactNode} from 'react';
import './Button.css';
import './Tooltip.css';

interface TooltipProps {
  children?: ReactNode;
  state: ReturnType<typeof useTooltipTriggerState>;
  triggerRef: React.RefObject<HTMLElement | null>;
}

function Tooltip({children, state, triggerRef, ...props}: TooltipProps) {
  let tooltipRef = useRef<HTMLDivElement>(null);
  let {overlayProps, placement} = useOverlayPosition({
    placement: 'top',
    targetRef: triggerRef,
    overlayRef: tooltipRef,
    isOpen: state.isOpen
  });
  let {tooltipProps} = useTooltip(props, state);

  if (!state.isOpen) {
    return null;
  }

  return (
    <Overlay>
      <div
        {...overlayProps}
        {...tooltipProps}
        ref={tooltipRef}
        className="react-aria-Tooltip"
        data-placement={placement}>
        {children}
      </div>
    </Overlay>
  );
}

export function TooltipTrigger(
  props: TooltipTriggerProps & {children: ReactElement, tooltip: ReactNode}
) {
  let state = useTooltipTriggerState(props);
  let ref = useRef<HTMLElement>(null);
  let {triggerProps, tooltipProps} = useTooltipTrigger(props, state, ref);

  return (
    <>
      <FocusableProvider {...triggerProps} ref={ref}>
        {props.children}
      </FocusableProvider>
      <Tooltip {...tooltipProps} state={state} triggerRef={ref}>
        {props.tooltip}
      </Tooltip>
    </>
  );
}
