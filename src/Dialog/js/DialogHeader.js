import AlertError from '../../Icon/core/AlertError';
import classNames from 'classnames';
import DialogButtons from './DialogButtons';
import filterDOMProps from '../../utils/filterDOMProps';
import Heading from '../../Heading';
import React from 'react';

const VARIANT_ICONS = {
  error: AlertError
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
      <Heading size={3} className="spectrum-Dialog-title">{title}</Heading>
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
