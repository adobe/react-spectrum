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
import AlertMedium from '@spectrum-icons/ui/AlertMedium';
import {Button, ClearButton} from '@react-spectrum/button';
import {classNames, filterDOMProps, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import CrossMedium from '@spectrum-icons/ui/CrossMedium';
import {DOMRef} from '@react-types/shared';
import InfoMedium from '@spectrum-icons/ui/InfoMedium';
import React from 'react';
import {SpectrumToastProps} from '@react-types/toast';
import styles from '@adobe/spectrum-css-temp/components/toast/vars.css';
import SuccessMedium from '@spectrum-icons/ui/SuccessMedium';
import toastContainerStyles from './toastContainer.css';
import {useToast} from '@react-aria/toast';

export const ICONS = {
  info: InfoMedium,
  negative: AlertMedium,
  positive: SuccessMedium
};

function Toast(props: SpectrumToastProps, ref: DOMRef<HTMLDivElement>) {
  let {
    actionButtonProps,
    closeButtonProps,
    iconProps,
    toastProps
  } = useToast(props);
  let {
    actionLabel,
    children,
    variant,
    ...otherProps
  } = props;
  let domRef = useDOMRef(ref);
  let {styleProps} = useStyleProps(otherProps);
  let Icon = ICONS[variant];

  return (
    <div
      {...filterDOMProps(otherProps)}
      {...styleProps}
      {...toastProps}
      ref={domRef}
      className={classNames(styles,
        'spectrum-Toast',
        {['spectrum-Toast--' + variant]: variant},
        styleProps.className,
        classNames(
          toastContainerStyles,
          'spectrum-Toast'
        )
      )}>
      {Icon &&
        <Icon
          {...iconProps}
          UNSAFE_className={classNames(styles, 'spectrum-Toast-typeIcon')} />
      }
      <div className={classNames(styles, 'spectrum-Toast-body')}>
        <div className={classNames(styles, 'spectrum-Toast-content')}>{children}</div>
        {actionLabel &&
          <Button
            {...actionButtonProps}
            UNSAFE_className={classNames(styles, 'spectrum-Button')}
            isQuiet
            variant="overBackground">{actionLabel}</Button>
        }
      </div>
      <div className={classNames(styles, 'spectrum-Toast-buttons')}>
        <ClearButton {...closeButtonProps} variant="overBackground">
          <CrossMedium />
        </ClearButton>
      </div>
    </div>
  );
}

let _Toast = React.forwardRef(Toast);
export {_Toast as Toast};
