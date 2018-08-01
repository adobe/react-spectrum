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
  cancelLabel,
  confirmDisabled,
  onConfirm,
  onCancel,
  className,
  variant,
  ...otherProps
}) {
  const confirmVariant = BUTTON_VARIANTS[variant] || 'primary';

  return (
    <div
      className={classNames(
        'react-spectrum-Dialog-buttons',
        className
      )}>
      {cancelLabel &&
        <Button variant="secondary" label={cancelLabel} onClick={onCancel} autoFocus={autoFocusButton === 'cancel'} />
      }
      {confirmLabel &&
        <Button variant={confirmVariant} label={confirmLabel} onClick={onConfirm} autoFocus={autoFocusButton === 'confirm'} disabled={confirmDisabled || null} />
      }
    </div>
  );
}
