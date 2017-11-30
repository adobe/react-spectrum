import classNames from 'classnames';
import {cloneIcon} from '../../utils/icon';
import React from 'react';

export default function ShellSolution({
  href,
  label,
  icon,
  entitled,
  className,
  children,
  ...otherProps
}) {
  return (
    <a
      className={
        classNames(
          'coral3-Shell-solution',
          {'coral3-Shell-solution--linked': entitled},
          className
        )
      }
      href={href}
      {...otherProps}>
      {cloneIcon(icon, {className: 'coral3-Shell-solution-icon', size: 'L'})}
      <div className="coral3-Shell-solution-label">{label}{children}</div>
    </a>
  );
}

ShellSolution.displayName = 'ShellSolution';
