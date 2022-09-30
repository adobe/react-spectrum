import {AriaModalOverlayProps, Overlay, useModalOverlay} from '@react-aria/overlays';
import {DOMAttributes} from '@react-types/shared';
import {DOMProps} from './utils';
import {mergeRefs} from '@react-aria/utils';
import {OverlayTriggerProps, OverlayTriggerState, useOverlayTriggerState} from 'react-stately';
import React, {createContext, ForwardedRef, forwardRef, RefObject, useContext, useMemo, useRef} from 'react';

interface ModalOverlayProps extends AriaModalOverlayProps, OverlayTriggerProps, DOMProps {}

interface ModalContextValue {
  state?: OverlayTriggerState
}

interface InternalModalContextValue {
  modalProps: DOMAttributes,
  modalRef: RefObject<HTMLDivElement>
}

export const ModalContext = createContext<ModalContextValue>(null);
const InternalModalContext = createContext<InternalModalContextValue>(null);

function Modal(props: ModalOverlayProps, ref: ForwardedRef<HTMLDivElement>) {
  let ctx = useContext(InternalModalContext);

  if (ctx) {
    return <ModalContent {...props} modalRef={ref}>{props.children}</ModalContent>;
  }

  let {className, style, ...otherProps} = props;
  
  return (
    <ModalOverlay {...otherProps}>
      <ModalContent className={className} style={style} modalRef={ref}>
        {props.children}
      </ModalContent>
    </ModalOverlay>
  );
}

interface ModalOverlayInnerProps extends ModalOverlayProps {
  overlayRef: ForwardedRef<HTMLDivElement>
}

const _Modal = forwardRef(Modal);
export {_Modal as Modal};

export const ModalOverlay = forwardRef((props: ModalOverlayProps, ref: ForwardedRef<HTMLDivElement>) => {
  let ctx = useContext(ModalContext);
  let isOpen = props.isOpen ?? ctx?.state?.isOpen;
  if (!isOpen) {
    return null;
  }

  return <ModalOverlayInner {...props} overlayRef={ref} />;
});

function ModalOverlayInner(props: ModalOverlayInnerProps) {
  let ctx = useContext(ModalContext);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  let state = ctx?.state ?? useOverlayTriggerState(props);
  let modalRef = useRef(null);
  let {modalProps, underlayProps} = useModalOverlay(props, state, modalRef);
  
  return (
    <Overlay>
      <div
        {...underlayProps}
        ref={props.overlayRef}
        style={props.style}
        className={props.className ?? 'react-aria-ModalOverlay'}>
        <InternalModalContext.Provider value={{modalProps, modalRef}}>
          {props.children}
        </InternalModalContext.Provider>
      </div>
    </Overlay>
  );
}

interface ModalContentProps extends DOMProps {
  modalRef: ForwardedRef<HTMLDivElement>
}

function ModalContent(props: ModalContentProps) {
  let {modalProps, modalRef} = useContext(InternalModalContext);
  let mergedRefs = useMemo(() => mergeRefs(props.modalRef, modalRef), [props.modalRef, modalRef]);

  return (
    <div 
      {...modalProps}
      ref={mergedRefs}
      className={props.className ?? 'react-aria-Modal'}
      style={props.style}>
      {props.children}
    </div>
  );
}
