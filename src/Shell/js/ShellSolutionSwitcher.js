import Button from '../../Button';
import classNames from 'classnames';
import React from 'react';
import ShellMenu from './ShellMenu';
import '../style/ShellSolutionSwitcher.styl';

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
          className="coral3-Shell-menu-button"
          variant="minimal"
          icon="apps"
          square
        />
      }
      {...otherProps}
    >
      <div
        className={
          classNames(
            'coral3-Shell-solutionSwitcher',
            className
          )
        }
      >
        <div className="coral3-Shell-solutionSwitcher-content">
          {children}
        </div>
      </div>
    </ShellMenu>
  );
}

ShellSolutionSwitcher.displayName = 'ShellSolutionSwitcher';
