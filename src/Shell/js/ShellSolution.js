import classNames from 'classnames';
import Icon from '../../Icon';
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
      <Icon icon={icon} size="L" className="coral3-Shell-solution-icon" />
      <div className="coral3-Shell-solution-label">{label}{children}</div>
    </a>
  );
}

ShellSolution.displayName = 'ShellSolution';
