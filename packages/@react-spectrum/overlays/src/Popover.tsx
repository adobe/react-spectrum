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
import overrideStyles from './overlays.css';
import {Placement} from '@react-types/overlays';
import React, {HTMLAttributes, ReactNode, RefObject, useLayoutEffect, useRef, useState} from 'react';
import styles from '@adobe/spectrum-css-temp/components/popover/vars.css';
import {useModal, useOverlay} from '@react-aria/overlays';
import {VisuallyHidden} from '@react-aria/visually-hidden';

interface PopoverProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode,
  placement?: Placement,
  arrowProps?: HTMLAttributes<HTMLElement>,
  hideArrow?: boolean,
  isOpen?: boolean,
  onClose?: () => void
}

let arrowPlacement = {
  left: 'right',
  right: 'left',
  top: 'bottom',
  bottom: 'top'
};

function Popover(props: PopoverProps, ref: RefObject<HTMLDivElement>) {
  let {style, children, placement = 'bottom', arrowProps, isOpen, onClose, hideArrow, className, ...otherProps} = props;
  let backupRef = useRef();
  let domRef = ref || backupRef;
  let {overlayProps, dismissButtonProps} = useOverlay({ref: domRef, onClose, isOpen, isDismissable: true});
  useModal();

  return (
    <div
      {...otherProps}
      style={style}
      ref={domRef}
      className={
        classNames(
          styles,
          'spectrum-Popover',
          `spectrum-Popover--${placement.split(' ')[0]}`,
          {
            'spectrum-Popover--withTip': !hideArrow,
            'is-open': isOpen
          },
          classNames(
            overrideStyles,
            'spectrum-Popover',
            'react-spectrum-Popover'
          ),
          className
        )
      }
      role="presentation"
      data-testid="popover"
      {...overlayProps}>
      <VisuallyHidden>
        <button {...dismissButtonProps} />
      </VisuallyHidden>
      {children}
      {hideArrow ? null : (
        <Arrow arrowProps={arrowProps} direction={arrowPlacement[placement.split(' ')[0]]} />
      )}
      <VisuallyHidden>
        <button {...dismissButtonProps} />
      </VisuallyHidden>
    </div>
  );
}

let ROOT_2 = Math.sqrt(2);

function Arrow(props) {
  let [size, setSize] = useState(20);
  let [borderWidth, setBorderWidth] = useState(1);
  let ref = useRef();
  // get the css value for the tip size and divide it by 2 for this arrow implementation
  useLayoutEffect(() => {
    let spectrumTipWidth = getComputedStyle(ref.current)
      .getPropertyValue('--spectrum-popover-tip-size');
    setSize(parseInt(spectrumTipWidth, 10) / 2);

    let spectrumBorderWidth = getComputedStyle(ref.current)
      .getPropertyValue('--spectrum-popover-tip-borderWidth');
    setBorderWidth(parseInt(spectrumBorderWidth, 10));
  }, [ref]);

  let landscape = props.direction === 'top' || props.direction === 'bottom';
  let mirror = props.direction === 'left' || props.direction === 'top';

  let borderDiagonal = borderWidth * ROOT_2;
  let halfBorderDiagonal = borderDiagonal / 2;

  let secondary = 2 * size + 2 * borderDiagonal;
  let primary = size + borderDiagonal;

  let primaryStart = mirror ? primary : 0;
  let primaryEnd = mirror ? halfBorderDiagonal : primary - halfBorderDiagonal;

  let secondaryStart = halfBorderDiagonal;
  let secondaryMiddle = secondary / 2;
  let secondaryEnd = secondary - halfBorderDiagonal;

  let pathData = landscape ? [
    'M', secondaryStart, primaryStart,
    'L', secondaryMiddle, primaryEnd,
    'L', secondaryEnd, primaryStart
  ] : [
    'M', primaryStart, secondaryStart,
    'L', primaryEnd, secondaryMiddle,
    'L', primaryStart, secondaryEnd
  ];
  let arrowProps = props.arrowProps;

  return (
    <div
      ref={ref}
      className={classNames(styles, 'spectrum-Popover-tip')}
      {...arrowProps}
      data-testid="tip">
      {
        React.createElement('svg',
          {
            xmlns: 'http://www.w3.org/svg/2000',
            width: landscape ? secondary : primary,
            height: landscape ? primary : secondary,
            style: props.style,
            className: props.className
          },
          React.createElement('path', {
            d: pathData.join(' ')
          })
        )
      }
    </div>
  );
}

let _Popover = React.forwardRef(Popover);
export {_Popover as Popover};
