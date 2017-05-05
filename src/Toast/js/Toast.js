import Button from '../../Button';
import classNames from 'classnames';
import React from 'react';
import '../style/index.styl';

export default class Toast extends React.Component {
  render() {
    let {icon, children, closable, onClose, variant} = this.props;

    return (
      <div className={classNames('coral-Toast', {['coral-Toast--' + variant]: variant})}>
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
}
