import React from 'react';
import classNames from 'classnames';
import ShellMenu from './internal/ShellMenu';

import Button from '../../Button';

export default function ShellSolutionSwitcher({
  className,
  children,
  ...otherProps
}) {
  return (
    <ShellMenu
      placement="top"
      animateFrom="top"
      full
      dark
      top
      target={
        <Button
          className="coral-Shell-menu-button"
          variant="minimal"
          icon="apps"
          square
        />
      }
      { ...otherProps }
    >
      <div
        className={
          classNames(
            'coral-Shell-solutionSwitcher',
            className
          )
        }
      >
        <div className="coral-Shell-solutionSwitcher-content">
          { children }
        </div>
      </div>
    </ShellMenu>
  );
}

ShellSolutionSwitcher.displayName = 'ShellSolutionSwitcher';
