import React from 'react';
import classNames from 'classnames';

import Icon from '../Icon';

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
          'coral-Shell-solution',
          { 'coral-Shell-solution--linked': entitled },
          className
        )
      }
      href={ href }
      { ...otherProps }
    >
      <Icon icon={ icon } size="L" className="coral-Shell-solution-icon" />
      <div className="coral-Shell-solution-label">{ label }{ children }</div>
    </a>
  );
}

ShellSolution.displayName = 'ShellSolution';
