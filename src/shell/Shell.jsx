import React from 'react';
import classNames from 'classnames';

export default function Shell({
  className,
  children,
  ...otherProps
}) {
  return (
    <div
      className={
        classNames(
          'coral-Shell',
          className
        )
      }
      { ...otherProps }
    >
      { children }
    </div>
  );
}
