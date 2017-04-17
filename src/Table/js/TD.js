import React from 'react';
import classNames from 'classnames';

export default function TD({
  className,
  children,
  ...otherProps
}) {
  return (
    <td
      className={
        classNames(
          'coral-Table-cell',
          className
        )
      }
      { ...otherProps }
    >
      { children }
    </td>
  );
}

TD.displayName = 'TD';
