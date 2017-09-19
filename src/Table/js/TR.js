import classNames from 'classnames';
import React from 'react';

export default function TR({
  className,
  children,
  ...otherProps
}) {
  return (
    <tr
      className={
        classNames(
          'coral-Table-row',
          className
        )
      }
      {...otherProps}>
      {children}
    </tr>
  );
}

TR.displayName = 'TR';
