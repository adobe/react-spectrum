import classNames from 'classnames';
import React from 'react';
import '../style/Shell.styl';

export default function Shell({
  className,
  children,
  ...otherProps
}) {
  return (
    <div
      className={
        classNames(
          'coral3-Shell',
          className
        )
      }
      {...otherProps}>
      {children}
    </div>
  );
}

Shell.displayName = 'Shell';
