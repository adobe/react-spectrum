import React, { Component } from 'react';
import classNames from 'classnames';
import ShellMenu from './ShellMenu';

import Button from '../Button';
import Icon from '../Icon';

export default class ShellSolutionSwitcher extends Component {
  render() {
    const {
      className,
      children,
      ...otherProps
    } = this.props;

    return (
      <ShellMenu
        placement="top"
        animateFrom="top"
        full
        dark
        top
        target={ <Button variant="minimal" className="coral-Shell-menu-button" icon="apps" square /> }
        { ...otherProps }
      >
        <div className="coral-Shell-solutionSwitcher">
          <div className="coral-Shell-solutionSwitcher-content">
            { children }
          </div>
        </div>
      </ShellMenu>
    )
  }
}
