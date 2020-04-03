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

import {classNames, filterDOMProps, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import {mergeProps} from '@react-aria/utils';
import {Overlay} from './Overlay';
import overrideStyles from './overlays.css';
import React, {forwardRef, HTMLAttributes, ReactNode, RefObject} from 'react';
import {TrayProps} from '@react-types/overlays';
import trayStyles from '@adobe/spectrum-css-temp/components/tray/vars.css';
import {Underlay} from './Underlay';
import {useModal, useOverlay, usePreventScroll} from '@react-aria/overlays';

interface TrayWrapperProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode,
  isOpen?: boolean,
  onClose?: () => void
}

function Tray(props: TrayProps, ref: DOMRef<HTMLDivElement>) {
  let {children, onClose, ...otherProps} = props;
  let domRef = useDOMRef(ref);
  let {styleProps} = useStyleProps(props);

  return (
    <Overlay {...otherProps}>
      <Underlay />
      <TrayWrapper
        {...filterDOMProps(otherProps)}
        {...styleProps}
        onClose={onClose}
        ref={domRef}>
        {children}
      </TrayWrapper>
    </Overlay>
  );
}

let TrayWrapper = forwardRef(function (props: TrayWrapperProps, ref: RefObject<HTMLDivElement>) {
  let {
    children,
    onClose,
    isOpen,
    ...otherProps
  } = props;
  let {overlayProps} = useOverlay({ref, onClose, isOpen, isDismissable: true});
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
    ),
    otherProps.className
  );

  return (
    <div className={wrapperClassName}>
      <div
        {...mergeProps(otherProps, overlayProps)}
        className={className}
        ref={ref}
        data-testid="tray">
        {children}
      </div>
    </div>
  );
});

let _Tray = forwardRef(Tray);
export {_Tray as Tray};
