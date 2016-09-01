import React from 'react';
import classNames from 'classnames';

export default function Well({
  children,
  className,
  ...otherProps
}) {
  return (
    <div
      className={
        classNames(
          'coral-Well',
          className
        )
      }
      { ...otherProps }
    >
      { children }
    </div>
  );
}

Well.displayName = 'Well';
