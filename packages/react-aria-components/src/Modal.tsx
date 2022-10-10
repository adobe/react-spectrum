import {AriaModalOverlayProps, Overlay, useModalOverlay} from '@react-aria/overlays';
import {DOMAttributes} from '@react-types/shared';
import {mergeRefs, useObjectRef} from '@react-aria/utils';
import {OverlayTriggerProps, OverlayTriggerState, useOverlayTriggerState} from 'react-stately';
import React, {createContext, ForwardedRef, forwardRef, RefObject, useContext, useMemo, useRef} from 'react';
import {RenderProps, useEnterAnimation, useExitAnimation, useRenderProps} from './utils';

interface ModalOverlayProps extends AriaModalOverlayProps, OverlayTriggerProps, RenderProps<ModalRenderProps> {}

interface ModalContextValue {
  state?: OverlayTriggerState
}

interface InternalModalContextValue {
  modalProps: DOMAttributes,
  modalRef: RefObject<HTMLDivElement>,
  isExiting: boolean
}

export const ModalContext = createContext<ModalContextValue>(null);
const InternalModalContext = createContext<InternalModalContextValue>(null);

export interface ModalRenderProps {
  /**
   * Whether the modal is currently entering. Use this to apply animations.
   * @selector [data-entering]
   */
  isEntering: boolean,
  /**
   * Whether the modal is currently exiting. Use this to apply animations.
   * @selector [data-exiting]
   */
  isExiting: boolean
}

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
  overlayRef: RefObject<HTMLDivElement>,
  modalRef: RefObject<HTMLDivElement>,
  state: OverlayTriggerState,
  isExiting: boolean
}

/**
 * A modal is an overlay element which blocks interaction with elements outside it.
 */
const _Modal = forwardRef(Modal);
export {_Modal as Modal};

/**
 * A ModalOverlay is a wrapper for a Modal which allows customizing the backdrop element.
 */
export const ModalOverlay = forwardRef((props: ModalOverlayProps, ref: ForwardedRef<HTMLDivElement>) => {
  let ctx = useContext(ModalContext);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  let state = ctx?.state ?? useOverlayTriggerState(props);

  let objectRef = useObjectRef(ref);
  let modalRef = useRef(null);
  let isOverlayExiting = useExitAnimation(objectRef, state.isOpen);
  let isModalExiting = useExitAnimation(modalRef, state.isOpen);
  let isExiting = isOverlayExiting || isModalExiting;

  if (!state.isOpen && !isExiting) {
    return null;
  }

  return (
    <ModalOverlayInner
      {...props}
      state={state}
      isExiting={isExiting}
      overlayRef={objectRef}
      modalRef={modalRef} />
  );
});

function ModalOverlayInner(props: ModalOverlayInnerProps) {
  let modalRef = props.modalRef;
  let {modalProps, underlayProps} = useModalOverlay(props, props.state, modalRef);

  let entering = useEnterAnimation(props.overlayRef);
  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-ModalOverlay',
    values: {
      isEntering: entering,
      isExiting: props.isExiting
    }
  });
  
  return (
    <Overlay>
      <div
        {...underlayProps}
        {...renderProps}
        ref={props.overlayRef}
        data-entering={entering || undefined}
        data-exiting={props.isExiting || undefined}>
        <InternalModalContext.Provider value={{modalProps, modalRef, isExiting: props.isExiting}}>
          {renderProps.children}
        </InternalModalContext.Provider>
      </div>
    </Overlay>
  );
}

interface ModalContentProps extends RenderProps<ModalRenderProps> {
  modalRef: ForwardedRef<HTMLDivElement>
}

function ModalContent(props: ModalContentProps) {
  let {modalProps, modalRef, isExiting} = useContext(InternalModalContext);
  let mergedRefs = useMemo(() => mergeRefs(props.modalRef, modalRef), [props.modalRef, modalRef]);

  let ref = useObjectRef(mergedRefs);
  let entering = useEnterAnimation(ref);
  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-Modal',
    values: {
      isEntering: entering,
      isExiting
    }
  });

  return (
    <div 
      {...modalProps}
      {...renderProps}
      ref={ref}
      data-entering={entering || undefined}
      data-exiting={isExiting || undefined}>
      {renderProps.children}
    </div>
  );
}
