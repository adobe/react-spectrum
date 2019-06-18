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

import AlertMedium from '../../Icon/core/AlertMedium';
import classNames from 'classnames';
import DialogButtons from './DialogButtons';
import filterDOMProps from '../../utils/filterDOMProps';
import Heading from '../../Heading';
import React from 'react';

const VARIANT_ICONS = {
  error: AlertMedium
};

export default function DialogHeader({
  title,
  variant,
  fullscreen,
  confirmDisabled,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  className,
  autoFocusButton,
  id,
  ...otherProps
}) {
  let Icon = VARIANT_ICONS[variant];

  return (
    <div
      {...filterDOMProps(otherProps)}
      className={classNames(
        'spectrum-Dialog-header',
        `spectrum-Dialog-header--${variant}`,
        className
      )}>
      <Heading size={3} className="spectrum-Dialog-title" id={id}>{title}</Heading>
      {Icon && <Icon size={null} className="spectrum-Dialog-typeIcon" />}
      {fullscreen && confirmLabel &&
        <DialogButtons
          autoFocusButton={autoFocusButton}
          variant={variant}
          cancelLabel={cancelLabel}
          confirmLabel={confirmLabel}
          confirmDisabled={confirmDisabled}
          onConfirm={onConfirm}
          onCancel={onCancel} />
      }
    </div>
  );
}
