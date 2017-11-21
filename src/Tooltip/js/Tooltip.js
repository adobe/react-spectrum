import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import '../style/index.styl';

export default class Tooltip extends Component {
  static propTypes = {
    placement: PropTypes.oneOf([
      'bottom', 'bottom left', 'bottom right',
      'top', 'top left', 'top right',
      'left', 'left top', 'left bottom',
      'right', 'right top', 'right bottom'
    ]),
    variant: PropTypes.oneOf(['inspect', 'info', 'success', 'error']),
    className: PropTypes.string
  };

  static defaultProps = {
    variant: 'inspect',
    placement: 'right',
    open: true
  };

  render() {
    const {
      variant,
      children,
      className,
      placement,
      open,
      ...otherProps
    } = this.props;

    return (
      <span
        className={
          classNames(
            'spectrum-Tooltip',
            `spectrum-Tooltip--${variant}`,
            `spectrum-Tooltip--${placement.split(' ')[0]}`,
            {
              'is-open': open
            },
            className
          )
        }
        {...otherProps}>
        <span className="spectrum-Tooltip-label">{children}</span>
        <span className="spectrum-Tooltip-tip" />
      </span>
    );
  }
}
