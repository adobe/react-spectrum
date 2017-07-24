import Button from '../../Button';
import classNames from 'classnames';
import React from 'react';
import '../style/index.styl';

export default function Alert({
  header,
  children,
  variant = 'info', // info, help, success, error, warning
  className,
  onClose = function () {},
  ...otherProps
}) {
  return (
    <div
      className={
        classNames(
          'spectrum-Alert',
          `spectrum-Alert--${variant}`,
          className
        )
      }
      {...otherProps}
    >
      <div className="spectrum-Alert-typeIcon" role="img" aria-label="info" />
      <div className="spectrum-Alert-header">{header}</div>
      <div className="spectrum-Alert-content">{children}</div>
    </div>
  );
}

Alert.displayName = 'Alert';
