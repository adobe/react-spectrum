import React from 'react';
import classNames from 'classnames';

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
      { ...otherProps }
    >
      { children }
    </tr>
  );
}

TR.displayName = 'TR';
