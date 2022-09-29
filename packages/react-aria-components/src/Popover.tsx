import {AriaPopoverProps, Overlay, usePopover} from '@react-aria/overlays';
import {DismissButton} from 'react-aria';
import {OverlayArrowContext} from './OverlayArrow';
import {OverlayTriggerState} from 'react-stately';
import {PlacementAxis, PositionProps} from '@react-types/overlays';
import React, {createContext, ForwardedRef, forwardRef, ReactElement, RefObject, useContext} from 'react';
import {RenderProps, useContextProps, useRenderProps, WithRef} from './utils';

interface PopoverProps extends Omit<PositionProps, 'isOpen'>, Omit<AriaPopoverProps, 'popoverRef' | 'triggerRef'>, RenderProps<PopoverRenderProps> {
  /**
   * The ref for the element which the popover positions itself with respect to.
   * 
   * When used within a trigger component such as DialogTrigger, MenuTrigger, Select, etc., 
   * this is set automatically. It is only required when used standalone.
   */
  triggerRef?: RefObject<Element>
}

export interface PopoverRenderProps {
  /**
   * The placement of the tooltip relative to the trigger.
   * @selector [data-placement="left | right | top | bottom"]
   */
  placement: PlacementAxis
}

interface PopoverContextValue extends WithRef<PopoverProps, HTMLElement> {
  state?: OverlayTriggerState,
  preserveChildren?: boolean
}

export const PopoverContext = createContext<PopoverContextValue>(null);

function Popover(props: PopoverProps, ref: ForwardedRef<HTMLElement>) {
  [props, ref] = useContextProps(props, ref, PopoverContext);
  let {preserveChildren, state} = useContext(PopoverContext) || {};

  if (state && !state.isOpen) {
    return preserveChildren ? props.children as ReactElement : null;
  }

  return <PopoverInner {...props} triggerRef={props.triggerRef} state={state} popoverRef={ref} />;
}

const _Popover = forwardRef(Popover);
export {_Popover as Popover};

interface PopoverInnerProps extends AriaPopoverProps, RenderProps<PopoverRenderProps> {
  state: OverlayTriggerState
}

function PopoverInner({children, state, ...props}: PopoverInnerProps) {
  let {popoverProps, arrowProps, placement} = usePopover({
    ...props,
    offset: props.offset ?? 8
  }, state);

  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-Popover',
    values: {
      placement
    }
  });

  let style = {...renderProps.style, ...popoverProps.style};

  return (
    <Overlay>
      <div
        {...popoverProps}
        {...renderProps}
        ref={props.popoverRef as RefObject<HTMLDivElement>}
        style={style}
        data-placement={placement}>
        <DismissButton onDismiss={state.close} />
        <OverlayArrowContext.Provider value={{arrowProps, placement}}>
          {children}
        </OverlayArrowContext.Provider>
        <DismissButton onDismiss={state.close} />
      </div>
    </Overlay>
  );
}
