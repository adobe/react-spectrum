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

import {classNames, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMProps, DOMRef, StyleProps} from '@react-types/shared';
import {ModalProps} from '@react-types/overlays';
import modalStyles from '@adobe/spectrum-css-temp/components/modal/vars.css';
import {Overlay} from './Overlay';
import overrideStyles from './overlays.css';
import React, {forwardRef} from 'react';
import {Underlay} from './Underlay';
import {useModal, useOverlay, usePreventScroll} from '@react-aria/overlays';

interface ModalWrapperProps extends DOMProps, ModalProps, StyleProps {
  isOpen?: boolean
}

function Modal(props: ModalProps, ref: DOMRef<HTMLDivElement>) {
  let {children, onClose, type, isDismissable, ...otherProps} = props;
  let {styleProps} = useStyleProps(props);

  return (
    <Overlay {...otherProps}>
      <Underlay />
      <ModalWrapper
        {...styleProps}
        onClose={onClose}
        type={type}
        isDismissable={isDismissable}
        ref={ref}>
        {children}
      </ModalWrapper>
    </Overlay>
  );
}

let typeMap = {
  fullscreen: 'fullscreen',
  fullscreenTakeover: 'fullscreenTakeover'
};

let ModalWrapper = React.forwardRef(function (props: ModalWrapperProps, ref: DOMRef<HTMLDivElement>) {
  let {children, onClose, isOpen, type, isDismissable = false} = props;
  let typeVariant = typeMap[type];
  let domRef = useDOMRef(ref);
  let {styleProps} = useStyleProps(props);

  let {overlayProps} = useOverlay({ref: domRef, onClose, isOpen, isDismissable});
  usePreventScroll();
  useModal();

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
    {[`spectrum-Modal--${typeVariant}`]: typeVariant}
  );

  return (
    <div className={wrapperClassName}>
      <div
        {...styleProps}
        {...overlayProps}
        ref={domRef}
        className={modalClassName}
        data-testid="modal">
        {children}
      </div>
    </div>
  );
});

let _Modal = forwardRef(Modal);
export {_Modal as Modal};
