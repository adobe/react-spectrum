import Button from '../../Button';
import React from 'react';

const BUTTON_VARIANTS = {
  confirmation: 'cta',
  information: 'primary',
  error: 'primary',
  destructive: 'warning'
};

export default function DialogButtons({
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
    <div className={className}>
      {cancelLabel &&
        <Button variant="secondary" label={cancelLabel} onClick={onCancel} />
      }
      {confirmLabel &&
        <Button variant={confirmVariant} label={confirmLabel} onClick={onConfirm} disabled={confirmDisabled || null} />
      }
    </div>
  );
}
