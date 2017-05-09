import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import '../style/index.styl';

const ARROWS = {
  right: 'arrowRight',
  left: 'arrowLeft',
  bottom: 'arrowDown',
  top: 'arrowUp'
};

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
            'coral3-Tooltip',
            `coral3-Tooltip--${variant}`,
            `coral3-Tooltip--${ARROWS[placement]}`,
            {
              'coral3-Tooltip-drop-after-open': open
            },
            className
          )
        }>
          {children}
      </div>
    );
  }
}
