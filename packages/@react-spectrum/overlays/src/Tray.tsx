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
import {Overlay} from './Overlay';
import overrideStyles from './overlays.css';
import React, {forwardRef} from 'react';
import {TrayProps} from '@react-types/overlays';
import trayStyles from '@adobe/spectrum-css-temp/components/tray/vars.css';
import {Underlay} from './Underlay';
import {useModal, useOverlay, usePreventScroll} from '@react-aria/overlays';
import {VisuallyHidden} from '@react-aria/visually-hidden';

interface TrayWrapperProps extends DOMProps, StyleProps, TrayProps {
  isOpen?: boolean
}

function Tray(props: TrayProps, ref: DOMRef<HTMLDivElement>) {
  let {children, onClose, ...otherProps} = props;
  let {styleProps} = useStyleProps(props);

  return (
    <Overlay {...otherProps} >
      <Underlay />
      <TrayWrapper
        {...styleProps}
        onClose={onClose}
        ref={ref}>
        {children}
      </TrayWrapper>
    </Overlay>
  );
}

let TrayWrapper = React.forwardRef(function (props: TrayWrapperProps, ref: DOMRef<HTMLDivElement>) {
  let {
    children,
    onClose,
    isOpen
  } = props;
  let domRef = useDOMRef(ref);
  let {styleProps} = useStyleProps(props);
  let {overlayProps, dismissButtonProps} = useOverlay({ref: domRef, onClose, isOpen, isDismissable: true});
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
      <div
        {...styleProps}
        className={className}
        ref={domRef}
        {...overlayProps}
        data-testid="tray">
        {children}
      </div>
      <VisuallyHidden>
        <button {...dismissButtonProps} />
      </VisuallyHidden>
    </div>
  );
});

let _Tray = forwardRef(Tray);
export {_Tray as Tray};
