import Button from '../../Button';
import classNames from 'classnames';
import {getVariantIcon} from '../../utils/icon-variant';
import Icon from '../../Icon';
import React from 'react';
import '../style/index.styl';

export default function Alert({
  header,
  children,
  closable = false,
  variant = 'info', // info, help, success, error, warning
  large = false,
  className,
  onClose = function () {},
  ...otherProps
}) {
  return (
    <div
      className={
        classNames(
          'coral3-Alert',
          `coral3-Alert--${variant}`,
          `coral3-Alert--${large ? 'large' : 'small' }`,
          className
        )
      }
      {...otherProps}>
      <Icon
        className="coral3-Alert-typeIcon"
        icon={getVariantIcon(variant)}
        size="XS" />
      {
        closable &&
          <Button
            className="coral3-Alert-closeButton u-coral-pullRight"
            variant="minimal"
            square
            size="M"
            icon="close"
            iconSize="XS"
            onClick={onClose} />
      }
      <div className="coral3-Alert-header">{header}</div>
      <div className="coral3-Alert-content">{children}</div>
    </div>
  );
}

Alert.displayName = 'Alert';
