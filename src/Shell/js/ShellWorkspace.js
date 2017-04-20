import React from 'react';
import classNames from 'classnames';

export default function ShellWorkspace({
  href = '#',
  label,
  selected = false,
  className,
  children,
  ...otherProps
}) {
  return (
    <a
      className={
        classNames(
          'coral-Shell-workspaces-workspace',
          {'is-selected': selected},
          className
        )
      }
      href={ href }
      selected={ selected }
      { ...otherProps }
    >
      { label }
      { children }
    </a>
  );
}

ShellWorkspace.displayName = 'ShellWorkspace';
