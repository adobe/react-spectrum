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

import {AriaModalOverlayProps, DismissButton, useModalOverlay} from '@react-aria/overlays';
import {classNames, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef, StyleProps} from '@react-types/shared';
import {Overlay} from './Overlay';
import {OverlayProps} from '@react-types/overlays';
import {OverlayTriggerState} from '@react-stately/overlays';
import overrideStyles from './overlays.css';
import React, {forwardRef, ReactNode, RefObject} from 'react';
import trayStyles from '@adobe/spectrum-css-temp/components/tray/vars.css';
import {Underlay} from './Underlay';
import {useViewportSize} from '@react-aria/utils';

interface TrayProps extends AriaModalOverlayProps, StyleProps, OverlayProps {
  children: ReactNode,
  state: OverlayTriggerState,
  isFixedHeight?: boolean
}

interface TrayWrapperProps extends TrayProps {
  isOpen?: boolean
}

function Tray(props: TrayProps, ref: DOMRef<HTMLDivElement>) {
  let {children, state, ...otherProps} = props;
  let domRef = useDOMRef(ref);

  return (
    <Overlay {...otherProps} isOpen={state.isOpen}>
      <TrayWrapper {...props} ref={domRef}>
        {children}
      </TrayWrapper>
    </Overlay>
  );
}

let TrayWrapper = forwardRef(function (props: TrayWrapperProps, ref: RefObject<HTMLDivElement>) {
  let {
    children,
    isOpen,
    isFixedHeight,
    state
  } = props;
  let {styleProps} = useStyleProps(props);

  let {modalProps, underlayProps} = useModalOverlay({
    ...props,
    isDismissable: true
  }, state, ref);

  // We need to measure the window's height in JS rather than using percentages in CSS
  // so that contents (e.g. menu) can inherit the max-height properly. Using percentages
  // does not work properly because there is nothing to base the percentage on.
  // We cannot use vh units because mobile browsers adjust the window height dynamically
  // when the address bar/bottom toolbars show and hide on scroll and vh units are fixed.
  // Also, the visual viewport is smaller than the layout viewport when the virtual keyboard
  // is up, so use the VisualViewport API to ensure the tray is displayed above the keyboard.
  let viewport = useViewportSize();
  let wrapperStyle: any = {
    '--spectrum-visual-viewport-height': viewport.height + 'px'
  };

  let wrapperClassName = classNames(
    trayStyles,
    'spectrum-Tray-wrapper'
  );

  let className = classNames(
    trayStyles,
    'spectrum-Tray',
    {
      'is-open': isOpen,
      'spectrum-Tray--fixedHeight': isFixedHeight
    },
    classNames(
      overrideStyles,
      'spectrum-Tray',
      'react-spectrum-Tray'
    ),
    styleProps.className
  );

  return (
    <>
      <Underlay {...underlayProps} isOpen={isOpen} />
      <div className={wrapperClassName} style={wrapperStyle}>
        <div
          {...styleProps}
          {...modalProps}
          className={className}
          ref={ref}
          data-testid="tray">
          <DismissButton onDismiss={state.close} />
          {children}
          <DismissButton onDismiss={state.close} />
        </div>
      </div>
    </>
  );
});

let _Tray = forwardRef(Tray);
export {_Tray as Tray};
