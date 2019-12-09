/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import AlertMedium from '@spectrum-icons/ui/AlertMedium';
import {Button, ClearButton} from '@react-spectrum/button';
import {classNames, DOMRef, filterDOMProps, useDOMRef} from '@react-spectrum/utils';
import CrossMedium from '@spectrum-icons/ui/CrossMedium';
import {DOMProps} from '@react-types/shared';
import InfoMedium from '@spectrum-icons/ui/InfoMedium';
import React from 'react';
import {StyleProps, useStyleProps} from '@react-spectrum/view';
import styles from '@adobe/spectrum-css-temp/components/toast/vars.css';
import SuccessMedium from '@spectrum-icons/ui/SuccessMedium';
import {ToastProps} from '@react-types/toast';
import {useToast} from '@react-aria/toast';

export const ICONS = {
  info: InfoMedium,
  negative: AlertMedium,
  positive: SuccessMedium
};

interface SpectrumToastProps extends ToastProps, DOMProps, StyleProps {}

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
        styleProps.className
      )}>
      {Icon &&
        <Icon
          {...iconProps}
          className={classNames(styles, 'spectrum-Toast-typeIcon')} />
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
