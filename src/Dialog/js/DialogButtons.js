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

import Button from '../../Button';
import classNames from 'classnames';
import React from 'react';
import '../style/index.styl';

const BUTTON_VARIANTS = {
  confirmation: 'cta',
  information: 'primary',
  error: 'primary',
  destructive: 'warning'
};

export default function DialogButtons({
  autoFocusButton,
  confirmLabel,
  secondaryLabel,
  cancelLabel,
  confirmDisabled,
  onConfirm,
  onCancel,
  className,
  variant
}) {
  const confirmVariant = BUTTON_VARIANTS[variant] || 'primary';

  let onKeyDown = (event) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.stopPropagation();
    }
  };

  return (
    <div
      className={classNames(
        'react-spectrum-Dialog-buttons',
        className
      )}>
      {cancelLabel &&
        <Button
          variant="secondary"
          label={cancelLabel}
          onClick={onCancel}
          autoFocus={autoFocusButton === 'cancel'}
          onKeyDown={onKeyDown} />
      }
      {secondaryLabel &&
        <Button
          variant="secondary"
          label={secondaryLabel}
          onClick={onConfirm ? onConfirm.bind(null, 'secondary') : null}
          autoFocus={autoFocusButton === 'secondary'}
          disabled={confirmDisabled || null}
          onKeyDown={onKeyDown} />
      }
      {confirmLabel &&
        <Button
          variant={confirmVariant}
          label={confirmLabel}
          onClick={onConfirm ? onConfirm.bind(null, 'primary') : null}
          autoFocus={autoFocusButton === 'confirm'}
          disabled={confirmDisabled || null}
          onKeyDown={onKeyDown} />
      }
    </div>
  );
}
