import React from 'react';
import classNames from 'classnames';

export default function ShellContent({
  className,
  children,
  ...otherProps
}) {
  return (
    <div
      className={
        classNames(
          'coral-Shell-content',
          className
        )
      }
      { ...otherProps }
    >
      { children }
    </div>
  );
}
