import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import '../style/index.styl';

export default class Tooltip extends Component {
  static propTypes = {
    placement: PropTypes.string,
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
      placement
    } = this.props;

    return (
      <div
        className={
          classNames(
            'spectrum-Tooltip',
            `spectrum-Tooltip--${variant}`,
            `spectrum-Tooltip--${placement}`,
            {
              'is-open': open
            },
            className
          )
        }>
          <div className="spectrum-Tooltip-content">{children}</div>
          <div className="spectrum-Tooltip-tip" />
      </div>
    );
  }
}
