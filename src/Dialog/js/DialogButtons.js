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
        <Button
          variant="secondary"
          label={cancelLabel}
          onClick={onCancel}
          autoFocus={autoFocusButton === 'cancel'} />
      }
      {secondaryLabel &&
        <Button
          variant="secondary"
          label={secondaryLabel}
          onClick={onConfirm ? onConfirm.bind(null, 'secondary') : null}
          autoFocus={autoFocusButton === 'secondary'}
          disabled={confirmDisabled || null} />
      }
      {confirmLabel &&
        <Button
          variant={confirmVariant}
          label={confirmLabel}
          onClick={onConfirm ? onConfirm.bind(null, 'primary') : null}
          autoFocus={autoFocusButton === 'confirm'}
          disabled={confirmDisabled || null} />
      }
    </div>
  );
}
