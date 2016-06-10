import React, { Component } from 'react';
import classNames from 'classnames';

import Icon from '../Icon';

export default class ShellSolution extends Component {
  render() {
    const {
      href,
      label,
      icon,
      linked,
      className,
      children,
      ...otherProps
    } = this.props;

    return (
      <a
        className={
          classNames(
            'coral-Shell-solution',
            { linked: 'coral-Shell-solution--linked' }
          )
        }
        href={ href }
        {...otherProps}
      >
        <Icon icon={icon} size="L" className="coral-Shell-solution-icon" />
        <div className="coral-Shell-solution-label">{ label }</div>
      </a>
    )
  }
}
