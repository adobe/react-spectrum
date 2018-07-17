import AlertMedium from '../../Icon/core/AlertMedium';
import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import HelpMedium from '../../Icon/core/HelpMedium';
import InfoMedium from '../../Icon/core/InfoMedium';
import React from 'react';
import SuccessMedium from '../../Icon/core/SuccessMedium';

importSpectrumCSS('alert');

const ICONS = {
  error: AlertMedium,
  warning: AlertMedium,
  info: InfoMedium,
  help: HelpMedium,
  success: SuccessMedium
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
      {...filterDOMProps(otherProps)}>
      <AlertIcon size={null} className="spectrum-Alert-icon" aria-label={variant} />
      <div className="spectrum-Alert-header">{header}</div>
      <div className="spectrum-Alert-content">{children}</div>
    </div>
  );
}

Alert.displayName = 'Alert';
