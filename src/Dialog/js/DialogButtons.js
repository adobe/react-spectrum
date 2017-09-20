import Button from '../../Button';
import React from 'react';

export default function DialogButtons({
  onClose,
  confirmLabel,
  cancelLabel,
  onConfirm,
  className,
  ...otherProps
}) {
  return (
    <div className={className}>
      {cancelLabel &&
        <Button variant="secondary" label={cancelLabel} onClick={onClose} />
      }
      {confirmLabel &&
        <Button variant="primary" label={confirmLabel} onClick={onConfirm} />
      }
    </div>
  );
}
