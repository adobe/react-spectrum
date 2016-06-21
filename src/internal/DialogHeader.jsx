import React from 'react';
import classNames from 'classnames';

import Heading from '../Heading';
import Button from '../Button';
import Icon from '../Icon';

export default function DialogHeader({
  title,
  icon,
  closable,
  onClose,
  children,
  className,
  ...otherProps
}) {
  return (
    <div className={ classNames('coral-Dialog-header', className) } { ...otherProps }>
      {
        icon &&
        <Icon className="coral-Dialog-typeIcon" icon={ icon } size="S" />
      }
      <Heading size={ 2 } className="coral-Dialog-title">{ title || children }</Heading>
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
