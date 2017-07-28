import classNames from 'classnames';
import Heading from '../../Heading';
import React from 'react';

export default function DialogHeader({
  title,
  variant,
  closable,
  onClose,
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
        <div className="spectrum-Dialog-typeIcon" />
        <Heading size={3} className="spectrum-Dialog-title">
          {title}
        </Heading>
    </div>
  );
}
