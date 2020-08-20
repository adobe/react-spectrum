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
import {DOMRef} from '@react-types/shared';
import {mergeProps} from '@react-aria/utils';
import {Overlay} from './Overlay';
import overrideStyles from './overlays.css';
import React, {forwardRef, HTMLAttributes, ReactNode, RefObject, useEffect, useState} from 'react';
import {TrayProps} from '@react-types/overlays';
import trayStyles from '@adobe/spectrum-css-temp/components/tray/vars.css';
import {Underlay} from './Underlay';
import {useModal, useOverlay, usePreventScroll} from '@react-aria/overlays';

interface TrayWrapperProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode,
  isOpen?: boolean,
  onClose?: () => void,
  shouldCloseOnBlur?: boolean,
  isKeyboardDismissDisabled?: boolean
}

function Tray(props: TrayProps, ref: DOMRef<HTMLDivElement>) {
  let {children, onClose, shouldCloseOnBlur, isKeyboardDismissDisabled, ...otherProps} = props;
  let domRef = useDOMRef(ref);
  let {styleProps} = useStyleProps(props);

  return (
    <Overlay {...otherProps}>
      <Underlay />
      <TrayWrapper
        {...styleProps}
        onClose={onClose}
        shouldCloseOnBlur={shouldCloseOnBlur}
        isKeyboardDismissDisabled={isKeyboardDismissDisabled}
        ref={domRef}>
        {children}
      </TrayWrapper>
    </Overlay>
  );
}

let TrayWrapper = forwardRef(function (props: TrayWrapperProps, ref: RefObject<HTMLDivElement>) {
  let {
    children,
    isOpen,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    shouldCloseOnBlur,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isKeyboardDismissDisabled,
    ...otherProps
  } = props;
  let {overlayProps} = useOverlay({...props, isDismissable: true}, ref);
  usePreventScroll();
  let {modalProps} = useModal();

  // We need to measure the window's height in JS rather than using percentages in CSS
  // so that contents (e.g. menu) can inherit the max-height properly. Using percentages
  // does not work properly because there is nothing to base the percentage on.
  // We cannot use vh units because mobile browsers adjust the window height dynamically
  // when the address bar/bottom toolbars show and hide on scroll and vh units are fixed.
  let [maxHeight, setMaxHeight] = useState(window.innerHeight);
  let [height, setHeight] = useState(0);

  // TODO: prob should have this logic happen only for combobox, pass in a boolean lockHeight??
  // First stab at locking tray height
  // Problem is that this will allow the tray to grow if more options load in (aka you delete your input), probably not desired
  // and it won't let the tray to shrink upon filtering (desired)
  // I would like it to not grow but unfortunately the final tray height happens on the second render so I can't useeffect on first render only
  if (ref.current) {
    ref.current.style.height = 'auto';
    if (ref.current.offsetHeight > height) {
      setHeight(ref.current.offsetHeight);
    }
    ref.current.style.height = `${height}px`;
  }

  useEffect(() => {
    let onResize = () => {
      setMaxHeight(window.innerHeight);
      if (height && height > window.innerHeight) {
        setHeight(window.innerHeight);
      }
    };

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  let domProps = mergeProps(otherProps, overlayProps);
  let style = {
    ...domProps.style,
    maxHeight: `calc(${maxHeight}px - var(--spectrum-tray-margin-top))`
  };

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
        {...domProps}
        {...modalProps}
        style={style}
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
