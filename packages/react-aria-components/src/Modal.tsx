/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaModalOverlayProps, DismissButton, Overlay, useModalOverlay} from 'react-aria';
import {DOMAttributes} from '@react-types/shared';
import {filterDOMProps, mergeProps} from '@react-aria/utils';
import {mergeRefs, useObjectRef, useViewportSize} from '@react-aria/utils';
import {OverlayTriggerProps, OverlayTriggerState, useOverlayTriggerState} from 'react-stately';
import React, {createContext, ForwardedRef, forwardRef, RefObject, useContext, useMemo, useRef} from 'react';
import {RenderProps, useEnterAnimation, useExitAnimation, useRenderProps} from './utils';

export interface ModalOverlayProps extends AriaModalOverlayProps, OverlayTriggerProps, RenderProps<ModalRenderProps> {}

interface ModalContextValue {
  state?: OverlayTriggerState
}

interface InternalModalContextValue {
  modalProps: DOMAttributes,
  modalRef: RefObject<HTMLDivElement>,
  isExiting: boolean,
  isDismissable?: boolean,
  state: OverlayTriggerState
}

export const ModalContext = createContext<ModalContextValue | null>(null);
const InternalModalContext = createContext<InternalModalContextValue | null>(null);

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

  let {
    isDismissable,
    isKeyboardDismissDisabled,
    isOpen,
    defaultOpen,
    onOpenChange,
    children,
    ...otherProps
  } = props;

  return (
    <ModalOverlay
      isDismissable={isDismissable}
      isKeyboardDismissDisabled={isKeyboardDismissDisabled}
      isOpen={isOpen}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}>
      <ModalContent {...otherProps} modalRef={ref}>
        {children}
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
  let modalRef = useRef<HTMLDivElement>(null);
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
  let {state} = props;
  let {modalProps, underlayProps} = useModalOverlay(props, state, modalRef);

  let entering = useEnterAnimation(props.overlayRef);
  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-ModalOverlay',
    values: {
      isEntering: entering,
      isExiting: props.isExiting
    }
  });

  let viewport = useViewportSize();
  let style = {
    ...renderProps.style,
    '--visual-viewport-height': viewport.height + 'px'
  };

  return (
    <Overlay>
      <div
        {...mergeProps(filterDOMProps(props as any), underlayProps)}
        {...renderProps}
        style={style}
        ref={props.overlayRef}
        data-entering={entering || undefined}
        data-exiting={props.isExiting || undefined}>
        <InternalModalContext.Provider value={{modalProps, modalRef, state, isExiting: props.isExiting, isDismissable: props.isDismissable}}>
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
  let {modalProps, modalRef, isExiting, isDismissable, state} = useContext(InternalModalContext)!;
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
      {...mergeProps(filterDOMProps(props as any), modalProps)}
      {...renderProps}
      ref={ref}
      data-entering={entering || undefined}
      data-exiting={isExiting || undefined}>
      {isDismissable &&
        <DismissButton onDismiss={state.close} />
      }
      {renderProps.children}
    </div>
  );
}
