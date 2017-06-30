import React from 'react';
import classNames from 'classnames';

import '../style/ShellWorkspace.styl';

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
          'coral3-Shell-workspaces-workspace',
          {'is-selected': selected},
          className
        )
      }
      href={href}
      selected={selected}
      {...otherProps}
    >
      {label}
      {children}
    </a>
  );
}

ShellWorkspace.displayName = 'ShellWorkspace';
