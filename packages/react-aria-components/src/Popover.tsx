import {DismissButton, FocusScope, mergeProps, OverlayContainer, useModal, useOverlay, useOverlayPosition} from 'react-aria';
import {OverlayTriggerState} from 'react-stately';
import {PositionProps} from '@react-types/overlays';
import React, {createContext, ForwardedRef, forwardRef, HTMLAttributes, ReactElement, RefObject, useContext} from 'react';
import {useContextProps, WithRef} from './utils';

interface PopoverProps extends Omit<PositionProps, 'isOpen'>, HTMLAttributes<HTMLElement> {
  /**
   * The ref for the element which the popover positions itself with respect to.
   */
  triggerRef?: RefObject<HTMLElement>,
  /**
   * Whether the popover is non-modal, i.e. elements outside the popover may be
   * interacted with by assistive technologies.
   */
  isNonModal?: boolean,

  children?: ReactElement
}

interface PopoverContextValue extends WithRef<PopoverProps, HTMLElement> {
  state?: OverlayTriggerState,
  preserveChildren?: boolean,
  restoreFocus?: boolean
}

export const PopoverContext = createContext<PopoverContextValue>(null);

function Popover(props: PopoverProps, ref: ForwardedRef<HTMLElement>) {
  [props, ref] = useContextProps(props, ref, PopoverContext);
  let {preserveChildren, restoreFocus = true, state} = useContext(PopoverContext) || {};

  if (state && !state.isOpen) {
    return preserveChildren ? props.children : null;
  }

  return (
    <OverlayContainer>
      <Overlay
        {...props}
        ref={ref}
        restoreFocus={restoreFocus}
        state={state} />
    </OverlayContainer>
  );
}

const _Popover = forwardRef(Popover);
export {_Popover as Popover};

function usePopover({
  triggerRef,
  placement = 'top',
  offset = 5,
  isNonModal
}: PopoverProps, state: OverlayTriggerState, ref: RefObject<HTMLElement>) {
  let {overlayProps} = useOverlay(
    {
      isOpen: state.isOpen,
      onClose: state.close,
      shouldCloseOnBlur: true,
      isDismissable: true
    },
    ref
  );

  let {overlayProps: positionProps} = useOverlayPosition({
    targetRef: triggerRef,
    overlayRef: ref,
    placement,
    offset,
    isOpen: state.isOpen
  });

  let {modalProps} = useModal({
    isDisabled: isNonModal || !state.isOpen
  });

  // TODO: useFocusScope

  return {
    popoverProps: mergeProps(overlayProps, positionProps, modalProps)
  };
}

const Overlay = forwardRef(({children, restoreFocus, className, style, state, ...props}: PopoverContextValue, ref: RefObject<HTMLElement>) => {
  let {popoverProps} = usePopover(props, state, ref);

  style = {...style, ...popoverProps.style};

  return (
    <FocusScope restoreFocus={restoreFocus}>
      <div
        {...popoverProps}
        ref={ref as RefObject<HTMLDivElement>}
        className={className}
        style={style}>
        <DismissButton onDismiss={state.close} />
        {children}
        <DismissButton onDismiss={state.close} />
      </div>
    </FocusScope>
  );
});
