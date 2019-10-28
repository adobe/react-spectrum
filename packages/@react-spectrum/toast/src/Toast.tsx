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
import {classNames, filterDOMProps} from '@react-spectrum/utils';
import CrossMedium from '@spectrum-icons/ui/CrossMedium';
import {HTMLElement} from 'react-dom';
import InfoMedium from '@spectrum-icons/ui/InfoMedium';
import React, {RefObject} from 'react';
import styles from '@adobe/spectrum-css-temp/components/toast/vars.css';
import SuccessMedium from '@spectrum-icons/ui/SuccessMedium';
import {ToastProps} from '@react-types/toast';
import {useProviderProps} from '@react-spectrum/provider';
import {useToast} from '@react-aria/toast';

export const ICONS = {
  info: InfoMedium,
  negative: AlertMedium,
  positive: SuccessMedium
};

export const Toast = React.forwardRef((props: ToastProps, ref: RefObject<HTMLElement>) => {
  let defaults = {};
  let completeProps = Object.assign({}, defaults, useProviderProps(props));
  let {
    actionButtonProps,
    closeButtonProps,
    iconProps,
    toastProps
  } = useToast(completeProps);
  let {
    actionLabel,
    children,
    className,
    variant,
    ...otherProps
  } = completeProps;
  let Icon = ICONS[variant];

  return (
    <div
      {...filterDOMProps(otherProps)}
      {...toastProps}
      ref={ref}
      className={classNames(styles,
        'spectrum-Toast',
        {['spectrum-Toast--' + variant]: variant},
        className
      )}>
      {Icon &&
        <Icon
          {...iconProps}
          size={null}
          className={classNames(styles, 'spectrum-Toast-typeIcon')} />
      }
      <div className={classNames(styles, 'spectrum-Toast-body')}>
        <div className={classNames(styles, 'spectrum-Toast-content')}>{children}</div>
        {actionLabel &&
          <Button
            {...actionButtonProps}
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
});
