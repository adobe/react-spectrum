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
        'coral-Dialog-header',
        `coral-Dialog-header--${variant}`,
        className
      )}>
        {icon && <Icon className="coral-Dialog-typeIcon" icon={icon} size="S" />}
        <Heading size={3} className="coral-Dialog-title">
          {title}
        </Heading>
    </div>
  );
}
