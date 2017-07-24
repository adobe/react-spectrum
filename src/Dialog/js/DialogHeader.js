import classNames from 'classnames';
import {getVariantIcon} from '../../utils/icon-variant';
import Heading from '../../Heading';
import Icon from '../../Icon';
import React from 'react';

export default function DialogHeader({
  title,
  variant,
  icon = getVariantIcon(variant || 'default'),
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
        {icon && <Icon className="spectrum-Dialog-typeIcon" icon={icon} size="S" />}
        <Heading size={3} className="spectrum-Dialog-title">
          {title}
        </Heading>
    </div>
  );
}
