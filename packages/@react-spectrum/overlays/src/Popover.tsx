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
import React, {HTMLAttributes, ReactNode, RefObject, useRef} from 'react';
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

function Popover(props: PopoverProps, ref: RefObject<HTMLDivElement>) {
  let {style, children, placement = 'bottom', arrowProps, isOpen, onClose, hideArrow, ...otherProps} = props;
  let backupRef = useRef();
  let domRef = ref || backupRef;
  let {overlayProps} = useOverlay({ref: domRef, onClose, isOpen});

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
          )
        )
      }
      role="presentation"
      data-testid="popover"
      {...overlayProps}>
      {children}
      {hideArrow ? null : <div className={classNames(styles, 'spectrum-Popover-tip')} {...arrowProps} data-testid="tip" />}
    </div>
  );
}

let _Popover = React.forwardRef(Popover);
export {_Popover as Popover};
