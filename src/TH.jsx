import React from 'react';
import classNames from 'classnames';

export default function TH({
  className,
  children,
  ...otherProps
}) {
  return (
    <th
      className={
        classNames(
          'coral-Table-headerCell',
          className
        )
      }
      {...otherProps}
    >
      { children }
    </th>
  );
}
