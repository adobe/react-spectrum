import AlertError from '../../Icon/core/AlertError';
import AlertHelp from '../../Icon/core/AlertHelp';
import AlertInfo from '../../Icon/core/AlertInfo';
import AlertSuccess from '../../Icon/core/AlertSuccess';
import classNames from 'classnames';
import React from 'react';
import '../style/index.styl';

const ICONS = {
  error: AlertError,
  warning: AlertError,
  info: AlertInfo,
  help: AlertHelp,
  success: AlertSuccess
};

export default function Alert({
  header,
  children,
  variant = 'info', // info, help, success, error, warning
  className,
  onClose = function () {},
  ...otherProps
}) {
  let AlertIcon = ICONS[variant];

  return (
    <div
      className={
        classNames(
          'spectrum-Alert',
          `spectrum-Alert--${variant}`,
          className
        )
      }
      {...otherProps}>
      <AlertIcon size={null} className="spectrum-Alert-icon" aria-label={variant} />
      <div className="spectrum-Alert-header">{header}</div>
      <div className="spectrum-Alert-content">{children}</div>
    </div>
  );
}

Alert.displayName = 'Alert';
