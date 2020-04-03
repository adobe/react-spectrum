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
import {DOMRef} from '@react-types/shared';
import {Overlay} from './Overlay';
import overrideStyles from './overlays.css';
import React, {forwardRef, ReactElement, useRef} from 'react';
import trayStyles from '@adobe/spectrum-css-temp/components/tray/vars.css';
import {Underlay} from './Underlay';
import {useModal, useOverlay, usePreventScroll} from '@react-aria/overlays';
import {VisuallyHidden} from '@react-aria/visually-hidden';

interface TrayProps {
  children: ReactElement,
  isOpen?: boolean,
  onClose?: () => void
}

interface TrayWrapperProps extends TrayProps {
  isOpen?: boolean
}

function Tray(props: TrayProps, ref: DOMRef<HTMLDivElement>) {
  let {children, onClose, ...otherProps} = props;

  return (
    <Overlay {...otherProps} ref={ref}>
      <Underlay />
      <TrayWrapper onClose={onClose}>
        {children}
      </TrayWrapper>
    </Overlay>
  );
}

function TrayWrapper({children, onClose, isOpen}: TrayWrapperProps) {
  let ref = useRef();
  let {overlayProps, dismissButtonProps} = useOverlay({ref, onClose, isOpen, isDismissable: true});
  usePreventScroll();
  useModal();

  // TODO: android back button?

  let wrapperClassName = classNames(
    trayStyles,
    'spectrum-Tray-wrapper'
  );

  let className = classNames(
    trayStyles,
    'spectrum-Tray',
    {
      'is-open': isOpen
    },
    classNames(
      overrideStyles,
      'spectrum-Tray',
      'react-spectrum-Tray'
    )
  );

  return (
    <div className={wrapperClassName}>
      <VisuallyHidden>
        <button {...dismissButtonProps} />
      </VisuallyHidden>
      <div className={className} ref={ref} {...overlayProps} data-testid="tray">
        {children}
      </div>
      <VisuallyHidden>
        <button {...dismissButtonProps} />
      </VisuallyHidden>
    </div>
  );
}

let _Tray = forwardRef(Tray);
export {_Tray as Tray};
