import React from 'react';
import classNames from 'classnames';

export default ({
  className,
  children,
  ...otherProps
}) => (
  <div className={ classNames('coral-Shell-header-content', className) } { ...otherProps }>
    <div className="coral-Shell-workspaces">
      { children }
    </div>
  </div>
)
