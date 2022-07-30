import {AriaOverlayProps, mergeProps, OverlayContainer, useModal, useOverlay, usePreventScroll} from 'react-aria';
import {DOMAttributes} from '@react-types/shared';
import {DOMProps} from './utils';
import {mergeRefs} from '@react-aria/utils';
import {OverlayTriggerState} from 'react-stately';
import React, {createContext, ForwardedRef, forwardRef, HTMLAttributes, RefObject, useContext, useRef} from 'react';

interface ModalOverlayProps extends Omit<AriaOverlayProps, 'isOpen' | 'onClose'>, DOMProps {}

interface ModalContextValue {
  state?: OverlayTriggerState
}

interface InternalModalContextValue {
  overlayProps: DOMAttributes,
  overlayRef: RefObject<HTMLDivElement>,
  underlayProps: DOMAttributes
}

export const ModalContext = createContext<ModalContextValue>(null);
const InternalModalContext = createContext<InternalModalContextValue>(null);

function ModalOverlay(props: ModalOverlayProps, ref: ForwardedRef<HTMLDivElement>) {
  let {state} = useContext(ModalContext);
  if (!state.isOpen) {
    return null;
  }
  
  return (
    <OverlayContainer>
      <ModalInner {...props} underlayRef={ref} />
    </OverlayContainer>
  );
}

const _ModalOverlay = forwardRef(ModalOverlay);
export {_ModalOverlay as ModalOverlay};

function useModalOverlay(props: ModalOverlayProps, state, ref) {
  let {overlayProps, underlayProps} = useOverlay({
    ...props,
    isOpen: state.isOpen,
    onClose: state.close,
    isDismissable: true
  }, ref);

  let {modalProps} = useModal({
    isDisabled: !state.isOpen
  });

  usePreventScroll({
    isDisabled: !state.isOpen
  });

  return {
    overlayProps: mergeProps(overlayProps, modalProps),
    underlayProps
  };
}

function ModalInner(props: ModalOverlayProps & {underlayRef: ForwardedRef<HTMLDivElement>}) {    
  let {state} = useContext(ModalContext);
  let overlayRef = useRef();
  let {overlayProps, underlayProps} = useModalOverlay(props, state, overlayRef);
  
  return (
    <div {...underlayProps} style={props.style} className={props.className}>
      <InternalModalContext.Provider
        value={{
          overlayProps,
          overlayRef,
          underlayProps
        }}>
        {props.children}
      </InternalModalContext.Provider>
    </div>
  );
}

function Modal(props: HTMLAttributes<HTMLElement>, ref: ForwardedRef<HTMLDivElement>) {
  let {overlayProps, overlayRef} = useContext(InternalModalContext);
  return <div {...mergeProps(overlayProps, props)} ref={mergeRefs(overlayRef, ref)} />;
}

const _Modal = forwardRef(Modal);
export {_Modal as Modal};
