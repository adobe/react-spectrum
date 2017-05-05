import Button from '../../Button';
import classNames from 'classnames';
import {getVariantIcon} from '../../utils/icon-variant';
import Icon from '../../Icon';
import React from 'react';
import '../style/index.styl';

export default function Toast({
  variant,
  icon = getVariantIcon(variant || 'default'),
  children,
  closable,
  onClose
}) {
  return (
    <div className={classNames('coral-Toast', {
      ['coral-Toast--' + variant]: variant,
      'is-closable': closable
    })}>
      {icon &&
        <Icon icon={icon} size="S" />
      }
      <span>{children}</span>
      {closable &&
        <Button
          className="coral-Toast-closeButton"
          variant="minimal"
          icon="close"
          size="S"
          iconSize="XS"
          onClick={onClose} />
      }
    </div>
  );
}
