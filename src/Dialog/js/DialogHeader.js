import classNames from 'classnames';
import DialogButtons from './DialogButtons';
import Heading from '../../Heading';
import React from 'react';

export default function DialogHeader({
  title,
  variant,
  fullscreen,
  onClose,
  confirmLabel,
  cancelLabel,
  onConfirm,
  className,
  ...otherProps
}) {
  return (
    <div
      {...otherProps}
      className={classNames(
        'spectrum-Dialog-header',
        `spectrum-Dialog-header--${variant}`,
        className
      )}>
      <Heading size={3} className="spectrum-Dialog-title">{title}</Heading>
      <div className="spectrum-Dialog-typeIcon" />
      {fullscreen && confirmLabel &&
        <DialogButtons
          cancelLabel={cancelLabel}
          confirmLabel={confirmLabel}
          onClose={onClose}
          onConfirm={onConfirm} />
      }
    </div>
  );
}
