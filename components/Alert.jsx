import React from 'react';
import classNames from 'classnames';

import Icon from './Icon';
import Button from './Button';
import { getVariantIcon } from './utils/icon-variant';

import './Alert.styl';

export default ({
  header,
  children,
  closable = false,
  variant = 'info', // info, help, success, error, warning
  large = false,
  className,
  onClose = () => {},
  ...otherProps
}) => (
  <div
    className={
      classNames(
        'coral3-Alert',
        `coral3-Alert--${variant}`,
        `coral3-Alert--${large ? 'large' : 'small'}`,
        className
      )
    }
    { ...otherProps }
  >
    <Icon
      className="coral3-Alert-typeIcon"
      icon={getVariantIcon(variant)}
      size="XS"
    />
    {
      closable &&
        <Button
          className="coral3-Alert-closeButton u-coral-pullRight"
          variant="minimal"
          square
          size="M"
          icon="close"
          iconSize="XS"
          onClick={onClose}
        />
    }
    <div className="coral3-Alert-header">{header}</div>
    <div className="coral3-Alert-content">{children}</div>
  </div>
);
