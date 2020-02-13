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
import {classNames} from '@react-spectrum/utils';
import modalStyles from '@adobe/spectrum-css-temp/components/modal/vars.css';
import {Overlay} from './Overlay';
import overrideStyles from './overlays.css';
import React, {ReactElement, useRef} from 'react';
import {Underlay} from './Underlay';
import {useModal, useOverlay} from '@react-aria/overlays';

interface ModalProps {
  children: ReactElement,
  isOpen?: boolean,
  onClose?: () => void
}

interface ModalWrapperProps extends ModalProps {
  isOpen?: boolean
}

export function Modal(props: ModalProps) {
  let {children, onClose, ...otherProps} = props;

  return (
    <Overlay {...otherProps}>
      <Underlay />
      <ModalWrapper onClose={onClose}>
        {children}
      </ModalWrapper>
    </Overlay>
  );
}

function ModalWrapper(props: ModalWrapperProps) {
  let {children, onClose, isOpen} = props;
  let ref = useRef(null);
  let {overlayProps} = useOverlay({ref, onClose, isOpen});
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
    )
  );

  return (
    <div className={wrapperClassName}>
      <div
        {...overlayProps}
        ref={ref}
        className={modalClassName}
        data-testid="modal">
        {children}
      </div>
    </div>
  );
}
