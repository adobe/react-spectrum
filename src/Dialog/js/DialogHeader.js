import React from 'react';
import classNames from 'classnames';

import Heading from '../../Heading';
import Button from '../../Button';
import Icon from '../../Icon';
import {getVariantIcon} from '../../utils/icon-variant';

export default function DialogHeader({
  title,
  variant,
  icon = getVariantIcon(variant || 'default'),
  closable,
  onClose,
  children,
  className,
  ...otherProps
}) {
  return (
    <div
      className={
        classNames(
          'coral-Dialog-header',
          className
        )
      }
      { ...otherProps }
    >
      {
        icon &&
        <Icon className="coral-Dialog-typeIcon" icon={ icon } size="S" />
      }
      <Heading size={ 2 } className="coral-Dialog-title">
        { title || children }
      </Heading>
      {
        closable &&
          <Button
            variant="minimal"
            onClick={ onClose }
            className="coral-Dialog-closeButton"
            square
            size="M"
            icon="close"
            iconSize="XS"
          />
      }
    </div>
  );
}

DialogHeader.displayName = 'DialogHeader';
