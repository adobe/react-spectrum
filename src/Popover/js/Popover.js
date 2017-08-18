import classNames from 'classnames';
import DialogHeader from '../../Dialog/js/DialogHeader';
import React, {Component, PropTypes} from 'react';
import '../style/index.styl';
import '../../Dialog/style/index.styl';

export default class Popover extends Component {
  static propTypes = {
    variant: PropTypes.oneOf(['default', 'error', 'warning', 'success', 'info', 'help']),
    icon: PropTypes.string,
    open: PropTypes.bool,
    title: PropTypes.node,
    className: PropTypes.string
  };

  static defaultProps = {
    variant: 'default',
    open: true
  };

  render() {
    const {
      variant,
      icon,
      open,
      title,
      children,
      className,
      ...otherProps
    } = this.props;

    return (
      <div
        className={
          classNames(
            'coral3-Popover',
            `coral-Dialog--${variant}`,
            {
              'is-open': open
            },
            className
          )
        }
        {...otherProps}>
        {
            title &&
              <DialogHeader
                className="coral-Popover-header"
                title={title}
                variant={variant}
                icon={icon} />
          }
        <div className="coral3-Popover-content">
          {title ? <div className="u-coral-margin">{children}</div> : children}
        </div>
      </div>
    );
  }
}

Popover.displayName = 'Popover';

