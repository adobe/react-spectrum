/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaModalOverlayProps, useModalOverlay} from '@react-aria/overlays';
import {classNames, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef, RefObject, StyleProps} from '@react-types/shared';
import modalStyles from '@adobe/spectrum-css-temp/components/modal/vars.css';
import {Overlay} from './Overlay';
import {OverlayProps} from '@react-types/overlays';
import {OverlayTriggerState} from '@react-stately/overlays';
import overrideStyles from './overlays.css';
import React, {ForwardedRef, forwardRef, ReactNode, useRef} from 'react';
import {Underlay} from './Underlay';
import {useObjectRef, useViewportSize} from '@react-aria/utils';

interface ModalProps extends AriaModalOverlayProps, StyleProps, Omit<OverlayProps, 'nodeRef' | 'shouldContainFocus'> {
  children: ReactNode,
  state: OverlayTriggerState,
  type?: 'modal' | 'fullscreen' | 'fullscreenTakeover'
}

interface ModalWrapperProps extends ModalProps {
  isOpen?: boolean,
  wrapperRef: RefObject<HTMLDivElement | null>,
  children: ReactNode
}

export const Modal = forwardRef(function Modal(props: ModalProps, ref: DOMRef<HTMLDivElement>) {
  let {children, state, ...otherProps} = props;
  let domRef = useDOMRef(ref);
  let wrapperRef = useRef<HTMLDivElement>(null);

  return (
    <Overlay {...otherProps} isOpen={state.isOpen} nodeRef={wrapperRef}>
      <ModalWrapper {...props} wrapperRef={wrapperRef} ref={domRef}>
        {children}
      </ModalWrapper>
    </Overlay>
  );
});

let typeMap = {
  fullscreen: 'fullscreen',
  fullscreenTakeover: 'fullscreenTakeover'
};

let ModalWrapper = forwardRef(function (props: ModalWrapperProps, ref: ForwardedRef<HTMLDivElement | null>) {
  let {type, children, state, isOpen, wrapperRef} = props;
  let typeVariant = type != null ? typeMap[type] : undefined;
  let {styleProps} = useStyleProps(props);
  let objRef = useObjectRef(ref);
  let {modalProps, underlayProps} = useModalOverlay(props, state, objRef);

  let wrapperClassName = classNames(
    modalStyles,
    'spectrum-Modal-wrapper',
    classNames(
      overrideStyles,
      'spectrum-Modal-wrapper',
      'react-spectrum-Modal-wrapper'
    )
  );

  let modalClassName = classNames(
    modalStyles,
    'spectrum-Modal',
    {
      'is-open': isOpen
    },
    classNames(
      overrideStyles,
      'spectrum-Modal',
      'react-spectrum-Modal'
    ),
    {[`spectrum-Modal--${typeVariant}`]: typeVariant},
    styleProps.className
  );

  let viewport = useViewportSize();
  let style: any = {
    '--spectrum-visual-viewport-height': viewport.height + 'px'
  };

  // Attach Transition's nodeRef to outer most wrapper for node.reflow: https://github.com/reactjs/react-transition-group/blob/c89f807067b32eea6f68fd6c622190d88ced82e2/src/Transition.js#L231
  return (
    <div ref={wrapperRef}>
      <Underlay {...underlayProps} isOpen={isOpen} />
      <div className={wrapperClassName} style={style}>
        <div
          {...styleProps}
          {...modalProps}
          ref={objRef}
          className={modalClassName}
          data-testid="modal">
          {children}
        </div>
      </div>
    </div>
  );
});
