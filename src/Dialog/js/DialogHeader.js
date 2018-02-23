import AlertError from '../../Icon/core/AlertError';
import classNames from 'classnames';
import DialogButtons from './DialogButtons';
import Heading from '../../Heading';
import React from 'react';

const VARIANT_ICONS = {
  error: AlertError
};

export default function DialogHeader({
  title,
  variant,
  fullscreen,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  className,
  ...otherProps
}) {
  let Icon = VARIANT_ICONS[variant];
  delete otherProps.backdropClickable;
  delete otherProps.backdropEnabled;

  return (
    <div
      {...otherProps}
      className={classNames(
        'spectrum-Dialog-header',
        `spectrum-Dialog-header--${variant}`,
        className
      )}>
      <Heading size={3} className="spectrum-Dialog-title">{title}</Heading>
      {Icon && <Icon size={null} className="spectrum-Dialog-typeIcon" />}
      {fullscreen && confirmLabel &&
        <DialogButtons
          variant={variant}
          cancelLabel={cancelLabel}
          confirmLabel={confirmLabel}
          onConfirm={onConfirm}
          onCancel={onCancel} />
      }
    </div>
  );
}
