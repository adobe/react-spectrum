import classNames from 'classnames';
import DialogHeader from '../../Dialog/js/DialogHeader';
import React, {Component, PropTypes} from 'react';
import '../style/index.styl';
import '../../Dialog/style/index.styl';

export default class Popover extends Component {
  static propTypes = {
    variant: PropTypes.oneOf(['default', 'error', 'warning', 'success', 'info', 'help']),
    placement: PropTypes.oneOf(['bottom', 'top', 'left', 'right']),
    open: PropTypes.bool,
    title: PropTypes.node,
    className: PropTypes.string
  };

  static defaultProps = {
    variant: 'default',
    placement: 'bottom',
    open: true
  };

  render() {
    const {
      variant,
      placement,
      arrowStyle,
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
            'spectrum-Popover',
            `spectrum-Popover--${placement}`,
            `spectrum-Dialog--${variant}`,
            {
              'is-open': open
            },
            className
          )
        }
        {...otherProps}>
        <div className="spectrum-Dialog-wrapper">
          {title &&
            <DialogHeader
              className="spectrum-Popover-header"
              title={title}
              variant={variant} />
          }
          <div className="spectrum-Dialog-content">
            {children}
          </div>
        </div>
        <div className="spectrum-Popover-tip" style={arrowStyle} />
      </div>
    );
  }
}

Popover.displayName = 'Popover';

