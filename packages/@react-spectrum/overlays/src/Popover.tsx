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
import {useOverlay} from '@react-aria/overlays';

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
  let {overlayProps} = useOverlay({ref: domRef, onClose, isOpen, isDismissable: true});

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
      {children}
      {hideArrow ? null : (
        <Arrow arrowProps={arrowProps} direction={arrowPlacement[placement.split(' ')[0]]} borderWidth={1} size={10} className={classNames(styles, 'svg-triangle')} />
      )}
    </div>
  );
}

let ROOT_2 = Math.sqrt(2);

function Arrow(props) {
  let [size, setTipWidth] = useState(20);
  let ref = useRef();
  useLayoutEffect(() => {
    let measuredTipWidth = getComputedStyle(ref.current)
      .getPropertyValue('--spectrum-popover-tip-size'); // i don't think this is how i'm supposed to get this
    setTipWidth(parseInt(measuredTipWidth, 10) / 2);
  }, [ref]);

  let landscape = props.direction === 'top' || props.direction === 'bottom';
  let mirror = props.direction === 'left' || props.direction === 'top';

  let borderDiagonal = props.borderWidth * ROOT_2;
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
