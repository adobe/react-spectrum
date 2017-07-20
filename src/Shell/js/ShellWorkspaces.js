import classNames from 'classnames';
import React from 'react';

export default function ShellWorkspaces({
  className,
  children,
  ...otherProps
}) {
  return (
    <div className={classNames('coral3-Shell-header-content', className)} {...otherProps}>
      <div className="coral3-Shell-workspaces">
        {children}
      </div>
    </div>
  );
}

ShellWorkspaces.displayName = 'ShellWorkspaces';
