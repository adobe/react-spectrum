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

import {Button, ClearButton} from '@react-spectrum/button';
import {classNames, filterDOMProps, ICON_VARIANTS} from '@react-spectrum/utils';
import CrossMedium from '@spectrum-icons/ui/CrossMedium';
import {HTMLElement} from 'react-dom';
import intlMessages from '../intl/*.json';
import React, {ReactNode, RefObject} from 'react';
import styles from '@adobe/spectrum-css-temp/components/toast/vars.css';
import {useMessageFormatter} from '@react-aria/i18n';
import {useToast} from '@react-aria/toast';
import {useProviderProps} from '@react-spectrum/provider';

export interface ToastOptions {
  actionLabel?: ReactNode,
  onAction?: () => void,
  shouldCloseOnAction?: boolean,
  onClose?: () => void,
  timeout?: number
}

export const Toast = React.forwardRef((props: ToastOptions, ref: RefObject<HTMLElement>) => {
  let defaults = {};
  let completeProps = Object.assign({}, defaults, useProviderProps(props));
  let ariaProps = useToast(completeProps);

  let {
    actionLabel,
    children,
    className,
    onAction,
    onClose,
    role = 'alert',
    shouldCloseOnAction,
    variant,
    ...otherProps
  } = completeProps;
  let formatMessage = useMessageFormatter(intlMessages);
  let Icon = ICON_VARIANTS[variant];

  const handleAction = (...args) => {
    if (onAction) {
      onAction(...args);
    }

    if (shouldCloseOnAction && onClose) {
      onClose(...args);
    }
  };

  return (
    <div
      {...filterDOMProps(otherProps)}
      {...ariaProps}
      ref={ref}
      className={classNames(styles,
        'spectrum-Toast',
        {['spectrum-Toast--' + variant]: variant},
        className
      )}
      role={role}>
      {Icon &&
        <Icon
          size={null}
          className={classNames(styles, 'spectrum-Toast-typeIcon')}
          alt={formatMessage(variant)} />}
      <div className={classNames(styles, 'spectrum-Toast-body')}>
        <div className={classNames(styles, 'spectrum-Toast-content')}>{children}</div>
        {actionLabel &&
          <Button
            isQuiet
            variant="overBackground"
            onPress={handleAction}>{actionLabel}</Button>
        }
      </div>
      <div className={classNames(styles, 'spectrum-Toast-buttons')}>
        <ClearButton
          aria-label={formatMessage('close')}
          variant="overBackground"
          onPress={onClose}>
          <CrossMedium size={null} />
        </ClearButton>
      </div>
    </div>
  );
});
