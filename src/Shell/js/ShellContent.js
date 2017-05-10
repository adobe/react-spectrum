import React from 'react';
import classNames from 'classnames';

import '../style/Shell.styl';

export default function ShellContent({
  className,
  children,
  ...otherProps
}) {
  return (
    <div
      className={
        classNames(
          'coral3-Shell-content',
          className
        )
      }
      { ...otherProps }
    >
      { children }
    </div>
  );
}

ShellContent.displayName = 'ShellContent';
