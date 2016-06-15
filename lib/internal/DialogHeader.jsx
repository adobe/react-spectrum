import React from 'react';

import Heading from '../Heading';
import Button from '../Button';
import Icon from '../Icon';

export default function DialogHeader({
  title,
  icon,
  closable,
  onClose,
  children
}) {
  return (
    <div className="coral-Dialog-header">
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
