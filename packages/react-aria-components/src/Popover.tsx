import {AriaPopoverProps, Overlay, usePopover} from '@react-aria/overlays';
import {DismissButton} from 'react-aria';
import {OverlayArrowContext} from './OverlayArrow';
import {OverlayTriggerState} from 'react-stately';
import {PlacementAxis, PositionProps} from '@react-types/overlays';
import React, {createContext, ForwardedRef, forwardRef, ReactElement, RefObject, useContext} from 'react';
import {RenderProps, useContextProps, useEnterAnimation, useExitAnimation, useRenderProps, WithRef} from './utils';

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
  placement: PlacementAxis,
  /**
   * Whether the popover is currently entering. Use this to apply animations.
   * @selector [data-entering]
   */
  isEntering: boolean,
  /**
   * Whether the popover is currently exiting. Use this to apply animations.
   * @selector [data-exiting]
   */
  isExiting: boolean
}

interface PopoverContextValue extends WithRef<PopoverProps, HTMLElement> {
  state?: OverlayTriggerState,
  preserveChildren?: boolean
}

export const PopoverContext = createContext<PopoverContextValue>(null);

function Popover(props: PopoverProps, ref: ForwardedRef<HTMLElement>) {
  [props, ref] = useContextProps(props, ref, PopoverContext);
  let {preserveChildren, state} = useContext(PopoverContext) || {};
  let isExiting = useExitAnimation(ref, state.isOpen);

  if (state && !state.isOpen && !isExiting) {
    return preserveChildren ? props.children as ReactElement : null;
  }

  return (
    <PopoverInner 
      {...props}
      triggerRef={props.triggerRef}
      state={state}
      popoverRef={ref}
      isExiting={isExiting} />
  );
}

/**
 * A popover is an overlay element positioned relative to a trigger.
 */
const _Popover = forwardRef(Popover);
export {_Popover as Popover};

interface PopoverInnerProps extends AriaPopoverProps, RenderProps<PopoverRenderProps> {
  state: OverlayTriggerState,
  isExiting: boolean
}

function PopoverInner({children, state, isExiting, ...props}: PopoverInnerProps) {
  let {popoverProps, arrowProps, placement} = usePopover({
    ...props,
    offset: props.offset ?? 8
  }, state);

  let ref = props.popoverRef as RefObject<HTMLDivElement>;
  let isEntering = useEnterAnimation(ref, !!placement);
  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-Popover',
    values: {
      placement,
      isEntering,
      isExiting
    }
  });

  let style = {...renderProps.style, ...popoverProps.style};

  return (
    <Overlay>
      <div
        {...popoverProps}
        {...renderProps}
        ref={ref}
        style={style}
        data-placement={placement}
        data-entering={isEntering || undefined}
        data-exiting={isExiting || undefined}>
        <DismissButton onDismiss={state.close} />
        <OverlayArrowContext.Provider value={{arrowProps, placement}}>
          {children}
        </OverlayArrowContext.Provider>
        <DismissButton onDismiss={state.close} />
      </div>
    </Overlay>
  );
}
