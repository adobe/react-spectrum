import Button from '../../Button';
import classNames from 'classnames';
import React from 'react';

export default function DialogFooter({
  onClose,
  confirmLabel,
  cancelLabel,
  onConfirm,
  className,
  ...otherProps
}) {
  return (
    <div className={classNames('coral-Dialog-footer', className)}>
      {
        cancelLabel && <Button variant="secondary" label={cancelLabel} onClick={onClose} />
      }
      {
        confirmLabel && <Button variant="primary" label={confirmLabel} onClick={onConfirm} />
      }
    </div>
  );
}
