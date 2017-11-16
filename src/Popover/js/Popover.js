import classNames from 'classnames';
import DialogHeader from '../../Dialog/js/DialogHeader';
import React, {Component, PropTypes} from 'react';
import '../style/index.styl';
import '../../Dialog/style/index.styl';

export default class Popover extends Component {
  static propTypes = {
    variant: PropTypes.oneOf(['default', 'error', 'warning', 'success', 'info', 'help']),
    placement: PropTypes.oneOf([
      'bottom', 'bottom left', 'bottom right',
      'top', 'top left', 'top right',
      'left', 'left top', 'left bottom',
      'right', 'right top', 'right bottom'
    ]),
    open: PropTypes.bool,
    title: PropTypes.node,
    className: PropTypes.string,
    showTip: PropTypes.bool
  };

  static defaultProps = {
    variant: 'default',
    placement: 'bottom',
    open: true,
    showTip: true
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
      showTip,
      ...otherProps
    } = this.props;

    return (
      <div
        className={
          classNames(
            'spectrum-Popover',
            `spectrum-Popover--${placement.split(' ')[0]}`,
            `spectrum-Dialog--${variant}`,
            {
              'is-open': open
            },
            className
          )
        }
        {...otherProps}>
        {title &&
          <DialogHeader
            className="spectrum-Popover-header"
            title={title}
            variant={variant} />
        }
        <div className="spectrum-Dialog-content">
          {children}
        </div>
        {this.props.showTip && <div className="spectrum-Popover-tip" style={arrowStyle} />}
      </div>
    );
  }
}

Popover.displayName = 'Popover';

